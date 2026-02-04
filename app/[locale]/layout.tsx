import "../globals.css";

import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "@/lib/i18n/messages";
import { defaultLocale, isRTL, locales, type AppLocale } from "@/lib/i18n/routing";
import { Cairo, IBM_Plex_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ar"
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-latin"
});

export const metadata: Metadata = {
  title: "أسعار الذهب اليوم",
  description: "أسعار الذهب لحظة بلحظة في الشرق الأوسط مع تحليلات يومية"
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages(locale);
  const direction = isRTL(locale) ? "rtl" : "ltr";
  const adsClient = process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT;

  return (
    <html lang={locale ?? defaultLocale} dir={direction} className={`${cairo.variable} ${plex.variable}`}>
      <body className={direction === "rtl" ? "font-ar" : "font-latin"}>
        <div className="noise-layer" aria-hidden="true" />
        {adsClient ? (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsClient}`}
            crossOrigin="anonymous"
          />
        ) : null}
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
