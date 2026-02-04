"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency, formatNumber } from "@/lib/data/pricing";

const karatOptions = [24, 22, 21, 18, 14, 12];

export function GoldCalculator({
  locale,
  currency,
  basePerGram
}: {
  locale: string;
  currency: string;
  basePerGram: number;
}) {
  const t = useTranslations("calculator");
  const tCommon = useTranslations("common");

  const [weight, setWeight] = useState(10);
  const [karat, setKarat] = useState(21);
  const [makingPerGram, setMakingPerGram] = useState(0);
  const [makingFixed, setMakingFixed] = useState(0);

  const { metalValue, totalValue } = useMemo(() => {
    const metal = basePerGram * (karat / 24) * weight;
    const total = metal + makingPerGram * weight + makingFixed;
    return {
      metalValue: metal,
      totalValue: total
    };
  }, [basePerGram, karat, weight, makingPerGram, makingFixed]);

  return (
    <section className="card p-8 text-start">
      <h1 className="text-3xl text-brand-50">{t("title")}</h1>
      <p className="mt-3 text-sm text-brand-200/80">{t("subtitle")}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-brand-400/20 p-4">
          <p className="text-xs text-brand-200/70">{t("basePrice")}</p>
          <p className="mt-3 text-lg text-brand-50">
            <bdi dir="ltr">{formatCurrency(basePerGram, locale, currency)}</bdi>
            <span className="ms-2 text-xs text-brand-200/70">/{tCommon("unitGram")}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-brand-400/20 p-4">
          <p className="text-xs text-brand-200/70">{t("weightInput")}</p>
          <input
            type="number"
            min={0}
            step={0.1}
            value={weight}
            onChange={(event) => setWeight(Number(event.target.value) || 0)}
            className="mt-3 w-full rounded-xl border border-brand-400/30 bg-transparent px-3 py-2 text-start text-sm text-brand-50"
            dir="ltr"
          />
          <p className="mt-2 text-xs text-brand-200/60">{tCommon("unitGram")}</p>
        </div>
        <div className="rounded-2xl border border-brand-400/20 p-4">
          <p className="text-xs text-brand-200/70">{t("karatInput")}</p>
          <select
            value={karat}
            onChange={(event) => setKarat(Number(event.target.value))}
            className="mt-3 w-full rounded-xl border border-brand-400/30 bg-transparent px-3 py-2 text-start text-sm text-brand-50"
            dir="ltr"
          >
            {karatOptions.map((option) => (
              <option key={option} value={option} className="text-brand-900">
                {option}{tCommon("karatSuffix")}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-2xl border border-brand-400/20 p-4">
          <p className="text-xs text-brand-200/70">{t("makingPerGram")}</p>
          <input
            type="number"
            min={0}
            step={0.1}
            value={makingPerGram}
            onChange={(event) => setMakingPerGram(Number(event.target.value) || 0)}
            className="mt-3 w-full rounded-xl border border-brand-400/30 bg-transparent px-3 py-2 text-start text-sm text-brand-50"
            dir="ltr"
          />
          <p className="mt-2 text-xs text-brand-200/60">{tCommon("unitGram")}</p>
        </div>
        <div className="rounded-2xl border border-brand-400/20 p-4">
          <p className="text-xs text-brand-200/70">{t("makingFixed")}</p>
          <input
            type="number"
            min={0}
            step={0.1}
            value={makingFixed}
            onChange={(event) => setMakingFixed(Number(event.target.value) || 0)}
            className="mt-3 w-full rounded-xl border border-brand-400/30 bg-transparent px-3 py-2 text-start text-sm text-brand-50"
            dir="ltr"
          />
          <p className="mt-2 text-xs text-brand-200/60">{currency}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-brand-400/20 p-4">
          <p className="text-xs text-brand-200/70">{t("metalValue")}</p>
          <p className="mt-3 text-xl font-semibold text-brand-50">
            <bdi dir="ltr">{formatCurrency(metalValue, locale, currency)}</bdi>
          </p>
          <p className="mt-2 text-xs text-brand-200/60">
            {formatNumber(weight, locale)} {tCommon("unitGram")} · {karat}{tCommon("karatSuffix")}
          </p>
        </div>
        <div className="rounded-2xl border border-brand-400/20 bg-brand-900/40 p-4">
          <p className="text-xs text-brand-200/70">{t("total")}</p>
          <p className="mt-3 text-2xl font-semibold text-brand-50">
            <bdi dir="ltr">{formatCurrency(totalValue, locale, currency)}</bdi>
          </p>
          <p className="mt-2 text-xs text-brand-200/60">{t("note")}</p>
        </div>
      </div>
    </section>
  );
}
