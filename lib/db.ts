import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

export function getPool(): Pool {
  if (!global.__pgPool) {
    global.__pgPool = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://yasan:judge0_password@postgres:5432/yasan',
      max: 5,
      idleTimeoutMillis: 30000,
    });
  }
  return global.__pgPool;
}
