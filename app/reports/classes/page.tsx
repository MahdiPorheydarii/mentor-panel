'use client';

import { mockStudents } from '@/lib/mock-data';
import { BarChart3 } from 'lucide-react';

export default function ClassesPage() {
  const sorted = [...mockStudents]
    .filter((s) => s.status === 'active')
    .sort((a, b) => (b.classesCompleted / b.totalClasses) - (a.classesCompleted / a.totalClasses));

  const totalCompleted = mockStudents.reduce((acc, s) => acc + s.classesCompleted, 0);
  const totalClasses = mockStudents.reduce((acc, s) => acc + s.totalClasses, 0);
  const overallRate = Math.round((totalCompleted / totalClasses) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
          <BarChart3 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">وضعیت کلاس‌ها</h1>
          <p className="text-xs text-slate-400">نرخ کلی: {overallRate}٪ · {totalCompleted} از {totalClasses} جلسه برگزار شده</p>
        </div>
      </div>

      {/* Overview bar */}
      <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-700">پیشرفت کلی برگزاری کلاس‌ها</p>
          <p className="text-xl font-bold text-blue-600">{overallRate}٪</p>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full bg-blue-500" style={{ width: `${overallRate}%` }} />
        </div>
      </div>

      {/* Per-student */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">دانشجو</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">درس</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">جلسات</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 min-w-[180px]">پیشرفت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sorted.map((s) => {
                const rate = Math.round((s.classesCompleted / s.totalClasses) * 100);
                const barColor =
                  rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-blue-500' : 'bg-amber-500';
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-slate-800">{s.name}</td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs">{s.course}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      {s.classesCompleted} / {s.totalClasses}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-600 w-8 text-left">{rate}٪</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
