'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Student } from '@/lib/types';

interface Props {
  student: Student | null;
  onClose: () => void;
}

export function CancellationModal({ student, onClose }: Props) {
  const [form, setForm] = useState({
    classDate: '',
    reason: '',
    notes: '',
    rescheduleDate: '',
    notifyStudent: true,
  });

  if (!student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API
    alert(`لغو کلاس برای ${student.name} ثبت شد.`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">ثبت لغو کلاس</h2>
            <p className="text-sm text-slate-500 mt-0.5">دانشجو: {student.name}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              تاریخ کلاس <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={form.classDate}
              onChange={(e) => setForm({ ...form, classDate: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              دلیل لغو <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:bg-white transition-colors appearance-none"
            >
              <option value="">انتخاب دلیل...</option>
              <option value="instructor_absent">عدم حضور مربی</option>
              <option value="technical">اشکال فنی</option>
              <option value="illness">بیماری</option>
              <option value="holiday">تعطیلی</option>
              <option value="other">سایر</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              توضیحات <span className="text-slate-400 text-xs font-normal">(اختیاری)</span>
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="توضیحات بیشتر..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 resize-none focus:border-blue-500 focus:bg-white transition-colors placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              تاریخ جبران <span className="text-slate-400 text-xs font-normal">(اختیاری)</span>
            </label>
            <input
              type="date"
              value={form.rescheduleDate}
              onChange={(e) => setForm({ ...form, rescheduleDate: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="notify"
              checked={form.notifyStudent}
              onChange={(e) => setForm({ ...form, notifyStudent: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 cursor-pointer"
            />
            <label htmlFor="notify" className="text-sm text-slate-700 cursor-pointer">
              اطلاع‌رسانی به دانشجو
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              ثبت لغو
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
