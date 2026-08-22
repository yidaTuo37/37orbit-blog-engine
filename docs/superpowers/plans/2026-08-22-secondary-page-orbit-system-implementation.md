# 37ORBIT Secondary Page Orbit System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify all secondary and tertiary pages with the 37ORBIT homepage visual system and deploy the result.

**Architecture:** Keep the existing hash router and content service. Replace the old Tailwind-heavy secondary-page presentation with shared inline style tokens and reusable page primitives in `components/Layout.tsx` and `pages/CollectionPage.tsx`; make `ArticleDetail.tsx` use the same tokens and reading layout.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, existing Tailwind utilities, static/API content source, Cloudflare deployment through GitHub main.

## Global Constraints

- Preserve the existing hash routes and CMS data contract.
- Use the homepage palette: `#05070c`, `#0d1420`, `#f2f0ea`, `#8792a3`, `#ff7a45`, `#8fc5c9`.
- Keep body text at least 16px on mobile and all touch targets at least 44px.
- Keep all image areas aspect-ratio constrained and lazy-load below-the-fold images.
- Verify desktop 1280px and mobile 390px layouts before deployment.

### Task 1: Shared Layout and page primitives

**Files:**
- Modify: `components/Layout.tsx`
- Modify: `App.tsx` only if active-route nav state needs a stable helper

- [ ] Replace the old hidden navigation and blue/orange background blobs with a shared orbit top bar, active route state, responsive nav, background rings, and footer tokens matching `Home.tsx`.
- [ ] Keep existing external social/MKFS links, but restyle them as quiet orbit metadata links.
- [ ] Verify the Layout compiles and all non-home routes still render inside it.

### Task 2: Collection pages

**Files:**
- Modify: `pages/CollectionPage.tsx`

- [ ] Replace old shared `pageStyle`, `surfaceStyle`, and `PageHeader` values with the homepage tokens and a stable max-width container.
- [ ] Redesign Projects cards as editorial archive cards with numbered metadata and the homepage border/hover language.
- [ ] Redesign Frames featured grid and topic sections without changing grouping or links.
- [ ] Redesign Diary as a numbered archive list with title, category, year, summary, and focus-visible state.
- [ ] Keep loading, empty, and error states inside the shared orbit surface.

### Task 3: Article and project detail

**Files:**
- Modify: `pages/ArticleDetail.tsx`

- [ ] Replace old utility-heavy header and card styling with a shared orbit detail header, breadcrumb, title block, cover, reading column, and footer navigation.
- [ ] Preserve scroll progress, image click-to-preview, KaTeX CSS, and dangerous HTML rendering behavior.
- [ ] Ensure project details reuse the same detail template while retaining the Projects parent link.

### Task 4: Verification and deployment

**Files:**
- Test: existing `utils/*.test.ts`

- [ ] Run `node --test --experimental-strip-types utils/*.test.ts`.
- [ ] Run `npx tsc --noEmit`, `npm run build`, and `git diff --check`.
- [ ] Inspect home, Projects, Frames, Diary, one article, and one project detail at desktop and mobile widths.
- [ ] Commit the exact validated source, push `main`, poll production until the new bundle is live, and verify route structure and no horizontal overflow.
