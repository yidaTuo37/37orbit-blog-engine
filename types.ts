// src/types.ts

export interface Post {
  id: number;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  category: string;
  homepage_slot: string;
  featured: boolean;
  sort_order: number;
  cover: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  content?: string;
  html?: string;
}

export interface HomepageContent {
  mainWork: Post | null;
  frames: {
    frameA: Post | null;
    frameB: Post | null;
  };
  wallLabels: Post[];
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
