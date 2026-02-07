import { useTranslations } from "next-intl";
import type { MarketSignal } from "@/lib/types/market";
import { formatPercent } from "@/lib/data/pricing";

const postureTone: Record<MarketSignal["posture"], string> = {
  buy_zone: "text-emerald-300",
  watch: "text-amber-300",
  wait: "text-rose-300"
};

export function MarketPosturePanel({ locale, signal }: { locale: string; signal: MarketSignal }) {
  const t = useTranslations("dealer");

  return (
    <section className="card p-6 text-start">
      <p className="text-xs text-brand-200/70">{t("marketPosture")}</p>
      <h2 className={`mt-2 text-2xl font-semibold ${postureTone[signal.posture]}`}>{t(`posture.${signal.posture}`)}</h2>
      <p className="mt-2 text-xs text-brand-200/70" dir="ltr">
        {t("confidence")} {formatPercent(signal.confidence, locale)}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-brand-300/20 bg-brand-900/50 p-3">
          <p className="text-[11px] text-brand-200/70">{t("spreadMetric")}</p>
          <p className="mt-1 text-brand-50" dir="ltr">{formatPercent(signal.spreadPct / 100, locale)}</p>
        </div>
        <div className="rounded-xl border border-brand-300/20 bg-brand-900/50 p-3">
          <p className="text-[11px] text-brand-200/70">{t("trendMetric")}</p>
          <p className="mt-1 text-brand-50" dir="ltr">
            {signal.dailyTrendPct >= 0 ? "+" : ""}
            {formatPercent(signal.dailyTrendPct / 100, locale)}
          </p>
        </div>
        <div className="rounded-xl border border-brand-300/20 bg-brand-900/50 p-3">
          <p className="text-[11px] text-brand-200/70">{t("premiumMetric")}</p>
          <p className="mt-1 text-brand-50" dir="ltr">
            {signal.premiumPct >= 0 ? "+" : ""}
            {formatPercent(signal.premiumPct, locale)}
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2 text-sm text-brand-200/80">
        {signal.rationale.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </section>
  );
}
