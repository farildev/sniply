import { Pool } from 'pg';

const pool = new Pool({
  host:     process.env.PG_HOST     || 'localhost',
  port:     Number(process.env.PG_PORT) || 5432,
  database: process.env.PG_DATABASE || 'sniply',
  user:     process.env.PG_USER     || 'sniply',
  password: process.env.PG_PASSWORD || 'secret',
  max:      20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
  process.exit(1);
});

export default pool;
