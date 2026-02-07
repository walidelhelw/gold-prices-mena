import "server-only";

import { createHash, randomUUID } from "crypto";
import { logger } from "@/lib/logger";
import { getPriceSnapshot } from "@/lib/data/pricing-server";
import { getSupabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";
import type {
  ContentItem,
  ContentVersion,
  GeneratedDraft,
  GuardrailResult,
  SourceRef
} from "@/lib/types/content";

const DEFAULT_LOCALE = "ar";
const DUPLICATE_THRESHOLD = Number(process.env.CONTENT_DUPLICATE_THRESHOLD ?? "0.35");
const NUMERIC_TOLERANCE_PCT = Number(process.env.CONTENT_NUMERIC_TOLERANCE_PCT ?? "12");

export type ContentGenerateInput = {
  topic: string;
  countryCode?: string | null;
  citySlug?: string | null;
  template?: "guide" | "insight" | "comparison";
  locale?: string;
};

const fallbackGuides: Array<{
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  publishedAt: string;
}> = [
  {
    slug: "gold-buying-timing-eg",
    title: "متى يكون شراء الذهب مناسبًا؟ دليل عملي سريع",
    excerpt: "طريقة بسيطة لمقارنة الاتجاه اليومي مع هامش السوق المحلي قبل قرار الشراء.",
    body: "ابدأ بمراجعة فرق الشراء والبيع في مدينتك، ثم قارن السعر الحالي بمتوسط 7 أيام. إذا كان الفرق محدودًا والاتجاه مستقرًا، يكون القرار أكثر أمانًا. لا تعتمد على سعر لحظة واحدة فقط؛ الأفضل متابعة 2-3 تحديثات متتالية.",
    publishedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    slug: "gold-premium-guide",
    title: "كيف تفهم فرق المدينة في أسعار الذهب؟",
    excerpt: "شرح عملي لمعنى الفرق المحلي وكيف يؤثر على الشراء الفعلي.",
    body: "فرق المدينة هو انحراف تقديري عن المتوسط العام. الفرق الإيجابي المرتفع يعني أن التكلفة المحلية أعلى نسبيًا. عند المقارنة بين مدينتين، ركز على سعر الجرام الصافي وهامش الشراء والبيع معًا، وليس أحدهما فقط.",
    publishedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

const safeString = (value: unknown, fallback = "") => (typeof value === "string" && value ? value : fallback);

const slugifyArabic = (value: string) => {
  const normalized = value
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  if (normalized) return normalized;
  return `guide-${createHash("md5").update(value).digest("hex").slice(0, 8)}`;
};

const cosineLikeSimilarity = (left: string, right: string) => {
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

  const leftTokens = normalize(left);
  const rightTokens = normalize(right);

  const leftSet = new Set(leftTokens);
  const rightSet = new Set(rightTokens);

  let overlap = 0;
  leftSet.forEach((token) => {
    if (rightSet.has(token)) overlap += 1;
  });

  const denominator = Math.sqrt(leftSet.size * rightSet.size) || 1;
  return overlap / denominator;
};

const buildSources = (countryCode?: string | null): SourceRef[] => [
  {
    url: "https://data-asg.goldprice.org/dbXRates/USD",
    label: "GoldPrice"
  },
  {
    url: "https://open.er-api.com/v6/latest/USD",
    label: "ExchangeRate API"
  },
  {
    url: countryCode ? `https://example.com/markets/${countryCode}` : "https://example.com/markets/global",
    label: "Local Market Feed"
  }
];

const buildDraftBody = async ({
  topic,
  countryCode,
  citySlug
}: {
  topic: string;
  countryCode?: string | null;
  citySlug?: string | null;
}) => {
  const normalizedCountry = countryCode ?? "eg";
  const normalizedCity = citySlug ?? null;
  const snapshot = await getPriceSnapshot(normalizedCountry, normalizedCity);

  const priceText = snapshot.localPerGram.toFixed(2);
  const fxText = snapshot.fxRate.toFixed(2);

  const body = [
    `يركز هذا الدليل على ${topic} في السوق المحلي.`,
    `السعر المحلي الحالي للجرام هو ${priceText} ${snapshot.currency} مع تحديث ${snapshot.updatedAt}.`,
    `سعر الصرف الحالي المستخدم في التسعير يساوي ${fxText}.`,
    "قبل اتخاذ قرار الشراء، قارن هامش الشراء/البيع بين أكثر من تاجر وراقب الاتجاه اليومي بدل الاعتماد على تحديث واحد.",
    "هذا المحتوى إرشادي ولا يمثل نصيحة استثمارية مباشرة."
  ].join(" ");

  return {
    body,
    numericClaims: [snapshot.localPerGram, snapshot.fxRate]
  };
};

export const generateContentDraft = async (input: ContentGenerateInput): Promise<GeneratedDraft> => {
  const locale = input.locale ?? DEFAULT_LOCALE;
  const template = input.template ?? "guide";
  const topic = input.topic.trim() || "تحليل سعر الذهب";
  const countryCode = input.countryCode ?? null;
  const citySlug = input.citySlug ?? null;

  const { body, numericClaims } = await buildDraftBody({ topic, countryCode, citySlug });
  const title = `${topic} - تحديث السوق`; 
  const excerpt = `ملخص سريع حول ${topic} مع أرقام حديثة للسعر المحلي والاتجاه.`;
  const slug = slugifyArabic(`${topic}-${countryCode ?? "global"}-${citySlug ?? "all"}`);

  const draft = {
    slug,
    title,
    excerpt,
    body,
    template,
    locale,
    countryCode,
    citySlug,
    sources: buildSources(countryCode),
    numericClaims
  };

  logger.info(
    {
      module: "content-pipeline",
      action: "generate-draft",
      slug: draft.slug,
      template,
      countryCode,
      citySlug
    },
    "Content draft generated"
  );

  return draft;
};

const computeDuplicateScore = async (draft: GeneratedDraft) => {
  const supabase = getSupabaseServer();
  if (!supabase) return 0;

  const { data } = await supabase
    .from("content_versions")
    .select("title, excerpt")
    .order("created_at", { ascending: false })
    .limit(30);

  if (!data || data.length === 0) return 0;

  let maxScore = 0;
  data.forEach((row) => {
    const score = Math.max(
      cosineLikeSimilarity(draft.title, row.title ?? ""),
      cosineLikeSimilarity(draft.excerpt, row.excerpt ?? "")
    );
    if (score > maxScore) maxScore = score;
  });

  return maxScore;
};

const computeNumericScore = async (draft: GeneratedDraft) => {
  const countryCode = draft.countryCode ?? "eg";
  const snapshot = await getPriceSnapshot(countryCode, draft.citySlug ?? null);
  const anchor = snapshot.localPerGram || 1;
  const claim = draft.numericClaims[0] ?? anchor;
  const deltaPct = Math.abs(((claim - anchor) / anchor) * 100);
  return Math.max(0, 1 - deltaPct / NUMERIC_TOLERANCE_PCT);
};

export const evaluateDraftGuardrails = async (draft: GeneratedDraft): Promise<GuardrailResult> => {
  const reasons: string[] = [];

  if (draft.sources.length < 2) {
    reasons.push("المصادر أقل من الحد الأدنى");
  }

  const duplicateScore = await computeDuplicateScore(draft);
  if (duplicateScore > DUPLICATE_THRESHOLD) {
    reasons.push("تشابه مرتفع مع محتوى موجود");
  }

  const numericScore = await computeNumericScore(draft);
  if (numericScore < 0.55) {
    reasons.push("الأرقام غير متسقة مع بيانات التسعير الحالية");
  }

  const approved = reasons.length === 0;

  return {
    approved,
    qaStatus: approved ? "approved" : "rejected",
    duplicateScore,
    numericScore,
    reasons
  };
};

export const createAndMaybePublishDraft = async (draft: GeneratedDraft) => {
  const guardrail = await evaluateDraftGuardrails(draft);
  const now = new Date().toISOString();
  let contentItemId = randomUUID();
  const versionId = randomUUID();

  if (!isSupabaseServerConfigured()) {
    return {
      contentItemId,
      versionId,
      guardrail,
      published: false
    };
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return {
      contentItemId,
      versionId,
      guardrail,
      published: false
    };
  }

  const { data: existing } = await supabase
    .from("content_items")
    .select("id")
    .eq("slug", draft.slug)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    contentItemId = existing.id;
  }

  await supabase.from("content_items").upsert(
    {
      id: contentItemId,
      slug: draft.slug,
      locale: draft.locale,
      country_code: draft.countryCode,
      city_slug: draft.citySlug,
      template: draft.template,
      is_published: false,
      published_at: null,
      created_at: now,
      updated_at: now
    },
    { onConflict: "slug" }
  );

  await supabase.from("content_versions").insert({
    id: versionId,
    content_item_id: contentItemId,
    title: draft.title,
    excerpt: draft.excerpt,
    body: draft.body,
    source_refs: draft.sources,
    numeric_claims: draft.numericClaims,
    qa_status: guardrail.qaStatus,
    duplicate_score: guardrail.duplicateScore,
    numeric_score: guardrail.numericScore,
    source_count: draft.sources.length,
    created_at: now
  });

  if (guardrail.approved) {
    await supabase
      .from("content_items")
      .update({ is_published: true, published_at: now, updated_at: now })
      .eq("slug", draft.slug);
  }

  logger.info(
    {
      module: "content-pipeline",
      action: "persist-draft",
      slug: draft.slug,
      approved: guardrail.approved,
      duplicateScore: guardrail.duplicateScore,
      numericScore: guardrail.numericScore
    },
    "Content draft persisted"
  );

  return {
    contentItemId,
    versionId,
    guardrail,
    published: guardrail.approved
  };
};

export const publishApprovedVersion = async ({
  contentItemId,
  versionId
}: {
  contentItemId: string;
  versionId: string;
}) => {
  if (!isSupabaseServerConfigured()) {
    return { published: false, reason: "Supabase not configured" };
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return { published: false, reason: "Supabase client missing" };
  }

  const { data: version } = await supabase
    .from("content_versions")
    .select("qa_status")
    .eq("id", versionId)
    .eq("content_item_id", contentItemId)
    .limit(1)
    .maybeSingle();

  if (!version || version.qa_status !== "approved") {
    return { published: false, reason: "Version not approved" };
  }

  const now = new Date().toISOString();
  await supabase
    .from("content_items")
    .update({ is_published: true, published_at: now, updated_at: now })
    .eq("id", contentItemId);

  return { published: true };
};

export const rollbackPublishedContent = async ({
  contentItemId,
  reason
}: {
  contentItemId: string;
  reason: string;
}) => {
  if (!isSupabaseServerConfigured()) {
    return { rolledBack: false, reason: "Supabase not configured" };
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return { rolledBack: false, reason: "Supabase client missing" };
  }

  await supabase
    .from("content_items")
    .update({ is_published: false, updated_at: new Date().toISOString() })
    .eq("id", contentItemId);

  await supabase.from("content_versions").insert({
    id: randomUUID(),
    content_item_id: contentItemId,
    title: "Rollback",
    excerpt: reason,
    body: `Rollback reason: ${reason}`,
    source_refs: [],
    numeric_claims: [],
    qa_status: "rejected",
    duplicate_score: 0,
    numeric_score: 0,
    source_count: 0,
    rollback_of_version_id: null,
    created_at: new Date().toISOString()
  });

  return { rolledBack: true };
};

const mapGuideFromDb = (row: Record<string, unknown>) => ({
  slug: safeString(row.slug, `guide-${randomUUID().slice(0, 8)}`),
  title: safeString(row.title, "دليل السوق المحلي"),
  excerpt: safeString(row.excerpt, "محتوى إرشادي قصير للمشتري المحلي."),
  body: safeString(row.body, "محتوى غير متاح حاليًا."),
  publishedAt: safeString(row.published_at ?? row.created_at, new Date().toISOString())
});

export const getPublishedGuides = async (limit = 12) => {
  if (!isSupabaseServerConfigured()) {
    return fallbackGuides.slice(0, limit);
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return fallbackGuides.slice(0, limit);
  }

  const { data } = await supabase
    .from("content_items")
    .select(
      "slug, published_at, content_versions!inner(title, excerpt, body, qa_status, created_at)"
    )
    .eq("is_published", true)
    .eq("content_versions.qa_status", "approved")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (!data || data.length === 0) {
    return fallbackGuides.slice(0, limit);
  }

  return data.map((item) => {
    const version = Array.isArray(item.content_versions) ? item.content_versions[0] : item.content_versions;
    return mapGuideFromDb({
      slug: item.slug,
      published_at: item.published_at,
      title: version?.title,
      excerpt: version?.excerpt,
      body: version?.body,
      created_at: version?.created_at
    });
  });
};

export const getGuideBySlug = async (slug: string) => {
  if (!isSupabaseServerConfigured()) {
    return fallbackGuides.find((guide) => guide.slug === slug) ?? null;
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return fallbackGuides.find((guide) => guide.slug === slug) ?? null;
  }

  const { data } = await supabase
    .from("content_items")
    .select("slug, published_at, content_versions!inner(title, excerpt, body, qa_status, created_at)")
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("content_versions.qa_status", "approved")
    .limit(1)
    .maybeSingle();

  if (!data) {
    return fallbackGuides.find((guide) => guide.slug === slug) ?? null;
  }

  const version = Array.isArray(data.content_versions) ? data.content_versions[0] : data.content_versions;
  return mapGuideFromDb({
    slug: data.slug,
    published_at: data.published_at,
    title: version?.title,
    excerpt: version?.excerpt,
    body: version?.body,
    created_at: version?.created_at
  });
};
