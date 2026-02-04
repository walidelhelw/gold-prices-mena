export const locales = ["ar", "en", "es"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "ar";
export const rtlLocales: readonly AppLocale[] = ["ar"];

const normalizeLocale = (locale?: string | string[] | null) =>
  Array.isArray(locale) ? locale[0] : locale;

export const isSupportedLocale = (locale?: string | string[] | null) =>
  locales.includes(normalizeLocale(locale) as AppLocale);

export const resolveLocale = (locale?: string | string[] | null): AppLocale => {
  const normalized = normalizeLocale(locale);
  return locales.includes(normalized as AppLocale) ? (normalized as AppLocale) : defaultLocale;
};

export const isRTL = (locale: string) => rtlLocales.includes(locale as AppLocale);
