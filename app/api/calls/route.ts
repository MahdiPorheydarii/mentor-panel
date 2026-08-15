import { NextResponse } from 'next/server';
import { fetchCallLogs } from '@/lib/queries';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  const teacher = session?.username;
  if (!teacher) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const logs = await fetchCallLogs(teacher);
    return NextResponse.json(logs);
  } catch (err) {
    console.error('[/api/calls]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
