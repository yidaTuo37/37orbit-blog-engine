
# 37ORBIT | Astro Implementation Guide

To move this from a React SPA to a formal Astro project for SSG:

### 1. Initialize
```bash
npm create astro@latest
# Selection: Use standard recommended settings, TypeScript enabled, Tailwind CSS added via integration.
npx astro add tailwind
```

### 2. Implementation logic
1. Move `types.ts` and `services/api.ts` to `src/lib/`.
2. Create `src/pages/index.astro`:
   - Use `const articles = await cmsService.getArticles();` in the frontmatter.
   - Loop through and render using your JSX components.
3. Create `src/pages/article/[slug].astro`:
   - Use `export async function getStaticPaths()`
   - Fetch all articles, return paths: `{ params: { slug: article.slug } }`.
   - In the same file, fetch the specific article in frontmatter using the slug.

### 3. Environment Variables
In Astro, use `import.meta.env.CMS_API_URL` and define it in `.env`.

### 4. Cloudflare Pages Deployment
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables: Set `CMS_API_URL` in the Cloudflare Dashboard.
