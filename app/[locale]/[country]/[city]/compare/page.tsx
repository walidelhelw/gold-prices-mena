import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/lib/i18n/routing";
import { citiesByCountry, countries, getCountry } from "@/lib/data/countries";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { compareCityPrices } from "@/lib/data/dealers-server";

export const revalidate = 120;

export default async function CityComparePage({
  params,
  searchParams
}: {
  params?: Promise<{ locale?: string | string[]; country?: string; city?: string }>;
  searchParams?: Promise<{ targetCity?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const locale = resolveLocale(resolvedParams?.locale);
  const country = resolvedParams?.country ?? "";
  const city = resolvedParams?.city ?? "";

  const countryData = getCountry(country);
  if (!countryData) notFound();

  const cities = citiesByCountry[countryData.code] ?? [];
  const cityData = cities.find((item) => item.slug === city);
  if (!cityData) notFound();

  const targetCitySlug = resolvedSearch?.targetCity ?? cities.find((item) => item.slug !== city)?.slug ?? city;
  const targetCity = cities.find((item) => item.slug === targetCitySlug) ?? cityData;

  const [t, comparison] = await Promise.all([
    getTranslations({ locale, namespace: "dealer" }),
    compareCityPrices(countryData.code, cityData.slug, targetCity.slug)
  ]);

  const winnerLabel =
    comparison.winner === "tie"
      ? t("winner.tie")
      : comparison.winner === "current"
      ? t("winner.current", { city: cityData.name_ar })
      : t("winner.target", { city: targetCity.name_ar });

  return (
    <div>
      <SiteHeader locale={locale} country={countryData} countries={countries} />
      <main className="container-page space-y-8 pb-24 md:pb-16">
        <section className="card p-8 text-start">
          <h1 className="text-3xl font-semibold text-brand-50 md:text-4xl">
            {t("compareTitle", { city: cityData.name_ar, target: targetCity.name_ar })}
          </h1>
          <p className="mt-3 text-sm text-brand-200/80">{t("compareSubtitle")}</p>
        </section>

        <div className="card p-6 text-start">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-brand-300/20 bg-brand-900/40 p-4">
              <p className="text-xs text-brand-200/70">{cityData.name_ar}</p>
              <p className="mt-1 text-2xl text-brand-50" dir="ltr">{comparison.currentPerGram.toFixed(2)}</p>
            </div>
            <div className="rounded-xl border border-brand-300/20 bg-brand-900/40 p-4">
              <p className="text-xs text-brand-200/70">{targetCity.name_ar}</p>
              <p className="mt-1 text-2xl text-brand-50" dir="ltr">{comparison.targetPerGram.toFixed(2)}</p>
            </div>
            <div className="rounded-xl border border-brand-300/20 bg-brand-900/40 p-4">
              <p className="text-xs text-brand-200/70">{t("delta")}</p>
              <p className="mt-1 text-2xl text-brand-50" dir="ltr">
                {comparison.deltaPerGram >= 0 ? "+" : ""}
                {comparison.deltaPerGram.toFixed(2)}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-brand-200/80">{winnerLabel}</p>
        </div>

        <section className="card p-6 text-start">
          <h2 className="text-xl text-brand-50">{t("switchCity")}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {cities
              .filter((item) => item.slug !== cityData.slug)
              .map((item) => (
                <Link
                  key={item.slug}
                  href={`/${locale}/${countryData.code}/${cityData.slug}/compare?targetCity=${item.slug}`}
                  className="rounded-full border border-brand-300/20 px-3 py-1 text-xs text-brand-100"
                >
                  {item.name_ar}
                </Link>
              ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
