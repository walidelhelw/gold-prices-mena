import { isUpstashConfigured, upstashExpire, upstashIncr, upstashTtl } from "./upstash";

type RateEntry = { count: number; resetAt: number };

const globalLimiter = globalThis as unknown as { __goldRate?: Map<string, RateEntry> };
const limiter = globalLimiter.__goldRate ?? new Map<string, RateEntry>();
if (!globalLimiter.__goldRate) {
  globalLimiter.__goldRate = limiter;
}

export const checkRateLimit = async (key: string, limit: number) => {
  if (isUpstashConfigured()) {
    const count = (await upstashIncr(key)) ?? 0;
    if (count <= 1) {
      await upstashExpire(key, 60);
    }

    const ttl = (await upstashTtl(key)) ?? 60;
    if (count > limit) {
      return { allowed: false, remaining: 0, resetAt: Date.now() + ttl * 1000 };
    }

    return {
      allowed: true,
      remaining: Math.max(0, limit - count),
      resetAt: Date.now() + ttl * 1000
    };
  }

  const now = Date.now();
  const entry = limiter.get(key);
  if (!entry || now > entry.resetAt) {
    limiter.set(key, { count: 1, resetAt: now + 60_000 });
    return { allowed: true, remaining: limit - 1, resetAt: now + 60_000 };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count += 1;
  limiter.set(key, entry);
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
};
