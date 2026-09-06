import { HomepageContent, Post, SiteSettings } from '../types';
import { collectAllPages } from '../utils/pagination';
import { resolveContentMediaUrl, resolveContentSourceMode } from './contentSourceMode';

const API_URL = (import.meta.env.VITE_CONTENT_API_URL || '').replace(/\/+$/, '');
const STATIC_BASE = (import.meta.env.VITE_CONTENT_STATIC_BASE || '/cms').replace(/\/+$/, '');
const CONTENT_SOURCE_MODE = resolveContentSourceMode(import.meta.env.VITE_CONTENT_SOURCE);

type ListResponse = {
  items: Post[];
  total: number;
  page: number;
  pageSize: number;
};

export interface ContentSource {
  getPosts(options?: {
    category?: string;
    homepage_slot?: string;
    featured?: boolean;
    pageSize?: number;
  }): Promise<Post[]>;
  getAllPosts(): Promise<Post[]>;
  getPostBySlug(slug: string): Promise<Post | null>;
  getHomepage(): Promise<HomepageContent>;
  getSettings(): Promise<SiteSettings>;
}

function apiPath(path: string): string {
  return API_URL ? `${API_URL}${path}` : path;
}

export const getMediaURL = (url?: string | null): string => {
  return resolveContentMediaUrl(CONTENT_SOURCE_MODE, API_URL, url);
};

export function absolutizeMediaUrls(html: string): string {
  if (!API_URL) return html;
  return html.replaceAll('src="/media/', `src="${API_URL}/media/`).replaceAll("src='/media/", `src='${API_URL}/media/`);
}

export const orbitContentSource: ContentSource = {
  async getPosts(options = {}): Promise<Post[]> {
    const params = new URLSearchParams({
      page: '1',
      pageSize: String(options.pageSize ?? 100),
    });
    if (options.category) params.set('category', options.category);
    if (options.homepage_slot) params.set('homepage_slot', options.homepage_slot);
    if (options.featured !== undefined) params.set('featured', String(options.featured));

    const res = await fetch(apiPath(`/api/posts?${params.toString()}`), { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
    const json = (await res.json()) as ListResponse;
    return json.items ?? [];
  },

  async getAllPosts(): Promise<Post[]> {
    return collectAllPages(async (page, pageSize) => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      const res = await fetch(apiPath(`/api/posts?${params.toString()}`), { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
      const json = (await res.json()) as ListResponse;
      return { items: json.items ?? [], total: json.total ?? 0 };
    });
  },

  async getPostBySlug(slug: string): Promise<Post | null> {
    const res = await fetch(apiPath(`/api/posts/${encodeURIComponent(slug)}`), { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
    const post = (await res.json()) as Post;
    return post.html ? { ...post, html: absolutizeMediaUrls(post.html) } : post;
  },

  async getHomepage(): Promise<HomepageContent> {
    const res = await fetch(apiPath('/api/homepage'), { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch homepage: ${res.status}`);
    return (await res.json()) as HomepageContent;
  },

  async getSettings(): Promise<SiteSettings> {
    const res = await fetch(apiPath('/api/settings'), { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch settings: ${res.status}`);
    return (await res.json()) as SiteSettings;
  },
};

export const staticContentSource: ContentSource = {
  async getPosts(options = {}): Promise<Post[]> {
    const res = await fetch(`${STATIC_BASE}/posts.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch static posts: ${res.status}`);
    const json = (await res.json()) as ListResponse;
    let items = json.items ?? [];
    if (options.category) items = items.filter((post) => post.category === options.category);
    if (options.homepage_slot) items = items.filter((post) => post.homepage_slot === options.homepage_slot);
    if (options.featured !== undefined) items = items.filter((post) => post.featured === options.featured);
    return items.slice(0, options.pageSize ?? items.length);
  },

  async getAllPosts(): Promise<Post[]> {
    const res = await fetch(`${STATIC_BASE}/posts.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch static posts: ${res.status}`);
    const json = (await res.json()) as ListResponse;
    return json.items ?? [];
  },

  async getPostBySlug(slug: string): Promise<Post | null> {
    const res = await fetch(`${STATIC_BASE}/posts/${encodeURIComponent(slug)}.json`, { cache: 'no-store' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch static post: ${res.status}`);
    return (await res.json()) as Post;
  },

  async getHomepage(): Promise<HomepageContent> {
    const res = await fetch(`${STATIC_BASE}/homepage.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch static homepage: ${res.status}`);
    return (await res.json()) as HomepageContent;
  },

  async getSettings(): Promise<SiteSettings> {
    const res = await fetch(`${STATIC_BASE}/settings.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch static settings: ${res.status}`);
    return (await res.json()) as SiteSettings;
  },
};

export const contentService = CONTENT_SOURCE_MODE === 'static'
  ? staticContentSource
  : orbitContentSource;
