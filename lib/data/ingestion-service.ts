import "server-only";

import { randomUUID } from "crypto";
import { insertJsonEachRow, isClickHouseConfigured } from "@/lib/data/clickhouse";
import { logger } from "@/lib/logger";
import { getPriceSnapshot } from "@/lib/data/pricing-server";
import { getSupabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";
import type { DealerQuote } from "@/lib/types/market";

type SeedSource = {
  dealerId: string;
  dealerName: string;
  countryCode: string;
  citySlug: string;
  sourceUrl: string;
};

export type SourceValidationResult = {
  url: string;
  allowed: boolean;
  robotsReachable: boolean;
  blockedByRobots: boolean;
  notes: string[];
  checkedAt: string;
};

export type IngestionRunResult = {
  jobId: string;
  startedAt: string;
  finishedAt: string;
  scanned: number;
  insertedQuotes: number;
  skipped: number;
  failed: number;
  results: Array<{
    dealerId: string;
    countryCode: string;
    citySlug: string;
    inserted: boolean;
    reason?: string;
  }>;
};

const seedSources: SeedSource[] = [
  {
    dealerId: "eg-cairo-nagib",
    dealerName: "نجيب جولد",
    countryCode: "eg",
    citySlug: "cairo",
    sourceUrl: "https://example.com/dealers/nagib"
  },
  {
    dealerId: "eg-cairo-masr",
    dealerName: "مصر للمجوهرات",
    countryCode: "eg",
    citySlug: "cairo",
    sourceUrl: "https://example.com/dealers/masr"
  },
  {
    dealerId: "sa-riyadh-riyadh-gold",
    dealerName: "ذهب الرياض",
    countryCode: "sa",
    citySlug: "riyadh",
    sourceUrl: "https://example.com/dealers/riyadh-gold"
  },
  {
    dealerId: "ae-dubai-burj-gold",
    dealerName: "برج الذهب",
    countryCode: "ae",
    citySlug: "dubai",
    sourceUrl: "https://example.com/dealers/burj-gold"
  }
];

const pathBlockedByRobots = (robotsText: string, path: string) => {
  const lines = robotsText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"));

  let applies = false;
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith("user-agent:")) {
      const userAgent = lower.replace("user-agent:", "").trim();
      applies = userAgent === "*";
    }
    if (applies && lower.startsWith("disallow:")) {
      const disallowPath = line.slice(line.indexOf(":") + 1).trim();
      if (!disallowPath) continue;
      if (disallowPath === "/") return true;
      if (path.startsWith(disallowPath)) return true;
    }
  }

  return false;
};

export const validateSourcePolicy = async (url: string): Promise<SourceValidationResult> => {
  const checkedAt = new Date().toISOString();
  const notes: string[] = [];

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {
      url,
      allowed: false,
      robotsReachable: false,
      blockedByRobots: false,
      notes: ["URL غير صالح"],
      checkedAt
    };
  }

  if (parsed.protocol !== "https:") {
    notes.push("المصدر ليس HTTPS");
  }

  const robotsUrl = `${parsed.origin}/robots.txt`;
  let robotsReachable = false;
  let blockedByRobots = false;

  try {
    const robotsResponse = await fetch(robotsUrl, { cache: "no-store" });
    if (robotsResponse.ok) {
      robotsReachable = true;
      const robotsText = await robotsResponse.text();
      blockedByRobots = pathBlockedByRobots(robotsText, parsed.pathname || "/");
      if (blockedByRobots) {
        notes.push("robots.txt يمنع الوصول إلى الصفحة المستهدفة");
      }
    } else {
      notes.push("تعذر قراءة robots.txt");
    }
  } catch {
    notes.push("فشل طلب robots.txt");
  }

  const hasTosSignal = /terms|tos|conditions/i.test(parsed.pathname);
  if (hasTosSignal) {
    notes.push("الرابط يبدو صفحة شروط وليس صفحة أسعار مباشرة");
  }

  const allowed = parsed.protocol === "https:" && !blockedByRobots;

  return {
    url,
    allowed,
    robotsReachable,
    blockedByRobots,
    notes,
    checkedAt
  };
};

const buildSyntheticQuote = async (source: SeedSource): Promise<DealerQuote> => {
  const snapshot = await getPriceSnapshot(source.countryCode, source.citySlug);
  const drift = ((source.dealerId.length % 7) - 3) * 0.0015;
  const base = snapshot.localPerGram * (1 + drift);
  const buyPerGram = base * 0.994;
  const sellPerGram = base * 1.008;

  return {
    id: randomUUID(),
    dealerId: source.dealerId,
    countryCode: source.countryCode,
    citySlug: source.citySlug,
    karat: 21,
    buyPerGram,
    sellPerGram,
    spreadPct: ((sellPerGram - buyPerGram) / sellPerGram) * 100,
    observedAt: new Date().toISOString(),
    sourceUrl: source.sourceUrl
  };
};

