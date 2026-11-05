import React, { useEffect, useState } from 'react';
import { cmsService, describeCmsError, getMediaURL } from '../services/api';
import { defaultSiteSettings as fallbackSettings } from '../services/defaultSettings';
import type { Category, Post, SiteSettings } from '../types';
import ArticleDetail from './ArticleDetail';
import './LayoutDemo.css';

/* ==========================================================================
   1. 基础配置与辅助函数 (Configuration & Helpers)
   ========================================================================== */

type View = string; // 'home' 或某个分类 slug

/** 旧路由别名 → 分类 slug（兼容已有链接） */
const legacyRouteMap: Record<string, string> = {
  photos: 'frame',
  journey: 'diary',
  projects: 'project',
};

/** 导航页面默认中文名称（CMS 未返回分类区时兜底） */
const defaultNavLabels: Record<string, string> = {
  home: '首页',
};

/** 依据分类区 slug 取可编辑名字，找不到时用兜底 */
function categoryName(categories: Category[], slug: string, fallback: string): string {
  return categories.find((category) => category.slug === slug)?.name || fallback;
}

/** 导航页面对应的哈希路由链接 */
function viewHref(view: string): string {
  return view === 'home' ? '#/' : `#/${view}`;
}

/** 生成文章详情页跳转链接 */
const postHref = (post: Post) => `#/article/${encodeURIComponent(post.slug)}`;

/** 侧边栏底部小列索引链接（来自 CMS「侧边栏链接」设置，JSON 数组） */
type SidebarLink = { label: string; href: string };
function parseSidebarLinks(raw: string): SidebarLink[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.label === 'string' && typeof item.href === 'string')
      .map((item) => ({ label: item.label as string, href: item.href as string }))
      .filter((item) => item.label && item.href);
  } catch {
    return [];
  }
}

/* ==========================================================================
   2. 通用 UI 部件 (Common UI Elements & Icons)
   ========================================================================== */

