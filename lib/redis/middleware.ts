import { NextResponse } from "next/server";
import { getCache, setCache } from "./cache";
import { checkRateLimit } from "./rate-limit";
import { checkQuota } from "./quota";

export type UserTier = "free" | "batch1" | "batch2" | "firstlaunch" | "official" | "pro" | "institutional";

const tierLimits: Record<UserTier, number> = {
  free: 20,
  batch1: 500,
  batch2: 500,
  firstlaunch: 500,
  official: 200,
  pro: 200,
  institutional: 500
};

const getClientKey = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";

const getUserTier = (request: Request): UserTier => {
  const headerTier = request.headers.get("x-user-tier");
  if (!headerTier) return "free";
  return (headerTier.toLowerCase() as UserTier) ?? "free";
};

export const setupAPIRoute = <T>(
  handler: (request: Request, context: { userTier: UserTier; userId?: string }) => Promise<T> | T,
  options?: { cacheKey?: string; cacheTTL?: number }
) =>
  async function wrapped(request: Request) {
    const userTier = getUserTier(request);
    const limit = tierLimits[userTier] ?? tierLimits.free;
    const rateKey = `${getClientKey(request)}:${options?.cacheKey ?? request.url}`;
    const rateResult = checkRateLimit(rateKey, limit);

    if (!rateResult.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    if (options?.cacheKey && options.cacheTTL && request.method === "GET") {
      const cached = getCache(`${options.cacheKey}:${request.url}`);
      if (cached) {
        return new NextResponse(cached, {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    const result = await handler(request, { userTier });
    const response = NextResponse.json(result);

    if (options?.cacheKey && options.cacheTTL && request.method === "GET") {
      setCache(`${options.cacheKey}:${request.url}`, JSON.stringify(result), options.cacheTTL);
    }

    return response;
  };

export const setupAIRoute = <T>(
  handler: (request: Request, context: { userTier: UserTier; userId?: string }) => Promise<T> | T,
  options?: { quotaType?: string }
) =>
  async function wrapped(request: Request) {
    const userTier = getUserTier(request);
    const quota = checkQuota();
    if (!quota.allowed) {
      return NextResponse.json({ error: "Quota exceeded" }, { status: 429 });
    }
    const result = await handler(request, { userTier });
    return NextResponse.json(result);
  };
