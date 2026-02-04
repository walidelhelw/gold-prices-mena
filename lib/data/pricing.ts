import { countries } from "./countries";

export type PriceType = "spot" | "am" | "pm" | "local";

export type KaratPrice = {
  karat: number;
  price: number;
  buy: number;
  sell: number;
};

export type PriceSnapshot = {
  country: string;
  currency: string;
  spotUsd: number;
  amFixUsd: number;
  pmFixUsd: number;
  fxRate: number;
  localPerGram: number;
  premiumPct: number;
  karats: KaratPrice[];
  bars: { weight: number; price: number }[];
  coins: { name: string; price: number }[];
  updatedAt: string;
  source?: string | null;
};

export const OUNCE_GRAMS = 31.1035;

const barWeights = [1, 5, 10, 20, 50, 100, 250, 500, 1000];
const coins = [
  { name: "جنيه ذهب", grams: 8 },
  { name: "ليرة ذهب", grams: 7.2 },
  { name: "سوفيرن", grams: 7.98 }
];

export const formatCurrency = (value: number, locale: string, currency: string) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);

export const formatNumber = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);

export const formatPercent = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 2 }).format(value);

export const computeLocalPerGram = (spotUsd: number, fxRate: number, premiumPct = 0) =>
  (spotUsd * fxRate * (1 + premiumPct)) / OUNCE_GRAMS;

export const computeKaratRows = (
  localPerGram: number,
  buySpreadBps: number,
  sellSpreadBps: number
): KaratPrice[] => {
  const buyMultiplier = 1 + buySpreadBps / 10000;
  const sellMultiplier = 1 + sellSpreadBps / 10000;

  return [24, 22, 21, 20, 18, 14, 12].map((karat) => {
    const price = localPerGram * (karat / 24);
    return {
      karat,
      price,
      buy: price * buyMultiplier,
      sell: price * sellMultiplier
    };
  });
};

export const computeBars = (localPerGram: number) =>
  barWeights.map((weight) => ({
    weight,
    price: localPerGram * weight
  }));

export const computeCoins = (localPerGram: number) =>
  coins.map((coin) => ({
    name: coin.name,
    price: localPerGram * coin.grams
  }));

export const buildSnapshot = ({
  countryCode,
  currency,
  spotUsd,
  amFixUsd,
  pmFixUsd,
  fxRate,
  premiumPct,
  buySpreadBps,
  sellSpreadBps,
  updatedAt,
  source
}: {
  countryCode: string;
  currency: string;
  spotUsd: number;
  amFixUsd: number;
  pmFixUsd: number;
  fxRate: number;
  premiumPct: number;
  buySpreadBps: number;
  sellSpreadBps: number;
  updatedAt: string;
  source?: string | null;
}): PriceSnapshot => {
  const country = countries.find((item) => item.code === countryCode);
  if (!country) {
    throw new Error(`Unknown country: ${countryCode}`);
  }

  const localPerGram = computeLocalPerGram(spotUsd, fxRate, premiumPct);
  const karats = computeKaratRows(localPerGram, buySpreadBps, sellSpreadBps);
  const bars = computeBars(localPerGram);
  const coinsList = computeCoins(localPerGram);

  return {
    country: country.code,
    currency,
    spotUsd,
    amFixUsd,
    pmFixUsd,
    fxRate,
    localPerGram,
    premiumPct,
    karats,
    bars,
    coins: coinsList,
    updatedAt,
    source
  };
};

export const fallbackCityPremium = (citySlug: string) => {
  let hash = 0;
  for (let i = 0; i < citySlug.length; i += 1) {
    hash = (hash << 5) - hash + citySlug.charCodeAt(i);
    hash |= 0;
  }
  const normalized = (Math.abs(hash) % 13) - 6;
  return normalized / 1000;
};
