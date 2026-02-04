import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/routing";
import { citiesByCountry, countries } from "@/lib/data/countries";
import { getFallbackArticles } from "@/lib/data/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const now = new Date().toISOString();
  const entries: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    entries.push({ url: `${baseUrl}/${locale}`, lastModified: now });
    entries.push({ url: `${baseUrl}/${locale}/articles`, lastModified: now });
    entries.push({ url: `${baseUrl}/${locale}/calculator`, lastModified: now });
    entries.push({ url: `${baseUrl}/${locale}/about`, lastModified: now });

    countries.forEach((country) => {
      entries.push({ url: `${baseUrl}/${locale}/${country.code}`, lastModified: now });
      const cities = citiesByCountry[country.code] ?? [];
      cities.forEach((city) => {
        entries.push({ url: `${baseUrl}/${locale}/${country.code}/${city.slug}`, lastModified: now });
      });
    });

    getFallbackArticles().forEach((article) => {
      entries.push({ url: `${baseUrl}/${locale}/articles/${article.slug}`, lastModified: article.publishedAt });
    });
  });

  return entries;
}
