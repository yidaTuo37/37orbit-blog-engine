import { afterEach, describe, expect, it, vi } from 'vitest';
import { cmsService } from './api';

const orbitPost = {
  id: 12,
  slug: 'nas-content',
  title: '内容在群晖',
  summary: '从 NAS 读取',
  tags: ['nas'],
  category: 'writing',
  homepage_slot: 'wall-label',
  featured: false,
  sort_order: 1,
  cover: '/media/posts/nas/cover.jpg',
  status: 'published',
  created_at: '2026-09-04T00:00:00.000Z',
  updated_at: '2026-09-04T01:00:00.000Z',
};

afterEach(() => vi.unstubAllGlobals());

describe('cmsService.getArticleBySlug', () => {
  it('rejects a default detail response without rendered HTML', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ...orbitPost, content: '# Markdown only' }),
    }));

    await expect(cmsService.getArticleBySlug(orbitPost.slug)).rejects.toThrow('Invalid Orbit post response');
  });
});

describe('cmsService.getArticles', () => {
  it('surfaces API errors instead of treating them as an empty post list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(cmsService.getArticles()).rejects.toThrow('HTTP 404');
  });
});
