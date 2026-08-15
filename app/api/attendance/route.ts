import { NextResponse } from 'next/server';
import { fetchAttendance } from '@/lib/queries';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  const teacher = session?.username;
  if (!teacher) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const records = await fetchAttendance(teacher);
    return NextResponse.json(records);
  } catch (err) {
    console.error('[/api/attendance]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
