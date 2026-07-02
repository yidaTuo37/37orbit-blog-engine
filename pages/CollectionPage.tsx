import React, { useEffect, useState } from 'react';
import { exhibitionFrames, exhibitionProjects, wallLabels } from '../data/exhibition';
import { contentService } from '../services/api';
import { Post } from '../types';

const pageStyle: React.CSSProperties = {
  minHeight: 'calc(100dvh - 80px)',
  color: '#eef3f8',
};

const surfaceStyle: React.CSSProperties = {
  border: '1px solid rgba(202, 220, 244, 0.14)',
  background: 'linear-gradient(180deg, rgba(18, 28, 43, 0.78), rgba(18, 28, 43, 0.52))',
  backdropFilter: 'blur(12px)',
};

const PageHeader: React.FC<{ eyebrow: string; title: string; body: string }> = ({ eyebrow, title, body }) => (
  <header style={{ marginBottom: 28 }}>
    <div className="mono-font" style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9aa9bd' }}>
      {eyebrow}
    </div>
    <h1 className="serif-font" style={{ margin: '10px 0 0', fontSize: 'clamp(42px, 7vw, 88px)', lineHeight: 0.95 }}>
      {title}
    </h1>
    <p style={{ maxWidth: 720, marginTop: 16, color: '#9aa9bd', lineHeight: 1.8 }}>
      {body}
    </p>
  </header>
);

export const ProjectsPage: React.FC = () => (
  <main style={pageStyle}>
    <PageHeader
      eyebrow="Projects"
      title="项目索引"
      body="这里放从首页中心展件延伸出来的项目。首页负责建立第一眼，项目页负责交代作品本身。"
    />
    <div className="grid gap-4 md:grid-cols-3">
      {exhibitionProjects.map((project) => (
        <a
          key={project.id}
          href={`#/projects/${project.id}`}
          className="group overflow-hidden rounded-3xl"
          style={surfaceStyle}
        >
          <div style={{ aspectRatio: '16 / 10', overflow: 'hidden' }}>
            <img
              src={project.cover}
              alt={project.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <div style={{ padding: 18 }}>
            <div className="serif-font" style={{ fontSize: 24, lineHeight: 1.15 }}>
              {project.title}
            </div>
            <div className="mono-font" style={{ marginTop: 8, fontSize: 12, color: '#9aa9bd' }}>
              {project.meta}
            </div>
            <p style={{ marginTop: 14, color: '#9aa9bd', lineHeight: 1.7, fontSize: 14 }}>
              {project.summary}
            </p>
          </div>
        </a>
      ))}
    </div>
  </main>
);

export const ProjectDetailPage: React.FC<{ id: string }> = ({ id }) => {
  const project = exhibitionProjects.find((item) => item.id === id) ?? exhibitionProjects[0];

  return (
    <main style={pageStyle}>
      <PageHeader
        eyebrow={project.meta}
        title={project.title}
        body={project.summary}
      />
      <div className="overflow-hidden rounded-[2rem]" style={surfaceStyle}>
        <div style={{ aspectRatio: '16 / 8' }}>
          <img src={project.cover} alt={project.title} className="h-full w-full object-cover" />
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_0.7fr] md:p-8">
          <div className="serif-font" style={{ fontSize: 34, lineHeight: 1.08 }}>
            这个页面之后可以继续补充项目背景、角色、过程和最终结果。
          </div>
          <div style={{ color: '#9aa9bd', lineHeight: 1.8 }}>
            现在先保留为作品详情入口，避免首页承担过多说明文字。等项目内容确定后，再把这里扩展成完整项目页。
          </div>
        </div>
      </div>
    </main>
  );
};

export const FramesPage: React.FC = () => (
  <main style={pageStyle}>
    <PageHeader
      eyebrow="Frames"
      title="影像索引"
      body="影像不是被压成标题的文字列表。这里保留图片本身的观看空间。"
    />
    <div className="grid gap-4 md:grid-cols-2">
      {exhibitionFrames.map((frame) => (
        <article key={frame.id} className="overflow-hidden rounded-3xl" style={surfaceStyle}>
          <div style={{ aspectRatio: '16 / 10' }}>
            <img src={frame.cover} alt={frame.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </div>
          <div style={{ padding: 18 }}>
            <div className="serif-font" style={{ fontSize: 24 }}>
              {frame.title}
            </div>
            <div className="mono-font" style={{ marginTop: 6, fontSize: 12, color: '#9aa9bd' }}>
              {frame.meta}
            </div>
          </div>
        </article>
      ))}
    </div>
  </main>
);

export const DiaryPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentService
      .getPosts()
      .then((items) => setPosts(items))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const fallbackItems = wallLabels.map((item, index) => ({
    id: index,
    title: item.title,
    meta: item.meta,
    href: '#/diary',
  }));

  const items = posts.length
    ? posts.map((post) => ({
        id: post.id,
        title: post.title,
        meta: post.category || 'Diary',
        href: `#/article/${post.slug}`,
      }))
    : fallbackItems;

  return (
    <main style={pageStyle}>
      <PageHeader
        eyebrow="Diary"
        title="日记索引"
        body="日记只需要标题和一点点时间感，不需要在首页展开正文。"
      />
      <div className="rounded-3xl p-5 md:p-7" style={surfaceStyle}>
        {loading && (
          <div style={{ color: '#9aa9bd' }}>读取中。</div>
        )}
        {!loading && items.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className="block border-b border-white/10 py-4 last:border-b-0"
          >
            <div className="serif-font" style={{ fontSize: 26, lineHeight: 1.25 }}>
              {item.title}
            </div>
            <div className="mono-font" style={{ marginTop: 8, fontSize: 12, color: '#9aa9bd' }}>
              {item.meta}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
};
