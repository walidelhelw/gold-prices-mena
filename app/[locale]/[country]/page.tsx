import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { citiesByCountry, countries, getCountry } from "@/lib/data/countries";
import { buildSnapshot } from "@/lib/data/pricing";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PriceHighlights } from "@/components/prices/PriceHighlights";
import { KaratTable } from "@/components/prices/KaratTable";
import { BarsTable } from "@/components/prices/BarsTable";
import { CoinsTable } from "@/components/prices/CoinsTable";
import { PriceStickyBar } from "@/components/prices/PriceStickyBar";
import { QuickComparison } from "@/components/prices/QuickComparison";
import { ShareActions } from "@/components/prices/ShareActions";
import { AdSlot } from "@/components/ads/AdSlot";
import { formatDate } from "@/lib/utils/format";
import { articles } from "@/lib/data/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { resolveLocale } from "@/lib/i18n/routing";
import { formatCurrency } from "@/lib/data/pricing";
import Link from "next/link";

export const revalidate = 60;

export async function generateMetadata({
  params
}: {
  params?: Promise<{ locale?: string | string[]; country?: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolveLocale(resolvedParams?.locale);
  const country = resolvedParams?.country ?? "";
  const t = await getTranslations({ locale, namespace: "country" });
  const countryData = getCountry(country);
  if (!countryData) return {};
  const countryName = countryData.name_ar;
  return {
    title: t("title", { country: countryName }),
    description: t("metaDescription", { country: countryName })
  };
}

export default async function CountryPage({
  params
}: {
  params?: Promise<{ locale?: string | string[]; country?: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolveLocale(resolvedParams?.locale);
  const country = resolvedParams?.country ?? "";
  const countryData = getCountry(country);
  if (!countryData) {
    notFound();
  }

  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tCountry = await getTranslations({ locale, namespace: "country" });
  const tArticles = await getTranslations({ locale, namespace: "articles" });
  const snapshot = buildSnapshot(countryData.code);
  const relatedArticles = articles.filter((article) => article.countryCodes.includes(countryData.code)).slice(0, 3);
  const countryName = countryData.name_ar;
  const cities = citiesByCountry[countryData.code] ?? [];
  const activeCity = cities.length > 0 ? cities[new Date(snapshot.updatedAt).getUTCDate() % cities.length] : null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gold-prices-mena.vercel.app";
  const shareUrl = `${siteUrl}/${locale}/${countryData.code}`;
  const priceText = `${tCountry("title", { country: countryName })} - ${formatCurrency(
    snapshot.localPerGram,
    locale,
    snapshot.currency
  )} / ${tCommon("unitGram")}`;
  const shareText = `${tCountry("title", { country: countryName })} • ${formatCurrency(
    snapshot.localPerGram,
    locale,
    snapshot.currency
  )} / ${tCommon("unitGram")}`;

  return (
    <div>
      <SiteHeader locale={locale} country={countryData} countries={countries} />

      <main className="container-page space-y-8 pb-24 md:pb-16">
        <PriceStickyBar
          locale={locale}
          countryName={countryName}
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
                {tCountry("title", { country: countryName })}
              </h1>
              <p className="text-sm text-brand-200/80">
                {tCommon("updatedAt")} · {tCommon("priceNow")}{" "}
                <bdi dir="ltr">{formatCurrency(snapshot.localPerGram, locale, snapshot.currency)}</bdi> /{tCommon("unitGram")}
              </p>
            </div>
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
          </div>
          {cities.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2 text-xs text-brand-200/70">
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  className="rounded-full border border-brand-300/20 px-3 py-1 hover:border-brand-200"
                  href={`/${locale}/${countryData.code}/${city.slug}`}
                >
                  {city.name_ar}
                </Link>
              ))}
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-brand-200/70">
            <ShareActions priceText={priceText} shareUrl={shareUrl} shareText={shareText} />
            {activeCity ? (
              <span>
                {tCommon("activeCity")}:{" "}
                <Link className="text-brand-100" href={`/${locale}/${countryData.code}/${activeCity.slug}`}>
                  {activeCity.name_ar}
                </Link>
              </span>
            ) : null}
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

        <QuickComparison
          locale={locale}
          currency={snapshot.currency}
          rows={snapshot.karats}
          defaultKarat={countryData.defaultKarat}
        />

        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <KaratTable locale={locale} currency={snapshot.currency} rows={snapshot.karats} />
          <AdSlot slot="prices-sidebar" />
        </div>

        <BarsTable locale={locale} currency={snapshot.currency} rows={snapshot.bars} />

        <CoinsTable locale={locale} currency={snapshot.currency} rows={snapshot.coins} />

        <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="card p-6">
            <h2 className="text-xl text-brand-50">{tCountry("analysisTitle")}</h2>
            <p className="mt-4 text-sm text-brand-200/80">
              {tCountry("analysisBody")}
            </p>
          </div>
          <AdSlot slot="analysis" />
        </section>

        <section className="card p-6">
          <h2 className="text-xl text-brand-50">{tCountry("sourcesTitle")}</h2>
          <p className="mt-4 text-sm text-brand-200/80">{tCountry("sourcesBody")}</p>
        </section>

        <section className="card p-6">
          <h2 className="text-xl text-brand-50">{tCountry("faqTitle")}</h2>
          <div className="mt-6 space-y-4 text-sm text-brand-200/80">
            <div>
              <p className="text-brand-50">{tCountry("faqOneQ")}</p>
              <p className="mt-2">{tCountry("faqOneA")}</p>
            </div>
            <div>
              <p className="text-brand-50">{tCountry("faqTwoQ")}</p>
              <p className="mt-2">{tCountry("faqTwoA")}</p>
            </div>
            <div>
              <p className="text-brand-50">{tCountry("faqThreeQ")}</p>
              <p className="mt-2">{tCountry("faqThreeA")}</p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl text-brand-50">{tArticles("latest")}</h2>
            <Link className="text-sm text-brand-200/80" href={`/${locale}/articles`}>
              {tCommon("viewAll")}
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedArticles.map((article) => (
              <ArticleCard key={article.slug} locale={locale} article={article} />
            ))}
          </div>
        </section>

        <AdSlot slot="footer" />
      </main>

      <SiteFooter />
    </div>
  );
}
