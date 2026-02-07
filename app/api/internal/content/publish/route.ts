import { NextResponse } from "next/server";
import { setupAPIRoute } from "@/lib/redis/middleware";
import { publishApprovedVersion, rollbackPublishedContent } from "@/lib/data/content-pipeline";
import { verifyInternalAuth } from "@/lib/utils/internal-auth";

export const POST = setupAPIRoute(async (request) => {
  const rawBody = await request.text();
  if (!verifyInternalAuth(request, rawBody)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: {
    action?: "publish" | "rollback";
    contentItemId?: string;
    versionId?: string;
    reason?: string;
  } = {};
  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as {
        action?: "publish" | "rollback";
        contentItemId?: string;
        versionId?: string;
        reason?: string;
      };
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }

  if (!payload.contentItemId) {
    return NextResponse.json({ error: "contentItemId is required" }, { status: 400 });
  }

  if (payload.action === "rollback") {
    const rollback = await rollbackPublishedContent({
      contentItemId: payload.contentItemId,
      reason: payload.reason ?? "Manual rollback"
    });

    return {
      ok: true,
      rollback
    };
  }

  if (!payload.versionId) {
    return NextResponse.json({ error: "versionId is required for publish" }, { status: 400 });
  }

  const publish = await publishApprovedVersion({
    contentItemId: payload.contentItemId,
    versionId: payload.versionId
  });

  return {
    ok: true,
    publish
  };
});
