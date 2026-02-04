"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function ShareActions({
  priceText,
  shareUrl,
  shareText
}: {
  priceText: string;
  shareUrl: string;
  shareText: string;
}) {
  const t = useTranslations("common");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(priceText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setCopied(false);
    }
  };

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-full bg-brand-400 px-4 py-2 text-xs font-semibold text-[#10161d] transition hover:brightness-110"
      >
        {copied ? t("copied") : t("copyPrice")}
      </button>
      <a
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        className="rounded-full border border-brand-300/30 px-4 py-2 text-xs text-brand-100/90 transition hover:border-brand-200"
      >
        {t("shareWhatsapp")}
      </a>
    </div>
  );
}
