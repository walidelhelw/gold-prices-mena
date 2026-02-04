import { setupAPIRoute } from "@/lib/redis/middleware";
import { buildSnapshot } from "@/lib/data/pricing";
import { getDefaultCountry, normalizeCountry } from "@/lib/utils/geo";

export const GET = setupAPIRoute(async (request) => {
  const { searchParams } = new URL(request.url);
  const country = normalizeCountry(searchParams.get("country")) ?? getDefaultCountry();
  const city = searchParams.get("city")?.toLowerCase() ?? null;
  const snapshot = buildSnapshot(country);
  return {
    country,
    city,
    snapshot
  };
}, {
  cacheKey: "prices",
  cacheTTL: 60
});
