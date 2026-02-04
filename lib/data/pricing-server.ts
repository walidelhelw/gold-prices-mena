import "server-only";

import { getSupabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";
import { countries, getCountry } from "@/lib/data/countries";
import { buildSnapshot, fallbackCityPremium, type PriceSnapshot } from "@/lib/data/pricing";

const fallbackSpotUsd = 2058.35;
const fallbackFxRates: Record<string, number> = {
  EGP: 48.9,
  SAR: 3.75,
  AED: 3.67,
  KWD: 0.307,
  QAR: 3.64,
  BHD: 0.377,
  OMR: 0.385
};

const SPOT_STALE_MS = 1000 * 60 * 5;
const FX_STALE_MS = 1000 * 60 * 60;
const SNAPSHOT_STALE_MS = 1000 * 60 * 5;

const DEFAULT_BUY_SPREAD_BPS = -40;
const DEFAULT_SELL_SPREAD_BPS = 90;

const currencies = countries.map((country) => country.currency);

type MarketSpot = {
  spotUsd: number;
  updatedAt: string;
  source: string | null;
  previousUsd?: number | null;
};

type PremiumRule = {
  premiumPct: number;
  buySpreadBps: number;
  sellSpreadBps: number;
};

const fetchSpotFromMetalsApi = async (): Promise<MarketSpot | null> => {
  const apiKey = process.env.METALS_API_KEY ?? process.env.GOLD_API_KEY;
  if (!apiKey) return null;

  const url = new URL(process.env.METALS_API_URL ?? "https://metals-api.com/api/latest");
  url.searchParams.set("access_key", apiKey);
  url.searchParams.set("base", "USD");
  url.searchParams.set("symbols", "XAU");

  const response = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!response.ok) return null;
  const data = await response.json();

  const rate = data?.rates?.XAU;
  if (!rate) return null;

  const spotUsd = 1 / rate;
  const updatedAt = data.timestamp ? new Date(data.timestamp * 1000).toISOString() : new Date().toISOString();

  return {
    spotUsd,
    updatedAt,
    source: "metals-api"
  };
};

const fetchSpotFromOpenApi = async (): Promise<MarketSpot | null> => {
  const response = await fetch("https://data-asg.goldprice.org/dbXRates/USD", { next: { revalidate: 60 } });
  if (!response.ok) return null;
  const data = await response.json();
  const spotUsd = Number(data?.items?.[0]?.xauPrice);
  if (!spotUsd) return null;
  const updatedAt = data?.ts ? new Date(data.ts).toISOString() : new Date().toISOString();

  return {
    spotUsd,
    updatedAt,
    source: "goldprice"
  };
};

const fetchFxRates = async (): Promise<{
  rates: Record<string, number>;
  updatedAt: string;
  source: string;
} | null> => {
  const list = currencies.join(",");
  const fxKey = process.env.FX_API_KEY;

  if (fxKey) {
    const url = new URL(process.env.FX_API_URL ?? "https://api.exchangerate.host/live");
    url.searchParams.set("access_key", fxKey);
    url.searchParams.set("source", "USD");
    url.searchParams.set("currencies", list);

    const response = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!response.ok) return null;
    const data = await response.json();

    if (data?.success && data?.quotes) {
      const rates: Record<string, number> = {};
      for (const [pair, value] of Object.entries(data.quotes)) {
        const quote = pair.slice(3);
        rates[quote] = Number(value);
      }

      return {
        rates,
        updatedAt: data.timestamp ? new Date(data.timestamp * 1000).toISOString() : new Date().toISOString(),
        source: "exchangerate-host"
      };
    }
  }

  const fallbackUrl = "https://open.er-api.com/v6/latest/USD";
  const response = await fetch(fallbackUrl, { next: { revalidate: 300 } });
  if (!response.ok) return null;
  const data = await response.json();
  if (!data?.rates) return null;

  const rates: Record<string, number> = {};
  currencies.forEach((currency) => {
    if (data.rates[currency]) {
      rates[currency] = Number(data.rates[currency]);
    }
  });

  return {
    rates,
    updatedAt: new Date().toISOString(),
    source: "exchange-rate-api"
  };
};

