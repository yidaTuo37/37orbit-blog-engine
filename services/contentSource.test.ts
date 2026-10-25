import { describe, expect, it } from 'vitest';
import {
  isHomepageContent,
  isOrbitPost,
  isOrbitPostsResponse,
  normalizeHomepageContent,
  normalizeCmsPost,
  rewriteCmsMediaUrls,
  sanitizeCmsHtml,
  type CmsPost,
} from './contentSource';

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
} satisfies CmsPost;

describe('Orbit Post contract', () => {
  it('accepts the documented Orbit response and rejects a legacy Strapi envelope', () => {
    expect(isOrbitPost(orbitPost)).toBe(true);
    expect(isOrbitPost({ data: { id: 12, attributes: orbitPost } })).toBe(false);
  });

  it.each([
    ['category', 37],
    ['homepage_slot', null],
    ['status', 'draft'],
    ['html', 37],
    ['content', {}],
  ])('rejects an invalid %s field', (field, value) => {
    expect(isOrbitPost({ ...orbitPost, [field]: value })).toBe(false);
  });

  it('accepts documented optional string content fields', () => {
    expect(isOrbitPost({ ...orbitPost, html: '<p>Rendered</p>', content: '# Markdown' })).toBe(true);
  });

  it('accepts custom category and homepage slot strings emitted by the CMS', () => {
    expect(isOrbitPost({ ...orbitPost, category: 'travel', homepage_slot: 'hero' })).toBe(true);
  });
});

describe('Orbit posts list contract', () => {
  const response = { items: [orbitPost], total: 1, page: 1, pageSize: 20 };

  it('accepts the documented pagination response shape', () => {
    expect(isOrbitPostsResponse(response)).toBe(true);
  });

  it.each([
    { items: [orbitPost] },
    { ...response, total: -1 },
    { ...response, page: 0 },
    { ...response, pageSize: 101 },
  ])('rejects invalid pagination metadata: %o', (value) => {
    expect(isOrbitPostsResponse(value)).toBe(false);
  });
});

describe('normalizeCmsPost', () => {
  it('maps the headless CMS post contract to the frontend post model', () => {
    expect(
      normalizeCmsPost({
        ...orbitPost,
        html: '<p>已发布</p>',
      }),
    ).toMatchObject({
      id: 12,
      slug: 'nas-content',
      title: '内容在群晖',
      cover: '/media/posts/nas/cover.jpg',
      html: '<p>已发布</p>',
    });
  });

  it('normalizes posts nested in a homepage response', () => {
    const response = {
      mainWork: orbitPost,
      frames: { frameA: null, frameB: orbitPost },
      wallLabels: [orbitPost],
    };

    expect(isHomepageContent(response)).toBe(true);
    expect(normalizeHomepageContent(response)).toMatchObject({
      mainWork: { updatedAt: orbitPost.updated_at },
      frames: { frameA: null, frameB: { updatedAt: orbitPost.updated_at } },
      wallLabels: [{ updatedAt: orbitPost.updated_at }],
    });
  });
});

describe('rewriteCmsMediaUrls', () => {
  it('prefixes root-relative CMS media URLs in rendered article HTML', () => {
    expect(
      rewriteCmsMediaUrls('https://cms.37orbit.com', '<figure><img src="/media/posts/a.jpg" /></figure>'),
    ).toBe('<figure><img src="https://cms.37orbit.com/media/posts/a.jpg" /></figure>');
  });

  it('prefixes unquoted root-relative CMS media URLs', () => {
    expect(
      rewriteCmsMediaUrls('https://cms.37orbit.com', '<img src=/media/posts/a.jpg alt=Cover>'),
    ).toBe('<img src=https://cms.37orbit.com/media/posts/a.jpg alt=Cover>');
  });
});

describe('sanitizeCmsHtml', () => {
  it('removes executable markup before article HTML is rendered', () => {
    expect(sanitizeCmsHtml('<p onclick="alert(1)">Safe</p><script>alert(2)</script>')).toBe('<p>Safe</p>');
  });

  it.each([
    '<a href=javascript:alert(1)>Unsafe link</a>',
    '<img src=javascript:alert(1) alt="Unsafe image">',
    '<a href="java\nscript:alert(1)">Obfuscated</a>',
  ])('removes unsafe URLs regardless of quoting: %s', (html) => {
    const sanitized = sanitizeCmsHtml(html);
    expect(sanitized).not.toMatch(/javascript:/i);
  });

  it('preserves documented figure and text-style attributes', () => {
    const html = '<figure data-figure-image data-size="67" data-layout="block-center"><img src="/media/a.jpg" alt="A"><figcaption>Caption</figcaption></figure><p data-text-style data-variant="lead" data-tone="accent" data-align="center">Lead</p>';
    expect(sanitizeCmsHtml(html)).toContain('data-figure-image');
    expect(sanitizeCmsHtml(html)).toContain('data-size="67"');
    expect(sanitizeCmsHtml(html)).toContain('data-layout="block-center"');
    expect(sanitizeCmsHtml(html)).toContain('data-text-style');
    expect(sanitizeCmsHtml(html)).toContain('data-variant="lead"');
  });

  it('drops undocumented values from enumerated presentation attributes', () => {
    const sanitized = sanitizeCmsHtml('<figure data-figure-image data-size="200" data-layout="fixed"><img src="/media/a.jpg"></figure><p data-text-style data-variant="huge" data-tone="neon" data-align="justify">Text</p>');
    expect(sanitized).not.toContain('data-size');
    expect(sanitized).not.toContain('data-layout');
    expect(sanitized).not.toContain('data-variant');
    expect(sanitized).not.toContain('data-tone');
    expect(sanitized).not.toContain('data-align');
  });
});
