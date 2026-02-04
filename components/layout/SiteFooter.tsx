import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("common");

  return (
    <footer className="container-page pb-12 pt-16 text-xs text-brand-200/70">
      <div className="card flex flex-col gap-4 p-6">
        <p>{t("disclaimer")}</p>
        <div className="flex flex-col gap-2 text-[11px] text-brand-200/60 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} {t("siteName")}</span>
          <span>{t("tagline")}</span>
        </div>
      </div>
    </footer>
  );
}
