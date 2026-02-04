import { useTranslations } from "next-intl";

export function AdSlot({ className, slot }: { className?: string; slot: string }) {
  const t = useTranslations("common");
  return (
    <div
      className={`card border-dashed border-brand-300/30 bg-[var(--panel-elevated)] p-6 text-center text-sm text-brand-200/80 ${className ?? ""}`}
      data-ad-slot={slot}
    >
      <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-300/30 px-3 py-1 text-xs uppercase tracking-[0.2em] text-brand-200/80">
        {t("adsLabel")}
      </span>
      <p>{t("adsPlaceholder")}: {slot}</p>
    </div>
  );
}
