import { setupAPIRoute } from "@/lib/redis/middleware";
import { getPriceHistory } from "@/lib/data/pricing-server";
import { getDefaultCountry, normalizeCountry } from "@/lib/utils/geo";

export const GET = setupAPIRoute(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const country = normalizeCountry(searchParams.get("country")) ?? getDefaultCountry();
    const days = Number(searchParams.get("days") ?? "30");
    const history = await getPriceHistory(country, Number.isFinite(days) ? days : 30);

    return {
      country,
      days: Number.isFinite(days) ? days : 30,
      history
    };
  },
  {
    cacheKey: "prices-history",
    cacheTTL: 300
  }
);
