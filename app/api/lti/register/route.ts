/**
 * LTI Platform Registration (admin-only)
 *
 * POST /api/lti/register  – register or update a Moodle platform
 * GET  /api/lti/register  – list registered platforms
 * DELETE /api/lti/register?id=N – remove a platform
 *
 * Requires a valid mentor session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerPlatform, listPlatforms, deletePlatform } from '@/lib/lti';
import { getSession } from '@/lib/auth';

async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireSession();
    const platforms = await listPlatforms();
    return NextResponse.json({ platforms });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireSession();
    const body = await req.json();
    const { issuer, client_id, auth_endpoint, jwks_endpoint, token_endpoint, deployment_id } = body;

    if (!issuer || !client_id || !auth_endpoint || !jwks_endpoint || !token_endpoint || !deployment_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const platform = await registerPlatform({
      issuer,
      client_id,
      auth_endpoint,
      jwks_endpoint,
      token_endpoint,
      deployment_id,
    });

    return NextResponse.json({ platform });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireSession();
    const id = req.nextUrl.searchParams.get('id');
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    await deletePlatform(parseInt(id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: message }, { status: message === 'Unauthorized' ? 401 : 500 });
  }
}
