import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("common");

  return (
    <footer className="container-page pb-12 pt-20 text-sm text-brand-200/70">
      <div className="card flex flex-col gap-4 p-6">
        <p>{t("disclaimer")}</p>
        <p>© {new Date().getFullYear()} {t("siteName")}</p>
      </div>
    </footer>
  );
}
