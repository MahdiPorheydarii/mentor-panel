/**
 * LTI 1.3 OIDC Login Initiation
 *
 * Moodle sends a GET or POST here first (the "third-party login initiation").
 * We validate the platform, generate a nonce+state, and redirect to Moodle's
 * authorization endpoint so it can send us a signed JWT.
 *
 * Required query/body params from Moodle:
 *   iss          – platform issuer URL
 *   client_id    – our client ID registered in Moodle
 *   login_hint   – opaque Moodle user hint (passed back verbatim)
 *   lti_message_hint – opaque hint (passed back verbatim if present)
 *   target_link_uri  – where to land after launch (should be /api/lti/launch)
 */

import { NextRequest, NextResponse } from 'next/server';
import { findPlatform, saveState, randomToken } from '@/lib/lti';

export const dynamic = 'force-dynamic';

async function handle(params: URLSearchParams): Promise<NextResponse> {
  const iss = params.get('iss');
  const clientId = params.get('client_id');
  const loginHint = params.get('login_hint');
  const ltiMessageHint = params.get('lti_message_hint');
  const targetLinkUri = params.get('target_link_uri') ?? `${process.env.NEXTAUTH_URL ?? ''}/api/lti/launch`;

  if (!iss || !clientId || !loginHint) {
    return NextResponse.json({ error: 'Missing required LTI initiation params' }, { status: 400 });
  }

  const platform = await findPlatform(iss, clientId);
  if (!platform) {
    return NextResponse.json({ error: `Platform not registered: ${iss} / ${clientId}` }, { status: 403 });
  }

  const state = randomToken(32);
  const nonce = randomToken(32);

  await saveState(state, nonce, platform.id, targetLinkUri);

  const launchUrl = process.env.LTI_LAUNCH_URL
    ?? `${process.env.NEXTAUTH_URL ?? ''}/api/lti/launch`;

  const redirect = new URL(platform.auth_endpoint);
  redirect.searchParams.set('scope', 'openid');
  redirect.searchParams.set('response_type', 'id_token');
  redirect.searchParams.set('client_id', clientId);
  redirect.searchParams.set('redirect_uri', launchUrl);
  redirect.searchParams.set('login_hint', loginHint);
  redirect.searchParams.set('state', state);
  redirect.searchParams.set('response_mode', 'form_post');
  redirect.searchParams.set('nonce', nonce);
  redirect.searchParams.set('prompt', 'none');
  if (ltiMessageHint) redirect.searchParams.set('lti_message_hint', ltiMessageHint);

  return NextResponse.redirect(redirect.toString());
}

export async function GET(req: NextRequest) {
  return handle(req.nextUrl.searchParams);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  return handle(new URLSearchParams(body));
}
