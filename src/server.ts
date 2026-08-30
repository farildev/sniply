import app from './app';
import pool from './configs/db';
import redis from './configs/redis';
const PORT = process.env.PORT || 3000;

async function bootstrap(): Promise<void> {
  try {
    await pool.query('SELECT 1');
    console.log('[DB] PostgreSQL connected');
    await redis.connect();
    console.log('[Cache] Redis connected');
    app.listen(PORT, () => {
      console.log(`[Server] Sniply running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

bootstrap();
