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
    <header className="container-page py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href={`/${locale}/${country?.code ?? "eg"}`} className="inline-flex items-center gap-3">
            <span className="rounded-full bg-brand-400/20 px-4 py-2 text-sm text-brand-100">
              {tCommon("siteName")}
            </span>
            <span className="text-xs text-brand-200/80">{tCommon("tagline")}</span>
          </Link>
        </div>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-brand-100/90">
          <Link className="rounded-full border border-brand-400/30 px-4 py-2" href={`/${locale}/${country?.code ?? "eg"}`}>
            {tNav("prices")}
          </Link>
          <Link className="rounded-full border border-brand-400/30 px-4 py-2" href={`/${locale}/articles`}>
            {tNav("articles")}
          </Link>
          <Link className="rounded-full border border-brand-400/30 px-4 py-2" href={`/${locale}/calculator`}>
            {tNav("calculator")}
          </Link>
          <Link className="rounded-full border border-brand-400/30 px-4 py-2" href={`/${locale}/about`}>
            {tNav("about")}
          </Link>
        </nav>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {countries.map((item) => (
          <Link
            key={item.code}
            href={`/${locale}/${item.code}?country=${item.code}`}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              item.code === country?.code
                ? "border-brand-200 bg-brand-400/30 text-brand-100"
                : "border-brand-400/20 text-brand-200/80 hover:border-brand-200"
            }`}
          >
            {locale === "ar" ? item.name_ar : item.name_en}
          </Link>
        ))}
      </div>
    </header>
  );
}
