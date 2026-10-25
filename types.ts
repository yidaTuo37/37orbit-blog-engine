// src/types.ts

export interface Media {
  url: string;
  alternativeText?: string;
}

export type PostCategory = string;
export type HomepageSlot = string;

export interface Article {
  id: number;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  category: PostCategory;
  cover: string;
  createdAt: string;
  updatedAt: string;
  content?: string;
  html?: string;
}

export interface Post extends Article {
  homepage_slot: HomepageSlot;
  featured: boolean;
  sort_order: number;
  status: 'published';
}

export interface HomepageContent {
  mainWork: Post | null;
  frames: { frameA: Post | null; frameB: Post | null };
  wallLabels: Post[];
}

export interface SiteSettings {
  home_eyebrow: string;
  home_title: string;
  home_intro: string;
  statement_label: string;
  statement_body: string;
  wall_labels_label: string;
  curator_label: string;
  curator_body: string;
  curator_meta: string;
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

// 影像作品(本地数据,见 data/frames.ts)
export interface Frame {
  id: string;
  title?: string;       // 首页不展示标题,详情可用
  cover: string;        // 封面图路径,如 /annual/2025/xxx.jpeg
  href?: string;        // 可选外链
  date?: string;
}

// 项目作品(本地数据,见 data/projects.ts)
export interface Project {
  id: string;
  title: string;
  cover: string;        // 封面图路径
  href?: string;        // 项目链接/详情
  desc?: string;
  date?: string;
}

export interface TimelineNodeProps {
  article: AnnualArticle;
  isActive: boolean;
  isExpanded: boolean;
  onExpand: () => void;
}
