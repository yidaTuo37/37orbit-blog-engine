# Frames Showcase Design

Date: 2026-07-06
Project: 37orbit-blog-engine
Target route: `#/frames`

## Goal

Turn the Frames second-level page into an image-led showcase rather than a normal article index. The page should feel like an image room inside 37ORBIT: visual first, but still able to open into post detail pages when an image set needs written context.

## Context

The frontend already has:

- `#/frames` routed through `CollectionPage.tsx`.
- Public content loaded from `contentService.getPosts({ category: 'frame' })`.
- A shared `Post` model with `title`, `summary`, `tags`, `category`, `cover`, `html`, and dates.
- Existing article detail pages at `#/article/:slug`.
- Homepage frame slots (`frame-a`, `frame-b`) that already treat imagery as part of the exhibition concept.

The headless CMS already treats `frame` as a normal category, so the safest implementation is to reuse published posts as the data source and change only the frontend presentation.

## Chosen Approach

Use a hybrid layout:

1. The Frames page is a visual showcase.
2. Each showcased item is still a `Post`.
3. Clicking an item opens the existing article detail route.
4. Text appears as metadata and optional short context, not as the dominant surface.

This avoids a separate gallery data model while preserving room for image essays, notes, and short descriptions.

## Alternatives Considered

### Pure Photo Album

A dense grid or masonry wall of images.

Pros: visually direct, fast to understand.

Cons: weak support for context; images become isolated assets instead of authored entries. This does not match the current CMS model as well.

### Article Card List

Reuse the existing article-card pattern with cover, title, date, and summary.

Pros: lowest implementation cost.

Cons: too textual. It makes Frames feel like another writing list instead of an image-led section.

### Theme Showcase

Image-led layout with featured entries, thematic groupings, and compact context.

Pros: matches the exhibition direction of the homepage, keeps images primary, and still supports text-heavy entries when needed.

Cons: needs a more specific layout than a generic collection page.

Decision: use Theme Showcase.

## Page Structure

### Header

The page opens with a compact exhibition-style header:

- Eyebrow: `Frames`
- Title: `取景器外`
- Short line: `影像先作为现场感出现；需要说明时，再进入文字。`

The header should not become a marketing hero. It should introduce the room and leave the image grid visible in the first viewport.

### Featured Strip

If frame posts exist, the first two or three posts become a featured strip:

- First post: large visual tile.
- Second and third posts: smaller supporting tiles.
- Tiles use `cover` as the primary signal.
- Missing covers fall back to a quiet text surface, not a broken image.

Ordering follows the API order from `getPosts({ category: 'frame' })`, which already reflects the content backend's ordering.

### Theme Rows

Below the featured strip, all frame posts are grouped into lightweight themes inferred from tags:

- If a post has tags, its first tag becomes the theme label.
- If no tag exists, use `Unsorted`.
- Each theme renders a horizontal or responsive grid of image entries.

This gives the page a classified feel without requiring a new taxonomy.

### Image Entry

Each image entry shows:

- Cover image.
- Title.
- A short metadata line from category/year or first tag/year.
- Summary only when present, capped to a short line count.

The image remains dominant. Summary text should support interpretation, not turn the tile into an article card.

### Detail Behavior

Every entry links to `#/article/:slug`.

The existing article detail view remains the canonical place for:

- Longer image descriptions.
- Image essays.
- Markdown-rendered notes.
- Additional images embedded in post body.

No new detail route is needed.

## Empty State

If there are no frame posts:

- Show the existing page header.
- Show a restrained empty surface saying that no frames are published yet.
- Do not fake sample images.

## Data Flow

1. `FramesPage` calls `useCategoryPosts(['frame'])`.
2. The hook requests `contentService.getPosts({ category: 'frame' })`.
3. The page derives:
   - `featuredPosts = posts.slice(0, 3)`
   - `themeGroups` from the first tag of each post.
4. Links continue using `#/article/:slug`.

No API change is required.

## Components

Implementation can stay inside `pages/CollectionPage.tsx` unless the JSX becomes unwieldy. If extraction is needed, create small local helpers in the same file first:

- `FrameShowcaseTile`
- `FrameThemeSection`
- `groupPostsByFrameTheme`

Avoid introducing a new global component unless another page will reuse it.

## Visual Direction

Use the current 37ORBIT visual language:

- Dark exhibition background.
- Orange accent for small labels and focus states.
- Pale cyan can remain a secondary frames accent.
- Large, stable image rectangles.
- No decorative gradient blobs.
- No card-inside-card structure.

Tiles may have subtle borders and overlays, but the images should read clearly.

## Responsive Behavior

Desktop:

- Featured strip uses an asymmetric grid.
- Theme rows use 2 to 3 columns depending on width.

Mobile:

- Featured strip collapses to a single column.
- Theme entries become stacked image tiles.
- Text must not overlap images or controls.

## Testing

Run:

- `npm run build`

Manual verification:

- `#/frames` shows a visual showcase when frame posts exist.
- `#/frames` shows a clean empty state when no frame posts exist.
- Tile clicks open `#/article/:slug`.
- Missing cover values do not break layout.
- Mobile width does not produce text overlap.

## Non-Goals

- Do not add a separate gallery API.
- Do not add masonry layout dependency.
- Do not add a new image upload flow.
- Do not change the article detail route.
- Do not change headless CMS data model.
