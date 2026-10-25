import React, { useEffect, useState } from 'react';
import { cmsService, getMediaURL } from '../services/api';
import type { Post } from '../types';
import ArticleDetail from './ArticleDetail';
import './LayoutDemo.css';

type View = 'home' | 'photos' | 'journey' | 'projects';

const photoBase = '/annual/2025/thumbs/';
const photos = [
  { image: 'IMG_5856.jpg', title: 'After dark', place: 'CITY / 01', shape: 'wide' },
  { image: '09550011.jpg', title: 'Somewhere quiet', place: 'MOMENTS / 02', shape: 'portrait' },
  { image: 'IMG_1116.jpg', title: 'Street notes', place: 'STREETS / 03', shape: 'portrait' },
  { image: 'IMG_0822.jpg', title: 'Light study', place: 'DETAILS / 04', shape: 'wide' },
  { image: '4I2A3618.jpg', title: 'Passing through', place: 'TRAVEL / 05', shape: 'wide' },
  { image: 'IMG_9941.jpg', title: 'Last light', place: 'SKY / 06', shape: 'portrait' },
];

const journeys = [
  { number: '01', title: '在路上，慢一点', subtitle: '关于出发与抵达之间的那些片刻。', image: 'IMG_1116.jpg', tag: 'TRAVEL NOTES' },
  { number: '02', title: '夜色有自己的语言', subtitle: '当城市的另一面开始醒来。', image: 'IMG_5856.jpg', tag: 'CITY DIARY' },
  { number: '03', title: '把日常留在相册里', subtitle: '一些无需特别理由的记录。', image: '09550011.jpg', tag: 'EVERYDAY' },
  { number: '04', title: '光落下来的地方', subtitle: '用镜头收集短暂的好天气。', image: 'IMG_0822.jpg', tag: 'PHOTO ESSAY' },
  { number: '05', title: '沿途所见', subtitle: '从一个街角走到下一个街角。', image: '4I2A3618.jpg', tag: 'FIELD NOTES' },
  { number: '06', title: '还未写完的地图', subtitle: '下一段旅程，总会有新的方向。', image: 'IMG_9941.jpg', tag: 'IN PROGRESS' },
];

const collections = [
  { title: 'After Dark', count: 'CITY LIGHTS', image: 'IMG_5856.jpg', index: '01' },
  { title: 'Street Notes', count: 'ON THE ROAD', image: 'IMG_1116.jpg', index: '02' },
  { title: 'Quiet Hours', count: 'SMALL MOMENTS', image: 'IMG_0822.jpg', index: '03' },
  { title: 'Everyday', count: 'LIFE IN FRAMES', image: '09550011.jpg', index: '04' },
];

const labels: Record<View, string> = {
  home: '首页', photos: '照片库', journey: '旅程', projects: '项目',
};

const hrefs: Record<View, string> = {
  home: '#/', photos: '#/photos', journey: '#/journey', projects: '#/projects',
};

const postHref = (post: Post) => `#/article/${encodeURIComponent(post.slug)}`;
const postImage = (post: Post, fallback: string) => getMediaURL(post.cover) || `${photoBase}${fallback}`;

const PostImage = ({ post, fallback }: { post: Post; fallback: string }) => {
  const localFallback = `${photoBase}${fallback}`;
  return <img src={postImage(post, fallback)} alt="" loading="lazy" onError={(event) => {
    const image = event.currentTarget;
    const current = image.getAttribute('src');
    const archived = post.cover?.startsWith('/media/') ? `/cms${post.cover}` : null;
    if (archived && current !== archived && current !== localFallback) image.src = archived;
    else if (current !== localFallback) image.src = localFallback;
  }} />;
};

function ArticleStatus({ loading, error, empty }: { loading: boolean; error: string | null; empty?: string }) {
  if (loading) return <p className="orbit-content-state">正在读取文章…</p>;
  if (error) return <p className="orbit-content-state orbit-content-error" role="alert">文章暂时无法加载：{error}</p>;
  return empty ? <p className="orbit-content-state">{empty}</p> : null;
}

