import "server-only";

import { citiesByCountry, countries, getCountry } from "@/lib/data/countries";
import { getPriceSnapshot } from "@/lib/data/pricing-server";
import { getSupabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";
import type {
  CityComparison,
  Dealer,
  DealerQuote,
  DealerSort,
  FreshnessStatus,
  MarketPosture,
  MarketSignal,
  QuoteIntent,
  RankingReadiness,
  SeoTemplateVariant
} from "@/lib/types/market";

const DEFAULT_SCORE = 0.78;

const fallbackDealers: Dealer[] = [
  {
    id: "eg-cairo-nagib",
    countryCode: "eg",
    citySlug: "cairo",
    name: "نجيب جولد",
    slug: "nagib-gold",
    sourceUrl: "https://example.com/dealers/nagib",
    verificationState: "trusted",
    reliabilityScore: 0.9,
    lastSeenAt: new Date(Date.now() - 4 * 60_000).toISOString()
  },
  {
    id: "eg-cairo-masr",
    countryCode: "eg",
    citySlug: "cairo",
    name: "مصر للمجوهرات",
    slug: "masr-jewels",
    sourceUrl: "https://example.com/dealers/masr",
    verificationState: "verified",
    reliabilityScore: 0.82,
    lastSeenAt: new Date(Date.now() - 6 * 60_000).toISOString()
  },
  {
    id: "sa-riyadh-riyadh-gold",
    countryCode: "sa",
    citySlug: "riyadh",
    name: "ذهب الرياض",
    slug: "riyadh-gold",
    sourceUrl: "https://example.com/dealers/riyadh-gold",
    verificationState: "trusted",
    reliabilityScore: 0.87,
    lastSeenAt: new Date(Date.now() - 5 * 60_000).toISOString()
  },
  {
    id: "ae-dubai-burj-gold",
    countryCode: "ae",
    citySlug: "dubai",
    name: "برج الذهب",
    slug: "burj-gold",
    sourceUrl: "https://example.com/dealers/burj-gold",
    verificationState: "verified",
    reliabilityScore: 0.84,
    lastSeenAt: new Date(Date.now() - 3 * 60_000).toISOString()
  }
];

const spreadFromPrices = (buyPerGram: number, sellPerGram: number) => {
  if (!sellPerGram) return 0;
  return ((sellPerGram - buyPerGram) / sellPerGram) * 100;
};

const normalizeQuotes = (rows: Array<Record<string, unknown>>): DealerQuote[] =>
  rows
    .map((row) => {
      const buyPerGram = Number(row.buy_per_gram ?? row.buyPerGram ?? 0);
      const sellPerGram = Number(row.sell_per_gram ?? row.sellPerGram ?? 0);
      return {
        id: String(row.id),
        dealerId: String(row.dealer_id ?? row.dealerId),
        countryCode: String(row.country_code ?? row.countryCode),
        citySlug: String(row.city_slug ?? row.citySlug),
        karat: Number(row.karat ?? 21),
        buyPerGram,
        sellPerGram,
        spreadPct: Number(row.spread_pct ?? spreadFromPrices(buyPerGram, sellPerGram)),
        observedAt: String(row.observed_at ?? row.observedAt ?? new Date().toISOString()),
        sourceUrl: String(row.source_url ?? row.sourceUrl ?? "")
      } satisfies DealerQuote;
    })
    .filter((row) => row.countryCode && row.citySlug);

const fallbackQuotes = async (countryCode: string, citySlug: string) => {
  const snapshot = await getPriceSnapshot(countryCode, citySlug);
  const base = snapshot.localPerGram;
  const now = Date.now();

  return fallbackDealers
    .filter((dealer) => dealer.countryCode === countryCode && dealer.citySlug === citySlug)
    .map((dealer, index) => {
      const modifier = 1 + (index - 1) * 0.0035;
      const buy = base * modifier * 0.994;
      const sell = base * modifier * 1.008;
      return {
        id: `${dealer.id}-${Math.floor(now / 60000)}`,
        dealerId: dealer.id,
        countryCode,
        citySlug,
        karat: 21,
        buyPerGram: buy,
        sellPerGram: sell,
        spreadPct: spreadFromPrices(buy, sell),
        observedAt: new Date(now - index * 90_000).toISOString(),
        sourceUrl: dealer.sourceUrl
      } satisfies DealerQuote;
    });
};

const sortQuotes = (quotes: DealerQuote[], sort: DealerSort) => {
  if (sort === "freshness") {
    return quotes.sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime());
  }
  return quotes.sort((a, b) => a.spreadPct - b.spreadPct);
};

