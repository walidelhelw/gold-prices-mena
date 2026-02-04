import { useTranslations } from "next-intl";
import { formatCurrency, formatPercent } from "@/lib/data/pricing";
import { formatDate } from "@/lib/utils/format";

export function PriceStickyBar({
  locale,
  countryName,
  localPerGram,
  currency,
  amFixUsd,
  pmFixUsd,
  updatedAt
}: {
  locale: string;
  countryName: string;
  localPerGram: number;
  currency: string;
  amFixUsd: number;
  pmFixUsd: number;
  updatedAt: string;
}) {
  const tCommon = useTranslations("common");
  const tCountry = useTranslations("country");
  const change = amFixUsd ? (pmFixUsd - amFixUsd) / amFixUsd : 0;
  const changeSign = change >= 0 ? "+" : "-";
  const delta = Math.abs(change);
  const isNeutral = delta < 0.0005;
  const changeTone = isNeutral
    ? "text-brand-200/80"
    : change >= 0
      ? "text-emerald-300"
      : "text-rose-300";
  const barTone = isNeutral
    ? "border-brand-300/20 bg-brand-900/80"
    : change >= 0
      ? "border-emerald-400/30 bg-emerald-950/40"
      : "border-rose-400/30 bg-rose-950/40";

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[min(1120px,90vw)] -translate-x-1/2">
      <div className={`card border px-4 py-3 backdrop-blur ${barTone}`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-start">
            <p className="text-[11px] text-brand-200/70">{tCountry("priceBarTitle", { country: countryName })}</p>
            <p className="mt-1 text-xl font-semibold text-brand-50">
              <bdi dir="ltr">{formatCurrency(localPerGram, locale, currency)}</bdi>
              <span className="ms-2 text-xs text-brand-200/70">/{tCommon("unitGram")}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-[11px] text-brand-200/70">
            <span>
              {tCommon("updatedAt")}: <bdi dir="ltr">{formatDate(updatedAt, locale)}</bdi>
            </span>
            <span className={`rounded-full px-2 py-0.5 ${changeTone} ${isNeutral ? "bg-brand-900/40" : "bg-black/20"}`}>
              {tCommon("dailyChange")}{" "}
              <bdi dir="ltr">
                {changeSign}
                {formatPercent(delta, locale)}
              </bdi>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
