export const locales = ["ar", "en", "es"] as const;
export const defaultLocale = "ar";
export const rtlLocales = ["ar"] as const;

export type AppLocale = (typeof locales)[number];

export const isRTL = (locale: string) => rtlLocales.includes(locale as AppLocale);
