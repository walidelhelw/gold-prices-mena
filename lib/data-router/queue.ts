import type { DataRouterPayload } from "@/lib/data-router/types";

const qstashToken = process.env.QSTASH_TOKEN;
const qstashUrl = process.env.QSTASH_URL ?? "https://qstash.upstash.io/v2/publish";

export const isQStashConfigured = () => Boolean(qstashToken && qstashUrl);

const getTargetUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!baseUrl) return null;
  return `${baseUrl.replace(/\/$/, "")}/api/qstash/data-run`;
};

export const publishDataRun = async (payload: DataRouterPayload) => {
  if (!isQStashConfigured()) {
    return {
      queued: false,
      reason: "QStash not configured"
    };
  }

  const target = getTargetUrl();
  if (!target) {
    return {
      queued: false,
      reason: "NEXT_PUBLIC_SITE_URL is missing"
    };
  }

  const internalSecret = process.env.INTERNAL_API_SECRET ?? process.env.CRON_SECRET ?? "";
  const headers: Record<string, string> = {
    Authorization: `Bearer ${qstashToken!}`,
    "Content-Type": "application/json"
  };
  if (internalSecret) {
    headers["Upstash-Forward-Authorization"] = `Bearer ${internalSecret}`;
  }

  const response = await fetch(`${qstashUrl}/${encodeURIComponent(target)}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    return {
      queued: false,
      reason: `QStash publish failed: ${response.status}`
    };
  }

  const result = (await response.json()) as { messageId?: string };
  return {
    queued: true,
    messageId: result?.messageId ?? null
  };
};
