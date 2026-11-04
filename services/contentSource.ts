import rehypeParse from 'rehype-parse';
import rehypeSanitize, { defaultSchema, type Options as SanitizeSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';
import type { Category, HomepageContent, HomepageSlot, Post, PostCategory, SiteSettings } from '../types';

export interface CmsPost {
  id: number;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  category: PostCategory;
  homepage_slot: HomepageSlot;
  featured: boolean;
  sort_order: number;
  cover: string;
  status: 'published';
  created_at: string;
  updated_at: string;
  content?: string;
  html?: string;
}

export interface CmsHomepageContent {
  mainWork: CmsPost | null;
  frames: { frameA: CmsPost | null; frameB: CmsPost | null };
  wallLabels: CmsPost[];
}

export interface CmsPostsResponse {
  items: CmsPost[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CmsCategory {
  slug: string;
  name: string;
  count?: number;
}

export interface CmsCategoriesResponse {
  items: CmsCategory[];
}

const textStyleAttributes: NonNullable<SanitizeSchema['attributes']>[string] = [
  'dataTextStyle',
  ['dataVariant', 'body', 'small', 'lead', 'note'],
  ['dataTone', 'default', 'muted', 'accent'],
  ['dataAlign', 'left', 'center', 'right'],
];

const cmsHtmlSchema: SanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'figure', 'figcaption'],
  attributes: {
    ...defaultSchema.attributes,
    figure: [
      'dataFigureImage',
      ['dataSize', '33', '50', '67', '100'],
      ['dataLayout', 'block-left', 'block-center', 'block-right', 'wrap-left', 'wrap-right'],
    ],
    p: textStyleAttributes,
    h1: textStyleAttributes,
    h2: [...(defaultSchema.attributes?.h2 ?? []), ...textStyleAttributes],
    h3: textStyleAttributes,
    h4: textStyleAttributes,
    h5: textStyleAttributes,
    h6: textStyleAttributes,
    blockquote: [...(defaultSchema.attributes?.blockquote ?? []), ...textStyleAttributes],
  },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Detect the direct Orbit `Post` payload. This intentionally excludes Strapi's `{ data, attributes }` envelope. */
export function isOrbitPost(value: unknown): value is CmsPost {
  return isRecord(value)
    && typeof value.id === 'number'
    && typeof value.slug === 'string'
    && typeof value.title === 'string'
    && typeof value.summary === 'string'
    && Array.isArray(value.tags)
    && value.tags.every((tag) => typeof tag === 'string')
    && typeof value.category === 'string'
    && typeof value.homepage_slot === 'string'
    && typeof value.featured === 'boolean'
    && typeof value.sort_order === 'number'
    && typeof value.cover === 'string'
    && value.status === 'published'
    && typeof value.created_at === 'string'
    && typeof value.updated_at === 'string'
    && (value.content === undefined || typeof value.content === 'string')
    && (value.html === undefined || typeof value.html === 'string');
}

export function isOrbitPostDetail(value: unknown): value is CmsPost & { html: string } {
  return isOrbitPost(value) && typeof value.html === 'string';
}

export function isHomepageContent(value: unknown): value is CmsHomepageContent {
  return isRecord(value)
    && (value.mainWork === null || isOrbitPost(value.mainWork))
    && isRecord(value.frames)
    && (value.frames.frameA === null || isOrbitPost(value.frames.frameA))
    && (value.frames.frameB === null || isOrbitPost(value.frames.frameB))
    && Array.isArray(value.wallLabels)
    && value.wallLabels.every(isOrbitPost);
}

const isIntegerInRange = (value: unknown, minimum: number, maximum = Number.MAX_SAFE_INTEGER): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= minimum && value <= maximum;

export function isOrbitPostsResponse(value: unknown): value is CmsPostsResponse {
  return isRecord(value)
    && Array.isArray(value.items)
    && value.items.every(isOrbitPost)
    && isIntegerInRange(value.total, 0)
    && isIntegerInRange(value.page, 1)
    && isIntegerInRange(value.pageSize, 1, 100);
}

export function isSiteSettings(value: unknown): value is SiteSettings {
  const keys: (keyof SiteSettings)[] = [
    'brand_logo_image', 'brand_name', 'brand_sub', 'brand_full',
    'sidebar_slogan', 'sidebar_copyright', 'sidebar_links',
    'topbar_prefix', 'topbar_article_label',
    'home_eyebrow', 'home_title', 'home_intro', 'home_hero_image',
    'home_hero_meta_start', 'home_hero_meta_end', 'home_hero_watermark',
    'home_photos_note', 'home_photos_title', 'home_stories_note', 'home_stories_title',
    'photos_kicker', 'photos_title', 'photos_intro', 'photos_intro_left', 'photos_intro_right', 'photos_section_note', 'photos_section_title',
    'journey_kicker', 'journey_title', 'journey_intro', 'journey_intro_left', 'journey_intro_right', 'journey_section_note', 'journey_section_title',
    'projects_kicker', 'projects_title', 'projects_intro', 'projects_intro_left', 'projects_intro_right', 'projects_section_note', 'projects_section_title',
    'footer_brand', 'footer_slogan', 'footer_back_top',
    'article_back_label', 'article_kicker_fallback', 'article_reading_template', 'article_loading_label', 'article_error_label', 'article_not_found_label',
    'empty_frames_label', 'empty_articles_label', 'empty_projects_label',
    'statement_label', 'statement_body', 'wall_labels_label', 'curator_label', 'curator_body', 'curator_meta',
  ];
  return isRecord(value) && keys.every((key) => typeof value[key] === 'string');
}

function isCategory(value: unknown): value is CmsCategory {
  return isRecord(value)
    && typeof value.slug === 'string'
    && typeof value.name === 'string'
    && (value.count === undefined || typeof value.count === 'number');
}

export function isCategoriesResponse(value: unknown): value is CmsCategoriesResponse {
  return isRecord(value)
    && Array.isArray(value.items)
    && value.items.every(isCategory);
}

export function normalizeCategories(response: CmsCategoriesResponse): Category[] {
  return response.items.map(({ slug, name, count }) => ({ slug, name, count }));
}

export function normalizeCmsPost(post: CmsPost): Post {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    tags: post.tags,
    category: post.category,
    homepage_slot: post.homepage_slot,
    featured: post.featured,
    sort_order: post.sort_order,
    status: post.status,
    cover: post.cover,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    content: post.content,
    html: post.html,
  };
}

export function normalizeHomepageContent(homepage: CmsHomepageContent): HomepageContent {
  return {
    mainWork: homepage.mainWork ? normalizeCmsPost(homepage.mainWork) : null,
    frames: {
      frameA: homepage.frames.frameA ? normalizeCmsPost(homepage.frames.frameA) : null,
      frameB: homepage.frames.frameB ? normalizeCmsPost(homepage.frames.frameB) : null,
    },
    wallLabels: homepage.wallLabels.map(normalizeCmsPost),
  };
}

export function resolveCmsMediaUrl(cmsApiUrl: string, url?: string | null): string {
  if (!url) return '';
  if (/^https?:\/\//.test(url)) return url;
  return `${cmsApiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function rewriteCmsMediaUrls(cmsApiUrl: string, html: string): string {
  if (!cmsApiUrl) return html;
  return html.replace(
    /\bsrc\s*=\s*(['"]?)(\/media\/[^\s'">]+)\1/gi,
    (_match, quote: string, mediaUrl: string) => `src=${quote}${cmsApiUrl}${mediaUrl}${quote}`,
  );
}

/** Defense-in-depth for the CMS's already-sanitized public HTML. */
export function sanitizeCmsHtml(html: string): string {
  return String(
    unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeSanitize, cmsHtmlSchema)
      .use(rehypeStringify)
      .processSync(html),
  );
}
