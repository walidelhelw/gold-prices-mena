import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/lib/i18n/routing";
import { citiesByCountry, countries, getCountry } from "@/lib/data/countries";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MarketPosturePanel } from "@/components/prices/MarketPosturePanel";
import { FreshnessBadge } from "@/components/prices/FreshnessBadge";
import { getFreshnessStatus, getMarketSignal } from "@/lib/data/dealers-server";

export const revalidate = 90;

export default async function CityInsightsPage({
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

  const [t, signal, freshness] = await Promise.all([
    getTranslations({ locale, namespace: "dealer" }),
    getMarketSignal(countryData.code, cityData.slug),
    getFreshnessStatus(countryData.code, cityData.slug)
  ]);

  return (
    <div>
      <SiteHeader locale={locale} country={countryData} countries={countries} />
      <main className="container-page space-y-8 pb-24 md:pb-16">
        <section className="card p-8 text-start">
          <h1 className="text-3xl font-semibold text-brand-50 md:text-4xl">
            {t("insightsTitle", { city: cityData.name_ar, country: countryData.name_ar })}
          </h1>
          <p className="mt-3 text-sm text-brand-200/80">{t("insightsSubtitle")}</p>
        </section>

        <FreshnessBadge locale={locale} freshness={freshness} />
        <MarketPosturePanel locale={locale} signal={signal} />
      </main>
      <SiteFooter />
    </div>
  );
}
