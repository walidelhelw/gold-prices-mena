import { NextResponse } from "next/server";
import { setupAPIRoute } from "@/lib/redis/middleware";
import { executeDataRun } from "@/lib/data-router/router";
import { publishDataRun } from "@/lib/data-router/queue";
import { getFeaturedCities } from "@/lib/data/dealers-server";
import { verifyInternalAuth } from "@/lib/utils/internal-auth";
import type { DataRouterPayload, DataRouterJobType } from "@/lib/data-router/types";

export const POST = setupAPIRoute(async (request) => {
  const rawBody = await request.text();
  if (!verifyInternalAuth(request, rawBody)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { jobType?: DataRouterJobType; countryCode?: string; citySlug?: string } = {};
  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as { jobType?: DataRouterJobType; countryCode?: string; citySlug?: string };
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }

  const jobType = payload.jobType ?? "window-poll";
  const countries = payload.countryCode ? [payload.countryCode] : ["eg", "sa", "ae"];

  const targets = countries.flatMap((countryCode) => {
    if (payload.citySlug) {
      return [{ countryCode, citySlug: payload.citySlug }];
    }
    return getFeaturedCities(countryCode).map((city) => ({ countryCode, citySlug: city.slug }));
  });

  const jobs: DataRouterPayload[] = targets.map((target) => ({
    sourceId: "dealer-quotes",
    jobType,
    countryCode: target.countryCode,
    citySlug: target.citySlug,
    entityKey: `${target.countryCode}:${target.citySlug}`
  }));

  const queueResults = [] as Array<{
    entityKey: string;
    queued: boolean;
    messageId?: string | null;
    runId?: string;
    reason?: string;
  }>;

  for (const job of jobs) {
    const queued = await publishDataRun(job);
    if (queued.queued) {
      queueResults.push({
        entityKey: job.entityKey ?? "",
        queued: true,
        messageId: queued.messageId ?? null
      });
      continue;
    }

    const fallbackRun = await executeDataRun(job);
    queueResults.push({
      entityKey: job.entityKey ?? "",
      queued: false,
      runId: fallbackRun.runId,
      reason: queued.reason ?? "executed inline"
    });
  }

  return {
    ok: true,
    jobType,
    total: jobs.length,
    queued: queueResults.filter((item) => item.queued).length,
    inlineExecuted: queueResults.filter((item) => !item.queued).length,
    results: queueResults
  };
});
