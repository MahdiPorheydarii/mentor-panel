'use client';

import { useState, useMemo } from 'react';
import { X, Search, UserPlus, XCircle } from 'lucide-react';
import type { Student } from '@/lib/types';

interface Props {
  student: Student | null;
  allStudents: Student[];
  onClose: () => void;
}

export function ExternalPlatformModal({ student, allStudents, onClose }: Props) {
  const [form, setForm] = useState({
    sessionDate: '',
    platform: '',
    durationMinutes: '',
    participantCount: '',
    notes: '',
    recordingLink: '',
  });
  const [extraSearch, setExtraSearch] = useState('');
  const [extraStudents, setExtraStudents] = useState<Student[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  if (!student) return null;

  const participantCount = parseInt(form.participantCount || '1', 10);
  const showStudentPicker = participantCount > 1;

  const searchResults = useMemo(() => {
    if (!extraSearch.trim()) return [];
    const q = extraSearch.trim().toLowerCase();
    return allStudents.filter(
      (s) =>
        s.id !== student.id &&
        !extraStudents.find((e) => e.id === s.id) &&
        (s.name.includes(extraSearch) || s.username.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [extraSearch, allStudents, student.id, extraStudents]);

  const addExtra = (s: Student) => {
    setExtraStudents((prev) => [...prev, s]);
    setExtraSearch('');
  };

  const removeExtra = (id: string) => {
    setExtraStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const names = [student.name, ...extraStudents.map((s) => s.name)].join('، ');
    const msg =
      extraStudents.length > 0
        ? `جلسه برای ${names} ثبت شد.`
        : `جلسه خارج از BBB برای ${student.name} ثبت شد.`;
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
      setForm({ sessionDate: '', platform: '', durationMinutes: '', participantCount: '', notes: '', recordingLink: '' });
      setExtraStudents([]);
      onClose();
    }, 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-semibold text-slate-900">ثبت کلاس خارج از BBB</h2>
            <p className="text-sm text-slate-500 mt-0.5">فراگیر: {student.name}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {successMsg ? (
          <div className="px-6 py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <UserPlus className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-slate-800">{successMsg}</p>
          </div>
        ) : (
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
                  onChange={(e) => {
                    setForm({ ...form, participantCount: e.target.value });
                    if (parseInt(e.target.value || '1', 10) <= 1) setExtraStudents([]);
                  }}
                  placeholder="مثلاً: ۱"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Extra student picker — shown when participantCount > 1 */}
            {showStudentPicker && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 space-y-2">
                <p className="text-xs font-medium text-blue-700">
                  سایر فراگیران شرکت‌کننده را انتخاب کنید — جلسه برای آن‌ها هم ثبت می‌شود.
                </p>

                {extraStudents.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {extraStudents.map((s) => (
                      <span key={s.id} className="inline-flex items-center gap-1 rounded-full bg-white border border-blue-200 px-2.5 py-1 text-xs text-blue-800">
                        {s.name}
                        <button type="button" onClick={() => removeExtra(s.id)} className="text-blue-400 hover:text-blue-600">
                          <XCircle className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={extraSearch}
                    onChange={(e) => setExtraSearch(e.target.value)}
                    placeholder="جستجوی نام فراگیر..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-8 pl-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-0"
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-50 shadow-sm">
                    {searchResults.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => addExtra(s)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-right"
                      >
                        <UserPlus className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                        <span>{s.name}</span>
                        <span className="text-xs text-slate-400 mr-auto" dir="ltr">{s.username}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                {extraStudents.length > 0 && (
                  <span className="mr-1.5 text-blue-200">({extraStudents.length + 1} نفر)</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
