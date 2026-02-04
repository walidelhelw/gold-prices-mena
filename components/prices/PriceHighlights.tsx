import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/data/pricing";

export function PriceHighlights({
  locale,
  currency,
  spotUsd,
  amFixUsd,
  pmFixUsd,
  localPerGram
}: {
  locale: string;
  currency: string;
  spotUsd: number;
  amFixUsd: number;
  pmFixUsd: number;
  localPerGram: number;
}) {
  const t = useTranslations("country");
  const tCommon = useTranslations("common");

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="card p-5 text-start">
        <p className="text-[11px] uppercase tracking-[0.3em] text-brand-200/60">{t("spotTitle")}</p>
        <p className="mt-3 text-2xl font-semibold text-brand-50">
          <bdi dir="ltr">{formatCurrency(spotUsd, locale, "USD")}</bdi>
        </p>
      </div>
      <div className="card p-5 text-start">
        <p className="text-[11px] uppercase tracking-[0.3em] text-brand-200/60">{t("fixTitle")}</p>
        <div className="mt-3 space-y-2 text-base text-brand-50">
          <p className="flex items-center justify-between">
            <span className="text-brand-200/80">{tCommon("am")}</span>
            <bdi dir="ltr" className="text-brand-50">{formatCurrency(amFixUsd, locale, "USD")}</bdi>
          </p>
          <p className="flex items-center justify-between">
            <span className="text-brand-200/80">{tCommon("pm")}</span>
            <bdi dir="ltr" className="text-brand-50">{formatCurrency(pmFixUsd, locale, "USD")}</bdi>
          </p>
        </div>
      </div>
      <div className="card p-5 text-start">
        <p className="text-[11px] uppercase tracking-[0.3em] text-brand-200/60">{t("localTitle")}</p>
        <p className="mt-3 text-2xl font-semibold text-brand-50">
          <bdi dir="ltr">{formatCurrency(localPerGram, locale, currency)}</bdi>
          <span className="ms-2 text-sm text-brand-200/70">/{tCommon("unitGram")}</span>
        </p>
      </div>
    </div>
  );
}
