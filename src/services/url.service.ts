import { nanoid } from 'nanoid';
import redis from '../configs/redis';
import { urlRepository } from '../repositories/url.repository';
import { ShortenResponse } from '../types';

const CACHE_TTL = 86_400; // 24 saat (saniyə ilə)

export const urlService = {
  async shorten(originalUrl: string): Promise<ShortenResponse> {
    try {
      new URL(originalUrl);
    } catch {
      throw new Error('Invalid URL');
    }

    const shortCode = nanoid(7);
    await urlRepository.insert(shortCode, originalUrl);
    await redis.set(`url:${shortCode}`, originalUrl, { EX: CACHE_TTL });

    return {
      shortCode,
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
      originalUrl,
    };
  },

  async resolve(shortCode: string): Promise<string | null> {
    const cached = await redis.get(`url:${shortCode}`);

    if (cached) {
      await redis.incr(`clicks:${shortCode}`);
      return cached;
    }
    const url = await urlRepository.findByCode(shortCode);
    if (!url) return null;
    await redis.set(`url:${shortCode}`, url.original_url, { EX: CACHE_TTL });
    await redis.incr(`clicks:${shortCode}`);

    return url.original_url;
  },
};
