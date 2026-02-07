import { NextResponse } from "next/server";
import { setupAPIRoute } from "@/lib/redis/middleware";
import { executeDataRun } from "@/lib/data-router/router";
import { verifyInternalAuth } from "@/lib/utils/internal-auth";
import type { DataRouterPayload } from "@/lib/data-router/types";

export const POST = setupAPIRoute(async (request) => {
  const rawBody = await request.text();

  if (!verifyInternalAuth(request, rawBody)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: DataRouterPayload;
  try {
    payload = JSON.parse(rawBody) as DataRouterPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload?.sourceId || !payload?.jobType) {
    return NextResponse.json({ error: "sourceId and jobType are required" }, { status: 400 });
  }

  const result = await executeDataRun(payload);

  return {
    ok: result.ok,
    runId: result.runId,
    status: result.status,
    entityCount: result.entityCount,
    failures: result.failures,
    recordsUpserted: result.recordsUpserted
  };
});
