import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE = 'mentor_session';
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'dev-secret-change-in-production-32chars!!'
);

export interface SessionPayload {
  username: string;
  name: string;
}

export interface TeacherConfig {
  username: string;
  name: string;
  password: string;
}

export function loadTeachers(): TeacherConfig[] {
  const raw = process.env.TEACHERS_JSON;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as TeacherConfig[];
  } catch {
    console.error('TEACHERS_JSON is invalid JSON');
    return [];
  }
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return { username: payload.username as string, name: payload.name as string };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
