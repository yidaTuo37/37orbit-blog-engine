import { getContentApiEndpoint, getContentApiUrl, getContentMediaOrigin } from './cmsConfig';
import {
  isHomepageContent,
  isOrbitPostDetail,
  isOrbitPostsResponse,
  isSiteSettings,
  normalizeCmsPost,
  normalizeHomepageContent,
  resolveCmsMediaUrl,
} from './contentSource';
import type { HomepageContent, SiteSettings } from '../types';

const API_URL = getContentApiUrl(import.meta.env.VITE_CONTENT_API_URL as string | undefined);
/**
 * Convert a root-relative Orbit media URL to the configured public API origin.
 */
export const getMediaURL = (url?: string | null): string => {
  return resolveCmsMediaUrl(getContentMediaOrigin(API_URL), url);
};

/**
 * Core CMS service
 * NOTE: no Node APIs, no process.env, no top-level side effects
 */
export const cmsService = {
  async getArticles() {
    const res = await fetch(`${getContentApiEndpoint(API_URL, '/posts')}?page=1&pageSize=100`);

    if (!res.ok) throw new Error(`Failed to fetch posts: HTTP ${res.status}`);

    const json: unknown = await res.json();
    if (!isOrbitPostsResponse(json)) throw new Error('Invalid Orbit posts response');
    return json.items.map(normalizeCmsPost);
  },

  async getArticleBySlug(slug: string) {
    const res = await fetch(getContentApiEndpoint(API_URL, `/posts/${encodeURIComponent(slug)}`));

    if (!res.ok) {
      throw new Error(`Failed to fetch article: ${res.status}`);
    }

    const post: unknown = await res.json();
    if (!isOrbitPostDetail(post)) throw new Error('Invalid Orbit post response');
    return normalizeCmsPost(post);
  },

  async getHomepage(): Promise<HomepageContent> {
    const res = await fetch(getContentApiEndpoint(API_URL, '/homepage'));
    if (!res.ok) throw new Error(`Failed to fetch homepage: ${res.status}`);
    const homepage = await res.json();
    if (!isHomepageContent(homepage)) throw new Error('Invalid Orbit homepage response');
    return normalizeHomepageContent(homepage);
  },

  async getSettings(): Promise<SiteSettings> {
    const res = await fetch(getContentApiEndpoint(API_URL, '/settings'));
    if (!res.ok) throw new Error(`Failed to fetch settings: ${res.status}`);
    const settings = await res.json();
    if (!isSiteSettings(settings)) throw new Error('Invalid Orbit settings response');
    return settings;
  },
};

export const contentMediaOrigin = getContentMediaOrigin(API_URL);
