import { setupAPIRoute } from "@/lib/redis/middleware";
import { getMarketSignal } from "@/lib/data/dealers-server";
import { getDefaultCountry, normalizeCountry } from "@/lib/utils/geo";
import { citiesByCountry } from "@/lib/data/countries";

export const GET = setupAPIRoute(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const country = normalizeCountry(searchParams.get("country")) ?? getDefaultCountry();
    const fallbackCity = citiesByCountry[country]?.[0]?.slug ?? "cairo";
    const city = searchParams.get("city")?.toLowerCase() ?? fallbackCity;

    const signal = await getMarketSignal(country, city);

    return {
      country,
      city,
      signal
    };
  },
  {
    cacheKey: "signals",
    cacheTTL: 120
  }
);
