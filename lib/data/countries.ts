export type Country = {
  code: string;
  name_ar: string;
  name_en: string;
  currency: string;
  localUnit: string;
  defaultKarat: number;
  citySlug: string;
};

export const countries: Country[] = [
  {
    code: "eg",
    name_ar: "مصر",
    name_en: "Egypt",
    currency: "EGP",
    localUnit: "جنيه",
    defaultKarat: 21,
    citySlug: "cairo"
  },
  {
    code: "sa",
    name_ar: "السعودية",
    name_en: "Saudi Arabia",
    currency: "SAR",
    localUnit: "ريال",
    defaultKarat: 21,
    citySlug: "riyadh"
  },
  {
    code: "ae",
    name_ar: "الإمارات",
    name_en: "UAE",
    currency: "AED",
    localUnit: "درهم",
    defaultKarat: 24,
    citySlug: "dubai"
  },
  {
    code: "kw",
    name_ar: "الكويت",
    name_en: "Kuwait",
    currency: "KWD",
    localUnit: "دينار",
    defaultKarat: 21,
    citySlug: "kuwait-city"
  },
  {
    code: "qa",
    name_ar: "قطر",
    name_en: "Qatar",
    currency: "QAR",
    localUnit: "ريال",
    defaultKarat: 22,
    citySlug: "doha"
  },
  {
    code: "bh",
    name_ar: "البحرين",
    name_en: "Bahrain",
    currency: "BHD",
    localUnit: "دينار",
    defaultKarat: 21,
    citySlug: "manama"
  },
  {
    code: "om",
    name_ar: "عُمان",
    name_en: "Oman",
    currency: "OMR",
    localUnit: "ريال",
    defaultKarat: 21,
    citySlug: "muscat"
  }
];

export const citiesByCountry: Record<string, { name_ar: string; name_en: string; slug: string }[]> = {
  eg: [
    { name_ar: "القاهرة", name_en: "Cairo", slug: "cairo" },
    { name_ar: "الإسكندرية", name_en: "Alexandria", slug: "alexandria" },
    { name_ar: "الجيزة", name_en: "Giza", slug: "giza" },
    { name_ar: "المنصورة", name_en: "Mansoura", slug: "mansoura" },
    { name_ar: "طنطا", name_en: "Tanta", slug: "tanta" },
    { name_ar: "المنيا", name_en: "Minya", slug: "minya" },
    { name_ar: "أسيوط", name_en: "Assiut", slug: "assiut" },
    { name_ar: "الإسماعيلية", name_en: "Ismailia", slug: "ismailia" }
  ],
  sa: [
    { name_ar: "الرياض", name_en: "Riyadh", slug: "riyadh" },
    { name_ar: "جدة", name_en: "Jeddah", slug: "jeddah" },
    { name_ar: "الدمام", name_en: "Dammam", slug: "dammam" },
    { name_ar: "مكة", name_en: "Makkah", slug: "makkah" },
    { name_ar: "المدينة", name_en: "Madinah", slug: "madinah" },
    { name_ar: "الخبر", name_en: "Khobar", slug: "khobar" }
  ],
  ae: [
    { name_ar: "دبي", name_en: "Dubai", slug: "dubai" },
    { name_ar: "أبوظبي", name_en: "Abu Dhabi", slug: "abu-dhabi" },
    { name_ar: "الشارقة", name_en: "Sharjah", slug: "sharjah" },
    { name_ar: "عجمان", name_en: "Ajman", slug: "ajman" },
    { name_ar: "رأس الخيمة", name_en: "Ras Al Khaimah", slug: "ras-al-khaimah" }
  ],
  kw: [
    { name_ar: "مدينة الكويت", name_en: "Kuwait City", slug: "kuwait-city" },
    { name_ar: "حولي", name_en: "Hawalli", slug: "hawalli" }
  ],
  qa: [
    { name_ar: "الدوحة", name_en: "Doha", slug: "doha" },
    { name_ar: "الريان", name_en: "Al Rayyan", slug: "al-rayyan" }
  ],
  bh: [
    { name_ar: "المنامة", name_en: "Manama", slug: "manama" },
    { name_ar: "المحرق", name_en: "Muharraq", slug: "muharraq" }
  ],
  om: [
    { name_ar: "مسقط", name_en: "Muscat", slug: "muscat" },
    { name_ar: "صلالة", name_en: "Salalah", slug: "salalah" }
  ]
};

export const getCountry = (code: string) => countries.find((country) => country.code === code);
