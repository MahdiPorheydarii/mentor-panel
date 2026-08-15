import { NextResponse } from 'next/server';
import { fetchWithdrawnStudents } from '@/lib/queries';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  const teacher = session?.username;
  if (!teacher) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const students = await fetchWithdrawnStudents(teacher);
    return NextResponse.json(students);
  } catch (err) {
    console.error('[/api/withdrawn]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
