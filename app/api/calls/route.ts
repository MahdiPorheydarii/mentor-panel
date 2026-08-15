import { NextResponse } from 'next/server';
import { fetchCallLogs } from '@/lib/queries';

export async function GET() {
  try {
    const logs = await fetchCallLogs();
    return NextResponse.json(logs);
  } catch (err) {
    console.error('[/api/calls]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
