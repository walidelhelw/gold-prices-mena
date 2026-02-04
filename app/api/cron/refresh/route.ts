import { NextResponse } from "next/server";
import { setupAPIRoute } from "@/lib/redis/middleware";
import { countries } from "@/lib/data/countries";
import { getPriceSnapshot } from "@/lib/data/pricing-server";

export const GET = setupAPIRoute(async (request) => {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    const cronHeader = request.headers.get("x-vercel-cron");
    if (authHeader !== `Bearer ${secret}` && cronHeader !== "1") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results = await Promise.all(
    countries.map(async (country) => {
      const snapshot = await getPriceSnapshot(country.code, null);
      return {
        country: country.code,
        updatedAt: snapshot.updatedAt
      };
    })
  );

  return {
    ok: true,
    count: results.length,
    results
  };
});