const getLatestMarketSpot = async (): Promise<MarketSpot> => {
  if (!isSupabaseServerConfigured()) {
    return {
      spotUsd: fallbackSpotUsd,
      updatedAt: new Date().toISOString(),
      source: "fallback"
    };
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return {
      spotUsd: fallbackSpotUsd,
      updatedAt: new Date().toISOString(),
      source: "fallback"
    };
  }

  const { data: recent } = await supabase
    .from("market_rates")
    .select("spot_usd, observed_at, source")
    .order("observed_at", { ascending: false })
    .limit(2);

  const latest = recent?.[0];
  const previous = recent?.[1];
  const latestTime = latest?.observed_at ? new Date(latest.observed_at).getTime() : 0;
  const isStale = !latest || Date.now() - latestTime > SPOT_STALE_MS;

  if (isStale) {
    const fresh = (await fetchSpotFromMetalsApi()) ?? (await fetchSpotFromOpenApi());
    if (fresh) {
      await supabase.from("market_rates").insert({
        spot_usd: fresh.spotUsd,
        observed_at: fresh.updatedAt,
        source: fresh.source
      });

      return {
        ...fresh,
        previousUsd: latest?.spot_usd ?? null
      };
    }
  }

  if (latest) {
    return {
      spotUsd: latest.spot_usd,
      updatedAt: latest.observed_at,
      source: latest.source,
      previousUsd: previous?.spot_usd ?? null
    };
  }

  return {
    spotUsd: fallbackSpotUsd,
    updatedAt: new Date().toISOString(),
    source: "fallback"
  };
};

const getFxRate = async (currency: string): Promise<{ rate: number; updatedAt: string; source: string }> => {
  const fallback = fallbackFxRates[currency] ?? 1;

  if (!isSupabaseServerConfigured()) {
    return { rate: fallback, updatedAt: new Date().toISOString(), source: "fallback" };
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return { rate: fallback, updatedAt: new Date().toISOString(), source: "fallback" };
  }

  const { data: cached } = await supabase
    .from("fx_rates")
    .select("rate, observed_at, source")
    .eq("quote", currency)
    .order("observed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const cachedTime = cached?.observed_at ? new Date(cached.observed_at).getTime() : 0;
  const isStale = !cached || Date.now() - cachedTime > FX_STALE_MS;

  if (isStale) {
    const fresh = await fetchFxRates();
    if (fresh?.rates?.[currency]) {
      await supabase.from("fx_rates").upsert(
        {
          base: "USD",
          quote: currency,
          rate: fresh.rates[currency],
          observed_at: fresh.updatedAt,
          source: fresh.source
        },
        { onConflict: "base,quote" }
      );

      return {
        rate: fresh.rates[currency],
        updatedAt: fresh.updatedAt,
        source: fresh.source
      };
    }
  }

  if (cached) {
    return {
      rate: cached.rate,
      updatedAt: cached.observed_at,
      source: cached.source ?? "cache"
    };
  }

  return { rate: fallback, updatedAt: new Date().toISOString(), source: "fallback" };
};

const getPremiumRule = async (countryCode: string, citySlug?: string | null): Promise<PremiumRule> => {
  const defaultPremium = citySlug ? fallbackCityPremium(citySlug) : 0;

  if (!isSupabaseServerConfigured()) {
    return {
      premiumPct: defaultPremium,
      buySpreadBps: DEFAULT_BUY_SPREAD_BPS,
      sellSpreadBps: DEFAULT_SELL_SPREAD_BPS
    };
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return {
      premiumPct: defaultPremium,
      buySpreadBps: DEFAULT_BUY_SPREAD_BPS,
      sellSpreadBps: DEFAULT_SELL_SPREAD_BPS
    };
  }

  let query = supabase
    .from("premium_rules")
    .select("premium_bps, buy_spread_bps, sell_spread_bps")
    .eq("country_code", countryCode);

  if (citySlug) {
    query = query.eq("city_slug", citySlug);
  } else {
    query = query.is("city_slug", null);
  }

  let { data } = await query.limit(1).maybeSingle();

  if (!data && citySlug) {
    const fallback = await supabase
      .from("premium_rules")
      .select("premium_bps, buy_spread_bps, sell_spread_bps")
      .eq("country_code", countryCode)
      .is("city_slug", null)
      .limit(1)
      .maybeSingle();

    data = fallback.data ?? null;
  }

  return {
    premiumPct: data ? Number(data.premium_bps) / 10000 : defaultPremium,
    buySpreadBps: data?.buy_spread_bps ?? DEFAULT_BUY_SPREAD_BPS,
    sellSpreadBps: data?.sell_spread_bps ?? DEFAULT_SELL_SPREAD_BPS
  };
};

const getBaseSnapshot = async (countryCode: string, currency: string) => {
  if (isSupabaseServerConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { data: cached } = await supabase
        .from("price_snapshots")
        .select("spot_usd, am_fix_usd, pm_fix_usd, fx_rate, created_at, source")
        .eq("country_code", countryCode)
        .is("city_slug", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const cachedTime = cached?.created_at ? new Date(cached.created_at).getTime() : 0;
      const isStale = !cached || Date.now() - cachedTime > SNAPSHOT_STALE_MS;

      if (!isStale && cached) {
        return {
          spotUsd: cached.spot_usd,
          amFixUsd: cached.am_fix_usd,
          pmFixUsd: cached.pm_fix_usd,
          fxRate: cached.fx_rate,
          updatedAt: cached.created_at,
          source: cached.source
        };
      }
    }
  }

  const market = await getLatestMarketSpot();
  const fx = await getFxRate(currency);
  const amFixUsd = market.previousUsd ?? market.spotUsd;
  const pmFixUsd = market.spotUsd;

  if (isSupabaseServerConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      await supabase.from("price_snapshots").insert({
        country_code: countryCode,
        city_slug: null,
        currency,
        spot_usd: market.spotUsd,
        am_fix_usd: amFixUsd,
        pm_fix_usd: pmFixUsd,
        fx_rate: fx.rate,
        local_per_gram: (market.spotUsd * fx.rate) / 31.1035,
        premium_pct: 0,
        source: market.source
      });
    }
  }

  return {
    spotUsd: market.spotUsd,
    amFixUsd,
    pmFixUsd,
    fxRate: fx.rate,
    updatedAt: market.updatedAt,
    source: market.source
  };
};

