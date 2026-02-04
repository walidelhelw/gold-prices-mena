import { NextResponse } from "next/server";
import { setupAPIRoute } from "@/lib/redis/middleware";
import { getArticleBySlug } from "@/lib/data/articles";

export const GET = setupAPIRoute(
  async (request) => {
    const { pathname } = new URL(request.url);
    const slug = pathname.split("/").filter(Boolean).pop() ?? "";
    const article = await getArticleBySlug(slug);

    if (!article) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return { article };
  },
  {
    cacheKey: "article",
    cacheTTL: 300
  }
);
