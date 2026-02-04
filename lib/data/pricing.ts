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
  localPerGram: number;
  karats: KaratPrice[];
  bars: { weight: number; price: number }[];
  coins: { name: string; price: number }[];
  updatedAt: string;
};

const fxRates: Record<string, number> = {
  EGP: 48.9,
  SAR: 3.75,
  AED: 3.67,
  KWD: 0.307,
  QAR: 3.64,
  BHD: 0.377,
  OMR: 0.385,
  JOD: 0.709,
  IQD: 1310,
  LBP: 89500,
  ILS: 3.68,
  SYP: 13500,
  YER: 245
};

export const getFxRate = (currency: string) => fxRates[currency.toUpperCase()] ?? null;

const baseSpotUsd = 2058.35;

const computePerGram = (usdPrice: number, fx: number) => (usdPrice * fx) / 31.1035;

export const buildSnapshot = (countryCode: string): PriceSnapshot => {
  const country = countries.find((item) => item.code === countryCode);
  if (!country) {
    throw new Error(`Unknown country: ${countryCode}`);
  }

  const fx = fxRates[country.currency] ?? 1;
  const spotUsd = baseSpotUsd;
  const amFixUsd = baseSpotUsd + 2.1;
  const pmFixUsd = baseSpotUsd - 1.4;
  const localPerGram = computePerGram(spotUsd, fx);

  const karats = [24, 22, 21, 20, 18, 14, 12].map((karat) => {
    const price = localPerGram * (karat / 24);
    return {
      karat,
      price,
      buy: price * 0.995,
      sell: price * 1.01
    };
  });

  const bars = [1, 5, 10, 20, 50, 100, 250, 500, 1000].map((weight) => ({
    weight,
    price: localPerGram * weight
  }));

  const coins = [
    { name: "جنيه ذهب", grams: 8 },
    { name: "ليرة ذهب", grams: 7.2 },
    { name: "سوفيرن", grams: 7.98 }
  ].map((coin) => ({
    name: coin.name,
    price: localPerGram * coin.grams
  }));

  return {
    country: country.code,
    currency: country.currency,
    spotUsd,
    amFixUsd,
    pmFixUsd,
    localPerGram,
    karats,
    bars,
    coins,
    updatedAt: new Date().toISOString()
  };
};

export const formatCurrency = (value: number, locale: string, currency: string) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);

export const formatNumber = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
