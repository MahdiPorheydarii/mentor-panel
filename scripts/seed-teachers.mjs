/**
 * One-time seed: creates mentor_teachers table and populates it from Metabase.
 * Run: node scripts/seed-teachers.mjs
 *
 * Env vars needed:
 *   DATABASE_URL   — postgres connection string
 *   MB_URL         — Metabase base URL
 *   MB_USER        — Metabase username
 *   MB_PASS        — Metabase password
 *   MB_DB_ID       — Metabase database ID (default 3)
 *   DEFAULT_PASSWORD — password to set for all teachers (default Yasan@123)
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;

const DB_URL = process.env.DATABASE_URL || 'postgresql://yasan:judge0_password@postgres:5432/yasan';
const MB_URL = (process.env.MB_URL || 'https://mb.yasan.ac').replace(/\/$/, '');
const MB_USER = process.env.MB_USER || '';
const MB_PASS = process.env.MB_PASS || '';
const MB_DB_ID = parseInt(process.env.MB_DB_ID || '3', 10);
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'Yasan@123';

async function getMBSession() {
  const res = await fetch(`${MB_URL}/api/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: MB_USER, password: MB_PASS }),
  });
  if (!res.ok) throw new Error(`Metabase auth failed: ${res.status}`);
  const data = await res.json();
  return data.id;
}

async function fetchTeachers(token) {
  const res = await fetch(`${MB_URL}/api/dataset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Metabase-Session': token },
    body: JSON.stringify({
      database: MB_DB_ID,
      type: 'native',
      native: {
        query: `SELECT DISTINCT teacher_username, teacher_firstname, teacher_lastname
                FROM viewStudentProfile
                WHERE teacher_username IS NOT NULL AND teacher_username != ''
                ORDER BY teacher_username`,
      },
    }),
  });
  if (!res.ok) throw new Error(`Metabase query failed: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  const cols = data.data.cols.map((c) => c.name);
  return data.data.rows.map((row) => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
}

async function main() {
  console.log('Connecting to postgres...');
  const pool = new Pool({ connectionString: DB_URL });

  console.log('Creating mentor_teachers table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS mentor_teachers (
      username      TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  console.log('Fetching teachers from Metabase...');
  const token = await getMBSession();
  const rows = await fetchTeachers(token);
  console.log(`Found ${rows.length} teachers`);

  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  console.log(`Hashing passwords (bcrypt rounds=10)...`);

  let inserted = 0, skipped = 0;
  for (const row of rows) {
    const username = (row.teacher_username || '').trim();
    const firstname = (row.teacher_firstname || '').trim();
    const lastname = (row.teacher_lastname || '').trim();
    const name = (firstname + ' ' + lastname).trim();
    if (!username || !name) { skipped++; continue; }

    await pool.query(
      `INSERT INTO mentor_teachers (username, name, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()`,
      [username, name, hash]
    );
    inserted++;
  }

  console.log(`Done. Inserted/updated: ${inserted}, skipped: ${skipped}`);
  await pool.end();
}

main().catch((err) => { console.error(err); process.exit(1); });
