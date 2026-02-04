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
      <div className="card p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-200/60">{t("spotTitle")}</p>
        <p className="mt-3 text-2xl font-semibold text-brand-50" dir="ltr">
          {formatCurrency(spotUsd, locale, "USD")}
        </p>
      </div>
      <div className="card p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-200/60">{t("fixTitle")}</p>
        <div className="mt-3 space-y-2 text-lg text-brand-50" dir="ltr">
          <p>
            {tCommon("am")}: {formatCurrency(amFixUsd, locale, "USD")}
          </p>
          <p>
            {tCommon("pm")}: {formatCurrency(pmFixUsd, locale, "USD")}
          </p>
        </div>
      </div>
      <div className="card p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-200/60">{t("localTitle")}</p>
        <p className="mt-3 text-2xl font-semibold text-brand-50" dir="ltr">
          {formatCurrency(localPerGram, locale, currency)}
          <span className="ms-2 text-sm text-brand-200/70">/{tCommon("unitGram")}</span>
        </p>
      </div>
    </div>
  );
}
