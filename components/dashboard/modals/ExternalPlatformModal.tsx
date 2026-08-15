'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Student } from '@/lib/types';

interface Props {
  student: Student | null;
  onClose: () => void;
}

export function ExternalPlatformModal({ student, onClose }: Props) {
  const [form, setForm] = useState({
    sessionDate: '',
    platform: '',
    durationMinutes: '',
    participantCount: '',
    notes: '',
    recordingLink: '',
  });

  if (!student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`جلسه خارج از BBB برای ${student.name} ثبت شد.`);
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
            <h2 className="text-base font-semibold text-slate-900">ثبت کلاس خارج از BBB</h2>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                تاریخ جلسه <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.sessionDate}
                onChange={(e) => setForm({ ...form, sessionDate: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                پلتفرم استفاده‌شده <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:bg-white transition-colors appearance-none"
              >
                <option value="">انتخاب پلتفرم...</option>
                <option value="skype">Skype</option>
                <option value="zoom">Zoom</option>
                <option value="google_meet">Google Meet</option>
                <option value="phone">تماس تلفنی</option>
                <option value="other">سایر</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                مدت جلسه <span className="text-xs text-slate-400">(دقیقه)</span>
              </label>
              <input
                type="number"
                min="1"
                max="300"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                placeholder="مثلاً: ۹۰"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                تعداد شرکت‌کنندگان
              </label>
              <input
                type="number"
                min="1"
                value={form.participantCount}
                onChange={(e) => setForm({ ...form, participantCount: e.target.value })}
                placeholder="مثلاً: ۱"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              توضیحات جلسه <span className="text-slate-400 text-xs font-normal">(اختیاری)</span>
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="خلاصه‌ای از آنچه در جلسه گذشت..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 resize-none focus:border-blue-500 focus:bg-white transition-colors placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              لینک ضبط <span className="text-slate-400 text-xs font-normal">(اختیاری)</span>
            </label>
            <input
              type="url"
              value={form.recordingLink}
              onChange={(e) => setForm({ ...form, recordingLink: e.target.value })}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:bg-white transition-colors placeholder:text-slate-400"
              dir="ltr"
            />
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
              ثبت جلسه
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
