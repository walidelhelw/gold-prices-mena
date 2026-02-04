import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getArticleBySlug, getRelatedArticles } from "@/lib/data/articles";
import { countries } from "@/lib/data/countries";
import { formatDate } from "@/lib/utils/format";
import { resolveLocale } from "@/lib/i18n/routing";
import Link from "next/link";

export default async function ArticlePage({
  params
}: {
  params?: Promise<{ locale?: string | string[]; slug?: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolveLocale(resolvedParams?.locale);
  const slug = resolvedParams?.slug ?? "";
  const t = await getTranslations({ locale, namespace: "articles" });
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = await getRelatedArticles(slug, 3);

  return (
    <div>
      <SiteHeader locale={locale} country={countries[0]} countries={countries} />
      <main className="container-page space-y-12 pb-16">
        <article className="card p-8 text-start">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-200/60" dir="ltr">
            {formatDate(article.publishedAt, locale)}
          </p>
          <h1 className="mt-3 text-3xl text-brand-50">{article.title}</h1>
          <p className="mt-4 text-sm text-brand-200/80">{t("byline")}</p>
          <p className="mt-6 text-base text-brand-100/90">{article.body}</p>
        </article>

        <section>
          <h2 className="mb-4 text-lg text-brand-50">{t("related")}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <Link key={item.slug} href={`/${locale}/articles/${item.slug}`} className="card p-5">
                <h3 className="text-lg text-brand-50">{item.title}</h3>
                <p className="mt-2 text-sm text-brand-200/70">{item.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
