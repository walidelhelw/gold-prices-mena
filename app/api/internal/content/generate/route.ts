import { NextResponse } from "next/server";
import { setupAPIRoute } from "@/lib/redis/middleware";
import { createAndMaybePublishDraft, generateContentDraft } from "@/lib/data/content-pipeline";
import { parseContentTemplate } from "@/lib/types/content";
import { verifyInternalAuth } from "@/lib/utils/internal-auth";

export const POST = setupAPIRoute(async (request) => {
  const rawBody = await request.text();
  if (!verifyInternalAuth(request, rawBody)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: {
    topic?: string;
    countryCode?: string;
    citySlug?: string;
    template?: string;
    locale?: string;
  } = {};
  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as {
        topic?: string;
        countryCode?: string;
        citySlug?: string;
        template?: string;
        locale?: string;
      };
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }

  if (!payload.topic) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }

  const draft = await generateContentDraft({
    topic: payload.topic,
    countryCode: payload.countryCode,
    citySlug: payload.citySlug,
    template: parseContentTemplate(payload.template ?? null),
    locale: payload.locale ?? "ar"
  });

  const result = await createAndMaybePublishDraft(draft);

  return {
    ok: true,
    draft,
    result
  };
});
