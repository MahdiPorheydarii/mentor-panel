'use client';

import { mockCallLogs, mockStudents } from '@/lib/mock-data';
import { formatShortDate, daysSince } from '@/lib/utils';
import { Phone, PhoneOff, PhoneMissed, AlertCircle } from 'lucide-react';
import type { CallResult } from '@/lib/types';

const resultConfig: Record<CallResult, { label: string; icon: React.ElementType; className: string }> = {
  answered: { label: 'پاسخ داده شد', icon: Phone, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  no_answer: { label: 'جواب نداد', icon: PhoneMissed, className: 'bg-slate-100 text-slate-600 border-slate-200' },
  busy: { label: 'خط اشغال', icon: PhoneOff, className: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export default function CallsPage() {
  // Students with last contact > 30 days ago (or no contact)
  const noContactStudents = mockStudents.filter((s) => {
    if (!s.lastContact) return true;
    return daysSince(s.lastContact) > 30;
  });

  // Sort logs newest first
  const sorted = [...mockCallLogs].sort((a, b) => b.date.localeCompare(a.date));

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

      {/* No-contact warning */}
      {noContactStudents.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">دانشجویانی که بیش از ۳۰ روز است تماس نداشته‌اید:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {noContactStudents.map((s) => (
                  <span key={s.id} className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-medium text-amber-800">
                    {s.name}
                    {s.lastContact && (
                      <span className="mr-1 text-amber-600">({daysSince(s.lastContact)} روز)</span>
                    )}
                    {!s.lastContact && <span className="mr-1 text-amber-600">(بدون تماس)</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calls table */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">دانشجو</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">تاریخ</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">مدت</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">نتیجه</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">یادداشت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sorted.map((log) => {
                const cfg = resultConfig[log.result];
                const Icon = cfg.icon;
                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-slate-800">{log.studentName}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{formatShortDate(log.date)}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      {log.duration ? `${log.duration} دقیقه` : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
                        <Icon className="h-3 w-3" />
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
      </div>
    </div>
  );
}
