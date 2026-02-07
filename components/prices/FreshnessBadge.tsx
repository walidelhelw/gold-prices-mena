import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/utils/format";
import type { FreshnessStatus } from "@/lib/types/market";

const toneByStatus: Record<FreshnessStatus["status"], string> = {
  fresh: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
  aging: "text-amber-300 border-amber-400/40 bg-amber-400/10",
  stale: "text-rose-300 border-rose-400/40 bg-rose-400/10"
};

export function FreshnessBadge({ locale, freshness }: { locale: string; freshness: FreshnessStatus }) {
  const t = useTranslations("dealer");

  return (
    <div className="rounded-2xl border border-brand-300/20 bg-brand-900/50 p-4 text-start">
      <p className="text-xs text-brand-200/70">{t("freshnessTitle")}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2.5 py-1 text-xs ${toneByStatus[freshness.status]}`}>
          {t(`freshnessStatus.${freshness.status}`)}
        </span>
        <span className="text-xs text-brand-200/70">
          {t("sourceCount", { count: freshness.sourceCount })}
        </span>
      </div>
      <p className="mt-3 text-xs text-brand-200/70" dir="ltr">
        {formatDate(freshness.observedAt, locale)}
      </p>
    </div>
  );
}
