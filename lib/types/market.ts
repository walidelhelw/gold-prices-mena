export type QuoteIntent = "buy" | "sell";
export type DealerSort = "spread" | "freshness";

export type DealerVerificationState = "unverified" | "verified" | "trusted";

export type Dealer = {
  id: string;
  countryCode: string;
  citySlug: string;
  name: string;
  slug: string;
  sourceUrl: string;
  phone?: string | null;
  verificationState: DealerVerificationState;
  reliabilityScore: number;
  lastSeenAt: string;
};

export type DealerQuote = {
  id: string;
  dealerId: string;
  countryCode: string;
  citySlug: string;
  karat: number;
  buyPerGram: number;
  sellPerGram: number;
  spreadPct: number;
  observedAt: string;
  sourceUrl: string;
};

export type DealerReliabilityScore = {
  dealerId: string;
  score: number;
  confidence: number;
  updatedAt: string;
  reasons: string[];
};

export type MarketPosture = "buy_zone" | "watch" | "wait";

export type MarketSignal = {
  countryCode: string;
  citySlug: string;
  posture: MarketPosture;
  confidence: number;
  rationale: string[];
  premiumPct: number;
  dailyTrendPct: number;
  spreadPct: number;
  updatedAt: string;
};

export type FreshnessStatus = {
  countryCode: string;
  citySlug: string;
  observedAt: string;
  ageSeconds: number;
  sourceCount: number;
  status: "fresh" | "aging" | "stale";
  reliabilityAvg: number;
};

export type CityComparison = {
  countryCode: string;
  citySlug: string;
  targetCitySlug: string;
  currentPerGram: number;
  targetPerGram: number;
  deltaPerGram: number;
  deltaPct: number;
  winner: "current" | "target" | "tie";
  updatedAt: string;
};

export type SeoTemplateVariant = "city" | "dealer" | "comparison";

export type RankingReadiness = {
  countryCode: string;
  citySlug: string;
  shadowMode: boolean;
  rankingEnabled: boolean;
  firstObservedAt: string | null;
  nextEligibleAt: string | null;
  freshnessStatus: "fresh" | "aging" | "stale";
  sourceCount: number;
  reliabilityAvg: number;
  reasons: string[];
};

export const parseQuoteIntent = (value: string | null): QuoteIntent =>
  value === "sell" ? "sell" : "buy";

export const parseDealerSort = (value: string | null): DealerSort =>
  value === "freshness" ? "freshness" : "spread";

export const parseSeoTemplateVariant = (value: string | null): SeoTemplateVariant => {
  if (value === "dealer" || value === "comparison") {
    return value;
  }
  return "city";
};