const getFallbackDealersForCity = async (
  countryCode: string,
  citySlug: string,
  sort: DealerSort
): Promise<Array<Dealer & { latestQuote: DealerQuote | null }>> => {
  const quotes = sortQuotes(await fallbackQuotes(countryCode, citySlug), sort);
  const quoteMap = new Map(quotes.map((quote) => [quote.dealerId, quote]));

  return fallbackDealers
    .filter((dealer) => dealer.countryCode === countryCode && dealer.citySlug === citySlug)
    .map((dealer) => ({
      ...dealer,
      latestQuote: quoteMap.get(dealer.id) ?? null
    }))
    .sort((a, b) => {
      if (!a.latestQuote) return 1;
      if (!b.latestQuote) return -1;
      if (sort === "freshness") {
        return new Date(b.latestQuote.observedAt).getTime() - new Date(a.latestQuote.observedAt).getTime();
      }
      return a.latestQuote.spreadPct - b.latestQuote.spreadPct;
    });
};

export const getDealers = async ({
  countryCode,
  citySlug,
  sort = "spread"
}: {
  countryCode: string;
  citySlug: string;
  intent?: QuoteIntent;
  sort?: DealerSort;
}) => {
  if (!isSupabaseServerConfigured()) {
    return getFallbackDealersForCity(countryCode, citySlug, sort);
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return getFallbackDealersForCity(countryCode, citySlug, sort);
  }

  const { data: dealers, error: dealersError } = await supabase
    .from("dealers")
    .select("id, country_code, city_slug, name, slug, source_url, phone, verification_state, last_seen_at")
    .eq("country_code", countryCode)
    .eq("city_slug", citySlug)
    .order("name", { ascending: true });

  if (dealersError || !dealers || dealers.length === 0) {
    return getFallbackDealersForCity(countryCode, citySlug, sort);
  }

  const dealerIds = dealers.map((dealer) => dealer.id);
  const [quotesResult, scoresResult] = await Promise.all([
    supabase
      .from("dealer_quotes")
      .select("id, dealer_id, country_code, city_slug, karat, buy_per_gram, sell_per_gram, spread_pct, observed_at, source_url")
      .in("dealer_id", dealerIds)
      .order("observed_at", { ascending: false }),
    supabase
      .from("reliability_scores")
      .select("dealer_id, score")
      .in("dealer_id", dealerIds)
      .order("updated_at", { ascending: false })
  ]);

  const latestQuoteByDealer = new Map<string, DealerQuote>();
  const normalizedQuotes = normalizeQuotes(quotesResult.data ?? []);
  normalizedQuotes.forEach((quote) => {
    if (!latestQuoteByDealer.has(quote.dealerId)) {
      latestQuoteByDealer.set(quote.dealerId, quote);
    }
  });

  const scoreByDealer = new Map<string, number>();
  (scoresResult.data ?? []).forEach((scoreRow) => {
    if (!scoreByDealer.has(scoreRow.dealer_id)) {
      scoreByDealer.set(scoreRow.dealer_id, Number(scoreRow.score ?? DEFAULT_SCORE));
    }
  });

  return dealers
    .map((dealer) => ({
      id: dealer.id,
      countryCode: dealer.country_code,
      citySlug: dealer.city_slug,
      name: dealer.name,
      slug: dealer.slug,
      sourceUrl: dealer.source_url,
      phone: dealer.phone,
      verificationState: dealer.verification_state,
      reliabilityScore: scoreByDealer.get(dealer.id) ?? DEFAULT_SCORE,
      lastSeenAt: dealer.last_seen_at,
      latestQuote: latestQuoteByDealer.get(dealer.id) ?? null
    }))
    .sort((a, b) => {
      if (!a.latestQuote) return 1;
      if (!b.latestQuote) return -1;
      if (sort === "freshness") {
        return new Date(b.latestQuote.observedAt).getTime() - new Date(a.latestQuote.observedAt).getTime();
      }
      return a.latestQuote.spreadPct - b.latestQuote.spreadPct;
    });
};

