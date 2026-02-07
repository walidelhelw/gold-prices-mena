import Link from "next/link";
import { useTranslations } from "next-intl";

type ContextLink = {
  href: string;
  label: string;
  description: string;
};

export function ContextLinks({ links }: { links: ContextLink[] }) {
  const t = useTranslations("dealer");

  return (
    <section className="card p-6 text-start">
      <h2 className="text-xl text-brand-50">{t("contextTitle")}</h2>
      <p className="mt-2 text-sm text-brand-200/80">{t("contextSubtitle")}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-brand-300/20 bg-brand-900/40 p-4 transition hover:border-brand-200"
          >
            <p className="text-brand-50">{link.label}</p>
            <p className="mt-2 text-xs text-brand-200/70">{link.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
