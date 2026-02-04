import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/lib/i18n/routing";

export default async function NotFound({
  params
}: {
  params?: Promise<{ locale?: string | string[] }>;
}) {
  const locale = resolveLocale((await params)?.locale);
  const tCommon = await getTranslations({ locale, namespace: "common" });

  return (
    <div className="container-page py-20 text-center">
      <h1 className="text-3xl text-brand-50">404</h1>
      <p className="mt-2 text-sm text-brand-200/70">{tCommon("notFoundTitle")}</p>
      <p className="mt-4 text-sm text-brand-200/80">{tCommon("notFoundBody")}</p>
      <Link href={`/${locale}`} className="mt-6 inline-flex rounded-full border border-brand-400/30 px-6 py-3 text-sm">
        {tCommon("backHome")}
      </Link>
    </div>
  );
}
