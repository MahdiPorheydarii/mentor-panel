import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getPool } from './db';
import bcrypt from 'bcryptjs';

const COOKIE = 'mentor_session';
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'dev-secret-change-in-production-32chars!!'
);

export interface SessionPayload {
  username: string;
  name: string;
}

export async function findAndVerifyTeacher(
  username: string,
  password: string
): Promise<SessionPayload | null> {
  try {
    const pool = getPool();
    const { rows } = await pool.query<{ username: string; name: string; password_hash: string }>(
      'SELECT username, name, password_hash FROM mentor_teachers WHERE username = $1 LIMIT 1',
      [username]
    );
    if (!rows.length) return null;
    const teacher = rows[0];
    const ok = await bcrypt.compare(password, teacher.password_hash);
    if (!ok) return null;
    return { username: teacher.username, name: teacher.name };
  } catch (err) {
    console.error('[auth] DB error:', err);
    return null;
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
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
