import { fetchCallLogs, fetchStudents } from '@/lib/queries';
import { formatShortDate, daysSince } from '@/lib/utils';
import { Phone, PhoneMissed, AlertCircle } from 'lucide-react';
import type { CallResult } from '@/lib/types';

export const dynamic = 'force-dynamic';

const resultConfig: Record<CallResult, { label: string; className: string }> = {
  answered: { label: 'موفق', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  no_answer: { label: 'بدون پاسخ', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  busy: { label: 'خط اشغال', className: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export default async function CallsPage() {
  const [logs, students] = await Promise.all([fetchCallLogs(), fetchStudents()]);

  // Build a map of student_id → last call date from logs
  const lastCallByStudent = new Map<string, string>();
  for (const log of logs) {
    const existing = lastCallByStudent.get(log.studentId);
    if (!existing || log.date > existing) {
      lastCallByStudent.set(log.studentId, log.date);
    }
  }

  // Students who haven't been contacted in 30+ days (or never)
  const noContactStudents = students.filter((s) => {
    const last = lastCallByStudent.get(s.id);
    if (!last) return true;
    return daysSince(last) > 30;
  });

  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
          <Phone className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">گزارش تماس‌ها</h1>
          <p className="text-xs text-slate-400">{sorted.length} تماس ثبت‌شده</p>
        </div>
      </div>

      {noContactStudents.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                دانشجویانی که بیش از ۳۰ روز است تماس نداشته‌اید ({noContactStudents.length} نفر):
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {noContactStudents.map((s) => {
                  const last = lastCallByStudent.get(s.id);
                  return (
                    <span key={s.id} className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-medium text-amber-800">
                      {s.name}
                      {last
                        ? <span className="mr-1 text-amber-600">({daysSince(last)} روز)</span>
                        : <span className="mr-1 text-amber-600">(بدون تماس)</span>
                      }
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white shadow-sm overflow-hidden border border-slate-100">
        {sorted.length === 0 ? (
          <p className="px-4 py-12 text-center text-slate-400 text-sm">هیچ تماسی ثبت نشده است.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">دانشجو</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">تاریخ</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">نتیجه</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">یادداشت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sorted.map((log) => {
                  const cfg = resultConfig[log.result];
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-slate-800">{log.studentName}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">{formatShortDate(log.date)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
                          <PhoneMissed className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 max-w-[200px] truncate" title={log.notes}>
                        {log.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
