import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/lib/i18n/routing";
import { citiesByCountry, countries, getCountry } from "@/lib/data/countries";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { DealerLeaderboard } from "@/components/prices/DealerLeaderboard";
import { FreshnessBadge } from "@/components/prices/FreshnessBadge";
import { MarketPosturePanel } from "@/components/prices/MarketPosturePanel";
import { ContextLinks } from "@/components/layout/ContextLinks";
import { getDealers, getFreshnessStatus, getMarketSignal, getRankingReadiness } from "@/lib/data/dealers-server";
import { getPriceSnapshot } from "@/lib/data/pricing-server";

export const revalidate = 60;

export default async function CityDealersPage({
  params
}: {
  params?: Promise<{ locale?: string | string[]; country?: string; city?: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolveLocale(resolvedParams?.locale);
  const country = resolvedParams?.country ?? "";
  const city = resolvedParams?.city ?? "";

  const countryData = getCountry(country);
  if (!countryData) notFound();

  const cityData = (citiesByCountry[countryData.code] ?? []).find((item) => item.slug === city);
  if (!cityData) notFound();

  const [t, snapshot, dealers, freshness, signal, readiness] = await Promise.all([
    getTranslations({ locale, namespace: "dealer" }),
    getPriceSnapshot(countryData.code, cityData.slug),
    getDealers({ countryCode: countryData.code, citySlug: cityData.slug, sort: "spread" }),
    getFreshnessStatus(countryData.code, cityData.slug),
    getMarketSignal(countryData.code, cityData.slug),
    getRankingReadiness(countryData.code, cityData.slug)
  ]);

  const basePath = `/${locale}/${countryData.code}/${cityData.slug}`;

  return (
    <div>
      <SiteHeader locale={locale} country={countryData} countries={countries} />
      <main className="container-page space-y-8 pb-24 md:pb-16">
        <section className="card p-8 text-start">
          <h1 className="text-3xl font-semibold text-brand-50 md:text-4xl">
            {t("dealersTitle", { city: cityData.name_ar, country: countryData.name_ar })}
          </h1>
          <p className="mt-3 text-sm text-brand-200/80">{t("dealersSubtitle")}</p>
        </section>

        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <FreshnessBadge locale={locale} freshness={freshness} />
          <section className="card p-4 text-start">
            <p className="text-xs text-brand-200/70">{t("currentPrice")}</p>
            <p className="mt-2 text-3xl font-semibold text-brand-50" dir="ltr">
              {new Intl.NumberFormat(locale, {
                style: "currency",
                currency: snapshot.currency,
                maximumFractionDigits: 2
              }).format(snapshot.localPerGram)}
            </p>
          </section>
        </div>

        <MarketPosturePanel locale={locale} signal={signal} />
        {readiness.rankingEnabled ? (
          <DealerLeaderboard locale={locale} currency={snapshot.currency} rows={dealers} />
        ) : (
          <section className="card p-6 text-start">
            <h2 className="text-xl text-brand-50">{t("shadowTitle")}</h2>
            <p className="mt-3 text-sm text-brand-200/80">{t("shadowBody")}</p>
            <ul className="mt-4 space-y-2 text-sm text-brand-200/80">
              {readiness.reasons.map((reason) => (
                <li key={reason}>• {reason}</li>
              ))}
            </ul>
          </section>
        )}

        <ContextLinks
          links={[
            {
              href: `${basePath}/compare`,
              label: t("compareLink"),
              description: t("compareLinkDesc")
            },
            {
              href: `${basePath}/insights`,
              label: t("insightsLink"),
              description: t("insightsLinkDesc")
            },
            {
              href: `/${locale}/guides/gold-premium-guide`,
              label: t("guideLink"),
              description: t("guideLinkDesc")
            },
            {
              href: `/${locale}/${countryData.code}/${cityData.slug}`,
              label: t("cityPriceLink"),
              description: t("cityPriceLinkDesc")
            }
          ]}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
