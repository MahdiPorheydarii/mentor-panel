'use server';

import { findAndVerifyTeacher, createSession, setSessionCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const username = (formData.get('username') as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null) ?? '';

  const session = await findAndVerifyTeacher(username, password);
  if (!session) {
    return { error: 'نام کاربری یا رمز عبور اشتباه است.' };
  }

  const token = await createSession(session);
  await setSessionCookie(token);
  redirect('/');
}
