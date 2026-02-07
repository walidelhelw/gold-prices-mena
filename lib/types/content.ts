export type ContentTemplateType = "guide" | "insight" | "comparison";
export type ContentQaStatus = "pending" | "approved" | "rejected";

export type SourceRef = {
  url: string;
  label: string;
};

export type ContentItem = {
  id: string;
  slug: string;
  locale: string;
  countryCode: string | null;
  citySlug: string | null;
  template: ContentTemplateType;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
};

export type ContentVersion = {
  id: string;
  contentItemId: string;
  title: string;
  excerpt: string;
  body: string;
  qaStatus: ContentQaStatus;
  duplicateScore: number;
  numericScore: number;
  sourceCount: number;
  rollbackOfVersionId?: string | null;
  createdAt: string;
};

export type GeneratedDraft = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  template: ContentTemplateType;
  locale: string;
  countryCode: string | null;
  citySlug: string | null;
  sources: SourceRef[];
  numericClaims: number[];
};

export type GuardrailResult = {
  approved: boolean;
  qaStatus: ContentQaStatus;
  duplicateScore: number;
  numericScore: number;
  reasons: string[];
};

export const parseContentTemplate = (value: string | null): ContentTemplateType => {
  if (value === "insight" || value === "comparison") {
    return value;
  }
  return "guide";
};
