import { useTranslations } from "next-intl";
import { formatNumber, formatPercent } from "@/lib/data/pricing";

export function MarketSignals({
  locale,
  currency,
  fxRate,
  premiumPct,
  amFixUsd,
  pmFixUsd
}: {
  locale: string;
  currency: string;
  fxRate: number;
  premiumPct: number;
  amFixUsd: number;
  pmFixUsd: number;
}) {
  const t = useTranslations("country");

  const change = amFixUsd ? (pmFixUsd - amFixUsd) / amFixUsd : 0;
  const absChange = Math.abs(change);
  const trendLabel = change > 0.0005 ? t("trendUp") : change < -0.0005 ? t("trendDown") : t("trendFlat");
  const trendTone =
    change > 0.0005 ? "text-emerald-300" : change < -0.0005 ? "text-rose-300" : "text-brand-200/80";

  const premiumTone =
    premiumPct > 0.001 ? "text-emerald-300" : premiumPct < -0.001 ? "text-rose-300" : "text-brand-200/80";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="card p-5 text-start">
        <p className="text-xs text-brand-200/70">{t("fxTitle")}</p>
        <p className="mt-3 text-xl font-semibold text-brand-50">
          <bdi dir="ltr">1 USD = {formatNumber(fxRate, locale)}</bdi>
          <span className="ms-2 text-xs text-brand-200/70">{currency}</span>
        </p>
        <p className="mt-2 text-[11px] text-brand-200/60">{t("fxSubtitle")}</p>
      </div>
      <div className="card p-5 text-start">
        <p className="text-xs text-brand-200/70">{t("premiumTitle")}</p>
        <p className={`mt-3 text-xl font-semibold ${premiumTone}`}>
          <bdi dir="ltr">{premiumPct >= 0 ? "+" : "-"}{formatPercent(Math.abs(premiumPct), locale)}</bdi>
        </p>
        <p className="mt-2 text-[11px] text-brand-200/60">{t("premiumSubtitle")}</p>
      </div>
      <div className="card p-5 text-start">
        <p className="text-xs text-brand-200/70">{t("dailyTrendTitle")}</p>
        <p className={`mt-3 text-xl font-semibold ${trendTone}`}>
          <bdi dir="ltr">{change >= 0 ? "+" : "-"}{formatPercent(absChange, locale)}</bdi>
        </p>
        <p className="mt-2 text-[11px] text-brand-200/60">{trendLabel}</p>
      </div>
    </div>
  );
}
