import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { countries } from "@/lib/data/countries";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { resolveLocale } from "@/lib/i18n/routing";

export default async function LocaleHome({
  params
}: {
  params?: Promise<{ locale?: string | string[] }>;
}) {
  const locale = resolveLocale((await params)?.locale);
  const tHome = await getTranslations({ locale, namespace: "home" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const defaultCountry = countries[0];

  return (
    <div>
      <SiteHeader locale={locale} country={defaultCountry} countries={countries} />
      <main className="container-page space-y-12 pb-16">
        <section className="card p-8 md:p-10">
          <div className="space-y-6 text-start">
            <h1 className="text-3xl font-semibold text-brand-50 md:text-4xl">
              {tHome("heroTitle")}
            </h1>
            <p className="max-w-2xl text-base text-brand-200/80">{tHome("heroSubtitle")}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/${defaultCountry.code}`}
                className="rounded-full bg-brand-400 px-6 py-3 text-sm font-semibold text-[#10161d]"
              >
                {tHome("ctaPrimary")}
              </Link>
              <Link
                href={`/${locale}/articles`}
                className="rounded-full border border-brand-300/30 px-6 py-3 text-sm text-brand-100"
              >
                {tHome("ctaSecondary")}
              </Link>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl text-brand-50">{tCommon("selectCountry")}</h2>
          <div className="grid gap-3 md:grid-cols-4">
            {countries.map((country) => (
              <Link
                key={country.code}
                href={`/${locale}/${country.code}?country=${country.code}`}
                className="card p-5 text-brand-50 transition hover:-translate-y-1"
              >
                <p className="text-lg">{country.name_ar}</p>
                <p className="mt-2 text-xs text-brand-200/70">{country.currency}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
