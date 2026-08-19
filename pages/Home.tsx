import React, { useEffect, useRef, useState } from 'react';
import { contentService, getMediaURL } from '../services/api';
import { HomepageContent, Post, SiteSettings } from '../types';
import { prepareHomepageBrowse } from '../utils/homepageCuration';
import { withMinimumDelay } from '../utils/loading';

const emptySettings: SiteSettings = {
  home_eyebrow: '',
  home_title: '',
  home_intro: '',
  statement_label: '',
  statement_body: '',
  wall_labels_label: '',
  curator_label: '',
  curator_body: '',
  curator_meta: '',
};

const emptyMainWork = {
  href: '#/projects',
  title: '商家正在备餐',
  meta: '',
};

const emptyFrames = {
  frameA: {
    title: '商家正在备餐',
    meta: '',
  },
  frameB: {
    title: '商家正在备餐',
    meta: '',
  },
};

function postHref(post: Post | null, fallback: string) {
  if (!post) return fallback;
  if (post.category === 'frame') return '#/frames';
  return `#/article/${post.slug}`;
}

function postMeta(post: Post | null, fallback: string) {
  if (!post) return fallback;
  return `${post.category || 'Post'} / ${new Date(post.updated_at || post.created_at).getFullYear()}`;
}

function renderLines(value: string) {
  const lines = value.split('\n');
  return lines.map((line, index) => (
    <React.Fragment key={`${line}-${index}`}>
      {line}
      {index < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}

function postTheme(post: Post) {
  return post.tags.find((tag) => tag.trim())?.trim() || '未分类';
}

const HomepagePostCard: React.FC<{ post: Post; compact?: boolean; lead?: boolean }> = ({
  post,
  compact = false,
  lead = false,
}) => {
  const cover = getMediaURL(post.cover);

  return (
    <a
      href={`#/article/${post.slug}`}
      className={`orbit-story${compact ? ' orbit-story-compact' : ''}${lead ? ' orbit-story-lead' : ''}`}
    >
      <div className="orbit-story-visual">
        {cover ? (
          <img src={cover} alt="" loading="lazy" decoding="async" />
        ) : (
          <div className="orbit-story-empty">NO VISUAL SIGNAL</div>
        )}
      </div>
      <div className="orbit-story-copy">
        <div className="orbit-story-meta">
          <span>{postTheme(post)}</span>
          <span>{postMeta(post, '')}</span>
        </div>
        <h3>{post.title}</h3>
        {!compact && post.summary && <p>{post.summary}</p>}
      </div>
    </a>
  );
};

const Home: React.FC = () => {
  const [homepage, setHomepage] = useState<HomepageContent | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let active = true;
    const loadHomepage = () => {
      const requestId = ++requestIdRef.current;
      withMinimumDelay(
        Promise.allSettled([
          contentService.getHomepage(),
          contentService.getSettings(),
          contentService.getAllPosts(),
        ]),
      ).then(([homepageResult, settingsResult, postsResult]) => {
          if (!active || requestId !== requestIdRef.current) return;
          if (homepageResult.status === 'fulfilled') setHomepage(homepageResult.value);
          if (settingsResult.status === 'fulfilled') {
            setSettings({ ...emptySettings, ...settingsResult.value });
          }
          if (postsResult.status === 'fulfilled') setPosts(postsResult.value);
        });
    };
    const reloadWhenVisible = () => {
      if (document.visibilityState === 'visible') loadHomepage();
    };

    loadHomepage();
    window.addEventListener('focus', loadHomepage);
    document.addEventListener('visibilitychange', reloadWhenVisible);

    return () => {
      active = false;
      window.removeEventListener('focus', loadHomepage);
      document.removeEventListener('visibilitychange', reloadWhenVisible);
    };
  }, []);

  const mainWork = homepage?.mainWork;
  const frameA = homepage?.frames.frameA;
  const frameB = homepage?.frames.frameB;
  const mainWorkCover = getMediaURL(mainWork?.cover);
  const frameACover = getMediaURL(frameA?.cover);
  const frameBCover = getMediaURL(frameB?.cover);
  const wallLabels = homepage?.wallLabels.length
    ? homepage.wallLabels.map((post, index) => ({
        title: post.title,
        meta: postMeta(post, `Wall Label / ${index + 1}`),
        href: `#/article/${post.slug}`,
      }))
    : [];
  const { latestPosts, themeGroups } = prepareHomepageBrowse(posts, mainWork?.slug);
  const [latestLead, ...latestRest] = latestPosts;

  return (
    <main className="orbit-page">
      <style>{`
        .orbit-page {
          --bg: #05070c;
          --surface: #0d1420;
          --text: #f2f0ea;
          --muted: #8792a3;
          --line: rgba(213, 224, 239, 0.15);
          --line-strong: rgba(213, 224, 239, 0.34);
          --orange: #ff7a45;
          --cyan: #8fc5c9;
          min-height: 100dvh;
          overflow-x: clip;
          color: var(--text);
          background: var(--bg);
          font-family: Inter, system-ui, sans-serif;
        }

        .orbit-page::before {
          content: "";
          position: fixed;
          z-index: 0;
          left: 50%;
          bottom: -54vw;
          width: 112vw;
          height: 78vw;
          border: 1px solid rgba(143, 197, 201, 0.18);
          border-radius: 50%;
          transform: translateX(-50%);
          pointer-events: none;
          box-shadow: 0 -34px 120px rgba(255, 122, 69, 0.12), 0 -4px 42px rgba(143, 197, 201, 0.1);
        }

        .orbit-page::after {
          content: "";
          position: fixed;
          z-index: 0;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(80% 34% at 50% 104%, rgba(255, 122, 69, 0.14), transparent 67%),
            linear-gradient(90deg, transparent 49.95%, rgba(213, 224, 239, 0.045) 50%, transparent 50.05%);
        }

        .orbit-page a { color: inherit; text-decoration: none; }
        .orbit-page a:focus-visible { outline: 2px solid var(--orange); outline-offset: 5px; }
        .orbit-page img { display: block; width: 100%; height: 100%; object-fit: cover; }

        .orbit-shell {
          position: relative;
          z-index: 1;
          width: min(1480px, calc(100vw - 64px));
          margin: 0 auto;
          padding: 22px 0 64px;
        }

        .orbit-topbar {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          min-height: 64px;
          border-bottom: 1px solid var(--line);
        }

        .orbit-brand {
          font: 700 28px/1 "Space Grotesk", sans-serif;
          letter-spacing: -0.055em;
        }

        .orbit-brand sup {
          margin-left: 8px;
          color: var(--orange);
          font: 500 9px/1 ui-monospace, monospace;
          letter-spacing: 0.08em;
          vertical-align: top;
        }

        .orbit-nav { display: flex; align-self: stretch; }
        .orbit-nav a {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 126px;
          padding: 0 18px;
          border-left: 1px solid var(--line);
          color: var(--muted);
          font: 600 11px/1 "Space Grotesk", sans-serif;
          letter-spacing: 0.12em;
          transition: color 180ms ease, border-color 180ms ease;
        }

        .orbit-nav a span { color: var(--orange); font-family: ui-monospace, monospace; }
        .orbit-nav a:hover { color: var(--text); border-color: var(--orange); }

        .orbit-hero {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 20px;
          padding: clamp(54px, 8vw, 126px) 0 clamp(58px, 8vw, 112px);
        }

        .orbit-hero-copy { grid-column: 1 / span 9; }
        .orbit-eyebrow,
        .orbit-kicker,
        .orbit-meta,
        .orbit-telemetry,
        .orbit-index {
          color: var(--muted);
          font: 500 10px/1.4 "SF Mono", "JetBrains Mono", ui-monospace, monospace;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .orbit-eyebrow { color: var(--cyan); }
        .orbit-hero h1 {
          max-width: 11ch;
          margin: 18px 0 0;
          font: 400 clamp(52px, 8vw, 132px)/0.88 "Noto Serif SC", Georgia, serif;
          letter-spacing: -0.065em;
        }

        .orbit-hero p {
          max-width: 650px;
          margin: 28px 0 0;
          color: var(--muted);
          font-size: 16px;
          line-height: 1.8;
        }

        .orbit-telemetry {
          grid-column: 10 / span 3;
          align-self: end;
          display: grid;
          gap: 9px;
          padding-bottom: 8px;
        }

        .orbit-telemetry div { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid var(--line); padding-bottom: 8px; }
        .orbit-telemetry b { color: var(--text); font-weight: 500; }

        .orbit-board {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 22px;
          border-top: 1px solid var(--line);
          padding-top: 22px;
        }

        .orbit-feature { grid-column: 1 / span 8; }
        .orbit-rail { grid-column: 9 / span 4; display: flex; flex-direction: column; border-left: 1px solid var(--line); padding-left: 22px; }
        .orbit-section-head { display: flex; align-items: center; justify-content: space-between; min-height: 34px; margin-bottom: 12px; }
        .orbit-section-head .orbit-index { color: var(--orange); }

        .orbit-media {
          position: relative;
          display: block;
          min-height: 530px;
          overflow: hidden;
          border-radius: 20px;
          background: var(--surface);
        }

        .orbit-media > img { position: absolute; inset: 0; transition: transform 320ms ease; }
        .orbit-media:hover > img { transform: scale(1.02); }
        .orbit-empty {
          display: grid;
          place-items: center;
          height: 100%;
          min-height: inherit;
          color: rgba(242, 240, 234, 0.43);
          font: 500 11px/1 ui-monospace, monospace;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          background:
            linear-gradient(135deg, rgba(143, 197, 201, 0.08), transparent 42%),
            radial-gradient(circle at 80% 110%, rgba(255, 122, 69, 0.16), transparent 40%),
            repeating-linear-gradient(90deg, transparent 0, transparent calc(25% - 1px), rgba(213, 224, 239, 0.04) 25%);
        }

        .orbit-caption {
          position: absolute;
          inset: auto 0 0;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: end;
          gap: 24px;
          padding: 84px 24px 24px;
          background: linear-gradient(transparent, rgba(5, 7, 12, 0.9));
        }

        .orbit-caption-title,
        .orbit-list-title {
          display: -webkit-box;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          font-family: "Noto Serif SC", Georgia, serif;
        }

        .orbit-caption-title { font-size: clamp(24px, 3vw, 42px); line-height: 1.06; }
        .orbit-meta { letter-spacing: 0.05em; }

        .orbit-note { padding: 18px 0 32px; border-bottom: 1px solid var(--line); }
        .orbit-note:first-child { padding-top: 0; }
        .orbit-note-label { display: flex; justify-content: space-between; gap: 12px; color: var(--orange); font: 500 11px/1.4 ui-monospace, monospace; }
        .orbit-note-label::after { content: "+"; color: var(--muted); }
        .orbit-manifesto { max-width: 10ch; margin-top: 28px; font: 400 clamp(30px, 3.4vw, 50px)/1 "Noto Serif SC", Georgia, serif; letter-spacing: -0.045em; }

        .orbit-writing { flex: 1; padding-top: 32px; }
        .orbit-writing-label { color: var(--cyan); margin-bottom: 12px; font: 500 11px/1.4 ui-monospace, monospace; }
        .orbit-list a { display: grid; grid-template-columns: 32px 1fr; gap: 14px; padding: 18px 0; border-top: 1px solid var(--line); transition: border-color 180ms ease; }
        .orbit-list a:hover { border-color: var(--orange); }
        .orbit-list-title { font-size: 20px; line-height: 1.35; }

        .orbit-lower {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 22px;
          margin-top: 42px;
          padding-top: 22px;
          border-top: 1px solid var(--line);
        }

        .orbit-filmstrip { grid-column: 1 / span 8; }
        .orbit-frames { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 8px; padding: 8px; border: 1px solid var(--line); border-radius: 12px; }
        .orbit-frame { min-height: 274px; border-radius: 7px; }
        .orbit-frame .orbit-caption { padding: 58px 14px 14px; }
        .orbit-frame .orbit-caption-title { font-size: 17px; }
        .orbit-frame .orbit-meta { font-size: 9px; }

        .orbit-curator { grid-column: 9 / span 4; display: flex; flex-direction: column; justify-content: space-between; padding: 8px 0 8px 22px; border-left: 1px solid var(--line); }
        .orbit-curator-label { color: var(--cyan); font: 500 11px/1.4 ui-monospace, monospace; }
        .orbit-curator-copy { max-width: 13ch; margin: 42px 0 24px; font: 400 clamp(28px, 3vw, 44px)/1.05 "Noto Serif SC", Georgia, serif; letter-spacing: -0.04em; }
        .orbit-footer-line { grid-column: 1 / -1; display: flex; justify-content: space-between; margin-top: 40px; padding-top: 14px; border-top: 1px solid var(--line); }

        .orbit-browse {
          grid-column: 1 / -1;
          margin-top: clamp(78px, 10vw, 150px);
        }

        .orbit-browse-title {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: end;
          gap: 24px;
          margin-bottom: 28px;
          padding: 0 0 18px;
          border-bottom: 1px solid var(--line);
        }

        .orbit-browse-title h2,
        .orbit-topic-head h2 {
          margin: 8px 0 0;
          font: 400 clamp(40px, 6vw, 86px)/0.94 "Noto Serif SC", Georgia, serif;
          letter-spacing: -0.055em;
        }

        .orbit-latest-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.55fr);
          gap: 10px;
        }

        .orbit-latest-grid-solo { grid-template-columns: 1fr; }
        .orbit-latest-stack { display: grid; gap: 10px; }

        .orbit-story {
          display: grid;
          min-width: 0;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: rgba(13, 20, 32, 0.72);
          transition: border-color 180ms ease, transform 180ms ease;
        }

        .orbit-story:hover { border-color: var(--line-strong); transform: translateY(-2px); }
        .orbit-story-visual { position: relative; min-height: 210px; overflow: hidden; background: var(--surface); }
        .orbit-story-visual img { position: absolute; inset: 0; transition: transform 320ms ease; }
        .orbit-story:hover .orbit-story-visual img { transform: scale(1.02); }
        .orbit-story-empty { display: grid; place-items: center; min-height: inherit; color: rgba(242,240,234,0.32); font: 500 10px/1 ui-monospace, monospace; letter-spacing: 0.16em; background: linear-gradient(135deg, rgba(143,197,201,0.07), transparent 44%), radial-gradient(circle at 80% 110%, rgba(255,122,69,0.14), transparent 42%); }
        .orbit-story-copy { padding: 20px; }
        .orbit-story-meta { display: flex; justify-content: space-between; gap: 18px; color: var(--muted); font: 500 10px/1.4 ui-monospace, monospace; letter-spacing: 0.08em; text-transform: uppercase; }
        .orbit-story-meta span:first-child { color: var(--cyan); }
        .orbit-story h3 { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 3; margin: 18px 0 0; font: 400 clamp(23px, 2.4vw, 38px)/1.08 "Noto Serif SC", Georgia, serif; letter-spacing: -0.035em; }
        .orbit-story p { margin: 16px 0 0; color: var(--muted); font-size: 16px; line-height: 1.7; }

        .orbit-story-lead { grid-template-rows: minmax(360px, 1fr) auto; }
        .orbit-story-lead .orbit-story-visual { min-height: 360px; }
        .orbit-story-lead h3 { font-size: clamp(34px, 4.5vw, 66px); max-width: 17ch; }
        .orbit-story-compact { grid-template-columns: 148px minmax(0, 1fr); }
        .orbit-story-compact .orbit-story-visual { min-height: 156px; }
        .orbit-story-compact .orbit-story-copy { padding: 16px; }
        .orbit-story-compact h3 { margin-top: 12px; font-size: clamp(18px, 1.8vw, 25px); }
        .orbit-story-compact .orbit-story-meta span:last-child { display: none; }

        .orbit-topics { grid-column: 1 / -1; margin-top: clamp(88px, 12vw, 170px); }
        .orbit-topics-intro { max-width: 680px; margin: 18px 0 0; color: var(--muted); font-size: 16px; line-height: 1.75; }
        .orbit-topic { margin-top: 72px; padding-top: 20px; border-top: 1px solid var(--line); }
        .orbit-topic-head { display: grid; grid-template-columns: 72px 1fr auto; align-items: end; gap: 22px; margin-bottom: 28px; }
        .orbit-topic-head h2 { font-size: clamp(38px, 5vw, 72px); }
        .orbit-topic-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
        .orbit-topic-grid .orbit-story:nth-child(4n + 1) { grid-column: span 2; }
        .orbit-topic-grid .orbit-story:nth-child(4n + 1) .orbit-story-visual { min-height: 320px; }

        @media (max-width: 960px) {
          .orbit-shell { width: min(100vw - 32px, 1480px); }
          .orbit-topbar { grid-template-columns: 1fr; }
          .orbit-brand { min-height: 60px; display: flex; align-items: center; }
          .orbit-nav { border-top: 1px solid var(--line); }
          .orbit-nav a { flex: 1; min-width: 0; min-height: 48px; padding: 0 10px; border-left: 0; border-right: 1px solid var(--line); }
          .orbit-hero-copy { grid-column: 1 / span 8; }
          .orbit-telemetry { grid-column: 9 / span 4; }
          .orbit-feature, .orbit-filmstrip { grid-column: 1 / span 7; }
          .orbit-rail, .orbit-curator { grid-column: 8 / span 5; }
          .orbit-media { min-height: 470px; }
          .orbit-latest-grid { grid-template-columns: 1fr; }
          .orbit-latest-stack { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .orbit-story-compact { grid-template-columns: 1fr; }
          .orbit-topic-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .orbit-topic-grid .orbit-story:nth-child(4n + 1) { grid-column: auto; }
        }

        @media (max-width: 700px) {
          .orbit-shell { width: calc(100vw - 24px); padding-top: 8px; }
          .orbit-brand { font-size: 24px; }
          .orbit-nav a { justify-content: center; gap: 6px; font-size: 10px; letter-spacing: 0.05em; }
          .orbit-hero { gap: 0; padding: 62px 0 66px; }
          .orbit-hero-copy, .orbit-telemetry { grid-column: 1 / -1; }
          .orbit-hero h1 { font-size: clamp(48px, 17vw, 78px); }
          .orbit-telemetry { margin-top: 52px; }
          .orbit-board { grid-template-columns: 1fr; gap: 0; }
          .orbit-feature, .orbit-rail, .orbit-lower, .orbit-filmstrip, .orbit-curator { grid-column: 1; }
          .orbit-media { min-height: 470px; }
          .orbit-caption { grid-template-columns: 1fr; gap: 8px; padding: 76px 16px 16px; }
          .orbit-rail { margin-top: 42px; padding: 22px 0 0; border-left: 0; border-top: 1px solid var(--line); }
          .orbit-lower { grid-template-columns: 1fr; margin-top: 52px; }
          .orbit-frames { grid-template-columns: 1fr; }
          .orbit-frame { min-height: 260px; }
          .orbit-curator { margin-top: 42px; padding: 22px 0 0; border-left: 0; border-top: 1px solid var(--line); }
          .orbit-footer-line { gap: 20px; }
          .orbit-browse-title { grid-template-columns: 1fr; }
          .orbit-latest-stack, .orbit-topic-grid { grid-template-columns: 1fr; }
          .orbit-story-lead { grid-template-rows: minmax(300px, auto) auto; }
          .orbit-story-lead .orbit-story-visual { min-height: 300px; }
          .orbit-story-compact { grid-template-columns: 112px minmax(0, 1fr); }
          .orbit-story-compact .orbit-story-visual { min-height: 150px; }
          .orbit-story-copy { padding: 16px; }
          .orbit-story h3 { font-size: 23px; }
          .orbit-story-lead h3 { font-size: 34px; }
          .orbit-topic-head { grid-template-columns: 44px 1fr auto; gap: 12px; }
          .orbit-topic { margin-top: 56px; }
          .orbit-topic-grid .orbit-story:nth-child(4n + 1) .orbit-story-visual { min-height: 210px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .orbit-page *, .orbit-page *::before, .orbit-page *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
          .orbit-media:hover > img { transform: none; }
        }
      `}</style>

      <div className="orbit-shell">
        <header className="orbit-topbar">
          <a className="orbit-brand" href="#/">37ORBIT<sup>FIELD NOTES</sup></a>
          <nav className="orbit-nav" aria-label="主要导航">
            <a href="#/projects"><span>01</span> PROJECTS</a>
            <a href="#/frames"><span>02</span> FRAMES</a>
            <a href="#/diary"><span>03</span> DIARY</a>
          </nav>
        </header>

        <section className="orbit-hero">
          <div className="orbit-hero-copy">
            <div className="orbit-eyebrow">{settings?.home_eyebrow ?? ''}</div>
            <h1>{settings ? renderLines(settings.home_title) : null}</h1>
            <p>{settings?.home_intro ?? ''}</p>
          </div>
          <div className="orbit-telemetry" aria-label="站点信息">
            <div><span>SECTOR</span><b>37° ORBIT</b></div>
            <div><span>MODE</span><b>ARCHIVE</b></div>
            <div><span>STATUS</span><b>RECEIVING</b></div>
          </div>
        </section>

        <section className="orbit-board">
          <section className="orbit-feature">
            <div className="orbit-section-head"><span className="orbit-kicker">CURRENT SIGNAL</span><span className="orbit-index">01 / 04</span></div>
            <a href={postHref(mainWork ?? null, emptyMainWork.href)} className="orbit-media">
              {mainWorkCover ? <img src={mainWorkCover} alt={mainWork?.title || emptyMainWork.title} /> : <div className="orbit-empty">Something here?</div>}
              <div className="orbit-caption">
                <div className="orbit-caption-title">{mainWork?.title || emptyMainWork.title}</div>
                <div className="orbit-meta">{postMeta(mainWork ?? null, emptyMainWork.meta)}</div>
              </div>
            </a>
          </section>

          <aside className="orbit-rail">
            <section className="orbit-note">
              <div className="orbit-note-label"><span>{settings?.statement_label ?? ''}</span><span>TRANSMISSION</span></div>
              <div className="orbit-manifesto">{settings ? renderLines(settings.statement_body) : null}</div>
            </section>
            <section className="orbit-writing">
              <div className="orbit-writing-label">{settings?.wall_labels_label ?? ''}</div>
              <div className="orbit-list">
                {wallLabels.length ? wallLabels.map((item, index) => (
                  <a key={`${item.href}-${item.title}`} href={item.href}>
                    <span className="orbit-index">{String(index + 1).padStart(2, '0')}</span>
                    <span><span className="orbit-list-title">{item.title}</span><span className="orbit-meta">{item.meta}</span></span>
                  </a>
                )) : (
                  <a href="#/diary"><span className="orbit-index">01</span><span><span className="orbit-list-title">正在加载地图</span><span className="orbit-meta"></span></span></a>
                )}
              </div>
            </section>
          </aside>

          <section className="orbit-lower">
            <section className="orbit-filmstrip">
              <div className="orbit-section-head"><span className="orbit-kicker">RECENT FRAMES</span><span className="orbit-index">02 / 04</span></div>
              <div className="orbit-frames">
                <a href="#/frames" className="orbit-media orbit-frame">
                  {frameACover ? <img src={frameACover} alt={frameA?.title || emptyFrames.frameA.title} /> : <div className="orbit-empty">Something here?</div>}
                  <div className="orbit-caption"><div className="orbit-caption-title">{frameA?.title || emptyFrames.frameA.title}</div><div className="orbit-meta">{postMeta(frameA ?? null, emptyFrames.frameA.meta)}</div></div>
                </a>
                <a href="#/frames" className="orbit-media orbit-frame">
                  {frameBCover ? <img src={frameBCover} alt={frameB?.title || emptyFrames.frameB.title} /> : <div className="orbit-empty">Something here?</div>}
                  <div className="orbit-caption"><div className="orbit-caption-title">{frameB?.title || emptyFrames.frameB.title}</div><div className="orbit-meta">{postMeta(frameB ?? null, emptyFrames.frameB.meta)}</div></div>
                </a>
              </div>
            </section>

            <aside className="orbit-curator">
              <div className="orbit-curator-label">{settings?.curator_label ?? ''}</div>
              <div>
                <div className="orbit-curator-copy">{settings?.curator_body ?? ''}</div>
                <div className="orbit-meta">{settings?.curator_meta ?? ''}</div>
              </div>
            </aside>
          </section>

          {latestLead && (
            <section className="orbit-browse" aria-labelledby="latest-stories-title">
              <div className="orbit-browse-title">
                <div>
                  <div className="orbit-kicker">BROWSE THE ARCHIVE</div>
                  <h2 id="latest-stories-title">Latest Stories</h2>
                </div>
                <div className="orbit-index">{String(latestPosts.length).padStart(2, '0')} SIGNALS</div>
              </div>
              <div className={`orbit-latest-grid${latestRest.length ? '' : ' orbit-latest-grid-solo'}`}>
                <HomepagePostCard post={latestLead} lead />
                {latestRest.length > 0 && (
                  <div className="orbit-latest-stack">
                    {latestRest.map((post) => <HomepagePostCard key={post.slug} post={post} compact />)}
                  </div>
                )}
              </div>
            </section>
          )}

          {themeGroups.length > 0 && (
            <section className="orbit-topics" aria-labelledby="topics-title">
              <div className="orbit-kicker">TOPIC DIRECTORY</div>
              <div className="orbit-browse-title">
                <div>
                  <h2 id="topics-title">Explore by Topic</h2>
                  <p className="orbit-topics-intro">从主题进入轨道。项目、影像与日记只是形式，真正的线索是内容彼此讨论的事物。</p>
                </div>
                <div className="orbit-index">{String(themeGroups.length).padStart(2, '0')} TOPICS</div>
              </div>
              {themeGroups.map((group, index) => (
                <section className="orbit-topic" key={group.theme}>
                  <div className="orbit-topic-head">
                    <span className="orbit-index">{String(index + 1).padStart(2, '0')}</span>
                    <h2>{group.theme}</h2>
                    <span className="orbit-index">{String(group.posts.length).padStart(2, '0')}</span>
                  </div>
                  <div className="orbit-topic-grid">
                    {group.posts.map((post) => <HomepagePostCard key={post.slug} post={post} />)}
                  </div>
                </section>
              ))}
            </section>
          )}

          <footer className="orbit-footer-line orbit-index"><span>37ORBIT / INDEPENDENT ARCHIVE</span><span>END OF TRANSMISSION</span></footer>
        </section>
      </div>
    </main>
  );
};

export default Home;
