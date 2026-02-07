import { NextResponse } from "next/server";
import { setupAPIRoute } from "@/lib/redis/middleware";
import { runIngestionPipeline } from "@/lib/data/ingestion-service";
import { verifyInternalAuth } from "@/lib/utils/internal-auth";

export const POST = setupAPIRoute(async (request) => {
  const rawBody = await request.text();
  if (!verifyInternalAuth(request, rawBody)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { countryCode?: string; citySlug?: string } = {};
  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as { countryCode?: string; citySlug?: string };
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }

  const result = await runIngestionPipeline({
    countryCode: payload.countryCode ?? null,
    citySlug: payload.citySlug ?? null
  });

  return {
    ok: true,
    result
  };
});
