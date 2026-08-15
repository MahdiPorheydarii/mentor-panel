import { fetchStudents } from '@/lib/queries';
import { ClipboardList, CheckCircle2, XCircle } from 'lucide-react';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function CardsPage() {
  const session = await getSession();
  const teacher = session?.username ?? '';
  const students = await fetchStudents(teacher);
  const total = students.length;
  const done = students.filter((s) => s.reportCardDone).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
          <ClipboardList className="h-5 w-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">وضعیت کارنامه</h1>
          <p className="text-xs text-slate-400">{done} از {total} کارنامه تکمیل‌شده</p>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-700">درصد تکمیل</p>
          <p className="text-2xl font-bold text-slate-900">{pct}٪</p>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-500 inline-block" />تکمیل‌شده: {done}</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-200 inline-block" />ناقص: {total - done}</span>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">دانشجو</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">درس</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">ترم</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">وضعیت کارنامه</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.sort((a, b) => Number(a.reportCardDone) - Number(b.reportCardDone)).map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-slate-800">{s.name}</td>
                  <td className="px-4 py-3.5 text-slate-600 text-xs">{s.phase || s.course}</td>
                  <td className="px-4 py-3.5 text-slate-600 text-xs">{s.term}</td>
                  <td className="px-4 py-3.5 text-center">
                    {s.reportCardDone ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />تکمیل‌شده
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                        <XCircle className="h-3.5 w-3.5" />ناقص
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
