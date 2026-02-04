import { useTranslations } from "next-intl";
import { formatCurrency, formatPercent } from "@/lib/data/pricing";

export type HistoryPoint = {
  date: string;
  localPerGram: number;
};

const buildPath = (values: number[], width: number, height: number) => {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
};

export function HistoryChart({
  locale,
  currency,
  history
}: {
  locale: string;
  currency: string;
  history: HistoryPoint[];
}) {
  const t = useTranslations("country");

  if (!history.length) {
    return null;
  }

  const values = history.map((item) => item.localPerGram);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const change = values[values.length - 1] - values[0];
  const changePct = change / values[0];
  const changeTone = change >= 0 ? "text-emerald-300" : "text-rose-300";

  const width = 300;
  const height = 120;
  const linePath = buildPath(values, width, height);
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <section className="card p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-start">
          <h2 className="text-xl text-brand-50">{t("historyTitle")}</h2>
          <p className="mt-2 text-sm text-brand-200/70">{t("historySubtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-brand-200/70">
          <span>
            {t("historyHigh")}: <bdi dir="ltr">{formatCurrency(max, locale, currency)}</bdi>
          </span>
          <span>
            {t("historyLow")}: <bdi dir="ltr">{formatCurrency(min, locale, currency)}</bdi>
          </span>
          <span className={changeTone}>
            {t("historyChange")}: <bdi dir="ltr">{formatCurrency(change, locale, currency)}</bdi> ({formatPercent(changePct, locale)})
          </span>
        </div>
      </div>
      <div className="mt-6">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full">
          <defs>
            <linearGradient id="historyGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(201, 166, 70, 0.35)" />
              <stop offset="100%" stopColor="rgba(201, 166, 70, 0.02)" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#historyGlow)" stroke="none" />
          <path d={linePath} fill="none" stroke="#c9a646" strokeWidth="2" />
        </svg>
      </div>
    </section>
  );
}
