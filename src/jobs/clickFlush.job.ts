import redis from '../configs/redis';
import { urlRepository } from '../repositories/url.repository';

const FLUSH_INTERVAL_MS = 5 * 60 * 1000;

async function flushClicksToPostgres(): Promise<void> {
  try {
    const keys = await redis.keys('clicks:*');
    if (keys.length === 0) return;
    for (const key of keys) {
      const shortCode = key.replace('clicks:', '');
      const clicks = await redis.getDel(key);
      if (clicks && parseInt(clicks) > 0) {
        await urlRepository.incrementClicks(shortCode, parseInt(clicks));
        console.log(`[ClickFlush] ${shortCode} → +${clicks} clicks synced`);
      }
    }
  } catch (err) {
    console.error('[ClickFlush] Error:', err);
  }
}

export function startClickFlushJob(): void {
  console.log('[ClickFlush] Job started — interval: 5 min');
  setInterval(flushClicksToPostgres, FLUSH_INTERVAL_MS);
}
