import { isUpstashConfigured, upstashCommand, upstashDel } from "@/lib/redis/upstash";

const memoryLock = globalThis as unknown as { __goldLocks?: Map<string, number> };
const lockStore = memoryLock.__goldLocks ?? new Map<string, number>();
if (!memoryLock.__goldLocks) {
  memoryLock.__goldLocks = lockStore;
}

export const acquireLock = async (key: string, ttlSeconds = 120) => {
  if (isUpstashConfigured()) {
    const result = await upstashCommand<string>(["SET", key, "1", "EX", ttlSeconds, "NX"]);
    return result === "OK";
  }

  const now = Date.now();
  const current = lockStore.get(key);
  if (current && current > now) {
    return false;
  }

  lockStore.set(key, now + ttlSeconds * 1000);
  return true;
};

export const releaseLock = async (key: string) => {
  if (isUpstashConfigured()) {
    await upstashDel(key);
    return;
  }

  lockStore.delete(key);
};
