import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { citiesByCountry, getCountry } from "@/lib/data/countries";
import { buildSnapshot } from "@/lib/data/pricing";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PriceHighlights } from "@/components/prices/PriceHighlights";
import { KaratTable } from "@/components/prices/KaratTable";
import { BarsTable } from "@/components/prices/BarsTable";
import { CoinsTable } from "@/components/prices/CoinsTable";
import { AdSlot } from "@/components/ads/AdSlot";
import { formatDate } from "@/lib/utils/format";
import type { AppLocale } from "@/lib/i18n/routing";
import { formatCurrency } from "@/lib/data/pricing";
import { countries } from "@/lib/data/countries";

export const revalidate = 60;

export default async function CityPage({
  params
}: {
  params: { locale: AppLocale; country: string; city: string };
}) {
  const { locale, country, city } = params;
  const countryData = getCountry(country);
  if (!countryData) {
    notFound();
  }
  const cities = citiesByCountry[countryData.code] ?? [];
  const cityData = cities.find((item) => item.slug === city);
  if (!cityData) {
    notFound();
  }

  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tCountry = await getTranslations({ locale, namespace: "country" });
  const snapshot = buildSnapshot(countryData.code);
  const countryName = locale === "ar" ? countryData.name_ar : countryData.name_en;
  const cityName = locale === "ar" ? cityData.name_ar : cityData.name_en;

  return (
    <div>
      <SiteHeader locale={locale} country={countryData} countries={countries} />
      <main className="container-page space-y-10 pb-16">
        <section className="card relative overflow-hidden p-8">
          <div className="absolute inset-0 bg-hero opacity-70" />
          <div className="relative z-10 space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-brand-200/70" dir="ltr">
              {formatDate(snapshot.updatedAt, locale)}
            </p>
            <h1 className="text-3xl font-semibold text-brand-50 md:text-4xl">
              {tCountry("title", { country: `${countryName} - ${cityName}` })}
            </h1>
            <p className="text-sm text-brand-200/80">
              {tCommon("updatedAt")} · {tCommon("priceNow")} {" "}
              <bdi dir="ltr">{formatCurrency(snapshot.localPerGram, locale, snapshot.currency)}</bdi> /{tCommon("unitGram")}
            </p>
          </div>
        </section>

        <PriceHighlights
          locale={locale}
          currency={snapshot.currency}
          spotUsd={snapshot.spotUsd}
          amFixUsd={snapshot.amFixUsd}
          pmFixUsd={snapshot.pmFixUsd}
          localPerGram={snapshot.localPerGram}
        />

        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <KaratTable locale={locale} currency={snapshot.currency} rows={snapshot.karats} />
          <AdSlot slot="city-sidebar" />
        </div>

        <BarsTable locale={locale} currency={snapshot.currency} rows={snapshot.bars} />
        <CoinsTable locale={locale} currency={snapshot.currency} rows={snapshot.coins} />
      </main>
      <SiteFooter />
    </div>
  );
}
