import React from 'react';
import SiteLogo from '../assets/logo/Lumkfs-Logo.png';
import SocialLinks from './SocialLinks';

const navItems = [
  { label: 'PROJECTS', index: '01', href: '#/projects' },
  { label: 'FRAMES', index: '02', href: '#/frames' },
  { label: 'DIARY', index: '03', href: '#/diary' },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentRoute = window.location.hash || '#/';

  return (
    <div className="orbit-site">
      <style>{`
        .orbit-site {
          --orbit-bg: #05070c;
          --orbit-surface: #0d1420;
          --orbit-surface-2: #101a29;
          --orbit-text: #f2f0ea;
          --orbit-muted: #8792a3;
          --orbit-dim: #5d6979;
          --orbit-line: rgba(213, 224, 239, 0.15);
          --orbit-line-strong: rgba(213, 224, 239, 0.34);
          --orbit-orange: #ff7a45;
          --orbit-cyan: #8fc5c9;
          position: relative;
          min-height: 100dvh;
          overflow-x: clip;
          color: var(--orbit-text);
          background: var(--orbit-bg);
          font-family: Inter, system-ui, sans-serif;
        }
        .orbit-site::before,
        .orbit-site::after {
          content: "";
          position: fixed;
          z-index: 0;
          pointer-events: none;
        }
        .orbit-site::before {
          left: 50%;
          bottom: -55vw;
          width: 112vw;
          height: 78vw;
          border: 1px solid rgba(143, 197, 201, 0.16);
          border-radius: 50%;
          transform: translateX(-50%);
          box-shadow: 0 -34px 120px rgba(255, 122, 69, 0.09), 0 -4px 42px rgba(143, 197, 201, 0.08);
        }
        .orbit-site::after {
          inset: 0;
          background: radial-gradient(80% 34% at 50% 104%, rgba(255, 122, 69, 0.11), transparent 67%), linear-gradient(90deg, transparent 49.95%, rgba(213, 224, 239, 0.035) 50%, transparent 50.05%);
        }
        .orbit-site *, .orbit-site *::before, .orbit-site *::after { box-sizing: border-box; }
        .orbit-site a { color: inherit; text-decoration: none; }
        .orbit-site a:focus-visible, .orbit-site button:focus-visible { outline: 2px solid var(--orbit-orange); outline-offset: 5px; }
        .orbit-site-header,
        .orbit-site-main,
        .orbit-site-footer { position: relative; z-index: 1; }
        .orbit-site-header {
          position: sticky;
          top: 0;
          z-index: 20;
          border-bottom: 1px solid var(--orbit-line);
          background: rgba(5, 7, 12, 0.82);
          backdrop-filter: blur(18px);
        }
        .orbit-site-nav {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          width: min(1480px, calc(100vw - 64px));
          min-height: 74px;
          margin: 0 auto;
        }
        .orbit-site-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          width: fit-content;
          font: 700 27px/1 "Space Grotesk", sans-serif;
          letter-spacing: -0.06em;
        }
        .orbit-site-brand sup { margin-left: 5px; color: var(--orbit-orange); font: 500 9px/1 ui-monospace, monospace; letter-spacing: 0.08em; vertical-align: top; }
        .orbit-site-nav-links { display: flex; align-self: stretch; }
        .orbit-site-nav-links a {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 126px;
          padding: 0 18px;
          border-left: 1px solid var(--orbit-line);
          color: var(--orbit-muted);
          font: 600 11px/1 "Space Grotesk", sans-serif;
          letter-spacing: 0.12em;
          transition: color 180ms ease, border-color 180ms ease, background 180ms ease;
        }
        .orbit-site-nav-links a span { color: var(--orbit-orange); font-family: ui-monospace, monospace; }
        .orbit-site-nav-links a:hover, .orbit-site-nav-links a.is-active { color: var(--orbit-text); border-color: var(--orbit-orange); background: rgba(255, 122, 69, 0.05); }
        .orbit-site-main { width: min(1480px, calc(100vw - 64px)); min-height: calc(100dvh - 74px); margin: 0 auto; padding: 56px 0 96px; }
        .orbit-collection { min-height: calc(100dvh - 74px); }
        .orbit-collection-header { display: grid; grid-template-columns: 1fr minmax(250px, 0.38fr); gap: 32px; align-items: end; padding: 46px 0 58px; border-bottom: 1px solid var(--orbit-line); }
        .orbit-back-link { display: inline-flex; align-items: center; min-height: 44px; margin-bottom: 36px; color: var(--orbit-muted); font: 500 11px/1 ui-monospace, monospace; letter-spacing: 0.1em; text-transform: uppercase; transition: color 180ms ease; }
        .orbit-back-link:hover { color: var(--orbit-orange); }
        .orbit-kicker { color: var(--orbit-cyan); font: 500 10px/1.4 ui-monospace, monospace; letter-spacing: 0.16em; text-transform: uppercase; }
        .orbit-collection-header h1 { max-width: 12ch; margin: 16px 0 0; font: 400 clamp(54px, 8vw, 128px)/0.88 "Noto Serif SC", Georgia, serif; letter-spacing: -0.07em; }
        .orbit-collection-header p { max-width: 620px; margin: 28px 0 0; color: var(--orbit-muted); font-size: 16px; line-height: 1.8; }
        .orbit-collection-signal { display: grid; gap: 10px; align-self: end; padding-bottom: 6px; }
        .orbit-collection-signal div { display: flex; justify-content: space-between; gap: 20px; padding-bottom: 9px; border-bottom: 1px solid var(--orbit-line); color: var(--orbit-muted); font: 500 10px/1.4 ui-monospace, monospace; letter-spacing: 0.1em; }
        .orbit-collection-signal b { color: var(--orbit-text); font-weight: 500; }
        .orbit-collection-body { padding-top: 34px; }
        .orbit-collection-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .orbit-collection-card, .orbit-frame-tile, .orbit-empty-state, .orbit-diary-list { border: 1px solid var(--orbit-line); border-radius: 14px; background: linear-gradient(180deg, rgba(13, 20, 32, 0.8), rgba(13, 20, 32, 0.56)); transition: border-color 180ms ease, transform 180ms ease, background 180ms ease; }
        .orbit-collection-card:hover, .orbit-frame-tile:hover, .orbit-diary-item:hover { border-color: var(--orbit-line-strong); transform: translateY(-3px); background: linear-gradient(180deg, rgba(18, 29, 44, 0.92), rgba(13, 20, 32, 0.64)); }
        .orbit-card-media { position: relative; overflow: hidden; aspect-ratio: 16 / 10; background: var(--orbit-surface); border-radius: 13px 13px 0 0; }
        .orbit-card-media img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 320ms ease; }
        .orbit-collection-card:hover img, .orbit-frame-tile:hover img { transform: scale(1.03); }
        .orbit-card-copy { padding: 20px; }
        .orbit-card-meta, .orbit-frame-meta { display: flex; justify-content: space-between; gap: 16px; color: var(--orbit-muted); font: 500 10px/1.4 ui-monospace, monospace; letter-spacing: 0.08em; text-transform: uppercase; }
        .orbit-card-meta span:first-child, .orbit-frame-meta { color: var(--orbit-cyan); }
        .orbit-card-copy h2, .orbit-frame-copy h2 { margin: 17px 0 0; font: 400 clamp(24px, 2.5vw, 38px)/1.08 "Noto Serif SC", Georgia, serif; letter-spacing: -0.04em; }
        .orbit-card-copy p, .orbit-frame-copy p { margin: 14px 0 0; color: var(--orbit-muted); font-size: 16px; line-height: 1.7; }
        .orbit-empty-state { padding: 28px; color: var(--orbit-muted); font-size: 16px; line-height: 1.7; }
        .orbit-frame-featured { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr); gap: 12px; }
        .orbit-frame-tile { display: block; overflow: hidden; }
        .orbit-frame-media { position: relative; overflow: hidden; aspect-ratio: 4 / 3; background: var(--orbit-surface); }
        .orbit-frame-feature .orbit-frame-media { aspect-ratio: 16 / 10; }
        .orbit-frame-media img { display: block; width: 100%; height: 100%; object-fit: cover; }
        .orbit-frame-overlay { position: absolute; inset: auto 0 0; padding: 76px 20px 20px; background: linear-gradient(transparent, rgba(5, 7, 12, 0.9)); }
        .orbit-frame-feature .orbit-frame-overlay { padding: 110px 28px 28px; }
        .orbit-frame-overlay h2 { max-width: 16ch; margin: 8px 0 0; color: var(--orbit-text); font: 400 clamp(22px, 3.2vw, 54px)/1.05 "Noto Serif SC", Georgia, serif; letter-spacing: -0.05em; }
        .orbit-frame-copy { padding: 16px 20px 20px; }
        .orbit-topic-section { margin-top: 68px; }
        .orbit-topic-heading { display: flex; align-items: end; justify-content: space-between; gap: 18px; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid var(--orbit-line); }
        .orbit-topic-heading h2 { margin: 6px 0 0; font: 400 clamp(34px, 5vw, 70px)/0.95 "Noto Serif SC", Georgia, serif; letter-spacing: -0.06em; }
        .orbit-topic-count { color: var(--orbit-orange); font: 500 10px/1 ui-monospace, monospace; }
        .orbit-diary-list { overflow: hidden; }
        .orbit-diary-item { display: grid; grid-template-columns: 56px 1fr auto; gap: 20px; align-items: start; padding: 24px; border-bottom: 1px solid var(--orbit-line); transition: background 180ms ease, border-color 180ms ease, transform 180ms ease; }
        .orbit-diary-item:last-child { border-bottom: 0; }
        .orbit-diary-index { color: var(--orbit-orange); font: 500 11px/1.4 ui-monospace, monospace; }
        .orbit-diary-title { font: 400 clamp(22px, 3vw, 38px)/1.1 "Noto Serif SC", Georgia, serif; letter-spacing: -0.04em; }
        .orbit-diary-summary { max-width: 620px; margin-top: 10px; color: var(--orbit-muted); font-size: 16px; line-height: 1.7; }
        .orbit-diary-meta { color: var(--orbit-muted); font: 500 10px/1.5 ui-monospace, monospace; letter-spacing: 0.06em; text-transform: uppercase; text-align: right; }
        .orbit-diary-arrow { color: var(--orbit-orange); font-size: 20px; transition: transform 180ms ease; }
        .orbit-diary-item:hover .orbit-diary-arrow { transform: translateX(5px); }
        .orbit-site-footer { display: flex; justify-content: space-between; gap: 20px; width: min(1480px, calc(100vw - 64px)); margin: 0 auto; padding: 18px 0 34px; border-top: 1px solid var(--orbit-line); color: var(--orbit-dim); font: 500 10px/1.4 ui-monospace, monospace; letter-spacing: 0.1em; text-transform: uppercase; }
        .orbit-site-footer a:hover { color: var(--orbit-orange); }
        .orbit-site-footer-right { display: flex; align-items: center; gap: 14px; }
        .orbit-site-footer-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--orbit-orange); box-shadow: 0 0 14px rgba(255, 122, 69, 0.75); }
        .orbit-detail { max-width: 1100px; margin: 0 auto; }
        .orbit-detail-header { padding: 38px 0 42px; border-bottom: 1px solid var(--orbit-line); }
        .orbit-detail-path { display: flex; align-items: center; gap: 14px; color: var(--orbit-muted); font: 500 11px/1.4 ui-monospace, monospace; letter-spacing: 0.08em; text-transform: uppercase; }
        .orbit-detail-path a:hover { color: var(--orbit-orange); }
        .orbit-detail-path-separator { color: var(--orbit-orange); }
        .orbit-detail h1 { max-width: 980px; margin: 28px 0 0; font: 400 clamp(48px, 8vw, 116px)/0.92 "Noto Serif SC", Georgia, serif; letter-spacing: -0.07em; }
        .orbit-detail-meta { display: flex; flex-wrap: wrap; gap: 12px 26px; margin-top: 28px; color: var(--orbit-muted); font: 500 11px/1.5 ui-monospace, monospace; letter-spacing: 0.06em; text-transform: uppercase; }
        .orbit-detail-meta strong { color: var(--orbit-cyan); font-weight: 500; }
        .orbit-detail-cover { margin: 38px 0 0; overflow: hidden; border: 1px solid var(--orbit-line); border-radius: 16px; background: var(--orbit-surface); }
        .orbit-detail-cover img { display: block; width: 100%; max-height: 720px; object-fit: cover; cursor: zoom-in; }
        .orbit-detail-body { max-width: 760px; margin: 58px auto 0; }
        .orbit-detail-body.prose { color: rgba(242, 240, 234, 0.82); font-size: 18px; line-height: 1.9; }
        .orbit-detail-body.prose h2, .orbit-detail-body.prose h3 { color: var(--orbit-text); font-family: "Noto Serif SC", Georgia, serif; letter-spacing: -0.04em; }
        .orbit-detail-body.prose a { color: var(--orbit-orange); text-decoration: underline; text-underline-offset: 4px; }
        .orbit-detail-body.prose img { border: 1px solid var(--orbit-line); border-radius: 12px; cursor: zoom-in; }
        .orbit-detail-footer { display: flex; justify-content: space-between; gap: 20px; margin-top: 72px; padding-top: 20px; border-top: 1px solid var(--orbit-line); color: var(--orbit-muted); font: 500 11px/1.4 ui-monospace, monospace; letter-spacing: 0.08em; text-transform: uppercase; }
        .orbit-detail-footer a:hover { color: var(--orbit-orange); }
        .orbit-loading, .orbit-error { padding: 120px 0; color: var(--orbit-muted); font: 500 11px/1.4 ui-monospace, monospace; letter-spacing: 0.12em; text-align: center; text-transform: uppercase; }
        .orbit-error { color: #ff9678; }
        .orbit-lightbox { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 24px; background: rgba(3, 5, 8, 0.94); }
        .orbit-lightbox img { max-width: min(92vw, 1400px); max-height: 88vh; object-fit: contain; }
        .orbit-lightbox button { position: absolute; top: 24px; right: 24px; width: 48px; height: 48px; border: 1px solid var(--orbit-line-strong); border-radius: 50%; color: var(--orbit-orange); background: rgba(13, 20, 32, 0.85); font-size: 26px; cursor: pointer; }
        @media (max-width: 960px) {
          .orbit-site-nav, .orbit-site-main, .orbit-site-footer { width: min(100vw - 32px, 1480px); }
          .orbit-site-nav { grid-template-columns: 1fr; }
          .orbit-site-brand { min-height: 64px; }
          .orbit-site-nav-links { border-top: 1px solid var(--orbit-line); }
          .orbit-site-nav-links a { flex: 1; min-width: 0; min-height: 48px; padding: 0 10px; border-left: 0; border-right: 1px solid var(--orbit-line); }
          .orbit-collection-header { grid-template-columns: 1fr; }
          .orbit-collection-signal { max-width: 480px; }
          .orbit-collection-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .orbit-site-main { padding-top: 24px; padding-bottom: 68px; }
          .orbit-collection-header { padding: 26px 0 40px; }
          .orbit-collection-header h1 { font-size: clamp(50px, 16vw, 78px); }
          .orbit-collection-grid, .orbit-frame-featured { grid-template-columns: 1fr; }
          .orbit-frame-featured > div { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .orbit-frame-featured > div .orbit-frame-media { aspect-ratio: 1 / 1; }
          .orbit-diary-item { grid-template-columns: 34px 1fr auto; gap: 12px; padding: 20px 16px; }
          .orbit-diary-meta { display: none; }
          .orbit-detail-header { padding-top: 20px; }
          .orbit-detail h1 { font-size: clamp(46px, 14vw, 72px); }
          .orbit-detail-body.prose { font-size: 17px; line-height: 1.85; }
          .orbit-detail-footer { flex-direction: column; gap: 12px; }
          .orbit-site-footer { flex-direction: column; gap: 12px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .orbit-site *, .orbit-site *::before, .orbit-site *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
        }
      `}</style>

      <header className="orbit-site-header">
        <nav className="orbit-site-nav" aria-label="Primary navigation">
          <a className="orbit-site-brand" href="#/">37ORBIT<sup>FIELD NOTES</sup></a>
          <div className="orbit-site-nav-links">
            {navItems.map((item) => (
              <a key={item.href} className={currentRoute.startsWith(item.href) ? 'is-active' : ''} href={item.href}>
                <span>{item.index}</span>{item.label}
              </a>
            ))}
          </div>
        </nav>
      </header>

      <main className="orbit-site-main">{children}</main>

      <footer className="orbit-site-footer">
        <div><a href="https://lumkfs.cn" target="_blank" rel="noopener noreferrer">37ORBIT / INDEPENDENT ARCHIVE</a></div>
        <div className="orbit-site-footer-right"><span className="orbit-site-footer-dot" /> SYSTEM ONLINE</div>
      </footer>
      <div className="sr-only"><SocialLinks /><img src={SiteLogo} alt="" /></div>
    </div>
  );
};

export default Layout;
