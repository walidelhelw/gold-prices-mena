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

export const articles: Article[] = [
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
    countryCodes: ["eg", "iq", "jo", "lb"]
  },
  {
    slug: "daily-fix-guide",
    title: "ما هو تثبيت لندن AM/PM ولماذا يهم المشتري؟",
    excerpt: "شرح سريع لتثبيت لندن ودلالته على الأسعار اليومية.",
    body: "تثبيت لندن AM/PM هو مؤشر عالمي يعتمد عليه السوق لتقدير التسعير. حتى لو كنت مشتريًا غير مستثمر، فهم هذا المؤشر يساعدك على مقارنة الأسعار بين الأيام واتخاذ قرار الشراء بوضوح.",
    publishedAt: makeDate(2),
    countryCodes: ["sa", "ae", "qa", "kw"]
  }
];

export const getArticleBySlug = (slug: string) => articles.find((article) => article.slug === slug);
