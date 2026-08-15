'use client';

import { useState, useMemo } from 'react';
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import type { AttendanceRecord } from '@/lib/types';

interface Props {
  records: AttendanceRecord[];
  formatShortDate: (d: string) => string;
}

export function AttendanceClient({ records, formatShortDate }: Props) {
  const [search, setSearch] = useState('');
  const [presenceFilter, setPresenceFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        !search || r.studentName.includes(search);
      const matchesPresence =
        presenceFilter === 'all' ||
        (presenceFilter === 'present' && r.present) ||
        (presenceFilter === 'absent' && !r.present);
      const date = r.sessionDate ? r.sessionDate.split('T')[0] : '';
      const matchesFrom = !dateFrom || date >= dateFrom;
      const matchesTo = !dateTo || date <= dateTo;
      return matchesSearch && matchesPresence && matchesFrom && matchesTo;
    });
  }, [records, search, presenceFilter, dateFrom, dateTo]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[180px] flex-1 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی نام فراگیر..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-9 pl-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-blue-500 focus:ring-0 transition-colors"
          />
        </div>

        <select
          value={presenceFilter}
          onChange={(e) => setPresenceFilter(e.target.value as 'all' | 'present' | 'absent')}
          className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 cursor-pointer"
        >
          <option value="all">همه</option>
          <option value="present">حاضر</option>
          <option value="absent">غایب</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-700 shadow-sm focus:border-blue-500"
            title="از تاریخ"
          />
          <span className="text-slate-400 text-xs">تا</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-700 shadow-sm focus:border-blue-500"
            title="تا تاریخ"
          />
        </div>

        <span className="text-xs text-slate-400 mr-auto">{filtered.length} جلسه</span>
      </div>

      <div className="rounded-xl bg-white shadow-sm overflow-hidden border border-slate-100">
        {filtered.length === 0 ? (
          <p className="px-4 py-12 text-center text-slate-400 text-sm">نتیجه‌ای یافت نشد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">فراگیر</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">تاریخ جلسه</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">مدت (دقیقه)</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((record) => (
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
