import { HomepageContent, Post } from '../types';

const API_URL = (import.meta.env.VITE_CONTENT_API_URL || '').replace(/\/+$/, '');

type ListResponse = {
  items: Post[];
  total: number;
  page: number;
  pageSize: number;
};

export interface ContentSource {
  getPosts(): Promise<Post[]>;
  getPostBySlug(slug: string): Promise<Post | null>;
  getHomepage(): Promise<HomepageContent>;
}

function apiPath(path: string): string {
  return API_URL ? `${API_URL}${path}` : path;
}

export const getMediaURL = (url?: string | null): string => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (!url.startsWith('/')) return url;
  return API_URL ? `${API_URL}${url}` : url;
};

export function absolutizeMediaUrls(html: string): string {
  if (!API_URL) return html;
  return html.replaceAll('src="/media/', `src="${API_URL}/media/`).replaceAll("src='/media/", `src='${API_URL}/media/`);
}

export const orbitContentSource: ContentSource = {
  async getPosts(): Promise<Post[]> {
    const res = await fetch(apiPath('/api/posts?page=1&pageSize=100'));
    if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
    const json = (await res.json()) as ListResponse;
    return json.items ?? [];
  },

  async getPostBySlug(slug: string): Promise<Post | null> {
    const res = await fetch(apiPath(`/api/posts/${encodeURIComponent(slug)}`));
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
    const post = (await res.json()) as Post;
    return post.html ? { ...post, html: absolutizeMediaUrls(post.html) } : post;
  },

  async getHomepage(): Promise<HomepageContent> {
    const res = await fetch(apiPath('/api/homepage'));
    if (!res.ok) throw new Error(`Failed to fetch homepage: ${res.status}`);
    return (await res.json()) as HomepageContent;
  },
};

export const contentService = orbitContentSource;
