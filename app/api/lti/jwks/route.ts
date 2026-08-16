import { NextResponse } from 'next/server';
import { buildJwks } from '@/lib/lti';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const jwks = await buildJwks();
    return NextResponse.json(jwks, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (err) {
    console.error('JWKS error:', err);
    return NextResponse.json({ error: 'Failed to build JWKS' }, { status: 500 });
  }
}
