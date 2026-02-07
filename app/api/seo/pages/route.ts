import { setupAPIRoute } from "@/lib/redis/middleware";
import { getSeoPageCandidates } from "@/lib/data/dealers-server";
import { getDefaultCountry, normalizeCountry } from "@/lib/utils/geo";
import { parseSeoTemplateVariant } from "@/lib/types/market";

export const GET = setupAPIRoute(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const country = normalizeCountry(searchParams.get("country")) ?? getDefaultCountry();
    const template = parseSeoTemplateVariant(searchParams.get("template"));

    const pages = await getSeoPageCandidates({ template, countryCode: country });

    return {
      template,
      country,
      count: pages.length,
      pages
    };
  },
  {
    cacheKey: "seo-pages",
    cacheTTL: 600
  }
);
