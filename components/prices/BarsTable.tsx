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

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-brand-400/20 px-6 py-4 text-sm text-brand-200/70">
        {t("barTable")}
      </div>
      <div className="grid gap-3 p-6 md:grid-cols-3">
        {rows.map((row) => (
          <div key={row.weight} className="rounded-2xl border border-brand-400/20 p-4 text-sm">
            <p className="text-brand-200/70" dir="ltr">
              {row.weight} {t("common.unitGram")}
            </p>
            <p className="mt-2 text-lg text-brand-50" dir="ltr">
              {formatCurrency(row.price, locale, currency)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
