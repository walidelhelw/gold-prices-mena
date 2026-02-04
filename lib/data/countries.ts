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
  },
  {
    code: "jo",
    name_ar: "الأردن",
    name_en: "Jordan",
    currency: "JOD",
    localUnit: "دينار",
    defaultKarat: 21,
    citySlug: "amman"
  },
  {
    code: "iq",
    name_ar: "العراق",
    name_en: "Iraq",
    currency: "IQD",
    localUnit: "دينار",
    defaultKarat: 21,
    citySlug: "baghdad"
  },
  {
    code: "lb",
    name_ar: "لبنان",
    name_en: "Lebanon",
    currency: "LBP",
    localUnit: "ليرة",
    defaultKarat: 21,
    citySlug: "beirut"
  },
  {
    code: "ps",
    name_ar: "فلسطين",
    name_en: "Palestine",
    currency: "ILS",
    localUnit: "شيكل",
    defaultKarat: 21,
    citySlug: "ramallah"
  },
  {
    code: "sy",
    name_ar: "سوريا",
    name_en: "Syria",
    currency: "SYP",
    localUnit: "ليرة",
    defaultKarat: 21,
    citySlug: "damascus"
  },
  {
    code: "ye",
    name_ar: "اليمن",
    name_en: "Yemen",
    currency: "YER",
    localUnit: "ريال",
    defaultKarat: 21,
    citySlug: "sanaa"
  }
];

export const citiesByCountry: Record<string, { name_ar: string; name_en: string; slug: string }[]> = {
  eg: [
    { name_ar: "القاهرة", name_en: "Cairo", slug: "cairo" },
    { name_ar: "الإسكندرية", name_en: "Alexandria", slug: "alexandria" },
    { name_ar: "الجيزة", name_en: "Giza", slug: "giza" }
  ],
  sa: [
    { name_ar: "الرياض", name_en: "Riyadh", slug: "riyadh" },
    { name_ar: "جدة", name_en: "Jeddah", slug: "jeddah" },
    { name_ar: "الدمام", name_en: "Dammam", slug: "dammam" }
  ],
  ae: [
    { name_ar: "دبي", name_en: "Dubai", slug: "dubai" },
    { name_ar: "أبوظبي", name_en: "Abu Dhabi", slug: "abu-dhabi" },
    { name_ar: "الشارقة", name_en: "Sharjah", slug: "sharjah" }
  ],
  kw: [
    { name_ar: "مدينة الكويت", name_en: "Kuwait City", slug: "kuwait-city" }
  ],
  qa: [
    { name_ar: "الدوحة", name_en: "Doha", slug: "doha" }
  ],
  bh: [
    { name_ar: "المنامة", name_en: "Manama", slug: "manama" }
  ],
  om: [
    { name_ar: "مسقط", name_en: "Muscat", slug: "muscat" }
  ],
  jo: [
    { name_ar: "عمّان", name_en: "Amman", slug: "amman" }
  ],
  iq: [
    { name_ar: "بغداد", name_en: "Baghdad", slug: "baghdad" },
    { name_ar: "أربيل", name_en: "Erbil", slug: "erbil" }
  ],
  lb: [
    { name_ar: "بيروت", name_en: "Beirut", slug: "beirut" }
  ],
  ps: [
    { name_ar: "رام الله", name_en: "Ramallah", slug: "ramallah" }
  ],
  sy: [
    { name_ar: "دمشق", name_en: "Damascus", slug: "damascus" }
  ],
  ye: [
    { name_ar: "صنعاء", name_en: "Sanaa", slug: "sanaa" }
  ]
};

export const getCountry = (code: string) => countries.find((country) => country.code === code);
