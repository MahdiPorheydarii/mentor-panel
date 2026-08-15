import { fetchStudents } from '@/lib/queries';
import { ClipboardList } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { CardsClient } from './CardsClient';

export const dynamic = 'force-dynamic';

export default async function CardsPage() {
  const session = await getSession();
  const teacher = session?.username ?? '';
  const students = await fetchStudents(teacher);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
          <ClipboardList className="h-5 w-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">وضعیت کارنامه</h1>
        </div>
      </div>

      <CardsClient students={students} />
    </div>
  );
}
