import { setupAPIRoute } from "@/lib/redis/middleware";
import { getPriceSnapshot } from "@/lib/data/pricing-server";
import { getDefaultCountry, normalizeCountry } from "@/lib/utils/geo";

export const GET = setupAPIRoute(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const country = normalizeCountry(searchParams.get("country")) ?? getDefaultCountry();
    const city = searchParams.get("city")?.toLowerCase() ?? null;
    const snapshot = await getPriceSnapshot(country, city);
    return {
      country,
      city,
      updatedAt: snapshot.updatedAt,
      localPerGram: snapshot.localPerGram,
      currency: snapshot.currency
    };
  },
  {
    cacheKey: "prices-latest",
    cacheTTL: 30
  }
);
