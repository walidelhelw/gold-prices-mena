import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { citiesByCountry, getCountry } from "@/lib/data/countries";
import { formatPercent } from "@/lib/data/pricing";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PriceHighlights } from "@/components/prices/PriceHighlights";
import { KaratTable } from "@/components/prices/KaratTable";
import { BarsTable } from "@/components/prices/BarsTable";
import { CoinsTable } from "@/components/prices/CoinsTable";
import { AdSlot } from "@/components/ads/AdSlot";
import { formatDate } from "@/lib/utils/format";
import { resolveLocale } from "@/lib/i18n/routing";
import { formatCurrency } from "@/lib/data/pricing";
import { countries } from "@/lib/data/countries";
import { getPriceSnapshot } from "@/lib/data/pricing-server";
import { PriceStickyBar } from "@/components/prices/PriceStickyBar";

export const revalidate = 60;

export default async function CityPage({
  params
}: {
  params?: Promise<{ locale?: string | string[]; country?: string; city?: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolveLocale(resolvedParams?.locale);
  const country = resolvedParams?.country ?? "";
  const city = resolvedParams?.city ?? "";
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
  const snapshot = await getPriceSnapshot(countryData.code, cityData.slug);
  const countryName = countryData.name_ar;
  const cityName = cityData.name_ar;
  const premium = snapshot.premiumPct;
  const premiumLabel =
    premium > 0.001 ? tCommon("aboveAverage") : premium < -0.001 ? tCommon("belowAverage") : tCommon("aroundAverage");
  const premiumTone = premium > 0.001 ? "text-emerald-300" : premium < -0.001 ? "text-rose-300" : "text-brand-200/80";

  return (
    <div>
      <SiteHeader locale={locale} country={countryData} countries={countries} />
      <main className="container-page space-y-8 pb-24 md:pb-16">
        <PriceStickyBar
          locale={locale}
          countryName={`${countryName} - ${cityName}`}
          localPerGram={snapshot.localPerGram}
          currency={snapshot.currency}
          amFixUsd={snapshot.amFixUsd}
          pmFixUsd={snapshot.pmFixUsd}
          updatedAt={snapshot.updatedAt}
        />
        <section className="card p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3 text-start">
              <p className="text-[11px] uppercase tracking-[0.35em] text-brand-200/70" dir="ltr">
                {formatDate(snapshot.updatedAt, locale)}
              </p>
              <h1 className="text-3xl font-semibold text-brand-50 md:text-4xl">
                {tCountry("title", { country: `${countryName} - ${cityName}` })}
              </h1>
              <p className="text-sm text-brand-200/80">
                {tCommon("updatedAt")} · {tCommon("priceNow")} {""}
                <bdi dir="ltr">{formatCurrency(snapshot.localPerGram, locale, snapshot.currency)}</bdi> /{tCommon("unitGram")}
              </p>
            </div>
            <div className="grid gap-3 md:w-[260px]">
              <div className="rounded-2xl border border-brand-300/20 bg-brand-900/40 p-4 text-start">
                <p className="text-xs text-brand-200/70">{tCountry("localPerGramLabel")}</p>
                <p className="mt-2 text-3xl font-semibold text-brand-50">
                  <bdi dir="ltr">{formatCurrency(snapshot.localPerGram, locale, snapshot.currency)}</bdi>
                </p>
                <p className="mt-2 text-xs text-brand-200/70">
                  {tCountry("defaultKaratLabel")} {countryData.defaultKarat}
                  {tCommon("karatSuffix")}
                </p>
              </div>
              <div className="rounded-2xl border border-brand-300/20 bg-brand-900/40 p-4 text-start">
                <p className="text-xs text-brand-200/70">{tCommon("cityPremium")}</p>
                <p className={`mt-2 text-2xl font-semibold ${premiumTone}`}>
                  <bdi dir="ltr">
                    {premium >= 0 ? "+" : "-"}
                    {formatPercent(Math.abs(premium), locale)}
                  </bdi>
                </p>
                <p className="mt-2 text-xs text-brand-200/70">{premiumLabel}</p>
              </div>
            </div>
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