export const getPriceSnapshot = async (countryCode: string, citySlug?: string | null): Promise<PriceSnapshot> => {
  const country = getCountry(countryCode);
  if (!country) {
    throw new Error(`Unknown country: ${countryCode}`);
  }

  const base = await getBaseSnapshot(countryCode, country.currency);
  const premiumRule = await getPremiumRule(countryCode, citySlug ?? null);

  return buildSnapshot({
    countryCode,
    currency: country.currency,
    spotUsd: base.spotUsd,
    amFixUsd: base.amFixUsd,
    pmFixUsd: base.pmFixUsd,
    fxRate: base.fxRate,
    premiumPct: premiumRule.premiumPct,
    buySpreadBps: premiumRule.buySpreadBps,
    sellSpreadBps: premiumRule.sellSpreadBps,
    updatedAt: base.updatedAt,
    source: base.source
  });
};

export const getPriceHistory = async (countryCode: string, days = 30) => {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = getSupabaseServer();
  if (!supabase) return [];

  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase
    .from("price_snapshots")
    .select("local_per_gram, created_at")
    .eq("country_code", countryCode)
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  return (
    data?.map((row) => ({
      date: row.created_at,
      localPerGram: row.local_per_gram
    })) ?? []
  );
};

export const getSpotSummary = async () => {
  const market = await getLatestMarketSpot();
  const amFixUsd = market.previousUsd ?? market.spotUsd;
  const pmFixUsd = market.spotUsd;

  return {
    spotUsd: market.spotUsd,
    amFixUsd,
    pmFixUsd,
    updatedAt: market.updatedAt,
    source: market.source
  };
};

export const getFxSummary = async (currency: string) => {
  const result = await getFxRate(currency);
  return {
    base: "USD",
    quote: currency,
    rate: result.rate,
    updatedAt: result.updatedAt,
    source: result.source
  };
};
