/**
 * LTI 1.3 Tool-side helpers.
 *
 * The mentor panel acts as an LTI Tool (not a Platform).
 * Moodle (the Platform) launches the tool via OIDC/JWT.
 *
 * Environment variables required:
 *   LTI_PRIVATE_KEY_B64  – base64-encoded PKCS#8 PEM private key
 *   LTI_PUBLIC_KEY_B64   – base64-encoded SPKI PEM public key
 *   LTI_KID              – key ID string (default: "lti-key-1")
 */

import { importPKCS8, importSPKI, exportJWK, jwtVerify, createRemoteJWKSet } from 'jose';
import { getPool } from './db';
import crypto from 'crypto';

export const LTI_KID = process.env.LTI_KID || 'lti-key-1';

function getKeyPem(envVar: string): string {
  const b64 = process.env[envVar];
  if (!b64) throw new Error(`Missing env var ${envVar}`);
  return Buffer.from(b64, 'base64').toString('utf8');
}

export async function getPrivateKey() {
  return importPKCS8(getKeyPem('LTI_PRIVATE_KEY_B64'), 'RS256');
}

export async function getPublicKey() {
  return importSPKI(getKeyPem('LTI_PUBLIC_KEY_B64'), 'RS256');
}

export async function buildJwks() {
  const pub = await getPublicKey();
  const jwk = await exportJWK(pub);
  return { keys: [{ ...jwk, kid: LTI_KID, alg: 'RS256', use: 'sig' }] };
}

// ── Platform registry ──────────────────────────────────────────────────────

export interface LtiPlatform {
  id: number;
  issuer: string;           // e.g. https://moodle.example.com
  client_id: string;
  auth_endpoint: string;    // Moodle's /mod/lti/auth.php
  jwks_endpoint: string;    // Moodle's /mod/lti/certs.php
  token_endpoint: string;   // Moodle's /mod/lti/token.php
  deployment_id: string;
}

export async function findPlatform(issuer: string, clientId: string): Promise<LtiPlatform | null> {
  const pool = getPool();
  const { rows } = await pool.query<LtiPlatform>(
    'SELECT * FROM lti_platforms WHERE issuer = $1 AND client_id = $2 LIMIT 1',
    [issuer, clientId]
  );
  return rows[0] ?? null;
}

export async function listPlatforms(): Promise<LtiPlatform[]> {
  const pool = getPool();
  const { rows } = await pool.query<LtiPlatform>('SELECT * FROM lti_platforms ORDER BY id');
  return rows;
}

export async function registerPlatform(p: Omit<LtiPlatform, 'id'>): Promise<LtiPlatform> {
  const pool = getPool();
  const { rows } = await pool.query<LtiPlatform>(
    `INSERT INTO lti_platforms (issuer, client_id, auth_endpoint, jwks_endpoint, token_endpoint, deployment_id)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (issuer, client_id) DO UPDATE
       SET auth_endpoint=$3, jwks_endpoint=$4, token_endpoint=$5, deployment_id=$6
     RETURNING *`,
    [p.issuer, p.client_id, p.auth_endpoint, p.jwks_endpoint, p.token_endpoint, p.deployment_id]
  );
  return rows[0];
}

export async function deletePlatform(id: number): Promise<void> {
  const pool = getPool();
  await pool.query('DELETE FROM lti_platforms WHERE id = $1', [id]);
}

// ── Nonce / state store ────────────────────────────────────────────────────

export async function saveState(state: string, nonce: string, platformId: number, targetUri: string) {
  const pool = getPool();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await pool.query(
    `INSERT INTO lti_states (state, nonce, platform_id, target_uri, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [state, nonce, platformId, targetUri, expiresAt]
  );
}

export interface StateRecord {
  state: string;
  nonce: string;
  platform_id: number;
  target_uri: string;
}

export async function consumeState(state: string): Promise<StateRecord | null> {
  const pool = getPool();
  const { rows } = await pool.query<StateRecord>(
    `DELETE FROM lti_states WHERE state = $1 AND expires_at > NOW() RETURNING *`,
    [state]
  );
  return rows[0] ?? null;
}

// ── JWT validation ─────────────────────────────────────────────────────────

export interface LtiClaims {
  sub: string;                   // Moodle user ID
  name?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  'https://purl.imsglobal.org/spec/lti/claim/roles'?: string[];
  'https://purl.imsglobal.org/spec/lti/claim/deployment_id'?: string;
  'https://purl.imsglobal.org/spec/lti/claim/message_type'?: string;
  'https://purl.imsglobal.org/spec/lti/claim/version'?: string;
  nonce?: string;
  iss?: string;
  aud?: string | string[];
}

export async function validateLtiJwt(
  idToken: string,
  platform: LtiPlatform,
  expectedNonce: string
): Promise<LtiClaims> {
  const JWKS = createRemoteJWKSet(new URL(platform.jwks_endpoint));

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: platform.issuer,
    audience: platform.client_id,
  });

  const claims = payload as unknown as LtiClaims;

  if (claims.nonce !== expectedNonce) {
    throw new Error('Nonce mismatch');
  }

  const msgType = claims['https://purl.imsglobal.org/spec/lti/claim/message_type'];
  if (msgType !== 'LtiResourceLinkRequest') {
    throw new Error(`Unexpected LTI message type: ${msgType}`);
  }

  return claims;
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function isInstructor(roles: string[] = []): boolean {
  return roles.some((r) =>
    r.includes('Instructor') || r.includes('TeachingAssistant') || r.includes('Administrator')
  );
}
