# Live CMS Production Source Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `37orbit.com` read published content from the live NAS CMS so post `1` appears immediately without regenerating static JSON.

**Architecture:** Keep both existing `ContentSource` implementations, but select the live API by default and require an explicit `static` mode for recovery builds. Commit the public production CMS origin so GitHub/Cloudflare production builds cannot silently fall back to the bundled `/cms` snapshot.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, Node test runner, NAS Next.js CMS, GitHub-to-Cloudflare deployment.

## Global Constraints

- Production API origin is exactly `https://cms.37orbit.com`.
- Public CMS requests remain credential-free and use the existing `Cache-Control: no-store` behavior.
- Static content remains available only through explicit `VITE_CONTENT_SOURCE=static` configuration.
- No secret or authentication value may be embedded in the frontend bundle.

---

### Task 1: Make content-source selection explicit

**Files:**
- Create: `services/contentSourceMode.ts`
- Create: `services/contentSourceMode.test.ts`
- Modify: `services/api.ts:1-6,129`
- Modify: `vite-env.d.ts:3-6`

**Interfaces:**
- Produces: `resolveContentSourceMode(value?: string): "api" | "static"`.
- Consumes: `import.meta.env.VITE_CONTENT_SOURCE` in `services/api.ts`.

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveContentSourceMode } from './contentSourceMode.ts';

describe('resolveContentSourceMode', () => {
  it('uses the live API when no source mode is configured', () => {
    assert.equal(resolveContentSourceMode(undefined), 'api');
  });

  it('uses static content only when explicitly requested', () => {
    assert.equal(resolveContentSourceMode('static'), 'static');
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test --experimental-strip-types services/contentSourceMode.test.ts`

Expected: FAIL because `services/contentSourceMode.ts` does not exist.

- [ ] **Step 3: Add the minimal selector**

```ts
export type ContentSourceMode = 'api' | 'static';

export function resolveContentSourceMode(value?: string): ContentSourceMode {
  return value === 'static' ? 'static' : 'api';
}
```

Update `services/api.ts`:

```ts
import { resolveContentSourceMode } from './contentSourceMode';

const CONTENT_SOURCE_MODE = resolveContentSourceMode(import.meta.env.VITE_CONTENT_SOURCE);

export const contentService = CONTENT_SOURCE_MODE === 'static'
  ? staticContentSource
  : orbitContentSource;
```

Update `vite-env.d.ts`:

```ts
readonly VITE_CONTENT_SOURCE?: 'api' | 'static';
```

- [ ] **Step 4: Run focused and existing tests and verify GREEN**

Run: `node --test --experimental-strip-types services/contentSourceMode.test.ts utils/*.test.ts`

Expected: all tests pass with zero failures.

- [ ] **Step 5: Commit**

```bash
git add services/contentSourceMode.ts services/contentSourceMode.test.ts services/api.ts vite-env.d.ts
git commit -m "fix: default frontend to live CMS source"
```

### Task 2: Pin the public production CMS origin

**Files:**
- Create: `.env.production`

**Interfaces:**
- Consumes: Vite production environment loading.
- Produces: `VITE_CONTENT_API_URL=https://cms.37orbit.com` and `VITE_CONTENT_SOURCE=api` in production builds.

- [ ] **Step 1: Add the production environment configuration**

```dotenv
VITE_CONTENT_API_URL=https://cms.37orbit.com
VITE_CONTENT_SOURCE=api
```

- [ ] **Step 2: Build and inspect the generated bundle**

Run: `npm run build`

Expected: Vite exits successfully.

Run: `rg -l 'https://cms\.37orbit\.com' dist/assets/*.js`

Expected: exactly one generated JavaScript bundle is listed.

Run: `rg -n 'GEMINI_API_KEY|SESSION_SECRET|ADMIN_PASSWORD' dist || true`

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add .env.production
git commit -m "fix: connect production frontend to NAS CMS"
```

### Task 3: Deploy and verify the original failure

**Files:**
- No source changes.

**Interfaces:**
- Consumes: the repository's GitHub-to-Cloudflare deployment triggered from `main`.
- Produces: a deployed frontend whose runtime API origin is `https://cms.37orbit.com`.

- [ ] **Step 1: Run complete local verification**

Run: `node --test --experimental-strip-types services/*.test.ts utils/*.test.ts && npm run build && git diff --check`

Expected: all tests pass, the build exits successfully, and `git diff --check` emits no errors.

- [ ] **Step 2: Push the verified branch to production**

Run: `git push origin HEAD:main`

Expected: the remote `main` branch advances to the verified implementation commit and triggers Cloudflare deployment.

- [ ] **Step 3: Wait for the production bundle to change**

Check `https://37orbit.com/` until its generated JavaScript asset hash differs from `index-BS5M9u_R.js`.

Expected: a new asset hash is served.

- [ ] **Step 4: Verify post `1` end to end**

Open and inspect:

```text
https://37orbit.com/
https://37orbit.com/#/diary
https://37orbit.com/#/article/1
```

Expected: the homepage main-work card shows title `1`; Diary includes title `1`; the detail page renders “这是一个测试。” without JSON parsing errors.

- [ ] **Step 5: Preserve evidence**

Run: `git status --short && git log -3 --oneline`

Expected: clean working tree and the two implementation commits above the design and plan commits.

