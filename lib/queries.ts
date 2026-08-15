// Server-only data access — wraps Metabase SQL queries into typed results
import { runQuery } from './metabase';
import type { Student, CallLog, AttendanceRecord } from './types';

function parsePlan(courseName: string): 'premium' | 'economy' | 'vip' {
  if (courseName.includes('VIP') || courseName.includes('vip')) return 'vip';
  if (courseName.includes('اکونومی') || courseName.includes('economy') || courseName.includes('Economy')) return 'economy';
  return 'premium'; // "پریمیوم" or default
}

function parseStatus(suspended: unknown): 'active' | 'suspended' | 'withdrawn' {
  if (suspended === true || suspended === 'True' || suspended === 1) return 'suspended';
  return 'active';
}

function toTimestamp(val: unknown): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const s = String(val);
  // Unix timestamp (already seconds)
  if (/^\d{10}$/.test(s)) return parseInt(s, 10);
  // Date string
  const d = new Date(s);
  return isNaN(d.getTime()) ? 0 : Math.floor(d.getTime() / 1000);
}

function formatISODate(val: unknown): string {
  if (!val) return '';
  const ts = toTimestamp(val);
  if (!ts) return String(val);
  return new Date(ts * 1000).toISOString();
}

export async function fetchStudents(teacher: string): Promise<Student[]> {
  if (!teacher) return [];

  // viewStudentProfile links students to their teacher.
  // A student may appear multiple times (multiple enrollments). We deduplicate
  // by student_id and keep the row where educational_sort is the highest
  // (= most advanced course in the sequence).
  const rows = await runQuery(`
    SELECT
      student_id,
      student_username,
      student_firstname,
      student_lastname,
      course_name,
      course_category1,
      course_category2,
      course_category3,
      course_category4,
      student_group_name,
      suspended,
      last_access_time_to_site,
      timeadded,
      educational_sort
    FROM viewStudentProfile
    WHERE teacher_username = '${teacher}'
    ORDER BY student_id, educational_sort DESC
  `);

  // Deduplicate: keep highest educational_sort per student
  const seen = new Map<number, typeof rows[0]>();
  for (const row of rows) {
    const id = Number(row.student_id);
    if (!seen.has(id)) seen.set(id, row);
  }

  return Array.from(seen.values()).map((row) => {
    const courseName = String(row.course_name || '');
    const firstName = String(row.student_firstname || '');
    const lastName = String(row.student_lastname || '');
    const fullName = (firstName + ' ' + lastName).trim();
    const plan = parsePlan(courseName);
    const status = parseStatus(row.suspended);

    // Estimate current week from enrollment date
    const enrolledTs = toTimestamp(row.timeadded);
    const nowTs = Math.floor(Date.now() / 1000);
    const weeksSinceEnroll = enrolledTs ? Math.max(1, Math.floor((nowTs - enrolledTs) / (7 * 24 * 3600))) : 1;
    const currentWeek = Math.min(weeksSinceEnroll, 24);

    return {
      id: String(row.student_id),
      name: fullName || String(row.student_username || '').split('@')[0],
      username: String(row.student_username || ''),
      role: 'دانشجو',
      status,
      withdrawalWarning: false, // populated separately
      course: courseName,
      term: String(row.course_category4 || ''),
      termNumber: parseInt(String(row.course_category4 || '').replace(/\D/g, '') || '1', 10) || 1,
      startDate: enrolledTs ? new Date(enrolledTs * 1000).toISOString().split('T')[0] : '',
      currentWeek,
      currentTopic: `هفته ${currentWeek} — ${String(row.course_category3 || '')}`,
      subscriptionPlan: plan,
      phase: String(row.course_category3 || ''),
      progress: Math.min(100, Math.round((currentWeek / 24) * 100)),
      lastContact: undefined,
      classesCompleted: Math.max(0, currentWeek - 1),
      totalClasses: 24,
      reportCardDone: false,
    } satisfies Student;
  });
}

