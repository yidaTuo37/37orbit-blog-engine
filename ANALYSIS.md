# 37ORBIT Blog Engine — 代码分析报告

> 评估对象：`37orbit-blog-engine`（Vite + React 19 + TypeScript + Tailwind 的前端站点）
> 评估日期：2026-06-12

## 一、它现在是什么

一个**纯客户端单页应用（SPA）**，部署到 Cloudflare Pages（`dist/`）。技术栈：Vite 6 + React 19 + TypeScript + Tailwind v4 + framer-motion。深空主题，标志色 `#FF791B`。

内容来源有**两条并行的管线**：

1. **Strapi v5（远程 CMS）** —— 首页文章列表与文章详情页。`services/api.ts` 从 `https://api.37orbit.com` 拉 `/api/articles`，文章正文走 Strapi 的 `context`（block JSON），经 `blocks.ts` 归一化为自定义的 *Block JSON v0.1*，再由 `BlockRenderer.tsx` 渲染。
2. **本地 Markdown（年度回顾）** —— `/annual/2025` 页面。`content/annual/2025/2025annual.md` 通过 Vite 的 `?raw` 在构建时内联，由 `data/annual2025.ts` 用正则切分成时间轴节点，再由 `MarkdownRenderer.tsx`（react-markdown + remark-gfm）渲染。

路由是 **App.tsx 里手写的 hash 路由**（`#/`、`#/article/:id`、`#/annual/2025`）。

**与你 NAS 无头系统的关系**：这个站现在的"内容后端"就是 Strapi（api.37orbit.com）。你正在做的 NAS CMS 本质上是要**取代 Strapi** 这个角色——这一点决定了下面几条建议的优先级。

## 二、做得好的地方

代码整体不糙，有几处是真正的亮点：

- **归一化层（`blocks.ts`）设计得很专业**。它把"CMS 返回的原始结构"和"前端渲染需要的结构"解耦，对字段做容错映射（image 的 url 在 `url/image.url/media.url/file.url` 都尝试），未知块不丢弃而是渲染成可见占位。这让你将来换 CMS（比如换成 NAS）时前端改动最小——这是这套代码最值钱的部分。
- **UX 细节到位**：阅读进度条、图片点击放大灯箱、懒加载、按图片真实宽高保持 `aspect-ratio` 防抖动、时间轴节点预加载下一张图。
- 空状态/加载骨架屏/错误态都有处理，列表请求把 404/403 当"暂无内容"而非报错，这个判断是对的。
- 设计系统统一（配色、字体、动效语言一致），年度时间轴的滚动叙事是个有想法的功能。

## 三、问题与风险（按优先级）

