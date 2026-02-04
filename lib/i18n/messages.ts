import { notFound } from "next/navigation";
import type { AppLocale } from "./routing";

export async function getMessages(locale: AppLocale) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
}
