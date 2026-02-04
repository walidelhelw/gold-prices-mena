import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/data/pricing";

export function CoinsTable({
  locale,
  currency,
  rows
}: {
  locale: string;
  currency: string;
  rows: { name: string; price: number }[];
}) {
  const t = useTranslations("country");

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-brand-400/20 px-6 py-4 text-sm text-brand-200/70">
        {t("coinTable")}
      </div>
      <div className="divide-y divide-brand-400/10">
        {rows.map((row) => (
          <div key={row.name} className="grid grid-cols-2 gap-4 px-6 py-4 text-sm">
            <div className="text-brand-50">{row.name}</div>
            <div className="text-brand-200/80">
              <bdi dir="ltr">{formatCurrency(row.price, locale, currency)}</bdi>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