| 级别 | 问题 | 影响 |
|---|---|---|
| 🔴 高 | **纯 SPA，无 SSG/SSR** | 博客最致命的短板：SEO 几乎为零（爬虫/社交卡片拿不到内容）、首屏白屏等 JS、JS 失败即空页。`README_ASTRO.md` 里你自己也写了要迁到 Astro SSG，但还没做。 |
| 🔴 高 | **Hash 路由 + 强制跳根** | URL 形如 `站点/#/article/xxx`，不利于 SEO 和分享；且 `App.tsx` 把任何非 `/` 路径 `location.replace` 回根，深链/刷新会丢路由，Pages 上直接访问子路径会 404。 |
| 🔴 高 | **73MB 未优化图片进了仓库** | `public/annual/2025` 73MB，单张 PNG 13MB、JPG 3–7MB。git 记录里已有 "Compress image to meet Pages size limit"——你已经撞过 Cloudflare Pages 单文件 25MB 上限。没有 WebP/AVIF、没有响应式多尺寸，加载很重，仓库也被撑大。 |
| 🔴 高 | **Tailwind 三套配置打架** | ①`index.html` 里挂了 `cdn.tailwindcss.com`（开发用 CDN，不该上生产）；②`index.css` 用 v4 的 `@import "tailwindcss"` + `@tailwindcss/postcss`；③`tailwind.config.js` 是 v3 写法且用 `require()`（在 `type:module` 项目里大概率加载失败/被忽略）。结果是样式部分靠 CDN 兜底，开发/生产存在漂移，难复现。 |
| 🟡 中 | **配置文件重复/混乱** | `vite.config.ts` 与 `vite.config.js` 内容完全相同（Vite 选谁有歧义，删掉 `.js`）；`README.md` 还是 AI Studio 模板，与 `README_ASTRO.md` 自相矛盾。 |
| 🟡 中 | **GEMINI_API_KEY 被注入前端 bundle** | `vite.config` 用 `define` 把 `process.env.API_KEY/GEMINI_API_KEY` 打进客户端代码，但全站没用到。一旦真填了 key 就会**泄露到公开 bundle**。应删除。 |
| 🟡 中 | **两套渲染管线 + 死代码** | Strapi 走 block JSON，年度走 markdown，维护成本翻倍。`components/TimelineNode.tsx`（用 `dangerouslySetInnerHTML`）是旧版、已被 `annual2025.tsx` 内联版取代，未被引用；`SocialLinks` 在 `Layout` 里被注释。建议清理。 |
| 🟡 中 | **年度 markdown 解析器脆弱** | 靠正则 `split(/^# /)`、`split(/^### /)`，月份硬编码映射、年份写死 2025，扩展到 2026+ 要改代码。结构稍变就解析错位。 |
| 🟡 中 | **未提交的工作有丢失风险** | `git status`：`blocks.ts`、`BlockRenderer.tsx`、`vite.config.ts` 未跟踪，`ArticleDetail.tsx`、`types.ts` 已改未提交。整个 block 渲染重构都没进版本库。**先 commit。** |
| 🟢 低 | 杂项 | 全仓 `.DS_Store` 未忽略；`metadata.json` 给博客申请了 camera/microphone 权限（AI Studio 模板残留，无意义）；空占位文件 `strapi`、`my-strapi-v-5@0.1.0`；无错误边界、无 404 页、无测试/CI。 |

## 四、和 NAS 无头系统怎么衔接（关键建议）

你的 NAS CMS 存的是 **Markdown + LaTeX**，而这个前端目前有两条管线，其中 Strapi 那条用的是 block JSON。要让 NAS 干净地替换 Strapi，推荐：

1. **全站统一到 Markdown 管线**。你已经有一个成熟的 `MarkdownRenderer`，给它补上 KaTeX（数学公式）即可。让 NAS 的 `/api/posts/[slug]` 直接返回 markdown 或渲染好的 HTML，文章详情页改用 markdown 渲染，逐步淘汰 Strapi 的 block JSON 那一套。`blocks.ts` 的容错思路可以保留，但渲染目标收敛成一种。
2. **迁到 Astro 或 Next 的 SSG**（你本来的计划）。构建时从 NAS API 拉全部文章生成静态页 → 解决 SEO 和首屏，同时 Cloudflare Pages 仍可托管产物。
3. **图片彻底移出仓库**，改由 NAS 的 `/media` 提供（正好对应你 NAS 方案里的 nginx 媒体直供），并转 WebP + 响应式尺寸。一举解决 25MB 上限、仓库膨胀、加载慢三件事。
4. 把 hash 路由换成真实路径路由（Astro/Next 自带），删掉 `App.tsx` 里强制跳根那段。

## 五、最小可立即执行清单

不改架构、先止血的几件事：

1. `git add -A && git commit` 把未提交的 block 重构存档。
2. 删 `vite.config.js`（留 `.ts`）、删 `index.html` 里的 Tailwind CDN、删 `vite.config` 里的 GEMINI key 注入、删 `metadata.json` 的多余权限。
3. 修好 Tailwind v4 配置（用 v4 的 `@theme`/`@plugin` 方式接 typography，丢掉 v3 的 `tailwind.config.js` `require`）。
4. 把 `.DS_Store` 加进 `.gitignore` 并从仓库移除。
5. 大图先离线压缩成 WebP（过渡），长期改为从 NAS 取。

---

**一句话总结**：组件质量和归一化设计不错，UX 有亮点；但作为博客，"纯 SPA + hash 路由 + 73MB 图片进仓库 + Tailwind 配置打架" 是四个必须解决的硬伤。好消息是它和你正在做的 NAS CMS 天然契合——把内容后端从 Strapi 换成 NAS、统一到 Markdown、迁到 SSG，能一次性把这些问题大部分解决。
