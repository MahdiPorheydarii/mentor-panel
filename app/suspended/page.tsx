'use client';

import { mockStudents } from '@/lib/mock-data';
import { PlanBadge } from '@/components/dashboard/PlanBadge';
import { formatShortDate } from '@/lib/utils';
import { UserMinus } from 'lucide-react';

export default function SuspendedPage() {
  const suspended = mockStudents.filter((s) => s.status === 'suspended');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
          <UserMinus className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">دانشجویان معلق</h1>
          <p className="text-xs text-slate-400">{suspended.length} دانشجو</p>
        </div>
      </div>

      {suspended.length > 0 && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ دانشجویان زیر در حال حاضر حساب‌شان تعلیق شده است و به کلاس‌ها دسترسی ندارند.
        </div>
      )}

      <div className="rounded-xl bg-white shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">دانشجو</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">درس</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">ترم</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">تاریخ شروع</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">پلن</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">دلیل تعلیق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {suspended.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">هیچ دانشجوی معلقی وجود ندارد.</td>
                </tr>
              ) : (
                suspended.map((s) => (
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
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        {s.suspensionReason || 'نامشخص'}
                      </span>
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