const ensureDealerExists = async (source: SeedSource) => {
  if (!isSupabaseServerConfigured()) return;
  const supabase = getSupabaseServer();
  if (!supabase) return;

  await supabase.from("dealers").upsert(
    {
      id: source.dealerId,
      country_code: source.countryCode,
      city_slug: source.citySlug,
      name: source.dealerName,
      slug: source.dealerId,
      source_url: source.sourceUrl,
      verification_state: "verified",
      last_seen_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );
};

export const runIngestionPipeline = async ({
  countryCode,
  citySlug
}: {
  countryCode?: string | null;
  citySlug?: string | null;
} = {}): Promise<IngestionRunResult> => {
  const startedAt = new Date().toISOString();
  const jobId = randomUUID();
  const jobLogger = logger.child({
    module: "ingestion",
    jobId,
    countryCode: countryCode ?? "all",
    citySlug: citySlug ?? "all"
  });

  const sources = seedSources.filter((source) => {
    if (countryCode && source.countryCode !== countryCode) return false;
    if (citySlug && source.citySlug !== citySlug) return false;
    return true;
  });

  let insertedQuotes = 0;
  let skipped = 0;
  let failed = 0;

  const results: IngestionRunResult["results"] = [];
  const clickHouseRows: Record<string, unknown>[] = [];

  const supabase = getSupabaseServer();
  if (supabase) {
    await supabase.from("crawl_jobs").insert({
      id: jobId,
      country_code: countryCode ?? null,
      city_slug: citySlug ?? null,
      status: "running",
      started_at: startedAt,
      meta: { sourceCount: sources.length }
    });
  }

  jobLogger.info({ sourceCount: sources.length }, "Ingestion run started");

  for (const source of sources) {
    const validation = await validateSourcePolicy(source.sourceUrl);
    if (!validation.allowed) {
      skipped += 1;
      results.push({
        dealerId: source.dealerId,
        countryCode: source.countryCode,
        citySlug: source.citySlug,
        inserted: false,
        reason: validation.notes.join(" | ") || "Source policy rejected"
      });

      if (supabase) {
        await supabase.from("crawl_events").insert({
          job_id: jobId,
          dealer_id: source.dealerId,
          level: "warn",
          message: "Source blocked by policy",
          payload: validation
        });
      }
      jobLogger.warn(
        { dealerId: source.dealerId, notes: validation.notes },
        "Source skipped by compliance policy"
      );
      continue;
    }

    try {
      const quote = await buildSyntheticQuote(source);
      await ensureDealerExists(source);

      if (supabase) {
        await supabase.from("dealer_quotes").insert({
          id: quote.id,
          dealer_id: quote.dealerId,
          country_code: quote.countryCode,
          city_slug: quote.citySlug,
          karat: quote.karat,
          buy_per_gram: quote.buyPerGram,
          sell_per_gram: quote.sellPerGram,
          spread_pct: quote.spreadPct,
          observed_at: quote.observedAt,
          source_url: quote.sourceUrl
        });

        await supabase.from("dealer_sources").upsert(
          {
            dealer_id: quote.dealerId,
            source_url: quote.sourceUrl,
            robots_reachable: validation.robotsReachable,
            robots_allowed: !validation.blockedByRobots,
            crawl_policy: "public_robots_respect",
            blocked: false,
            last_checked_at: validation.checkedAt
          },
          { onConflict: "dealer_id,source_url" }
        );

        await supabase.from("reliability_scores").upsert(
          {
            dealer_id: quote.dealerId,
            score: 0.82,
            confidence: 0.74,
            reasons: ["policy_check_passed", "recent_observation"],
            updated_at: quote.observedAt
          },
          { onConflict: "dealer_id" }
        );

        await supabase.from("crawl_events").insert({
          job_id: jobId,
          dealer_id: source.dealerId,
          level: "info",
          message: "Quote inserted",
          payload: { observedAt: quote.observedAt }
        });
      }

      insertedQuotes += 1;
      clickHouseRows.push({
        dealer_id: quote.dealerId,
        country_code: quote.countryCode,
        city_slug: quote.citySlug,
        karat: quote.karat,
        buy_per_gram: quote.buyPerGram,
        sell_per_gram: quote.sellPerGram,
        spread_pct: quote.spreadPct,
        observed_at: quote.observedAt
      });
      results.push({
        dealerId: source.dealerId,
        countryCode: source.countryCode,
        citySlug: source.citySlug,
        inserted: true
      });
    } catch (error) {
      failed += 1;
      results.push({
        dealerId: source.dealerId,
        countryCode: source.countryCode,
        citySlug: source.citySlug,
        inserted: false,
        reason: error instanceof Error ? error.message : "unknown error"
      });

      if (supabase) {
        await supabase.from("crawl_events").insert({
          job_id: jobId,
          dealer_id: source.dealerId,
          level: "error",
          message: "Ingestion failure",
          payload: { message: error instanceof Error ? error.message : "unknown" }
        });
      }
      jobLogger.error(
        { dealerId: source.dealerId, error: error instanceof Error ? error.message : "unknown error" },
        "Dealer ingestion failed"
      );
    }
  }

  const finishedAt = new Date().toISOString();

  if (isClickHouseConfigured() && clickHouseRows.length > 0) {
    await insertJsonEachRow({
      table: "dealer_quotes_raw",
      rows: clickHouseRows
    });
  }

  if (supabase) {
    await supabase.from("crawl_jobs").update({
      status: failed > 0 ? "partial" : "completed",
      finished_at: finishedAt,
      meta: {
        scanned: sources.length,
        insertedQuotes,
        skipped,
        failed
      }
    }).eq("id", jobId);
  }

  jobLogger.info(
    {
      scanned: sources.length,
      insertedQuotes,
      skipped,
      failed
    },
    "Ingestion run completed"
  );

  return {
    jobId,
    startedAt,
    finishedAt,
    scanned: sources.length,
    insertedQuotes,
    skipped,
    failed,
    results
  };
};
