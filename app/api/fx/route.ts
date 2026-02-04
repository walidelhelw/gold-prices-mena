import { setupAPIRoute } from "@/lib/redis/middleware";
import { getFxRate } from "@/lib/data/pricing";
import { getDefaultCountry } from "@/lib/utils/geo";
import { getCountry } from "@/lib/data/countries";

export const GET = setupAPIRoute(async (request) => {
  const { searchParams } = new URL(request.url);
  const quote = searchParams.get("quote")?.toUpperCase();
  const base = searchParams.get("base")?.toUpperCase() ?? "USD";

  const defaultCountry = getCountry(getDefaultCountry());
  const fallback = defaultCountry?.currency ?? "USD";
  const currency = quote ?? fallback;
  const rate = getFxRate(currency);

  return {
    base,
    quote: currency,
    rate,
    updatedAt: new Date().toISOString()
  };
}, {
  cacheKey: "fx",
  cacheTTL: 300
});