export const getDealerQuotes = async (dealerId: string, days = 30): Promise<DealerQuote[]> => {
  if (!isSupabaseServerConfigured()) {
    const fallbackDealer = fallbackDealers.find((dealer) => dealer.id === dealerId);
    if (!fallbackDealer) return [];

    const now = Date.now();
    const snapshot = await getPriceSnapshot(fallbackDealer.countryCode, fallbackDealer.citySlug);
    const rows: DealerQuote[] = [];
    for (let day = days - 1; day >= 0; day -= 1) {
      const fluctuation = Math.sin(day / 3) * 0.007;
      const base = snapshot.localPerGram * (1 + fluctuation);
      const buy = base * 0.994;
      const sell = base * 1.008;
      rows.push({
        id: `${dealerId}-${day}`,
        dealerId,
        countryCode: fallbackDealer.countryCode,
        citySlug: fallbackDealer.citySlug,
        karat: 21,
        buyPerGram: buy,
        sellPerGram: sell,
        spreadPct: spreadFromPrices(buy, sell),
        observedAt: new Date(now - day * 86400000).toISOString(),
        sourceUrl: fallbackDealer.sourceUrl
      });
    }
    return rows;
  }

  const supabase = getSupabaseServer();
  if (!supabase) return [];

  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase
    .from("dealer_quotes")
    .select("id, dealer_id, country_code, city_slug, karat, buy_per_gram, sell_per_gram, spread_pct, observed_at, source_url")
    .eq("dealer_id", dealerId)
    .gte("observed_at", since)
    .order("observed_at", { ascending: true });

  return normalizeQuotes(data ?? []);
};

export const getFreshnessStatus = async (
  countryCode: string,
  citySlug: string
): Promise<FreshnessStatus> => {
  const now = Date.now();
  const dealers = await getDealers({ countryCode, citySlug, sort: "freshness" });
  const quotes = dealers.map((dealer) => dealer.latestQuote).filter(Boolean) as DealerQuote[];

  const latest = quotes[0]?.observedAt ?? new Date(now - 20 * 60_000).toISOString();
  const ageSeconds = Math.max(0, Math.round((now - new Date(latest).getTime()) / 1000));
  const reliabilityAvg =
    dealers.length > 0 ? dealers.reduce((sum, dealer) => sum + dealer.reliabilityScore, 0) / dealers.length : DEFAULT_SCORE;

  const status = ageSeconds <= 600 ? "fresh" : ageSeconds <= 1800 ? "aging" : "stale";

  return {
    countryCode,
    citySlug,
    observedAt: latest,
    ageSeconds,
    sourceCount: quotes.length,
    status,
    reliabilityAvg
  };
};

export const getRankingReadiness = async (
  countryCode: string,
  citySlug: string
): Promise<RankingReadiness> => {
  const freshness = await getFreshnessStatus(countryCode, citySlug);
  const reasons: string[] = [];
  let firstObservedAt: string | null = null;

  if (isSupabaseServerConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { data } = await supabase
        .from("crawl_jobs")
        .select("started_at")
        .eq("country_code", countryCode)
        .eq("city_slug", citySlug)
        .not("started_at", "is", null)
        .order("started_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      firstObservedAt = data?.started_at ?? null;
    }
  }

  const now = Date.now();
  const shadowUntil = firstObservedAt ? new Date(new Date(firstObservedAt).getTime() + 7 * 86400000) : null;
  const shadowMode = shadowUntil ? now < shadowUntil.getTime() : true;

  if (shadowMode) {
    reasons.push("المدينة في فترة shadow ingest لمدة 7 أيام");
  }
  if (freshness.status === "stale") {
    reasons.push("البيانات قديمة وتتجاوز حد الجاهزية");
  }
  if (freshness.sourceCount < 2) {
    reasons.push("عدد المصادر أقل من الحد الأدنى");
  }
  if (freshness.reliabilityAvg < 0.75) {
    reasons.push("متوسط الموثوقية أقل من عتبة النشر");
  }

  const rankingEnabled =
    !shadowMode && freshness.status !== "stale" && freshness.sourceCount >= 2 && freshness.reliabilityAvg >= 0.75;

  return {
    countryCode,
    citySlug,
    shadowMode,
    rankingEnabled,
    firstObservedAt,
    nextEligibleAt: shadowUntil ? shadowUntil.toISOString() : null,
    freshnessStatus: freshness.status,
    sourceCount: freshness.sourceCount,
    reliabilityAvg: freshness.reliabilityAvg,
    reasons
  };
};

const resolvePosture = (spreadPct: number, dailyTrendPct: number, premiumPct: number): MarketPosture => {
  if (spreadPct < 1.8 && dailyTrendPct <= 0.4 && premiumPct <= 0.015) {
    return "buy_zone";
  }
  if (spreadPct < 2.3 && dailyTrendPct <= 0.9 && premiumPct <= 0.03) {
    return "watch";
  }
  return "wait";
};

