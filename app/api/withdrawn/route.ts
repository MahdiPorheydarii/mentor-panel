import { NextResponse } from 'next/server';
import { fetchWithdrawnStudents } from '@/lib/queries';

export async function GET() {
  try {
    const students = await fetchWithdrawnStudents();
    return NextResponse.json(students);
  } catch (err) {
    console.error('[/api/withdrawn]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
