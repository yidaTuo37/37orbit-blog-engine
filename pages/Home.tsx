import React, { useEffect, useState } from 'react';
import { contentService, getMediaURL } from '../services/api';
import { HomepageContent, Post } from '../types';

const fallbackMainWork = {
  href: '#/projects/main-work',
  cover: '/annual/2025/20251216-result44.png',
  title: '一件代表性作品',
  meta: 'Project / Direction / Interface / 2026',
};

const fallbackFrames = {
  frameA: {
    cover: '/annual/2025/IMG_7318.jpeg',
    title: '海边那天',
    meta: 'Frame / 2025',
  },
  frameB: {
    cover: '/annual/2025/09550011.JPG',
    title: '胶片日常',
    meta: 'Frame / 2025',
  },
};

const fallbackWallLabels = [
  { title: '我为什么不想把个人站做成动态流', meta: 'Essay / 01', href: '#/diary' },
  { title: '作品集真正展示的不是结果，而是判断力', meta: 'Essay / 02', href: '#/diary' },
  { title: '影像为什么还要保留在首页里', meta: 'Note / 03', href: '#/diary' },
  { title: '长期创作和短期更新其实不是一回事', meta: 'Journal / 04', href: '#/diary' },
];

function postHref(post: Post | null, fallback: string) {
  if (!post) return fallback;
  if (post.category === 'frame') return '#/frames';
  return `#/article/${post.slug}`;
}

function postMeta(post: Post | null, fallback: string) {
  if (!post) return fallback;
  return `${post.category || 'Post'} / ${new Date(post.updated_at || post.created_at).getFullYear()}`;
}

