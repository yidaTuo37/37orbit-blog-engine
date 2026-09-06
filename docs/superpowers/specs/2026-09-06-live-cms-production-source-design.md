# Production Live CMS Content Source

## Problem

The production frontend is built without `VITE_CONTENT_API_URL`. The content service therefore selects the bundled `/cms` JSON snapshot. Articles published in the NAS CMS are valid and publicly readable, but they do not appear on `37orbit.com` until the static snapshot is regenerated and the frontend is redeployed.

## Decision

Production builds will use `https://cms.37orbit.com` as the live content API origin. The existing static content source remains available only when explicitly selected for offline or recovery builds; a missing production setting must not silently select it.

## Data Flow

1. A post is published in the NAS CMS.
2. The frontend requests `https://cms.37orbit.com/api/homepage`, `/api/posts`, and `/api/posts/<slug>` at runtime with `cache: "no-store"`.
3. The CMS returns published content with its existing public CORS headers.
4. Root-relative `/media` URLs are resolved against the CMS origin.
5. A browser refresh displays the new post without regenerating frontend JSON files.

## Implementation

- Extract content-source selection into a small testable function.
- Make the live API source the production default through a committed public production environment setting.
- Preserve the static source behind an explicit static-mode setting instead of treating an absent API URL as static mode.
- Add a regression test proving that a production-like configuration selects the live API source and that static mode still requires an explicit opt-in.

## Error Handling

Existing request error states remain unchanged. The CMS already returns `Cache-Control: no-store` and `Access-Control-Allow-Origin: *` for public read endpoints. No credentials or secrets are embedded in the frontend bundle.

## Verification

- Run the focused content-source selection test and observe the red-green cycle.
- Run the complete frontend test suite and TypeScript/Vite production build.
- Inspect the production bundle for `https://cms.37orbit.com` and ensure it contains no secret values.
- Deploy through the repository's existing GitHub-to-Cloudflare workflow.
- Verify that `https://37orbit.com/#/article/1`, the Diary collection, and the homepage all display CMS post `1`.

