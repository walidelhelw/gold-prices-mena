import { NextResponse } from "next/server";
import { setupAPIRoute } from "@/lib/redis/middleware";
import { validateSourcePolicy } from "@/lib/data/ingestion-service";
import { verifyInternalAuth } from "@/lib/utils/internal-auth";

export const POST = setupAPIRoute(async (request) => {
  const rawBody = await request.text();
  if (!verifyInternalAuth(request, rawBody)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { url?: string } = {};
  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as { url?: string };
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }
  if (!payload.url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const validation = await validateSourcePolicy(payload.url);

  return {
    ok: true,
    validation
  };
});
