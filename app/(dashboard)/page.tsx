import { Users, UserCheck, AlertTriangle, ClipboardX } from 'lucide-react';
import { fetchStudents } from '@/lib/queries';
import { StudentsTable } from '@/components/dashboard/StudentsTable';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getSession();
  const teacher = session?.username ?? '';
  const students = await fetchStudents(teacher);

  const total = students.length;
  const active = students.filter((s) => s.status === 'active').length;
  const warnings = students.filter((s) => s.withdrawalWarning).length;
  const incompleteCards = students.filter((s) => !s.reportCardDone).length;

  const stats = [
    { label: 'کل دانشجویان', value: total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'دانشجویان فعال', value: active, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'هشدار انصراف', value: warnings, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'کارنامه‌های ناقص', value: incompleteCards, icon: ClipboardX, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{label}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">کلاس‌های من</h1>
          <p className="text-xs text-slate-400">داده‌های زنده از Moodle</p>
        </div>
        <StudentsTable students={students} />
      </div>
    </div>
  );
}
