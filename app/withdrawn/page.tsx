'use client';

import { mockStudents } from '@/lib/mock-data';
import { PlanBadge } from '@/components/dashboard/PlanBadge';
import { formatShortDate } from '@/lib/utils';
import { UserX } from 'lucide-react';

export default function WithdrawnPage() {
  const withdrawn = mockStudents.filter((s) => s.status === 'withdrawn');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
          <UserX className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">دانشجویان منصرف</h1>
          <p className="text-xs text-slate-400">{withdrawn.length} دانشجو</p>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">دانشجو</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">درس</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">ترم</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">تاریخ شروع</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">پلن</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">پیشرفت هنگام انصراف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {withdrawn.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">هیچ دانشجوی منصرفی وجود ندارد.</td>
                </tr>
              ) : (
                withdrawn.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-800">{s.name}</p>
                      <p className="text-xs text-slate-400" dir="ltr">{s.username}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">{s.course}</td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs">{s.term}</td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs">{formatShortDate(s.startDate)}</td>
                    <td className="px-4 py-3.5"><PlanBadge plan={s.subscriptionPlan} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-slate-400 rounded-full" style={{ width: `${s.progress}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{s.progress}٪</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
