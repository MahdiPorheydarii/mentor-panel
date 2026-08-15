// Server-only Metabase client — do not import in client components
import https from 'https';

const MB_URL = (process.env.MB_URL || 'https://mb.yasan.ac').replace(/\/$/, '');
const MB_USER = process.env.MB_USER || '';
const MB_PASS = process.env.MB_PASS || '';
const MB_DB_ID = parseInt(process.env.MB_DB_ID || '3', 10);

// Ignore self-signed cert for internal Metabase
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let _sessionToken: string | null = null;
let _sessionExpiry = 0;

async function getSession(): Promise<string> {
  if (_sessionToken && Date.now() < _sessionExpiry) return _sessionToken;

  const res = await fetch(`${MB_URL}/api/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: MB_USER, password: MB_PASS }),
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Metabase auth failed: ${res.status}`);
  const data = await res.json();
  _sessionToken = data.id as string;
  _sessionExpiry = Date.now() + 13 * 60 * 1000; // refresh before 14-min expiry
  return _sessionToken;
}

type Row = Record<string, unknown>;

export async function runQuery(sql: string): Promise<Row[]> {
  const token = await getSession();

  const res = await fetch(`${MB_URL}/api/dataset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Metabase-Session': token,
    },
    body: JSON.stringify({
      database: MB_DB_ID,
      type: 'native',
      native: { query: sql },
    }),
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Metabase query failed: ${res.status}`);
  const data = await res.json();

  if (data.error) throw new Error(`Metabase error: ${data.error}`);

  const cols: string[] = (data.data?.cols ?? []).map((c: { name: string }) => c.name);
  const rows: unknown[][] = data.data?.rows ?? [];

  return rows.map((row) => {
    const obj: Row = {};
    cols.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

export { MB_DB_ID };
