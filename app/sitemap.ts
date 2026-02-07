import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/routing";
import { citiesByCountry, countries } from "@/lib/data/countries";
import { getFallbackArticles } from "@/lib/data/articles";
import { getPublishedGuides } from "@/lib/data/content-pipeline";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const now = new Date().toISOString();
  const entries: MetadataRoute.Sitemap = [];
  const guides = await getPublishedGuides(120);

  locales.forEach((locale) => {
    entries.push({ url: `${baseUrl}/${locale}`, lastModified: now, priority: 1 });
    entries.push({ url: `${baseUrl}/${locale}/articles`, lastModified: now, priority: 0.8 });
    entries.push({ url: `${baseUrl}/${locale}/calculator`, lastModified: now, priority: 0.7 });
    entries.push({ url: `${baseUrl}/${locale}/about`, lastModified: now, priority: 0.5 });

    countries.forEach((country) => {
      entries.push({ url: `${baseUrl}/${locale}/${country.code}`, lastModified: now, priority: 0.9 });
      const cities = citiesByCountry[country.code] ?? [];
      cities.forEach((city) => {
        entries.push({ url: `${baseUrl}/${locale}/${country.code}/${city.slug}`, lastModified: now, priority: 0.85 });
        entries.push({
          url: `${baseUrl}/${locale}/${country.code}/${city.slug}/dealers`,
          lastModified: now,
          priority: 0.85
        });
        entries.push({
          url: `${baseUrl}/${locale}/${country.code}/${city.slug}/compare`,
          lastModified: now,
          priority: 0.8
        });
        entries.push({
          url: `${baseUrl}/${locale}/${country.code}/${city.slug}/insights`,
          lastModified: now,
          priority: 0.8
        });
      });
    });

    getFallbackArticles().forEach((article) => {
      entries.push({
        url: `${baseUrl}/${locale}/articles/${article.slug}`,
        lastModified: article.publishedAt,
        priority: 0.75
      });
    });

    guides.forEach((guide) => {
      entries.push({
        url: `${baseUrl}/${locale}/guides/${guide.slug}`,
        lastModified: guide.publishedAt,
        priority: 0.7
      });
    });
  });

  return entries;
}
