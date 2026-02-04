import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { countries } from "@/lib/data/countries";
import { resolveLocale } from "@/lib/i18n/routing";

export default async function AboutPage({
  params
}: {
  params?: Promise<{ locale?: string | string[] }>;
}) {
  const locale = resolveLocale((await params)?.locale);
  const t = await getTranslations({ locale, namespace: "about" });

  return (
    <div>
      <SiteHeader locale={locale} country={countries[0]} countries={countries} />
      <main className="container-page space-y-8 pb-16">
        <section className="card p-8">
          <h1 className="text-3xl text-brand-50">{t("title")}</h1>
          <p className="mt-4 text-sm text-brand-200/80">{t("body")}</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
