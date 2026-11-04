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
  // 品牌与 Logo
  brand_logo_image: string;
  brand_name: string;
  brand_sub: string;
  brand_full: string;
  // 侧边栏
  sidebar_slogan: string;
  sidebar_copyright: string;
  sidebar_links: string; // 侧边栏底部小列索引链接（JSON 数组：[{label, href}]）
  // 顶栏
  topbar_prefix: string;
  topbar_article_label: string;
  // 首屏 Hero
  home_eyebrow: string;
  home_title: string;
  home_intro: string;
  home_hero_image: string;
  home_hero_meta_start: string;
  home_hero_meta_end: string;
  home_hero_watermark: string;
  // 首页 · 照片集区块
  home_photos_note: string;
  home_photos_title: string;
  // 首页 · 最近文章区块
  home_stories_note: string;
  home_stories_title: string;
  // 照片库页
  photos_kicker: string;
  photos_title: string;
  photos_intro: string;
  photos_intro_left: string;
  photos_intro_right: string;
  photos_section_note: string;
  photos_section_title: string;
  // 日记页
  journey_kicker: string;
  journey_title: string;
  journey_intro: string;
  journey_intro_left: string;
  journey_intro_right: string;
  journey_section_note: string;
  journey_section_title: string;
  // 项目页
  projects_kicker: string;
  projects_title: string;
  projects_intro: string;
  projects_intro_left: string;
  projects_intro_right: string;
  projects_section_note: string;
  projects_section_title: string;
  // 页脚
  footer_brand: string;
  footer_slogan: string;
  footer_back_top: string;
  // 文章详情页
  article_back_label: string;
  article_kicker_fallback: string;
  article_reading_template: string;
  article_loading_label: string;
  article_error_label: string;
  article_not_found_label: string;
  // 空状态
  empty_frames_label: string;
  empty_articles_label: string;
  empty_projects_label: string;
  // 备用布局（展览墙）
  statement_label: string;
  statement_body: string;
  wall_labels_label: string;
  curator_label: string;
  curator_body: string;
  curator_meta: string;
}

/** 分类页面文案（来自 CMS「分类区」，可在后台编辑）。 */
export interface CategoryPageSettings {
  kicker: string;
  title: string;
  intro: string;
  intro_left: string;
  intro_right: string;
  section_note: string;
  section_title: string;
  layout: 'grid' | 'list';
}

/** 首页「分类区」：slug 是稳定键，name 是首页展示的可编辑名字。 */
export interface Category {
  slug: string;
  name: string;
  count?: number;
  settings: CategoryPageSettings;
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
