import { setupAPIRoute } from "@/lib/redis/middleware";
import { getSpotSummary } from "@/lib/data/pricing-server";

export const GET = setupAPIRoute(
  async () => {
    const snapshot = await getSpotSummary();
    return {
      spotUsd: snapshot.spotUsd,
      amFixUsd: snapshot.amFixUsd,
      pmFixUsd: snapshot.pmFixUsd,
      updatedAt: snapshot.updatedAt,
      source: snapshot.source
    };
  },
  {
    cacheKey: "spot",
    cacheTTL: 30
  }
);
