import { createClient } from 'redis';

const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

redis.on('connect', () => console.log('[Cache] Redis connected'));
redis.on('error', (err) => console.error('[Cache] Redis error:', err));

export default redis;
