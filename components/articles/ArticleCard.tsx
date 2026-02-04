import Link from "next/link";
import { formatDate } from "@/lib/utils/format";
import type { Article } from "@/lib/data/articles";
import { useTranslations } from "next-intl";

export function ArticleCard({
  locale,
  article
}: {
  locale: string;
  article: Article;
}) {
  const t = useTranslations("articles");

  return (
    <Link href={`/${locale}/articles/${article.slug}`} className="card block p-6 transition hover:-translate-y-1">
      <p className="text-xs uppercase tracking-[0.35em] text-brand-200/60" dir="ltr">
        {formatDate(article.publishedAt, locale)}
      </p>
      <h3 className="mt-3 text-xl text-brand-50">{article.title}</h3>
      <p className="mt-3 text-sm text-brand-200/70">{article.excerpt}</p>
      <p className="mt-4 text-xs text-brand-200/50">{t("byline")}</p>
    </Link>
  );
}
