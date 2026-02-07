const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isUpstashConfigured = () => Boolean(redisUrl && redisToken);

export const upstashCommand = async <T>(command: unknown[]) => {
  if (!isUpstashConfigured()) return null;

  const response = await fetch(redisUrl!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisToken!}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command),
    cache: "no-store"
  });

  if (!response.ok) return null;
  const payload = (await response.json()) as { result?: T };
  return (payload?.result ?? null) as T | null;
};

export const upstashGet = (key: string) => upstashCommand<string>(["GET", key]);

export const upstashSetEx = (key: string, ttlSeconds: number, value: string) =>
  upstashCommand(["SETEX", key, ttlSeconds, value]);

export const upstashIncr = (key: string) => upstashCommand<number>(["INCR", key]);

export const upstashExpire = (key: string, ttlSeconds: number) =>
  upstashCommand<number>(["EXPIRE", key, ttlSeconds]);

export const upstashTtl = (key: string) => upstashCommand<number>(["TTL", key]);

export const upstashDel = (key: string) => upstashCommand<number>(["DEL", key]);
