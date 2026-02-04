import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { countries } from "@/lib/data/countries";
import type { AppLocale } from "@/lib/i18n/routing";

export default async function CalculatorPage({
  params
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "calculator" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  return (
    <div>
      <SiteHeader locale={locale} country={countries[0]} countries={countries} />
      <main className="container-page space-y-8 pb-16">
        <section className="card p-8">
          <h1 className="text-3xl text-brand-50">{t("title")}</h1>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-brand-400/20 p-4">
              <p className="text-xs text-brand-200/70">{t("weight")}</p>
              <p className="mt-3 text-lg text-brand-50" dir="ltr">
                10.0 {tCommon("unitGram")}
              </p>
            </div>
            <div className="rounded-2xl border border-brand-400/20 p-4">
              <p className="text-xs text-brand-200/70">{t("karat")}</p>
              <p className="mt-3 text-lg text-brand-50" dir="ltr">
                21{tCommon("karatSuffix")}
              </p>
            </div>
            <div className="rounded-2xl border border-brand-400/20 p-4">
              <p className="text-xs text-brand-200/70">{t("result")}</p>
              <p className="mt-3 text-lg text-brand-50" dir="ltr">
                1,245.00
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
