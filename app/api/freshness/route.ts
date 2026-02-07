import { setupAPIRoute } from "@/lib/redis/middleware";
import { getFreshnessStatus, getRankingReadiness } from "@/lib/data/dealers-server";
import { getDefaultCountry, normalizeCountry } from "@/lib/utils/geo";
import { citiesByCountry } from "@/lib/data/countries";

export const GET = setupAPIRoute(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const country = normalizeCountry(searchParams.get("country")) ?? getDefaultCountry();
    const fallbackCity = citiesByCountry[country]?.[0]?.slug ?? "cairo";
    const city = searchParams.get("city")?.toLowerCase() ?? fallbackCity;

    const [freshness, readiness] = await Promise.all([
      getFreshnessStatus(country, city),
      getRankingReadiness(country, city)
    ]);

    return {
      country,
      city,
      freshness,
      readiness
    };
  },
  {
    cacheKey: "freshness",
    cacheTTL: 45
  }
);
