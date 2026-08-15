import { fetchAttendance } from '@/lib/queries';
import { formatShortDate } from '@/lib/utils';
import { CalendarCheck, CheckCircle2, XCircle } from 'lucide-react';
import { getSession } from '@/lib/auth';

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

      <div className="rounded-xl bg-white shadow-sm overflow-hidden border border-slate-100">
        {sorted.length === 0 ? (
          <p className="px-4 py-12 text-center text-slate-400 text-sm">هیچ سابقه حضور و غیابی ثبت نشده است.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">دانشجو</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">تاریخ جلسه</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">مدت (دقیقه)</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sorted.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-slate-800">{record.studentName}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{formatShortDate(record.sessionDate)}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{record.duration ?? '—'}</td>
                    <td className="px-4 py-3.5 text-center">
                      {record.present ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 inline-block" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 inline-block" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
