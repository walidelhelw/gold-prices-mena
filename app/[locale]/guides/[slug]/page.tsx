import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/lib/i18n/routing";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { countries } from "@/lib/data/countries";
import { getGuideBySlug, getPublishedGuides } from "@/lib/data/content-pipeline";
import { formatDate } from "@/lib/utils/format";

export const revalidate = 300;

export default async function GuidePage({
  params
}: {
  params?: Promise<{ locale?: string | string[]; slug?: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolveLocale(resolvedParams?.locale);
  const slug = resolvedParams?.slug ?? "";
  const [t, guide, guides] = await Promise.all([
    getTranslations({ locale, namespace: "dealer" }),
    getGuideBySlug(slug),
    getPublishedGuides(4)
  ]);

  if (!guide) {
    notFound();
  }

  const related = guides.filter((item) => item.slug !== guide.slug).slice(0, 3);

  return (
    <div>
      <SiteHeader locale={locale} country={countries[0]} countries={countries} />
      <main className="container-page space-y-8 pb-24 md:pb-16">
        <article className="card p-8 text-start">
          <p className="text-[11px] uppercase tracking-[0.3em] text-brand-200/60" dir="ltr">
            {formatDate(guide.publishedAt, locale)}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-brand-50">{guide.title}</h1>
          <p className="mt-4 text-sm text-brand-200/80">{guide.excerpt}</p>
          <p className="mt-6 text-base text-brand-100/90">{guide.body}</p>
        </article>

        <section className="card p-6 text-start">
          <h2 className="text-xl text-brand-50">{t("relatedGuides")}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {related.map((item) => (
              <Link key={item.slug} href={`/${locale}/guides/${item.slug}`} className="rounded-2xl border border-brand-300/20 p-4">
                <p className="text-brand-50">{item.title}</p>
                <p className="mt-2 text-xs text-brand-200/70">{item.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
