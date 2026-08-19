import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Post } from '../types.ts';
import { groupHomepagePostsByTheme, sortHomepagePosts } from './homepageCuration.ts';

function post(overrides: Partial<Post> & Pick<Post, 'slug'>): Post {
  return {
    id: 1,
    slug: overrides.slug,
    title: overrides.slug,
    summary: '',
    tags: [],
    category: 'writing',
    homepage_slot: '',
    featured: false,
    sort_order: 0,
    cover: '',
    status: 'published',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('sortHomepagePosts', () => {
  it('sorts newest updates first without mutating the input', () => {
    const older = post({ slug: 'older', updated_at: '2026-01-02T00:00:00.000Z' });
    const newer = post({ slug: 'newer', updated_at: '2026-02-02T00:00:00.000Z' });
    const input = [older, newer];

    assert.deepEqual(sortHomepagePosts(input).map((item) => item.slug), ['newer', 'older']);
    assert.deepEqual(input.map((item) => item.slug), ['older', 'newer']);
  });
});

describe('groupHomepagePostsByTheme', () => {
  it('uses the first non-empty tag and preserves newest-first group order', () => {
    const items = [
      post({ slug: 'latest-trip', tags: ['', '现场与远行'], updated_at: '2026-03-01T00:00:00.000Z' }),
      post({ slug: 'experiment', tags: ['异想与实验'], updated_at: '2026-02-01T00:00:00.000Z' }),
      post({ slug: 'older-trip', tags: ['现场与远行', '次要标签'], updated_at: '2026-01-01T00:00:00.000Z' }),
    ];

    assert.deepEqual(
      groupHomepagePostsByTheme(items).map((group) => ({
        theme: group.theme,
        slugs: group.posts.map((item) => item.slug),
      })),
      [
        { theme: '现场与远行', slugs: ['latest-trip', 'older-trip'] },
        { theme: '异想与实验', slugs: ['experiment'] },
      ],
    );
  });

  it('groups posts without a usable tag under 未分类', () => {
    const groups = groupHomepagePostsByTheme([
      post({ slug: 'blank', tags: ['  ', ''] }),
      post({ slug: 'missing', tags: [] }),
    ]);

    assert.equal(groups.length, 1);
    assert.equal(groups[0].theme, '未分类');
    assert.deepEqual(groups[0].posts.map((item) => item.slug), ['blank', 'missing']);
  });
});
