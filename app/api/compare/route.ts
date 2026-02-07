import { setupAPIRoute } from "@/lib/redis/middleware";
import { compareCityPrices } from "@/lib/data/dealers-server";
import { getDefaultCountry, normalizeCountry } from "@/lib/utils/geo";
import { citiesByCountry } from "@/lib/data/countries";

export const GET = setupAPIRoute(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const country = normalizeCountry(searchParams.get("country")) ?? getDefaultCountry();
    const fallbackCity = citiesByCountry[country]?.[0]?.slug ?? "cairo";
    const city = searchParams.get("city")?.toLowerCase() ?? fallbackCity;
    const targetCity = searchParams.get("targetCity")?.toLowerCase() ?? citiesByCountry[country]?.[1]?.slug ?? fallbackCity;

    const comparison = await compareCityPrices(country, city, targetCity);

    return {
      country,
      city,
      targetCity,
      comparison
    };
  },
  {
    cacheKey: "city-compare",
    cacheTTL: 90
  }
);
