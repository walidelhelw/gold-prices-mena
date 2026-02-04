import { setupAPIRoute } from "@/lib/redis/middleware";
import { getFxSummary } from "@/lib/data/pricing-server";
import { getDefaultCountry } from "@/lib/utils/geo";
import { getCountry } from "@/lib/data/countries";

export const GET = setupAPIRoute(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const quote = searchParams.get("quote")?.toUpperCase();
    const base = searchParams.get("base")?.toUpperCase() ?? "USD";

    const defaultCountry = getCountry(getDefaultCountry());
    const fallback = defaultCountry?.currency ?? "USD";
    const currency = quote ?? fallback;

    const result = await getFxSummary(currency);

    return {
      base,
      quote: currency,
      rate: result.rate,
      updatedAt: result.updatedAt,
      source: result.source
    };
  },
  {
    cacheKey: "fx",
    cacheTTL: 300
  }
);
