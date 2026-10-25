import { afterEach, describe, expect, it, vi } from 'vitest';
import { cmsService, describeCmsError } from './api';

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

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

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

  it('bounds a stalled CMS request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [], total: 0, page: 1, pageSize: 100 }) });
    vi.stubGlobal('fetch', fetchMock);
    const timeout = vi.spyOn(AbortSignal, 'timeout');

    await cmsService.getArticles();

    expect(timeout).toHaveBeenCalledWith(10000);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/posts'), expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });
});

it('explains a CMS timeout in Chinese', () => {
  expect(describeCmsError).toBeTypeOf('function');
  expect(describeCmsError(new DOMException('signal timed out', 'TimeoutError'))).toBe('连接 CMS 超时，请稍后重试');
});
