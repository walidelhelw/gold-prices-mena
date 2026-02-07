import { NextResponse } from "next/server";
import { setupAPIRoute } from "@/lib/redis/middleware";
import { countries } from "@/lib/data/countries";
import { getPriceSnapshot } from "@/lib/data/pricing-server";
import { getFeaturedCities } from "@/lib/data/dealers-server";
import { publishDataRun } from "@/lib/data-router/queue";
import { executeDataRun } from "@/lib/data-router/router";

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

  const moatCountries = ["eg", "sa", "ae"];
  const jobs = moatCountries.flatMap((countryCode) =>
    getFeaturedCities(countryCode).map((city) => ({
      sourceId: "dealer-quotes" as const,
      jobType: "window-poll" as const,
      countryCode,
      citySlug: city.slug,
      entityKey: `${countryCode}:${city.slug}`
    }))
  );

  const queueResults = await Promise.all(
    jobs.map(async (job) => {
      const queued = await publishDataRun(job);
      if (queued.queued) {
        return { entityKey: job.entityKey, queued: true, messageId: queued.messageId ?? null };
      }
      const fallback = await executeDataRun(job);
      return {
        entityKey: job.entityKey,
        queued: false,
        runId: fallback.runId,
        reason: queued.reason ?? "inline execution"
      };
    })
  );

  return {
    ok: true,
    count: results.length,
    results,
    moatJobs: {
      total: jobs.length,
      queued: queueResults.filter((item) => item.queued).length,
      inlineExecuted: queueResults.filter((item) => !item.queued).length
    }
  };
});
