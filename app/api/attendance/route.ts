import { NextResponse } from 'next/server';
import { fetchAttendance } from '@/lib/queries';

export async function GET() {
  try {
    const records = await fetchAttendance();
    return NextResponse.json(records);
  } catch (err) {
    console.error('[/api/attendance]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
