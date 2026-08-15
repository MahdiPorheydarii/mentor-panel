import { fetchAttendance } from '@/lib/queries';
import { formatShortDate } from '@/lib/utils';
import { CalendarCheck, CheckCircle2, XCircle } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { AttendanceClient } from './AttendanceClient';

export const dynamic = 'force-dynamic';

export default async function AttendancePage() {
  const session = await getSession();
  const teacher = session?.username ?? '';
  const records = await fetchAttendance(teacher);
  const sorted = [...records].sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));
  const presentCount = sorted.filter((r) => r.present).length;
  const rate = sorted.length > 0 ? Math.round((presentCount / sorted.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
          <CalendarCheck className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">حضور و غیاب (BigBlueButton)</h1>
          <p className="text-xs text-slate-400">{sorted.length} جلسه · نرخ حضور: {rate}٪</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'کل جلسات', value: sorted.length, color: 'text-slate-900' },
          { label: 'حضور', value: presentCount, color: 'text-emerald-600' },
          { label: 'غیاب', value: sorted.length - presentCount, color: 'text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl bg-white border border-slate-100 shadow-sm p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <AttendanceClient records={sorted} formatShortDate={formatShortDate} />
    </div>
  );
}
