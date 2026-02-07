import { setupAPIRoute } from "@/lib/redis/middleware";
import { getDealers, getRankingReadiness } from "@/lib/data/dealers-server";
import { getDefaultCountry, normalizeCountry } from "@/lib/utils/geo";
import { parseDealerSort, parseQuoteIntent } from "@/lib/types/market";
import { citiesByCountry } from "@/lib/data/countries";

export const GET = setupAPIRoute(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const country = normalizeCountry(searchParams.get("country")) ?? getDefaultCountry();
    const fallbackCity = citiesByCountry[country]?.[0]?.slug ?? "cairo";
    const city = searchParams.get("city")?.toLowerCase() ?? fallbackCity;
    const intent = parseQuoteIntent(searchParams.get("intent"));
    const sort = parseDealerSort(searchParams.get("sort"));

    const dealers = await getDealers({
      countryCode: country,
      citySlug: city,
      intent,
      sort
    });
    const readiness = await getRankingReadiness(country, city);

    return {
      country,
      city,
      intent,
      sort,
      rankingEnabled: readiness.rankingEnabled,
      readiness,
      count: dealers.length,
      dealers
    };
  },
  {
    cacheKey: "dealers",
    cacheTTL: 90
  }
);
