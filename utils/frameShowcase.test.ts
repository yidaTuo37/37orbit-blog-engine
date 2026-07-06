import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { groupFramePostsByTheme } from './frameShowcase.ts';
import type { Post } from '../types.ts';

function post(slug: string, tags: string[]): Post {
  return {
    id: slug.length,
    slug,
    title: slug,
    summary: '',
    tags,
    category: 'frame',
    homepage_slot: '',
    featured: false,
    sort_order: 0,
    cover: '',
    status: 'published',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };
}

describe('groupFramePostsByTheme', () => {
  it('groups frame posts by first non-empty tag and keeps insertion order', () => {
    const groups = groupFramePostsByTheme([
      post('street-1', ['Street', 'Night']),
      post('quiet-1', []),
      post('street-2', ['Street']),
      post('quiet-2', ['  ']),
    ]);

    assert.deepEqual(
      groups.map((group) => ({
        theme: group.theme,
        slugs: group.posts.map((item) => item.slug),
      })),
      [
        { theme: 'Street', slugs: ['street-1', 'street-2'] },
        { theme: 'Unsorted', slugs: ['quiet-1', 'quiet-2'] },
      ],
    );
  });
});
