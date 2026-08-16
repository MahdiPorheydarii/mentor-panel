/**
 * LTI 1.3 Resource Link Launch
 *
 * Moodle POSTs here with:
 *   id_token – signed JWT containing LTI claims
 *   state    – the opaque value we sent in the initiation redirect
 *
 * We validate both, then create a mentor-panel session for the user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { consumeState, findPlatform, validateLtiJwt, isInstructor } from '@/lib/lti';
import { createSession } from '@/lib/auth';
import { getPool } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Ensure the LTI user exists in our teacher table and return their username.
async function upsertLtiTeacher(email: string, name: string): Promise<string> {
  const pool = getPool();
  // username = email for LTI users; password_hash is a locked placeholder
  await pool.query(
    `INSERT INTO mentor_teachers (username, name, password_hash)
     VALUES ($1, $2, 'lti-sso')
     ON CONFLICT (username) DO UPDATE SET name = EXCLUDED.name`,
    [email, name]
  );
  return email;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const idToken = params.get('id_token');
    const state = params.get('state');

    if (!idToken || !state) {
      return NextResponse.json({ error: 'Missing id_token or state' }, { status: 400 });
    }

    // Consume the state record (validates it hasn't expired and wasn't replayed)
    const stateRecord = await consumeState(state);
    if (!stateRecord) {
      return NextResponse.json({ error: 'Invalid or expired state' }, { status: 400 });
    }

    // Re-fetch the platform by ID (stored in state record)
    const pool = getPool();
    const { rows: platformRows } = await pool.query(
      'SELECT * FROM lti_platforms WHERE id = $1',
      [stateRecord.platform_id]
    );
    if (!platformRows[0]) {
      return NextResponse.json({ error: 'Platform not found' }, { status: 400 });
    }
    const platform = platformRows[0];

    // Validate the JWT signature + claims
    const claims = await validateLtiJwt(idToken, platform, stateRecord.nonce);

    const email = claims.email ?? `lti-${claims.sub}@${new URL(platform.issuer).hostname}`;
    const name = claims.name ?? claims.given_name ?? email;
    const roles = claims['https://purl.imsglobal.org/spec/lti/claim/roles'] ?? [];

    // Only allow instructors/admins through (Moodle students are not mentors)
    if (!isInstructor(roles)) {
      return NextResponse.json(
        { error: 'Access denied: only instructors can access the mentor panel' },
        { status: 403 }
      );
    }

    const username = await upsertLtiTeacher(email, name);

    const token = await createSession({ username, name });

    const cookieStore = await cookies();
    cookieStore.set('mentor_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // Redirect to the target link or the panel root
    const target = stateRecord.target_uri || '/';
    const targetUrl = target.startsWith('http') ? target : `${process.env.NEXTAUTH_URL ?? ''}${target}`;

    return NextResponse.redirect(targetUrl);
  } catch (err) {
    console.error('LTI launch error:', err);
    const message = err instanceof Error ? err.message : 'Launch failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
