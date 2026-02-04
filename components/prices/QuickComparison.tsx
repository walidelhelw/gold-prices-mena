import { useTranslations } from "next-intl";
import type { KaratPrice } from "@/lib/data/pricing";
import { formatCurrency, formatPercent } from "@/lib/data/pricing";

export function QuickComparison({
  locale,
  currency,
  rows,
  defaultKarat
}: {
  locale: string;
  currency: string;
  rows: KaratPrice[];
  defaultKarat: number;
}) {
  const t = useTranslations("country");

  const row24 = rows.find((row) => row.karat === 24);
  const row21 = rows.find((row) => row.karat === 21);
  const rowDefault = rows.find((row) => row.karat === defaultKarat) ?? row21 ?? row24;

  if (!row24 || !row21 || !rowDefault) {
    return null;
  }

  const karatDelta = row24.price - row21.price;
  const spread = rowDefault.sell - rowDefault.buy;
  const spreadPct = spread / rowDefault.buy;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card p-5 text-start">
        <p className="text-xs text-brand-200/70">{t("karatDeltaTitle")}</p>
        <p className="mt-3 text-xl font-semibold text-brand-50">
          <bdi dir="ltr">{formatCurrency(karatDelta, locale, currency)}</bdi>
        </p>
        <p className="mt-2 text-[11px] text-brand-200/60">{t("karatDeltaSubtitle")}</p>
      </div>
      <div className="card p-5 text-start">
        <p className="text-xs text-brand-200/70">{t("spreadTitle")}</p>
        <div className="mt-3 flex items-center justify-between">
          <bdi dir="ltr" className="text-xl font-semibold text-brand-50">
            {formatCurrency(spread, locale, currency)}
          </bdi>
          <span className="text-xs text-brand-200/70">
            <bdi dir="ltr">{formatPercent(spreadPct, locale)}</bdi>
          </span>
        </div>
        <p className="mt-2 text-[11px] text-brand-200/60">{t("spreadSubtitle")}</p>
      </div>
    </div>
  );
}
