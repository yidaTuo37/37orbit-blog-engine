// src/types.ts

export interface Media {
  url: string;
  alternativeText?: string;
}

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: string;
  context?: unknown;
  publishedAt: string;
  cover?: Media[];
}

export interface AnnualArticle {
  id: number;
  date: string;      // e.g. '2024-01-12'
  label: string;     // small timeline label (month/custom)
  title: string;
  excerpt: string;
  content: string;   // HTML string
  imageUrls?: string[]; // extracted image URLs for preloading
}

export interface TimelineNodeProps {
  article: AnnualArticle;
  isActive: boolean;
  isExpanded: boolean;
  onExpand: () => void;
}
