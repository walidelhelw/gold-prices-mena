import { setupAPIRoute } from "@/lib/redis/middleware";
import { buildSnapshot } from "@/lib/data/pricing";

export const GET = setupAPIRoute(async () => {
  const snapshot = buildSnapshot("eg");
  return {
    spotUsd: snapshot.spotUsd,
    amFixUsd: snapshot.amFixUsd,
    pmFixUsd: snapshot.pmFixUsd,
    updatedAt: snapshot.updatedAt
  };
}, {
  cacheKey: "spot",
  cacheTTL: 30
});
