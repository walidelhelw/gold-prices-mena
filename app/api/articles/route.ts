import { setupAPIRoute } from "@/lib/redis/middleware";
import { articles } from "@/lib/data/articles";

export const GET = setupAPIRoute(async (request) => {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country")?.toLowerCase();
  const filtered = country
    ? articles.filter((article) => article.countryCodes.includes(country))
    : articles;

  return {
    count: filtered.length,
    articles: filtered
  };
}, {
  cacheKey: "articles",
  cacheTTL: 300
});
