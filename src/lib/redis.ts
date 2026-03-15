import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

function createRedis(): Redis {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  const client = new Redis(url, { maxRetriesPerRequest: 3, lazyConnect: true });
  client.on("error", () => {});
  return client;
}

function getRedis(): Redis {
  if (globalForRedis.redis) return globalForRedis.redis;
  const client = createRedis();
  if (process.env.NODE_ENV !== "production") globalForRedis.redis = client;
  return client;
}

export const redis = getRedis();

export async function getCached<T>(key: string, fetcher: () => Promise<T>, ttlSeconds = 60): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached) as T;
  const value = await fetcher();
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
  return value;
}

export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(...keys);
}
