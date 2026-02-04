import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/data/pricing";

export function BarsTable({
  locale,
  currency,
  rows
}: {
  locale: string;
  currency: string;
  rows: { weight: number; price: number }[];
}) {
  const t = useTranslations("country");
  const tCommon = useTranslations("common");

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-brand-400/20 px-6 py-4 text-sm text-brand-200/70">
        {t("barTable")}
      </div>
      <div className="px-6 py-3 text-xs text-brand-200/70">
        <div className="grid grid-cols-2 gap-4 text-start">
          <span>{t("weightLabel")}</span>
          <span>{t("priceLabel")}</span>
        </div>
      </div>
      <div className="divide-y divide-brand-400/10">
        {rows.map((row) => (
          <div key={row.weight} className="grid grid-cols-2 gap-4 px-6 py-4 text-sm text-start">
            <div className="text-brand-50">
              <bdi dir="ltr">{row.weight}</bdi>
              <span className="ms-2 text-brand-200/70">{tCommon("unitGram")}</span>
            </div>
            <div className="text-brand-100">
              <bdi dir="ltr">{formatCurrency(row.price, locale, currency)}</bdi>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