export const getMarketSignal = async (
  countryCode: string,
  citySlug: string
): Promise<MarketSignal> => {
  const snapshot = await getPriceSnapshot(countryCode, citySlug);
  const dealers = await getDealers({ countryCode, citySlug, sort: "spread" });
  const spreads = dealers
    .map((dealer) => dealer.latestQuote?.spreadPct)
    .filter((value): value is number => typeof value === "number");
  const avgSpread = spreads.length ? spreads.reduce((sum, value) => sum + value, 0) / spreads.length : 2.1;

  const dailyTrendPct = snapshot.amFixUsd ? ((snapshot.pmFixUsd - snapshot.amFixUsd) / snapshot.amFixUsd) * 100 : 0;
  const posture = resolvePosture(avgSpread, dailyTrendPct, snapshot.premiumPct);
  const confidence = Math.min(0.95, 0.55 + dealers.length * 0.06 + (snapshot.source ? 0.08 : 0));

  const rationale = [
    avgSpread < 2 ? "هامش البيع والشراء منخفض نسبيًا" : "هامش البيع والشراء مرتفع نسبيًا",
    dailyTrendPct <= 0 ? "الاتجاه اليومي ليس صاعدًا بقوة" : "الاتجاه اليومي صاعد ويحتاج متابعة",
    snapshot.premiumPct <= 0.02 ? "فرق المدينة قريب من المتوسط" : "فرق المدينة أعلى من المتوسط"
  ];

  return {
    countryCode,
    citySlug,
    posture,
    confidence,
    rationale,
    premiumPct: snapshot.premiumPct,
    dailyTrendPct,
    spreadPct: avgSpread,
    updatedAt: snapshot.updatedAt
  };
};

export const compareCityPrices = async (
  countryCode: string,
  citySlug: string,
  targetCitySlug: string
): Promise<CityComparison> => {
  const [current, target] = await Promise.all([
    getPriceSnapshot(countryCode, citySlug),
    getPriceSnapshot(countryCode, targetCitySlug)
  ]);

  const deltaPerGram = target.localPerGram - current.localPerGram;
  const deltaPct = current.localPerGram ? (deltaPerGram / current.localPerGram) * 100 : 0;
  const winner = Math.abs(deltaPerGram) < 0.0001 ? "tie" : deltaPerGram < 0 ? "target" : "current";

  return {
    countryCode,
    citySlug,
    targetCitySlug,
    currentPerGram: current.localPerGram,
    targetPerGram: target.localPerGram,
    deltaPerGram,
    deltaPct,
    winner,
    updatedAt: new Date(
      Math.max(new Date(current.updatedAt).getTime(), new Date(target.updatedAt).getTime())
    ).toISOString()
  };
};

export const getSeoPageCandidates = async ({
  template,
  countryCode
}: {
  template: SeoTemplateVariant;
  countryCode: string;
}) => {
  const country = getCountry(countryCode);
  if (!country) return [];

  const locale = "ar";
  const cities = citiesByCountry[countryCode] ?? [];

  if (template === "city") {
    return cities.map((city) => ({
      template,
      slug: `/${locale}/${countryCode}/${city.slug}`,
      countryCode,
      citySlug: city.slug,
      title: `سعر الذهب اليوم في ${city.name_ar}`
    }));
  }

  if (template === "comparison") {
    return cities.flatMap((city) =>
      cities
        .filter((target) => target.slug !== city.slug)
        .slice(0, 2)
        .map((target) => ({
          template,
          slug: `/${locale}/${countryCode}/${city.slug}/compare?targetCity=${target.slug}`,
          countryCode,
          citySlug: city.slug,
          targetCitySlug: target.slug,
          title: `مقارنة سعر الذهب بين ${city.name_ar} و${target.name_ar}`
        }))
    );
  }

  const dealerRows = await Promise.all(
    cities.slice(0, 6).map(async (city) => {
      const dealers = await getDealers({ countryCode, citySlug: city.slug, sort: "spread" });
      return dealers.slice(0, 3).map((dealer) => ({
        template,
        slug: `/${locale}/${countryCode}/${city.slug}/dealers#${dealer.slug}`,
        countryCode,
        citySlug: city.slug,
        dealerId: dealer.id,
        title: `${dealer.name} - أسعار الذهب اليوم`
      }));
    })
  );

  return dealerRows.flat();
};

export const getFeaturedCities = (countryCode: string) => {
  const countryCities = citiesByCountry[countryCode] ?? [];
  return countryCities.slice(0, 4);
};

export const getCountryCoverage = () => {
  const preferred = new Set(["eg", "sa", "ae"]);

  return countries.map((country) => ({
    code: country.code,
    enabled: preferred.has(country.code),
    cityCount: (citiesByCountry[country.code] ?? []).length
  }));
};