export async function fetchWithdrawnStudents(teacher: string): Promise<Student[]> {
  if (!teacher) return [];

  // quit_logs: logtype=1 typically means withdrawal
  // We join back to viewStudentProfile to get teacher filter
  const rows = await runQuery(`
    SELECT
      u.id as student_id,
      u.username as student_username,
      u.firstname as student_firstname,
      u.lastname as student_lastname,
      vsp.course_name,
      vsp.course_category3,
      vsp.course_category4,
      vsp.student_group_name,
      FROM_UNIXTIME(ql.logdate) as quit_date
    FROM mdl_local_adminprofile_quit_logs ql
    JOIN mdl_user u ON ql.userid = u.id
    LEFT JOIN viewStudentProfile vsp ON vsp.student_id = u.id AND vsp.teacher_username = '${teacher}'
    WHERE vsp.student_id IS NOT NULL
    ORDER BY ql.logdate DESC
    LIMIT 100
  `);

  return rows.map((row) => ({
    id: String(row.student_id),
    name: (String(row.student_firstname || '') + ' ' + String(row.student_lastname || '')).trim(),
    username: String(row.student_username || ''),
    role: 'دانشجو',
    status: 'withdrawn' as const,
    withdrawalWarning: false,
    course: String(row.course_name || ''),
    term: String(row.course_category4 || ''),
    termNumber: 1,
    startDate: '',
    currentWeek: 0,
    currentTopic: '',
    subscriptionPlan: parsePlan(String(row.course_name || '')),
    phase: String(row.course_category3 || ''),
    progress: 0,
    classesCompleted: 0,
    totalClasses: 24,
    reportCardDone: false,
  }));
}

export async function fetchCallLogs(teacher: string): Promise<CallLog[]> {
  if (!teacher) return [];

  // Get teacher's Moodle user_id from viewTeachers
  const teacherRows = await runQuery(`
    SELECT id FROM mdl_user WHERE username = '${teacher}' LIMIT 1
  `);
  if (!teacherRows.length) return [];
  const teacherMoodleId = Number(teacherRows[0].id);

  const rows = await runQuery(`
    SELECT
      cli.id,
      cli.student_id,
      CONCAT(s.firstname, ' ', s.lastname) as student_name,
      cli.status,
      cli.description,
      cli.timecreated,
      op.name as operation_name
    FROM mdl_local_call_log_info cli
    JOIN mdl_user s ON cli.student_id = s.id
    LEFT JOIN mdl_local_call_log_opration op ON cli.opration = op.id
    WHERE cli.user_id = ${teacherMoodleId}
    ORDER BY cli.timecreated DESC
    LIMIT 200
  `);

  return rows.map((row) => ({
    id: String(row.id),
    studentId: String(row.student_id),
    studentName: String(row.student_name || ''),
    date: formatISODate(row.timecreated),
    duration: undefined,
    notes: String(row.description || ''),
    result: String(row.status || '') === 'موفق' ? 'answered' : 'no_answer',
    operationName: String(row.operation_name || ''),
  } satisfies CallLog & { operationName: string }));
}

export async function fetchAttendance(teacher: string): Promise<AttendanceRecord[]> {
  if (!teacher) return [];

  // Get teacher's Moodle user_id
  const teacherRows = await runQuery(`
    SELECT id FROM mdl_user WHERE username = '${teacher}' LIMIT 1
  `);
  if (!teacherRows.length) return [];
  const teacherMoodleId = Number(teacherRows[0].id);

  const rows = await runQuery(`
    SELECT
      a.id,
      a.studentid,
      CONCAT(u.firstname, ' ', u.lastname) as student_name,
      a.startat,
      a.endat,
      a.attendancetimestudent,
      a.meetingid
    FROM mdl_local_bigbluebuttonbn_attendance a
    JOIN mdl_user u ON a.studentid = u.id
    WHERE a.teacherid = ${teacherMoodleId}
      AND a.startat > 1
    ORDER BY a.startat DESC
    LIMIT 300
  `);

  return rows.map((row) => {
    const startTs = toTimestamp(row.startat);
    const durationSec = Number(row.attendancetimestudent || 0);
    return {
      id: String(row.id),
      studentId: String(row.studentid),
      studentName: String(row.student_name || ''),
      sessionDate: startTs ? new Date(startTs * 1000).toISOString() : '',
      sessionType: 'BigBlueButton',
      present: durationSec > 60, // present if attended > 1 minute
      duration: Math.round(durationSec / 60),
    } satisfies AttendanceRecord;
  });
}
