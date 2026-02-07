import { useTranslations } from "next-intl";
import type { Dealer } from "@/lib/types/market";
import { formatCurrency, formatPercent } from "@/lib/data/pricing";

type DealerWithQuote = Dealer & {
  latestQuote: {
    buyPerGram: number;
    sellPerGram: number;
    spreadPct: number;
    observedAt: string;
  } | null;
};

export function DealerLeaderboard({
  locale,
  currency,
  rows
}: {
  locale: string;
  currency: string;
  rows: DealerWithQuote[];
}) {
  const t = useTranslations("dealer");

  return (
    <section className="card overflow-hidden text-start">
      <div className="border-b border-brand-300/20 px-6 py-4">
        <h2 className="text-xl text-brand-50">{t("leaderboardTitle")}</h2>
        <p className="mt-1 text-xs text-brand-200/70">{t("leaderboardSubtitle")}</p>
      </div>

      <div className="divide-y divide-brand-300/10">
        {rows.map((dealer, index) => (
          <div key={dealer.id} id={dealer.slug} className="grid gap-3 px-6 py-4 md:grid-cols-[50px_1fr_1fr_1fr_90px] md:items-center">
            <div className="text-sm text-brand-200/70" dir="ltr">#{index + 1}</div>
            <div>
              <p className="text-base text-brand-50">{dealer.name}</p>
              <p className="text-xs text-brand-200/60" dir="ltr">
                {dealer.verificationState} · {formatPercent(dealer.reliabilityScore, locale)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-brand-200/70">{t("buyPrice")}</p>
              <p className="text-brand-50" dir="ltr">
                {dealer.latestQuote ? formatCurrency(dealer.latestQuote.buyPerGram, locale, currency) : "-"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-brand-200/70">{t("sellPrice")}</p>
              <p className="text-brand-50" dir="ltr">
                {dealer.latestQuote ? formatCurrency(dealer.latestQuote.sellPerGram, locale, currency) : "-"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-brand-200/70">{t("spread")}</p>
              <p className="text-brand-50" dir="ltr">
                {dealer.latestQuote ? formatPercent(dealer.latestQuote.spreadPct / 100, locale) : "-"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
