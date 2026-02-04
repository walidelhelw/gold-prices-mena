import { setupAPIRoute } from "@/lib/redis/middleware";
import { getArticles } from "@/lib/data/articles";

export const GET = setupAPIRoute(
  async (request) => {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country")?.toLowerCase();
    const limit = Number(searchParams.get("limit") ?? "0");
    const articles = await getArticles({ country: country ?? undefined, limit: limit || undefined });

    return {
      count: articles.length,
      articles
    };
  },
  {
    cacheKey: "articles",
    cacheTTL: 300
  }
);
