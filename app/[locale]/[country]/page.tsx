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
import { AdSlot } from "@/components/ads/AdSlot";
import { formatDate } from "@/lib/utils/format";
import { articles } from "@/lib/data/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";
import type { AppLocale } from "@/lib/i18n/routing";
import { formatCurrency } from "@/lib/data/pricing";
import Link from "next/link";

export const revalidate = 60;

export async function generateMetadata({
  params
}: {
  params: { locale: AppLocale; country: string };
}) {
  const { locale, country } = params;
  const t = await getTranslations({ locale, namespace: "country" });
  const countryData = getCountry(country);
  if (!countryData) return {};
  const countryName = locale === "ar" ? countryData.name_ar : countryData.name_en;
  return {
    title: t("title", { country: countryName }),
    description: t("metaDescription", { country: countryName })
  };
}

export default async function CountryPage({
  params
}: {
  params: { locale: AppLocale; country: string };
}) {
  const { locale, country } = params;
  const countryData = getCountry(country);
  if (!countryData) {
    notFound();
  }

  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tCountry = await getTranslations({ locale, namespace: "country" });
  const tArticles = await getTranslations({ locale, namespace: "articles" });
  const snapshot = buildSnapshot(countryData.code);
  const relatedArticles = articles.filter((article) => article.countryCodes.includes(countryData.code)).slice(0, 3);
  const countryName = locale === "ar" ? countryData.name_ar : countryData.name_en;
  const cities = citiesByCountry[countryData.code] ?? [];

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
              {tCountry("title", { country: countryName })}
            </h1>
            <p className="text-sm text-brand-200/80">
              {tCommon("updatedAt")} · {tCommon("priceNow")}{" "}
              <bdi dir="ltr">{formatCurrency(snapshot.localPerGram, locale, snapshot.currency)}</bdi> /{tCommon("unitGram")}
            </p>
            {cities.length > 0 ? (
              <div className="flex flex-wrap gap-2 text-xs text-brand-200/70">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    className="rounded-full border border-brand-400/20 px-3 py-1 hover:border-brand-200"
                    href={`/${locale}/${countryData.code}/${city.slug}`}
                  >
                    {locale === "ar" ? city.name_ar : city.name_en}
                  </Link>
                ))}
              </div>
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
