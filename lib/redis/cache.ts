import { isUpstashConfigured, upstashGet, upstashSetEx } from "./upstash";

type CacheEntry = {
  value: string;
  expiresAt: number;
};

const globalCache = globalThis as unknown as { __goldCache?: Map<string, CacheEntry> };

const cacheStore = globalCache.__goldCache ?? new Map<string, CacheEntry>();
if (!globalCache.__goldCache) {
  globalCache.__goldCache = cacheStore;
}

export const getCache = async (key: string) => {
  if (isUpstashConfigured()) {
    const cached = await upstashGet(key);
    if (typeof cached === "string") {
      return cached;
    }
  }

  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }
  return entry.value;
};

export const setCache = async (key: string, value: string, ttlSeconds: number) => {
  if (isUpstashConfigured()) {
    await upstashSetEx(key, ttlSeconds, value);
    return;
  }

  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000
  });
};
