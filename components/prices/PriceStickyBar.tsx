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
  const change = (pmFixUsd - amFixUsd) / amFixUsd;
  const changeSign = change >= 0 ? "+" : "-";
  const changeTone = change >= 0 ? "text-emerald-300" : "text-rose-300";

  return (
    <div className="sticky top-4 z-30">
      <div className="card border border-brand-300/20 bg-brand-900/80 px-4 py-3 backdrop-blur">
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
            <span className={changeTone}>
              {tCommon("dailyChange")}{" "}
              <bdi dir="ltr">
                {changeSign}
                {formatPercent(Math.abs(change), locale)}
              </bdi>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
