# Topic Browse Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a 37ORBIT homepage that keeps the editorial hero while exposing recent stories and tag-based topic sections on the first page.

**Architecture:** Add a pure homepage curation helper that sorts posts and groups them by the first non-empty tag. `Home.tsx` will fetch the existing homepage payload, settings, and full post list, then render the existing hero plus latest and topic sections. Static CMS records receive initial topic tags so the deployed site demonstrates the hierarchy with real content.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, Node test runner, static JSON CMS, Git/Cloudflare deployment.

## Global Constraints

- Keep all existing authored placeholder copy unchanged.
- Use tags for topics; category remains display metadata only.
- Do not add dependencies or fake content.
- Show no more than 6 posts in Latest Stories and every published post in its topic.
- Preserve reduced-motion and responsive behavior.

---

### Task 1: Homepage curation model

**Files:**
- Create: `utils/homepageCuration.ts`
- Test: `utils/homepageCuration.test.ts`

**Interfaces:**
- Produces: `sortHomepagePosts(posts: Post[]): Post[]`
- Produces: `groupHomepagePostsByTheme(posts: Post[]): Array<{ theme: string; posts: Post[] }>`

- [ ] Write tests proving newest-first sorting, first-tag grouping, blank-tag skipping, and “未分类” fallback.
- [ ] Run `node --test --experimental-strip-types utils/homepageCuration.test.ts` and verify the missing module/function failure.
- [ ] Implement the two pure helpers without mutating input arrays.
- [ ] Re-run the test and verify all assertions pass.

### Task 2: Browsable homepage UI

**Files:**
- Modify: `pages/Home.tsx`

**Interfaces:**
- Consumes: `contentService.getAllPosts()` with complete API pagination
- Consumes: `sortHomepagePosts()` and `groupHomepagePostsByTheme()`

- [ ] Extend homepage state and loading to retrieve all published posts without removing existing homepage/settings behavior.
- [ ] Render Latest Stories after the editorial feature, with a maximum of 6 real posts.
- [ ] Render every non-empty topic group with a heading, count, and all of its post links.
- [ ] Add responsive styles, lazy image loading below the hero, focus states, and line clamping.
- [ ] Confirm empty and partial-failure states keep the existing authored placeholders.

### Task 3: Initial topic metadata

**Files:**
- Modify: `public/cms/posts.json`
- Modify: `public/cms/posts/6th-live-dream-bloom-garden-party-bloom-garden-party-stage.json`
- Modify: `public/cms/posts/homo810.json`

**Interfaces:**
- Produces first-tag topics consumed by `groupHomepagePostsByTheme()`.

- [ ] Assign “现场与远行” to the concert travel record.
- [ ] Assign “异想与实验” to HOMO810.
- [ ] Validate all three JSON files with `jq empty` and confirm list/detail tags match.

### Task 4: Verification and deployment

**Files:**
- Verify all modified files.

- [ ] Run both Node test files and verify zero failures.
- [ ] Run `npx tsc --noEmit` and verify exit 0.
- [ ] Run `npm run build` and verify exit 0.
- [ ] Inspect desktop and 390px mobile renders; verify topics, links, images, and no horizontal overflow.
- [ ] Fetch `origin/main` again and integrate any new content commits without overwriting CMS data.
- [ ] Commit the scoped files, push the feature branch, merge to `main` with terminal Git, and push `main`.
- [ ] Poll the Cloudflare-served production URL until its built asset/content reflects the pushed commit, then verify `https://37orbit.com/` visually and structurally.