/** 箭头图标（支持水平方向与斜向右上方向） */
const Arrow = ({ diagonal = false }: { diagonal?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {diagonal ? (
      /* 斜向右上箭头 ↗ */
      <path d="M5 19 19 5M7 5h12v12" />
    ) : (
      /* 水平向右箭头 → */
      <path d="M4 12h16m-6-6 6 6-6 6" />
    )}
  </svg>
);

/** 37° Orbit 专属轨道 Logo 图标 */
const OrbitMark = ({ className = '' }: { className?: string }) => (
  <svg
    className={`orbit-logo-mark ${className}`}
    viewBox="0 0 80 80"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M57.7 13.1C45.8 5.2 29.6 6.7 19 17.3C6.5 29.8 6.5 50.2 19 62.7s32.9 12.5 45.4 0C72.6 54.5 74.5 43.6 71.1 34"
      stroke="currentColor"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    <path
      d="M22.83 52.94 57.17 27.06"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    <circle cx="67.68" cy="19.14" r="5" fill="#FF791B" />
  </svg>
);

/** 文章/封面图片组件（加载失败自动降级为占位符） */
const PostImage = ({ post }: { post: Post }) => {
  const [failed, setFailed] = useState(false);
  const url = getMediaURL(post.cover);

  if (!url || failed) {
    return (
      <div className="orbit-media-placeholder" aria-hidden="true">
        <OrbitMark />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

/** 数据加载状态/错误提示/空数据提示组件 */
function ArticleStatus({
  loading,
  error,
  empty,
}: {
  loading: boolean;
  error: string | null;
  empty?: string;
}) {
  if (loading) {
    return <p className="orbit-content-state">正在读取 CMS 内容…</p>;
  }
  if (error) {
    return (
      <p className="orbit-content-state orbit-content-error" role="alert">
        CMS 内容暂时无法加载：{error}
      </p>
    );
  }
  return empty ? <p className="orbit-content-state">{empty}</p> : null;
}

/** 区块标题栏组件（序号 / 英文小标 / 中文标题 / “查看全部”链接） */
const SectionHeading = ({
  index,
  title,
  note,
  link,
  linkText = '查看全部',
}: {
  index: string;
  title: string;
  note?: string;
  link?: string;
  linkText?: string;
}) => (
  <div className="orbit-section-heading">
    <div>
      {/* 序号与英文标注，例如：01 / PHOTO ARCHIVE */}
      <span className="orbit-section-index">
        {index} / {note}
      </span>
      {/* 中文大标题，例如：照片集 */}
      <h2>{title}</h2>
    </div>

    {/* 右侧跳转链接，例如：“查看全部 →” */}
    {link && (
      <a href={link} className="orbit-text-link">
        {linkText}
        <Arrow />
      </a>
    )}
  </div>
);

/* ==========================================================================
   3. 核心布局框架部件 (Shell: Sidebar, Topbar, Footer, MobileNav)
   ========================================================================== */

/**
 * 【页面左侧固定侧边栏】
 * 包含：Logo 品牌区、主导航菜单、底部标语与版权
 */
function Sidebar({
  view,
  isArticle,
  labels,
  navItems,
  settings,
}: {
  view: View;
  isArticle: boolean;
  labels: Record<string, string>;
  navItems: string[];
  settings: SiteSettings;
}) {
  const sidebarLinks = parseSidebarLinks(settings.sidebar_links);

  return (
    <aside className="orbit-sidebar">
      {/* --- 顶部品牌 Logo --- */}
      <a className="orbit-brand" href='#/' aria-label={`${settings.brand_name} ${settings.brand_sub} 首页`}>
        {settings.brand_logo_image ? (
          <img
            src={getMediaURL(settings.brand_logo_image)}
            alt={settings.brand_name}
            style={{ width: 54, height: 54, objectFit: 'contain', display: 'block', flex: 'none' }}
          />
        ) : (
          <OrbitMark />
        )}
        <div className="orbit-brand-name">
          <strong>{settings.brand_name}</strong>
          <small>{settings.brand_sub}</small>
        </div>
      </a>

      {/* 分隔线 */}
      <div className="orbit-sidebar-rule" />

      {/* --- 中部导航菜单项 --- */}
      <nav aria-label="页面导航">
        {navItems.map((item, i) => {
          const isActive = !isArticle && view === item;
          return (
            <a
              key={item}
              href={viewHref(item)}
              className={isActive ? 'active' : ''}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* 序号：01, 02, 03, 04 */}
              <span className="orbit-nav-num">0{i + 1}</span>
              {/* 中文名称：首页 / 照片库 / 旅程 / 项目 */}
              <span>{labels[item]}</span>
              {/* 选中或悬停时显示的箭头 */}
              <Arrow />
            </a>
          );
        })}
      </nav>

      {/* --- 底部：自定义链接小列 + 标语与版权 --- */}
      <div className="orbit-sidebar-foot">
        {sidebarLinks.length > 0 && (
          <ul className="orbit-sidebar-links">
            {sidebarLinks.map((link) => (
              <li key={`${link.label}-${link.href}`}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
        <p style={{ whiteSpace: 'pre-line' }}>{settings.sidebar_slogan}</p>
        <small>{settings.sidebar_copyright}</small>
      </div>
    </aside>
  );
}

/**
 * 【页面顶部栏 Topbar】
 * 包含：面包屑路径、右侧“阅读文章”快捷入口
 */
function Topbar({
  view,
  isArticle,
  labels,
  settings,
}: {
  view: View;
  isArticle: boolean;
  labels: Record<View, string>;
  settings: SiteSettings;
}) {
  return (
    <header className="orbit-topbar">
      {/* 左侧路径面包屑，例如：PERSONAL SPACE / 首页 */}
      <span>
        {settings.topbar_prefix} <b>/</b> {isArticle ? settings.topbar_article_label : labels[view]}
      </span>
    </header>
  );
}

/**
 * 【页面底部栏 Footer】
 * 包含：品牌名称、格言“KEEP LOOKING, KEEP MOVING.”、回到起点
 */
function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="orbit-footer">
      <strong>{settings.footer_brand}</strong>
      <span>{settings.footer_slogan}</span>
      <a href='#/'>{settings.footer_back_top}</a>
    </footer>
  );
}

/**
 * 【移动端底部固定导航条】
 * 仅在小屏幕 (<700px) 下显示
 */
function MobileNav({
  view,
  isArticle,
  labels,
  navItems,
}: {
  view: View;
  isArticle: boolean;
  labels: Record<string, string>;
  navItems: string[];
}) {

  return (
    <nav className="orbit-mobile-nav" aria-label="移动端页面导航">
      {navItems.map((item) => {
        const isActive = !isArticle && view === item;
        return (
          <a
            key={item}
            href={viewHref(item)}
            className={isActive ? 'active' : ''}
          >
            {labels[item]}
          </a>
        );
      })}
    </nav>
  );
}

/* ==========================================================================
   4. 各页面子视图 (Page Views)
   ========================================================================== */

/**
 * 4.1 【首页视图 HomeView】
 * 组成结构：
 * - Section 1: 首屏 Hero 介绍区 ("把经过的世界，慢慢收藏。")
 * - Section 2: 照片集预览区块 ("01 / PHOTO ARCHIVE" - 照片集)
 * - Section 3: 最近文章列表区块 ("02 / LATEST STORIES" - 最近文章)
 */
function HomeView({
  posts,
  frames,
  settings,
  categories,
  loading,
  error,
}: {
  posts: Post[];
  frames: Post[];
  settings: SiteSettings;
  categories: Category[];
  loading: boolean;
  error: string | null;
}) {
  return (
    <>
      {/* --------------------------------------------------------------------
          首页 - 部位 1: 首屏 Hero 区块
          主图与主文字来自 CMS「首页设置」，不可达时使用兜底文案。
          -------------------------------------------------------------------- */}
      <section className="orbit-home-hero">
        {/* 左侧文案与交互按钮 */}
        <div className="orbit-hero-copy">
          {/* 小标签 */}
          <span className="orbit-kicker">
            {settings.home_eyebrow}
          </span>

          {/* 首屏主标题 */}
          <h1 style={{ whiteSpace: 'pre-line' }}>{settings.home_title}</h1>

          {/* 首屏导言描述 */}
          <p style={{ whiteSpace: 'pre-line' }}>{settings.home_intro}</p>

          {/* 首屏底部元信息 */}
          <div className="orbit-hero-bottom">
            <span>{settings.home_hero_meta_start}</span>
            <span>{settings.home_hero_meta_end}</span>
          </div>
        </div>

        {/* 右侧视效背景图与大水印 */}
        <div className="orbit-hero-visual" aria-hidden="true">
          {settings.home_hero_image ? (
            <img
              src={getMediaURL(settings.home_hero_image)}
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="orbit-hero-graphic" style={{ position: 'absolute', inset: 0 }}>
              <span className="orbit-hero-caption">{settings.home_hero_watermark}</span>
            </div>
          )}
        </div>
      </section>

      {/* --------------------------------------------------------------------
          首页 - 部位 2: 照片集横向精选卡片
          区块标题："01 / PHOTO ARCHIVE" - 照片集
          -------------------------------------------------------------------- */}
      <section className="orbit-section orbit-home-collections">
        <SectionHeading
          index="01"
          note={settings.home_photos_note}
          title={settings.home_photos_title}
          link={viewHref('frame')}
        />

        {/* 前 3 张精选照片卡片展示 */}
        <div className="orbit-collection-strip">
          {frames.slice(0, 3).map((post, index) => (
            <a
              key={post.id}
              href={postHref(post)}
              className="orbit-collection-card"
            >
              <div className="orbit-collection-image">
                <PostImage post={post} />
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="orbit-collection-meta">
                <div>
                  <strong>{post.title}</strong>
                  <small>{post.category ? categoryName(categories, post.category, post.category) : ''}</small>
                </div>
                <Arrow diagonal />
              </div>
            </a>
          ))}
        </div>

        {/* CMS 内容为空或加载状态 */}
        {!frames.length && (
          <ArticleStatus
            loading={loading}
            error={error}
            empty={settings.empty_frames_label}
          />
        )}
      </section>

      {/* --------------------------------------------------------------------
          首页 - 部位 3: 最近文章列表预览
          区块标题："02 / LATEST STORIES" - 最近文章
          -------------------------------------------------------------------- */}
      <section className="orbit-section orbit-home-journey">
        <SectionHeading
          index="02"
          note={settings.home_stories_note}
          title={settings.home_stories_title}
          link={viewHref('diary')}
        />

        {/* 前 3 篇最新文章条目展示 */}
        <div className="orbit-journey-teasers">
          {posts.slice(0, 3).map((post, index) => (
            <a
              key={post.id}
              href={postHref(post)}
              className="orbit-journey-teaser"
            >
              <span>0{index + 1}</span>
              <PostImage post={post} />
              <div>
                <small>{post.category ? categoryName(categories, post.category, post.category) : settings.article_kicker_fallback}</small>
                <h3>{post.title}</h3>
              </div>
              <Arrow diagonal />
            </a>
          ))}
        </div>

        {/* CMS 内容为空或加载状态 */}
        {!posts.length && (
          <ArticleStatus
            loading={loading}
            error={error}
            empty={settings.empty_articles_label}
          />
        )}
      </section>
    </>
  );
}

/**
 * 4.2 【照片库视图 PhotosView】
 * 对应路由: #/photos
 * 标语："那些被留住的瞬间。"
 */
function PhotosView({
  posts,
  categories,
  settings,
  loading,
  error,
}: {
  posts: Post[];
  categories: Category[];
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
}) {
  return (
    <>
      {/* 页面顶部引言区 */}
      <div className="orbit-page-intro">
        <span className="orbit-kicker">{settings.photos_kicker}</span>
        <h1 style={{ whiteSpace: 'pre-line' }}>{settings.photos_title}</h1>
        <p style={{ whiteSpace: 'pre-line' }}>{settings.photos_intro}</p>
        <div className="orbit-intro-line">
          <span>{settings.photos_intro_left}</span>
          <span>{settings.photos_intro_right}</span>
        </div>
      </div>

      {/* 照片画廊网格列表区 */}
      <section className="orbit-section">
        <SectionHeading
          index="01"
          note={settings.photos_section_note}
          title={settings.photos_section_title}
        />

        <div className="orbit-story-grid">
          {posts.map((post, index) => (
            <a
              key={post.id}
              href={postHref(post)}
              className="orbit-story-card"
            >
              <div className="orbit-story-image">
                <PostImage post={post} />
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="orbit-story-body">
                <small>{post.category ? categoryName(categories, post.category, post.category) : ''}</small>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
                <span className="orbit-story-arrow">
                  <Arrow diagonal />
                </span>
              </div>
            </a>
          ))}
        </div>

        <ArticleStatus
          loading={loading}
          error={error}
          empty={posts.length ? undefined : settings.empty_frames_label}
        />
      </section>
    </>
  );
}

/**
 * 4.3 【旅程视图 JourneyView】
 * 对应路由: #/journey
 * 标语："走过的路，写成故事。"
 */
function JourneyView({
  posts,
  categories,
  settings,
  loading,
  error,
}: {
  posts: Post[];
  categories: Category[];
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
}) {
  return (
    <>
      {/* 页面顶部引言区 */}
      <div className="orbit-page-intro orbit-journey-intro">
        <span className="orbit-kicker">{settings.journey_kicker}</span>
        <h1 style={{ whiteSpace: 'pre-line' }}>{settings.journey_title}</h1>
        <p style={{ whiteSpace: 'pre-line' }}>{settings.journey_intro}</p>
        <div className="orbit-intro-line">
          <span>{settings.journey_intro_left}</span>
          <span>{settings.journey_intro_right}</span>
        </div>
      </div>

      {/* 旅程故事文章网格区 */}
      <section className="orbit-section orbit-journey-page">
        <SectionHeading
          index="01"
          note={settings.journey_section_note}
          title={settings.journey_section_title}
        />

        <div className="orbit-story-grid">
          {posts.map((post, index) => (
            <a
              key={post.id}
              href={postHref(post)}
              className="orbit-story-card"
            >
              <div className="orbit-story-image">
                <PostImage post={post} />
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="orbit-story-body">
                <small>{post.category ? categoryName(categories, post.category, post.category) : settings.article_kicker_fallback}</small>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
                <span className="orbit-story-arrow">
                  <Arrow diagonal />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {!posts.length && (
        <ArticleStatus
          loading={loading}
          error={error}
          empty={settings.empty_articles_label}
        />
      )}
    </>
  );
}

/**
 * 4.4 【项目视图 ProjectsView】
 * 对应路由: #/projects
 * 标语："想法落地，继续生长。"
 */
function ProjectsView({
  posts,
  categories,
  settings,
  loading,
  error,
}: {
  posts: Post[];
  categories: Category[];
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
}) {
  return (
    <>
      {/* 页面顶部引言区 */}
      <div className="orbit-page-intro">
        <span className="orbit-kicker">{settings.projects_kicker}</span>
        <h1 style={{ whiteSpace: 'pre-line' }}>{settings.projects_title}</h1>
        <p style={{ whiteSpace: 'pre-line' }}>{settings.projects_intro}</p>
        <div className="orbit-intro-line">
          <span>{settings.projects_intro_left}</span>
          <span>{settings.projects_intro_right}</span>
        </div>
      </div>

      {/* 项目列表行展示区 */}
      <section className="orbit-section">
        <SectionHeading
          index="01"
          note={settings.projects_section_note}
          title={settings.projects_section_title}
        />

        <div className="orbit-project-list">
          {posts.map((post, index) => (
            <a
              key={post.id}
              href={postHref(post)}
              className="orbit-project-row"
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <PostImage post={post} />
              <h3>{post.title}</h3>
              <small>{post.category ? categoryName(categories, post.category, post.category) : settings.article_kicker_fallback}</small>
              <Arrow diagonal />
            </a>
          ))}
        </div>
      </section>

      {!posts.length && (
        <ArticleStatus
          loading={loading}
          error={error}
          empty={settings.empty_projects_label}
        />
      )}
    </>
  );
}

/**
 * 4.5 【通用分类视图 CategoryView】
 * 页面文案与布局（grid / list）全部来自 CMS「分类区」的 settings。
 */
function CategoryView({
  category,
  posts,
  categories,
  settings,
  loading,
  error,
}: {
  category: Category;
  posts: Post[];
  categories: Category[];
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
}) {
  const page = category.settings;
  return (
    <>
      <div className="orbit-page-intro">
        <span className="orbit-kicker">{page.kicker}</span>
        <h1 style={{ whiteSpace: 'pre-line' }}>{page.title}</h1>
        <p style={{ whiteSpace: 'pre-line' }}>{page.intro}</p>
        <div className="orbit-intro-line">
          <span>{page.intro_left}</span>
          <span>{page.intro_right}</span>
        </div>
      </div>

      <section className="orbit-section">
        <SectionHeading index="01" note={page.section_note} title={page.section_title} />

        {page.layout === 'list' ? (
          <div className="orbit-project-list">
            {posts.map((post, index) => (
              <a key={post.id} href={postHref(post)} className="orbit-project-row">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <PostImage post={post} />
                <h3>{post.title}</h3>
                <small>
                  {post.category
                    ? categoryName(categories, post.category, post.category)
                    : settings.article_kicker_fallback}
                </small>
                <Arrow diagonal />
              </a>
            ))}
          </div>
        ) : (
          <div className="orbit-story-grid">
            {posts.map((post) => (
              <a
                key={post.id}
                href={postHref(post)}
                className={`orbit-story-card ${post.cover ? 'has-cover' : 'no-cover'}`}
              >
                {post.cover ? <PostImage post={post} /> : null}
                <span className="orbit-story-caption">
                  <small>
                    {post.category
                      ? categoryName(categories, post.category, post.category)
                      : settings.article_kicker_fallback}
                  </small>
                  <h3>{post.title}</h3>
                  {post.cover && post.summary ? <p>{post.summary}</p> : null}
                </span>
              </a>
            ))}
          </div>
        )}

        <ArticleStatus
          loading={loading}
          error={error}
          empty={posts.length ? undefined : settings.empty_articles_label}
        />
      </section>
    </>
  );
}

/* ==========================================================================
   5. 主布局入口组件 (LayoutDemo Main Component)
   ========================================================================== */

export default function LayoutDemo({ route }: { route: string }) {
  // --- 状态获取与管理 ---
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(fallbackSettings);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    cmsService
      .getArticles()
      .then((items) => {
        if (active) setPosts(items);
      })
      .catch((cause) => {
        if (active) setError(describeCmsError(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    cmsService
      .getSettings()
      .then((latest) => {
        if (active) setSettings(latest);
      })
      .catch(() => {});

    cmsService
      .getCategories()
      .then((items) => {
        if (active) setCategories(items);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // --- 动态导航：首页 + 所有分类 ---
  const navItems = ['home', ...categories.map((category) => category.slug)];
  const navLabels: Record<string, string> = {
    home: defaultNavLabels.home,
    ...Object.fromEntries(categories.map((category) => [category.slug, category.name])),
  };

  // --- 路由解析（兼容旧链接 #/photos、#/journey、#/projects） ---
  const isArticle = route.startsWith('#/article/');
  const rawView = route.replace(/^#\//, '').split('/')[0] || 'home';
  const view = legacyRouteMap[rawView] ?? rawView;
  const activeCategory = categories.find((category) => category.slug === view) ?? null;

  // --- 严格按分类筛选；未分类文章在首页「最近」兜底 ---
  const uncategorizedPosts = posts.filter((post) => !post.category);
  const framePosts = posts.filter((post) => post.category === 'frame');
  const categoryPosts = activeCategory
    ? posts.filter((post) => post.category === activeCategory.slug)
    : [];

  // --- 整体页面结构渲染 ---
  return (
    <div className="orbit-demo">
      {/* 1. 【左侧固定侧边栏】：Logo、主导航、底部格言 */}
      <Sidebar view={view} isArticle={isArticle} labels={navLabels} navItems={navItems} settings={settings} />

      {/* 2. 【右侧主内容区】 */}
      <div className="orbit-main">
        {/* 2.1 顶部导航栏：当前位置面包屑与快速跳转 */}
        <Topbar view={view} isArticle={isArticle} labels={navLabels} settings={settings} />

        {/* 2.2 主体页面内容：根据当前路由分发具体视图 */}
        <main>
          {isArticle ? (
            /* 文章详情页 */
            <ArticleDetail slug={route.slice('#/article/'.length)} settings={settings} />
          ) : view === 'home' || !activeCategory ? (
            /* 首页视图（未分类文章作为「最近」兜底） */
            <HomeView
              posts={uncategorizedPosts}
              frames={framePosts}
              settings={settings}
              categories={categories}
              loading={loading}
              error={error}
            />
          ) : (
            /* 分类页（严格按分类过滤，文案来自 CMS「分类区」） */
            <CategoryView
              category={activeCategory}
              posts={categoryPosts}
              categories={categories}
              settings={settings}
              loading={loading}
              error={error}
            />
          )}
        </main>

        {/* 2.3 页脚：标语与回到顶部 */}
        <Footer settings={settings} />
      </div>

      {/* 3. 【移动端底部固定悬浮导航】：仅在小屏幕时可见 */}
      <MobileNav view={view} isArticle={isArticle} labels={navLabels} navItems={navItems} />
    </div>
  );
}
