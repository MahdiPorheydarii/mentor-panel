'use client';

import { useState, useMemo } from 'react';
import { Search, Monitor, XCircle, AlertTriangle } from 'lucide-react';
import type { Student, SubscriptionPlan } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { PlanBadge } from './PlanBadge';
import { ProgressBar } from './ProgressBar';
import { CancellationModal } from './modals/CancellationModal';
import { ExternalPlatformModal } from './modals/ExternalPlatformModal';
import { formatShortDate } from '@/lib/utils';

type StatusFilterValue = 'all' | 'active' | 'suspended' | 'withdrawn' | 'suspended_or_withdrawn';

export function StudentsTable({ students }: { students: Student[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [planFilter, setPlanFilter] = useState<SubscriptionPlan | 'all'>('all');
  const [cancellationStudent, setCancellationStudent] = useState<Student | null>(null);
  const [externalStudent, setExternalStudent] = useState<Student | null>(null);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        !search ||
        s.name.includes(search) ||
        s.username.toLowerCase().includes(search.toLowerCase()) ||
        s.course.includes(search);

      let matchesStatus = true;
      if (statusFilter === 'suspended_or_withdrawn') {
        matchesStatus = s.status === 'suspended' || s.status === 'withdrawn';
      } else if (statusFilter !== 'all') {
        matchesStatus = s.status === statusFilter;
      }

      const matchesPlan = planFilter === 'all' || s.subscriptionPlan === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [search, statusFilter, planFilter, students]);

  return (
    <>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی نام، نام کاربری، درس..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-9 pl-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-blue-500 focus:ring-0 transition-colors"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilterValue)}
          className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 cursor-pointer"
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="active">فعال</option>
          <option value="suspended">معلق</option>
          <option value="withdrawn">انصراف</option>
          <option value="suspended_or_withdrawn">معلق یا انصراف</option>
        </select>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value as SubscriptionPlan | 'all')}
          className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 cursor-pointer"
        >
          <option value="all">همه پلن‌ها</option>
          <option value="premium">پریمیوم</option>
          <option value="vip">VIP</option>
          <option value="economy">اقتصادی</option>
        </select>

        <span className="text-xs text-slate-400 mr-auto">
          {filtered.length} فراگیر
        </span>
      </div>

      {/* Table card */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 w-[180px]">فراگیر</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">وضعیت</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">درس و ترم</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">تاریخ شروع</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">هفته جاری</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">پلن</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 min-w-[150px]">فاز پیشرفت</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">آخرین ورود</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400 text-sm">
                    فراگیری با این مشخصات یافت نشد.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    {/* Name + username */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{student.name}</span>
                          {student.withdrawalWarning && (
                            <span
                              title="این فراگیر بیش از ۱۴ روز است که وارد سایت نشده و در خطر انصراف است."
                              className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-medium text-amber-700 cursor-help"
                            >
                              <AlertTriangle className="h-2.5 w-2.5" />
                              هشدار
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400" dir="ltr">{student.username}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={student.status} />
                    </td>

                    {/* Course & term */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-800 font-medium">{student.course}</span>
                        <span className="text-xs text-slate-400">{student.term}</span>
                      </div>
                    </td>

                    {/* Start date */}
                    <td className="px-4 py-3.5 text-slate-600 text-xs">
                      {formatShortDate(student.startDate)}
                    </td>

                    {/* Current week */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-800 font-medium">هفته {student.currentWeek}</span>
                        <span className="text-xs text-slate-400 max-w-[120px] truncate" title={student.currentTopic}>
                          {student.currentTopic.replace(/^هفته \d+ — /, '')}
                        </span>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="px-4 py-3.5">
                      <PlanBadge plan={student.subscriptionPlan} />
                    </td>

                    {/* Progress */}
                    <td className="px-4 py-3.5">
                      <ProgressBar progress={student.progress} phase={student.phase} />
                    </td>

                    {/* Last access */}
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {formatShortDate(student.lastAccess ?? '')}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setCancellationStudent(student)}
                          title="ثبت لغو کلاس"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-200 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setExternalStudent(student)}
                          title="کلاس خارج از BBB"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-500 hover:bg-blue-100 hover:border-blue-200 transition-colors"
                        >
                          <Monitor className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CancellationModal
        student={cancellationStudent}
        onClose={() => setCancellationStudent(null)}
      />
      <ExternalPlatformModal
        student={externalStudent}
        allStudents={students}
        onClose={() => setExternalStudent(null)}
      />
    </>
  );
}
