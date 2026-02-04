import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { articles } from "@/lib/data/articles";
import { countries } from "@/lib/data/countries";
import type { AppLocale } from "@/lib/i18n/routing";

export default async function ArticlesPage({
  params
}: {
  params: { locale: AppLocale };
}) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "articles" });

  return (
    <div>
      <SiteHeader locale={locale} country={countries[0]} countries={countries} />
      <main className="container-page space-y-12 pb-16">
        <section className="card p-8">
          <h1 className="text-3xl text-brand-50">{t("title")}</h1>
          <p className="mt-3 text-sm text-brand-200/80">{t("subtitle")}</p>
        </section>

        <section>
          <h2 className="mb-4 text-lg text-brand-50">{t("latest")}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.slug} locale={locale} article={article} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
