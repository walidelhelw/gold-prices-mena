import { countries } from "@/lib/data/countries";

const allowedCountries = new Set(countries.map((country) => country.code));

export const normalizeCountry = (code?: string | null) => {
  if (!code) return null;
  const value = code.toLowerCase();
  return allowedCountries.has(value) ? value : null;
};

export const getDefaultCountry = () =>
  normalizeCountry(process.env.NEXT_PUBLIC_DEFAULT_COUNTRY ?? "eg") ?? "eg";

export const extractCountryFromHeaders = (headers: Headers) => {
  const vercel = headers.get("x-vercel-ip-country");
  const cloudflare = headers.get("cf-ipcountry");
  const custom = headers.get("x-country");
  return normalizeCountry(vercel) ?? normalizeCountry(cloudflare) ?? normalizeCountry(custom);
};
