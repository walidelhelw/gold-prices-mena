import "server-only";

import { getSupabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  publishedAt: string;
  countryCodes: string[];
};

const today = new Date();

const makeDate = (offset: number) => {
  const date = new Date(today);
  date.setDate(today.getDate() - offset);
  return date.toISOString();
};

const fallbackArticles: Article[] = [
  {
    slug: "gold-today-demand-shift",
    title: "لماذا زاد طلب الذهب في الأسواق المحلية اليوم؟",
    excerpt: "نظرة سريعة على حركة الطلب في أسواق التجزئة وتأثير سعر الصرف.",
    body: "يشهد السوق المحلي موجة شراء جديدة مع اقتراب مناسبات اجتماعية وتغيرات سعر الصرف. في هذا التقرير القصير نوضح كيف يؤثر الدولار على سعر الجرام محليًا، ولماذا تختلف المصنعية بين المدن. تابع التحليل مع نصائح عملية للمشتري غير المستثمر.",
    publishedAt: makeDate(0),
    countryCodes: ["eg", "sa", "ae"]
  },
  {
    slug: "gold-spot-vs-local",
    title: "ما الفرق بين السعر العالمي والسعر المحلي للذهب؟",
    excerpt: "توضيح مبسط لفروقات السعر العالمي مقابل التسعير المحلي.",
    body: "السعر العالمي يُقاس بالأونصة بالدولار، بينما السعر المحلي يعتمد على سعر الصرف وتكاليف السوق المحلي. نعرض مثالًا عمليًا لتحويل الأونصة إلى جرام وتأثير فرق العملة والمصنعية على السعر النهائي للمستهلك.",
    publishedAt: makeDate(1),
    countryCodes: ["eg", "qa", "kw", "bh"]
  },
  {
    slug: "daily-fix-guide",
    title: "كيف تقرأ حركة السعر خلال اليوم؟",
    excerpt: "توضيح سريع لأفضل توقيتات الشراء عند تغير السعر.",
    body: "التغير اللحظي في السعر لا يعني دائمًا فرصة شراء فورية. نوضح كيف تراقب فرق الافتتاح/الإغلاق، وكيف تقارن سعر الصرف المحلي بالسعر العالمي للوصول لقرار شراء أفضل.",
    publishedAt: makeDate(2),
    countryCodes: ["sa", "ae", "qa", "kw"]
  }
];

const mapArticle = (row: {
  slug: string;
  title_ar: string;
  excerpt_ar: string;
  body_ar: string;
  published_at: string;
  country_codes: string[];
}): Article => ({
  slug: row.slug,
  title: row.title_ar,
  excerpt: row.excerpt_ar,
  body: row.body_ar,
  publishedAt: row.published_at,
  countryCodes: row.country_codes ?? []
});

export const getArticles = async ({
  country,
  limit
}: {
  country?: string | null;
  limit?: number;
} = {}): Promise<Article[]> => {
  if (!isSupabaseServerConfigured()) {
    const filtered = country
      ? fallbackArticles.filter((article) => article.countryCodes.includes(country))
      : fallbackArticles;
    return limit ? filtered.slice(0, limit) : filtered;
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    const filtered = country
      ? fallbackArticles.filter((article) => article.countryCodes.includes(country))
      : fallbackArticles;
    return limit ? filtered.slice(0, limit) : filtered;
  }

  let query = supabase
    .from("articles")
    .select("slug, title_ar, excerpt_ar, body_ar, published_at, country_codes")
    .order("published_at", { ascending: false });

  if (country) {
    query = query.contains("country_codes", [country]);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data } = await query;
  if (!data || data.length === 0) return fallbackArticles;
  return data.map(mapArticle);
};

export const getArticleBySlug = async (slug: string): Promise<Article | null> => {
  if (!isSupabaseServerConfigured()) {
    return fallbackArticles.find((article) => article.slug === slug) ?? null;
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return fallbackArticles.find((article) => article.slug === slug) ?? null;
  }

  const { data } = await supabase
    .from("articles")
    .select("slug, title_ar, excerpt_ar, body_ar, published_at, country_codes")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (!data) {
    return fallbackArticles.find((article) => article.slug === slug) ?? null;
  }

  return mapArticle(data);
};

export const getRelatedArticles = async (slug: string, limit = 3) => {
  const articles = await getArticles();
  return articles.filter((item) => item.slug !== slug).slice(0, limit);
};

export const getFallbackArticles = () => fallbackArticles;
