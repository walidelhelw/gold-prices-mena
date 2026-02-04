import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { countries, getCountry } from "@/lib/data/countries";
import { resolveLocale } from "@/lib/i18n/routing";
import { getDefaultCountry, normalizeCountry } from "@/lib/utils/geo";
import { getPriceSnapshot } from "@/lib/data/pricing-server";
import { GoldCalculator } from "@/components/calculator/GoldCalculator";

export default async function CalculatorPage({
  params
}: {
  params?: Promise<{ locale?: string | string[] }>;
}) {
  const locale = resolveLocale((await params)?.locale);
  const t = await getTranslations({ locale, namespace: "calculator" });

  const cookieStore = await cookies();
  const cookieCountry = normalizeCountry(cookieStore.get("country")?.value ?? null);
  const countryCode = cookieCountry ?? getDefaultCountry();
  const country = getCountry(countryCode) ?? countries[0];
  const snapshot = await getPriceSnapshot(country.code, null);

  return (
    <div>
      <SiteHeader locale={locale} country={country} countries={countries} />
      <main className="container-page space-y-8 pb-16">
        <GoldCalculator
          locale={locale}
          currency={snapshot.currency}
          basePerGram={snapshot.localPerGram}
        />
        <section className="card p-6 text-start">
          <h2 className="text-xl text-brand-50">{t("noteTitle")}</h2>
          <p className="mt-3 text-sm text-brand-200/80">{t("noteBody")}</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
