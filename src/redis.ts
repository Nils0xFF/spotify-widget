import { createClient, RedisClientType } from 'redis';

const globalForRedis = globalThis as unknown as { redis: RedisClientType };

export const redis =
  globalForRedis.redis ||
  (await createClient({ url: process.env.REDIS_URL }).connect());

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
