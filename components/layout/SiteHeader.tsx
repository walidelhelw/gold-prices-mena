import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Country } from "@/lib/data/countries";

export function SiteHeader({
  locale,
  country,
  countries
}: {
  locale: string;
  country?: Country;
  countries: Country[];
}) {
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");

  return (
    <header className="container-page pt-8 pb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Link href={`/${locale}/${country?.code ?? "eg"}`} className="flex flex-col gap-2">
          <span className="text-xl font-semibold text-brand-50">{tCommon("siteName")}</span>
          <span className="text-xs text-brand-200/80">{tCommon("tagline")}</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm text-brand-100/90">
          <Link className="rounded-full border border-brand-300/30 px-4 py-2" href={`/${locale}/${country?.code ?? "eg"}`}>
            {tNav("prices")}
          </Link>
          <Link className="rounded-full border border-brand-300/30 px-4 py-2" href={`/${locale}/articles`}>
            {tNav("articles")}
          </Link>
          <Link className="rounded-full border border-brand-300/30 px-4 py-2" href={`/${locale}/calculator`}>
            {tNav("calculator")}
          </Link>
          <Link className="rounded-full border border-brand-300/30 px-4 py-2" href={`/${locale}/about`}>
            {tNav("about")}
          </Link>
          <Link className="rounded-full border border-brand-300/30 px-4 py-2" href={`/${locale}/guides/gold-premium-guide`}>
            {tNav("guides")}
          </Link>
        </nav>
      </div>

      <div className="mt-6">
        <p className="text-xs text-brand-200/70">{tCommon("selectCountry")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {countries.map((item) => (
            <Link
              key={item.code}
              href={`/${locale}/${item.code}?country=${item.code}`}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                item.code === country?.code
                  ? "border-brand-200 bg-brand-400/15 text-brand-50"
                  : "border-brand-300/20 text-brand-200/80 hover:border-brand-200"
              }`}
            >
              {item.name_ar}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
