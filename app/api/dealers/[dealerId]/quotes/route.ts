import { setupAPIRoute } from "@/lib/redis/middleware";
import { getDealerQuotes } from "@/lib/data/dealers-server";
import { NextResponse } from "next/server";

export const GET = setupAPIRoute(
  async (request) => {
    const url = new URL(request.url);
    const daysRaw = Number(url.searchParams.get("days") ?? "30");
    const days = Number.isFinite(daysRaw) ? Math.min(90, Math.max(1, daysRaw)) : 30;

    const segments = url.pathname.split("/").filter(Boolean);
    const quotesIndex = segments.findIndex((segment) => segment === "quotes");
    const dealerId = quotesIndex > 0 ? segments[quotesIndex - 1] : "";

    if (!dealerId) {
      return NextResponse.json({ error: "Missing dealerId" }, { status: 400 });
    }

    const quotes = await getDealerQuotes(dealerId, days);

    return {
      dealerId,
      days,
      count: quotes.length,
      quotes
    };
  },
  {
    cacheKey: "dealer-quotes",
    cacheTTL: 120
  }
);