const Arrow = ({ diagonal = false }: { diagonal?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {diagonal ? <path d="M5 19 19 5M7 5h12v12" /> : <path d="M4 12h16m-6-6 6 6-6 6" />}
  </svg>
);

const OrbitMark = ({ className = '' }: { className?: string }) => (
  <svg className={`orbit-logo-mark ${className}`} viewBox="0 0 80 80" fill="none" aria-hidden="true">
    <path d="M57.7 13.1C45.8 5.2 29.6 6.7 19 17.3C6.5 29.8 6.5 50.2 19 62.7s32.9 12.5 45.4 0C72.6 54.5 74.5 43.6 71.1 34" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M22.83 52.94 57.17 27.06" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    <circle cx="67.68" cy="19.14" r="5" fill="#FF791B" />
  </svg>
);

const Photo = ({ name, alt = '' }: { name: string; alt?: string }) => (
  <img src={`${photoBase}${name}`} alt={alt} loading="lazy" />
);

const SectionHeading = ({ index, title, note, link, linkText = '查看全部' }: { index: string; title: string; note?: string; link?: string; linkText?: string }) => (
  <div className="orbit-section-heading">
    <div><span className="orbit-section-index">{index} / {note}</span><h2>{title}</h2></div>
    {link && <a href={link} className="orbit-text-link">{linkText}<Arrow /></a>}
  </div>
);

function HomeView({ posts, loading, error }: { posts: Post[]; loading: boolean; error: string | null }) {
  return <>
    <section className="orbit-home-hero">
      <div className="orbit-hero-copy">
        <span className="orbit-kicker"><span className="orbit-pulse" /> A PERSONAL ARCHIVE · 37° ORBIT</span>
        <h1>把经过的世界，<br /><em>慢慢收藏。</em></h1>
        <p>一些照片，一些旅程，一些正在发生的想法。<br />这里是我的私人轨道，也是所有故事的起点。</p>
        <a className="orbit-primary-link" href={hrefs.photos}>开始探索 <Arrow /></a>
        <div className="orbit-hero-bottom"><span>EST. 2025</span><span>SCROLL TO EXPLORE ↓</span></div>
      </div>
      <div className="orbit-hero-visual"><Photo name="4I2A3618.jpg" alt="旅途中的影像" /><span className="orbit-photo-caption">FRAME 001 — LIFE IN MOTION</span><span className="orbit-hero-frame"><OrbitMark /></span></div>
    </section>

    <section className="orbit-section orbit-home-collections">
      <SectionHeading index="01" note="PHOTO ARCHIVE" title="照片集" link={hrefs.photos} />
      <div className="orbit-collection-strip">
        {collections.slice(0, 3).map((item) => <a href={hrefs.photos} className="orbit-collection-card" key={item.title}>
          <div className="orbit-collection-image"><Photo name={item.image} alt={`${item.title} 相册预览`} /><span>{item.index}</span></div>
          <div className="orbit-collection-meta"><div><strong>{item.title}</strong><small>{item.count}</small></div><Arrow diagonal /></div>
        </a>)}
      </div>
    </section>

    <section className="orbit-section orbit-home-journey">
      <SectionHeading index="02" note="LATEST STORIES" title="最近文章" link={hrefs.journey} />
      <div className="orbit-journey-teasers">
        {posts.slice(0, 3).map((post, index) => <a href={postHref(post)} className="orbit-journey-teaser" key={post.id}>
          <span>0{index + 1}</span><PostImage post={post} fallback="IMG_1116.jpg" /><div><small>{post.category || 'ARTICLE'}</small><h3>{post.title}</h3></div><Arrow diagonal />
        </a>)}
      </div>
      {!posts.length && <ArticleStatus loading={loading} error={error} empty="暂无已发布文章。" />}
    </section>
  </>;
}

function PhotosView({ posts, loading, error }: { posts: Post[]; loading: boolean; error: string | null }) {
  return <>
    <div className="orbit-page-intro"><span className="orbit-kicker">THE PHOTO LIBRARY / 001—∞</span><h1>那些被留住的<em>瞬间。</em></h1><p>从城市街头到遥远的风景，按主题与心情收集每一帧。</p><div className="orbit-intro-line"><span>PHOTO ARCHIVE</span><span>SCROLL TO DISCOVER ↓</span></div></div>
    <section className="orbit-section orbit-albums"><SectionHeading index="01" note="COLLECTIONS" title="按心情漫游" /><div className="orbit-album-grid">
      {collections.map((item) => <a href={hrefs.photos} onClick={(event) => { event.preventDefault(); document.getElementById('photo-moments')?.scrollIntoView({ behavior: 'smooth' }); }} className="orbit-album" key={item.title}><Photo name={item.image} alt={`${item.title} 相册`} /><span className="orbit-album-count">{item.count}</span><div><small>{item.index} / COLLECTION</small><h3>{item.title}</h3></div><span className="orbit-album-arrow"><Arrow diagonal /></span></a>)}
    </div></section>
    <section className="orbit-section orbit-moments" id="photo-moments"><SectionHeading index="02" note="MOMENTS" title="随手拍，也值得珍藏" /><div className="orbit-photo-grid">
      {photos.map((item, index) => <article className={`orbit-photo-tile ${item.shape}`} key={item.title}><div className="orbit-photo-image"><Photo name={item.image} alt={item.title} /><span>0{index + 1}</span></div><div className="orbit-photo-info"><h3>{item.title}</h3><small>{item.place}</small></div></article>)}
    </div></section>
    {posts.length > 0 && <section className="orbit-section"><SectionHeading index="03" note="PUBLISHED FRAMES" title="影像文章" /><div className="orbit-story-grid">{posts.map((post, index) => <a href={postHref(post)} className="orbit-story-card" key={post.id}><div className="orbit-story-image"><PostImage post={post} fallback={photos[index % photos.length].image} /><span>{String(index + 1).padStart(2, '0')}</span></div><div className="orbit-story-body"><small>PHOTO ESSAY</small><h3>{post.title}</h3><p>{post.summary}</p><span className="orbit-story-arrow"><Arrow diagonal /></span></div></a>)}</div></section>}
    {error && <section className="orbit-section"><ArticleStatus loading={loading} error={error} /></section>}
  </>;
}

function JourneyView({ posts, loading, error }: { posts: Post[]; loading: boolean; error: string | null }) {
  return <>
    <div className="orbit-page-intro orbit-journey-intro"><span className="orbit-kicker">THE JOURNEY / NOTES FROM ELSEWHERE</span><h1>走过的路，<em>写成故事。</em></h1><p>不是目的地清单，而是路上真实发生过的细小片刻。</p><div className="orbit-intro-line"><span>FIELD NOTES · 2025—NOW</span><span>KEEP WANDERING ↓</span></div></div>
    <section className="orbit-section orbit-journey-page"><SectionHeading index="01" note="ALL STORIES" title="旅程目录" /><div className="orbit-story-grid">
      {posts.map((post, index) => <a href={postHref(post)} className="orbit-story-card" key={post.id}><div className="orbit-story-image"><PostImage post={post} fallback={journeys[index % journeys.length].image} /><span>{String(index + 1).padStart(2, '0')}</span></div><div className="orbit-story-body"><small>{post.category || 'ARTICLE'}</small><h3>{post.title}</h3><p>{post.summary}</p><span className="orbit-story-arrow"><Arrow diagonal /></span></div></a>)}
    </div></section>
    {!posts.length && <ArticleStatus loading={loading} error={error} empty="暂无已发布文章。" />}
  </>;
}

function ProjectsView({ posts, loading, error }: { posts: Post[]; loading: boolean; error: string | null }) {
  return <>
    <div className="orbit-page-intro"><span className="orbit-kicker">SELECTED PROJECTS / THINGS IN PROGRESS</span><h1>想法落地，<em>继续生长。</em></h1><p>创作、实验与一些仍在打磨的计划。</p><div className="orbit-intro-line"><span>PROJECT INDEX</span><span>ALWAYS EVOLVING ↓</span></div></div>
    <section className="orbit-section"><SectionHeading index="01" note="SELECTED WORK" title="正在发生" /><div className="orbit-project-list">
      {posts.map((post, index) => <a href={postHref(post)} className="orbit-project-row" key={post.id}><span>{String(index + 1).padStart(2, '0')}</span><PostImage post={post} fallback="IMG_0822.jpg" /><h3>{post.title}</h3><small>{post.category || 'PROJECT'}</small><Arrow diagonal /></a>)}
    </div></section>
    {!posts.length && <ArticleStatus loading={loading} error={error} empty="暂无已发布项目。" />}
  </>;
}

export default function LayoutDemo({ route }: { route: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    cmsService.getArticles()
      .then((items) => { if (active) setPosts(items); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : '网络错误'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const isArticle = route.startsWith('#/article/');
  const view: View = route.includes('/photos') ? 'photos' : route.includes('/journey') ? 'journey' : route.includes('/projects') ? 'projects' : 'home';
  const journeyPosts = posts.filter((post) => post.category !== 'project' && post.category !== 'frame');
  const projectPosts = posts.filter((post) => post.category === 'project');
  const framePosts = posts.filter((post) => post.category === 'frame');
  return <div className="orbit-demo">
    <aside className="orbit-sidebar">
      <a className="orbit-brand" href={hrefs.home} aria-label="37 Orbit 首页"><OrbitMark /><div className="orbit-brand-name"><strong>37°</strong><small>ORBIT</small></div></a>
      <div className="orbit-sidebar-rule" />
      <nav aria-label="页面导航">{(['home', 'photos', 'journey', 'projects'] as View[]).map((item, i) => <a href={hrefs[item]} className={!isArticle && view === item ? 'active' : ''} aria-current={!isArticle && view === item ? 'page' : undefined} key={item}><span className="orbit-nav-num">0{i + 1}</span><span>{labels[item]}</span><Arrow /></a>)}</nav>
      <div className="orbit-sidebar-foot"><span className="orbit-sidebar-mark">✳</span><p>沿着自己的轨道，<br />收藏世界的片刻。</p><small>© 2026 37° ORBIT</small></div>
    </aside>
    <div className="orbit-main"><header className="orbit-topbar"><span>PERSONAL SPACE <b>/</b> {isArticle ? '文章' : labels[view]}</span><a href={hrefs.journey}>阅读文章 <Arrow diagonal /></a></header><main>{isArticle ? <ArticleDetail slug={route.slice('#/article/'.length)} /> : view === 'home' ? <HomeView posts={posts} loading={loading} error={error} /> : view === 'photos' ? <PhotosView posts={framePosts} loading={loading} error={error} /> : view === 'journey' ? <JourneyView posts={journeyPosts} loading={loading} error={error} /> : <ProjectsView posts={projectPosts} loading={loading} error={error} />}</main><footer className="orbit-footer"><strong>37° Orbit</strong><span>KEEP LOOKING, KEEP MOVING.</span><a href={hrefs.home}>回到起点 ↑</a></footer></div>
    <nav className="orbit-mobile-nav" aria-label="移动端页面导航">{(['home', 'photos', 'journey', 'projects'] as View[]).map((item) => <a href={hrefs[item]} className={!isArticle && view === item ? 'active' : ''} key={item}>{labels[item]}</a>)}</nav>
  </div>;
}