const Home: React.FC = () => {
  const [homepage, setHomepage] = useState<HomepageContent | null>(null);

  useEffect(() => {
    contentService
      .getHomepage()
      .then(setHomepage)
      .catch(() => setHomepage(null));
  }, []);

  const mainWork = homepage?.mainWork;
  const frameA = homepage?.frames.frameA;
  const frameB = homepage?.frames.frameB;
  const wallLabels = homepage?.wallLabels.length
    ? homepage.wallLabels.map((post, index) => ({
        title: post.title,
        meta: postMeta(post, `Wall Label / ${index + 1}`),
        href: `#/article/${post.slug}`,
      }))
    : fallbackWallLabels;

  return (
    <main className="exhibition-page">
      <style>{`
        .exhibition-page {
          --bg: #101724;
          --panel: rgba(18, 28, 43, 0.8);
          --line: rgba(202, 220, 244, 0.14);
          --line-strong: rgba(216, 230, 250, 0.28);
          --text: #eef3f8;
          --muted: #9aa9bd;
          --green: #9ed0cf;
          --orange: #ef8d69;
          --violet: #c6b8df;
          min-height: 100dvh;
          overflow-x: hidden;
          background:
            linear-gradient(180deg, #02050d 0%, #040916 12%, #09172c 28%, #102848 48%, #09172a 68%, #030812 100%);
          color: var(--text);
        }

        .exhibition-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(180deg, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.36) 16%, rgba(16,42,78,0.1) 38%, rgba(34,74,125,0.14) 53%, rgba(3,8,18,0.22) 100%),
            linear-gradient(180deg, transparent 15%, rgba(48,93,139,0.035) 30%, rgba(74,139,171,0.09) 45%, rgba(94,171,195,0.14) 58%, rgba(160,132,205,0.15) 70%, rgba(225,111,166,0.21) 80%, rgba(238,83,70,0.3) 88%, rgba(249,151,79,0.45) 94%, rgba(248,185,103,0.52) 97%, transparent 100%),
            radial-gradient(1800px 780px at 50% 116%, rgba(251,177,91,0.52) 0%, rgba(242,99,76,0.38) 22%, rgba(222,126,184,0.26) 42%, rgba(101,187,206,0.16) 64%, transparent 86%);
          opacity: 0.95;
        }

        .exhibition-page::after {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 50% 100%, rgba(255,202,134,0.16), transparent 24%),
            radial-gradient(circle at 52% 98%, rgba(123,206,217,0.12), transparent 20%),
            linear-gradient(180deg, transparent 38%, rgba(99,188,213,0.065) 58%, rgba(207,121,200,0.095) 75%, rgba(245,112,74,0.15) 90%, transparent 100%);
          mix-blend-mode: screen;
        }

        .exhibition-page a {
          color: inherit;
          text-decoration: none;
        }

        .exhibition-page img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .exhibition-sky-sun {
          position: fixed;
          left: -10vw;
          top: 52vh;
          width: 42vw;
          height: 42vw;
          min-width: 420px;
          min-height: 420px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
          background:
            radial-gradient(circle at 50% 50%, rgba(255,188,105,0.5) 0%, rgba(248,105,78,0.34) 18%, rgba(226,116,184,0.18) 35%, rgba(93,180,212,0.08) 52%, transparent 70%);
          filter: blur(28px);
          opacity: 0.76;
          mix-blend-mode: screen;
        }

        .exhibition-shell {
          width: min(1440px, calc(100vw - 40px));
          margin: 0 auto;
          padding: 20px 0 40px;
          position: relative;
          z-index: 2;
        }

        .exhibition-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .exhibition-brand {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.05em;
          font-family: "Space Grotesk", sans-serif;
        }

        .exhibition-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          color: var(--muted);
          font-size: 13px;
        }

        .exhibition-nav a,
        .exhibition-nav span {
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 8px 12px;
          background: rgba(255,255,255,0.02);
          transition: border-color 160ms ease, color 160ms ease, background 160ms ease;
        }

        .exhibition-nav a:hover {
          border-color: var(--line-strong);
          color: var(--text);
          background: rgba(255,255,255,0.045);
        }

        .exhibition-hero {
          margin: 0 0 18px;
        }

        .exhibition-eyebrow {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.24em;
          color: var(--muted);
          font-family: "SF Mono", "JetBrains Mono", ui-monospace, monospace;
        }

        .exhibition-hero h1 {
          margin: 10px 0 0;
          font-size: clamp(34px, 6vw, 92px);
          line-height: 0.94;
          font-family: "Noto Serif SC", Georgia, "Songti SC", serif;
        }

        .exhibition-hero p {
          margin: 14px 0 0;
          max-width: 780px;
          color: var(--muted);
          line-height: 1.75;
          font-size: 15px;
        }

        .exhibition-stage {
          position: relative;
          min-height: 720px;
          padding: 22px;
          border: 1px solid rgba(206, 220, 242, 0.08);
          border-radius: 30px;
          background:
            linear-gradient(180deg, rgba(205,225,255,0.035), rgba(255,255,255,0.01)),
            linear-gradient(180deg, rgba(26,49,85,0.28), rgba(7,16,31,0.18) 42%, rgba(238,92,74,0.06) 82%, rgba(247,169,93,0.085) 100%),
            linear-gradient(180deg, transparent 35%, rgba(107,190,209,0.04) 57%, rgba(210,117,192,0.055) 76%, rgba(246,137,82,0.085) 92%, transparent 100%),
            radial-gradient(circle at 85% 14%, rgba(115,153,202,0.1), transparent 24%),
            radial-gradient(circle at 50% 103%, rgba(247,158,82,0.22), transparent 30%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.02),
            0 34px 90px rgba(6,10,18,0.26);
          overflow: hidden;
        }

        .exhibition-stage-grid {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(rgba(210,226,246,0.032) 1px, transparent 1px),
            linear-gradient(90deg, rgba(210,226,246,0.032) 1px, transparent 1px);
          background-size: 132px 132px;
          opacity: 0.22;
          pointer-events: none;
        }

        .exhibition-wall {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          grid-template-rows: 180px 230px 228px;
          gap: 18px;
          position: relative;
          z-index: 1;
        }

        .exhibition-surface {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 24px;
          backdrop-filter: blur(12px);
        }

        .exhibition-image-fill {
          position: relative;
          overflow: hidden;
        }

        .exhibition-image-fill > img {
          position: absolute;
          inset: 0;
        }

        .exhibition-overlay-bottom {
          position: absolute;
          inset: auto 0 0 0;
          padding: 18px;
          background: linear-gradient(180deg, rgba(8,11,17,0) 0%, rgba(10,14,21,0.86) 100%);
        }

        .exhibition-caption {
          display: grid;
          gap: 4px;
        }

        .exhibition-caption-title {
          font-size: 18px;
          line-height: 1.2;
          font-family: "Noto Serif SC", Georgia, "Songti SC", serif;
        }

        .exhibition-caption-meta {
          font-size: 12px;
          color: var(--muted);
        }

        .exhibition-project-wrap {
          grid-column: 1 / span 7;
          grid-row: 1 / span 2;
          position: relative;
        }

        .exhibition-project {
          display: block;
          position: relative;
          overflow: hidden;
          min-height: 0;
          height: 100%;
          border-radius: 28px;
          box-shadow:
            0 28px 84px rgba(5,9,17,0.38),
            0 0 0 1px rgba(219,228,240,0.04);
        }

        .exhibition-tag {
          position: absolute;
          left: 18px;
          top: -12px;
          z-index: 2;
          padding: 8px 12px;
          border: 1px solid rgba(205,220,242,0.16);
          border-radius: 999px;
          background: rgba(18,24,33,0.92);
          font-size: 11px;
          letter-spacing: 0.12em;
          color: var(--text);
          font-family: "SF Mono", "JetBrains Mono", ui-monospace, monospace;
        }

        .exhibition-side-note {
          grid-column: 8 / span 5;
          grid-row: 1;
          padding: 20px;
          border-radius: 28px 28px 12px 28px;
          background:
            linear-gradient(180deg, rgba(227,160,126,0.12), rgba(255,255,255,0.02)),
            linear-gradient(180deg, rgba(22,31,42,0.66), rgba(22,31,42,0.66));
        }

        .exhibition-writing {
          grid-column: 8 / span 5;
          grid-row: 2 / span 2;
          padding: 20px;
          border-radius: 12px 28px 28px 28px;
          background:
            linear-gradient(180deg, rgba(178,172,208,0.08), rgba(255,255,255,0.015)),
            linear-gradient(180deg, rgba(22,31,42,0.72), rgba(22,31,42,0.72));
        }

        .exhibition-frame-a {
          display: block;
          grid-column: 1 / span 4;
          grid-row: 3;
          border-radius: 18px;
        }

        .exhibition-frame-b {
          display: block;
          grid-column: 5 / span 3;
          grid-row: 3;
          border-radius: 18px;
        }

        .exhibition-frame-c {
          grid-column: 8 / span 5;
          grid-row: 3;
          padding: 20px;
          display: grid;
          align-content: end;
          border-radius: 28px;
          background:
            linear-gradient(180deg, rgba(157,195,196,0.08), rgba(255,255,255,0.02)),
            linear-gradient(180deg, rgba(22,31,42,0.72), rgba(22,31,42,0.72));
        }

        .exhibition-label-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .exhibition-label-row::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--line);
        }

        .exhibition-label-row span {
          font-size: 14px;
          font-family: "Noto Serif SC", Georgia, "Songti SC", serif;
        }

        .exhibition-manifesto {
          font-size: clamp(28px, 3.3vw, 42px);
          line-height: 1;
          max-width: 10ch;
          font-family: "Noto Serif SC", Georgia, "Songti SC", serif;
        }

        .exhibition-list {
          display: grid;
        }

        .exhibition-list a {
          padding: 14px 0 12px;
          border-bottom: 1px solid var(--line);
        }

        .exhibition-list a:last-child {
          border-bottom: 0;
        }

        .exhibition-list-title {
          font-size: 20px;
          line-height: 1.32;
          margin-bottom: 6px;
          font-family: "Noto Serif SC", Georgia, "Songti SC", serif;
        }

        .exhibition-list-meta,
        .exhibition-muted {
          color: var(--muted);
          font-family: "SF Mono", "JetBrains Mono", ui-monospace, monospace;
          font-size: 12px;
        }

        .exhibition-curator-copy {
          font-size: 28px;
          line-height: 1.15;
          max-width: 15ch;
          font-family: "Noto Serif SC", Georgia, "Songti SC", serif;
        }

        @media (max-width: 1100px) {
          .exhibition-shell {
            width: min(100vw - 24px, 1440px);
          }

          .exhibition-stage {
            min-height: auto;
            padding: 16px;
          }

          .exhibition-wall {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
          }

          .exhibition-project-wrap,
          .exhibition-side-note,
          .exhibition-writing,
          .exhibition-frame-a,
          .exhibition-frame-b,
          .exhibition-frame-c {
            grid-column: auto;
            grid-row: auto;
          }

          .exhibition-project {
            min-height: 420px;
          }

          .exhibition-frame-a,
          .exhibition-frame-b {
            min-height: 260px;
          }
        }

        @media (max-width: 720px) {
          .exhibition-shell {
            width: calc(100vw - 16px);
            padding-top: 12px;
          }

          .exhibition-brand {
            font-size: 24px;
          }

          .exhibition-nav {
            font-size: 12px;
          }

          .exhibition-hero p {
            font-size: 14px;
          }

          .exhibition-stage {
            padding: 12px;
            border-radius: 22px;
          }

          .exhibition-side-note,
          .exhibition-writing,
          .exhibition-frame-c {
            padding: 14px;
          }

          .exhibition-tag {
            left: 12px;
            top: 12px;
          }

          .exhibition-manifesto,
          .exhibition-curator-copy {
            max-width: none;
          }
        }
      `}</style>

      <div className="exhibition-sky-sun" aria-hidden="true" />

      <div className="exhibition-shell">
        <div className="exhibition-topbar">
          <div className="exhibition-brand">37ORBIT</div>
          <div className="exhibition-nav">
            <a href="#/projects">项目</a>
            <a href="#/frames">影像</a>
            <a href="#/diary">日记</a>
          </div>
        </div>

        <section className="exhibition-hero">
          <div className="exhibition-eyebrow">Exhibition Wall</div>
          <h1>
            先让人看到中心展品，<br />再读旁边的解释文字。
          </h1>
          <p>
            这一版不再平均对待栏目。主项目像被挂在墙面中央，写作退成展签，影像变成侧面证据。重点不是模块齐不齐，而是视线有没有被正确引导。
          </p>
        </section>

        <section className="exhibition-stage">
          <div className="exhibition-stage-grid" />
          <section className="exhibition-wall">
            <div className="exhibition-project-wrap">
              <div className="exhibition-tag">Main Work / 01</div>
              <a href={postHref(mainWork ?? null, fallbackMainWork.href)} className="exhibition-surface exhibition-project exhibition-image-fill">
                <img src={mainWork?.cover ? getMediaURL(mainWork.cover) : fallbackMainWork.cover} alt="" />
                <div className="exhibition-overlay-bottom">
                  <div className="exhibition-caption">
                    <div className="exhibition-caption-title">{mainWork?.title || fallbackMainWork.title}</div>
                    <div className="exhibition-caption-meta">{postMeta(mainWork ?? null, fallbackMainWork.meta)}</div>
                  </div>
                </div>
              </a>
            </div>

            <div className="exhibition-surface exhibition-side-note">
              <div className="exhibition-label-row">
                <span style={{ color: 'var(--orange)' }}>Statement</span>
              </div>
              <div className="exhibition-manifesto">
                项目是主展件。<br />文字是墙签。<br />影像是现场感。
              </div>
            </div>

            <div className="exhibition-surface exhibition-writing">
              <div className="exhibition-label-row">
                <span style={{ color: 'var(--violet)' }}>Wall Labels</span>
              </div>
              <div className="exhibition-list">
                {wallLabels.map((item) => (
                  <a key={`${item.href}-${item.title}`} href={item.href}>
                    <div className="exhibition-list-title">{item.title}</div>
                    <div className="exhibition-list-meta">{item.meta}</div>
                  </a>
                ))}
              </div>
            </div>

            <a href="#/frames" className="exhibition-surface exhibition-frame-a exhibition-image-fill">
              <img src={frameA?.cover ? getMediaURL(frameA.cover) : fallbackFrames.frameA.cover} alt="" />
              <div className="exhibition-overlay-bottom">
                <div className="exhibition-caption">
                  <div className="exhibition-caption-title">{frameA?.title || fallbackFrames.frameA.title}</div>
                  <div className="exhibition-caption-meta">{postMeta(frameA ?? null, fallbackFrames.frameA.meta)}</div>
                </div>
              </div>
            </a>

            <a href="#/frames" className="exhibition-surface exhibition-frame-b exhibition-image-fill">
              <img src={frameB?.cover ? getMediaURL(frameB.cover) : fallbackFrames.frameB.cover} alt="" />
              <div className="exhibition-overlay-bottom">
                <div className="exhibition-caption">
                  <div className="exhibition-caption-title">{frameB?.title || fallbackFrames.frameB.title}</div>
                  <div className="exhibition-caption-meta">{postMeta(frameB ?? null, fallbackFrames.frameB.meta)}</div>
                </div>
              </div>
            </a>

            <div className="exhibition-surface exhibition-frame-c">
              <div className="exhibition-label-row">
                <span style={{ color: 'var(--green)' }}>Curator Note</span>
              </div>
              <div className="exhibition-curator-copy">
                不是把项目、写作、影像做成三块平权模块，而是像策展一样先确定主轴，再安排旁证。
              </div>
              <div className="exhibition-muted" style={{ marginTop: 18 }}>
                37ORBIT / Homepage Study / v2
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
};

export default Home;
