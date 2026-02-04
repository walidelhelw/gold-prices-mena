import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/data/pricing";
import type { KaratPrice } from "@/lib/data/pricing";

export function KaratTable({
  locale,
  currency,
  rows
}: {
  locale: string;
  currency: string;
  rows: KaratPrice[];
}) {
  const t = useTranslations("country");
  const tCommon = useTranslations("common");

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-brand-400/20 px-6 py-4 text-sm text-brand-200/70">
        {t("karatTable")}
      </div>
      <div className="px-6 py-3 text-xs text-brand-200/70">
        <div className="grid grid-cols-3 gap-4 text-start">
          <span>{t("karatLabel")}</span>
          <span>{t("priceLabel")}</span>
          <span>{t("buySellLabel")}</span>
        </div>
      </div>
      <div className="divide-y divide-brand-400/10">
        {rows.map((row) => (
          <div key={row.karat} className="grid grid-cols-3 gap-4 px-6 py-4 text-sm text-start">
            <div className="text-brand-50">
              {row.karat}
              {tCommon("karatSuffix")}
            </div>
            <div className="text-brand-100">
              <bdi dir="ltr">{formatCurrency(row.price, locale, currency)}</bdi>
            </div>
            <div className="text-brand-200/80">
              {tCommon("buy")}
              <span className="ms-2">
                <bdi dir="ltr">{formatCurrency(row.buy, locale, currency)}</bdi>
              </span>
              <span className="mx-2">·</span>
              {tCommon("sell")}
              <span className="ms-2">
                <bdi dir="ltr">{formatCurrency(row.sell, locale, currency)}</bdi>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
