import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { countries } from "@/lib/data/countries";
import { resolveLocale } from "@/lib/i18n/routing";
import { getArticles } from "@/lib/data/articles";

export default async function ArticlesPage({
  params
}: {
  params?: Promise<{ locale?: string | string[] }>;
}) {
  const locale = resolveLocale((await params)?.locale);
  const t = await getTranslations({ locale, namespace: "articles" });
  const items = await getArticles();

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
            {items.map((article) => (
              <ArticleCard key={article.slug} locale={locale} article={article} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
