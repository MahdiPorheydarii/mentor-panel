import { NextResponse } from 'next/server';
import { fetchStudents } from '@/lib/queries';

export async function GET() {
  try {
    const students = await fetchStudents();
    return NextResponse.json(students);
  } catch (err) {
    console.error('[/api/students]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
