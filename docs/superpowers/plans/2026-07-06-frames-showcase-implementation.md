# Frames Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `#/frames` page as an image-led showcase with featured entries, theme grouping, and article-detail links.

**Architecture:** Keep data flow unchanged: `FramesPage` still consumes `useCategoryPosts(['frame'])` and links to `#/article/:slug`. Add a small pure helper for grouping posts by first tag so the only reusable logic is testable without a browser. Keep visual components local to `pages/CollectionPage.tsx`.

**Tech Stack:** React 19, Vite 6, TypeScript, Tailwind utility classes, Node 24 `node --test`.

## Global Constraints

- Do not add a separate gallery API.
- Do not add masonry layout dependency.
- Do not add a new image upload flow.
- Do not change the article detail route.
- Do not change headless CMS data model.
- Use current 37ORBIT visual language: dark exhibition background, orange labels/focus, pale cyan as secondary frames accent.
- Images must reserve stable aspect ratios and use lazy loading below the top featured image.

---

### Task 1: Frame Theme Grouping Helper

**Files:**
- Create: `utils/frameShowcase.ts`
- Create: `utils/frameShowcase.test.ts`

**Interfaces:**
- Consumes: `Post` from `types.ts`.
- Produces: `type FrameThemeGroup = { theme: string; posts: Post[] }`
- Produces: `function getFrameTheme(post: Pick<Post, 'tags'>): string`
- Produces: `function groupFramePostsByTheme(posts: Post[]): FrameThemeGroup[]`

- [ ] **Step 1: Write the failing test**

Create `utils/frameShowcase.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test utils/frameShowcase.test.ts`

Expected: FAIL because `utils/frameShowcase.ts` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create `utils/frameShowcase.ts`:

```ts
import type { Post } from '../types';

export type FrameThemeGroup = {
  theme: string;
  posts: Post[];
};

export function getFrameTheme(post: Pick<Post, 'tags'>): string {
  return post.tags.find((tag) => tag.trim())?.trim() || 'Unsorted';
}

export function groupFramePostsByTheme(posts: Post[]): FrameThemeGroup[] {
  const groups = new Map<string, Post[]>();

  posts.forEach((post) => {
    const theme = getFrameTheme(post);
    groups.set(theme, [...(groups.get(theme) || []), post]);
  });

  return Array.from(groups, ([theme, groupedPosts]) => ({ theme, posts: groupedPosts }));
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test utils/frameShowcase.test.ts`

Expected: PASS.

### Task 2: Frames Showcase Page

**Files:**
- Modify: `pages/CollectionPage.tsx`

**Interfaces:**
- Consumes: `groupFramePostsByTheme(posts: Post[]): FrameThemeGroup[]`
- Consumes: `getMediaURL(url?: string | null): string`
- Produces: Updated `FramesPage` UI.

- [ ] **Step 1: Add local frame tile components**

In `pages/CollectionPage.tsx`, import `groupFramePostsByTheme` and add local components:

```ts
import { groupFramePostsByTheme } from '../utils/frameShowcase';
```

Add `FrameImageFallback`, `FrameTile`, and `FrameThemeSection` near `ProjectCard`.

- [ ] **Step 2: Replace the current frames grid**

Inside `FramesPage`, derive:

```ts
const featuredPosts = posts.slice(0, 3);
const themeGroups = groupFramePostsByTheme(posts.slice(3));
```

Render featured posts first, then theme groups.

- [ ] **Step 3: Preserve existing behavior**

All tiles link to `#/article/${post.slug}`. Loading and empty states stay in place, with copy updated to match the approved design.

- [ ] **Step 4: Type-check through build**

Run: `npm run build`

Expected: PASS.

### Task 3: Visual Verification

**Files:**
- No code files unless verification reveals a layout issue.

**Interfaces:**
- Consumes: Vite app routes.
- Produces: verified `#/frames` route on desktop and mobile widths.

- [ ] **Step 1: Start dev server**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite prints a local URL.

- [ ] **Step 2: Inspect `#/frames`**

Open the route in the browser and verify:

- Header stays compact.
- Image grid is visible in the first viewport when posts exist.
- Tiles do not overlap text on mobile.
- Missing covers render a calm fallback.

- [ ] **Step 3: Stop dev server**

Stop the Vite process after verification.
