'use server';

import { createSession, loadTeachers, setSessionCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const username = (formData.get('username') as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null) ?? '';

  const teachers = loadTeachers();
  const teacher = teachers.find((t) => t.username === username);

  if (!teacher || teacher.password !== password) {
    return { error: 'نام کاربری یا رمز عبور اشتباه است.' };
  }

  const token = await createSession({ username: teacher.username, name: teacher.name });
  await setSessionCookie(token);
  redirect('/');
}
