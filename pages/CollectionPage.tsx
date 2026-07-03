import React, { useEffect, useState } from 'react';
import { contentService, getMediaURL } from '../services/api';
import { Post } from '../types';
import ArticleDetail from './ArticleDetail';

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
    <a
      href="#/"
      className="mono-font"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 40,
        padding: '0 14px',
        marginBottom: 22,
        border: '1px solid rgba(202, 220, 244, 0.16)',
        borderRadius: 999,
        background: 'rgba(18, 28, 43, 0.48)',
        color: '#9aa9bd',
        fontSize: 12,
        letterSpacing: '0.08em',
        textDecoration: 'none',
      }}
    >
      ← 返回展览墙
    </a>
    <div
      className="mono-font"
      style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9aa9bd' }}
    >
      {eyebrow}
    </div>
    <h1 className="serif-font" style={{ margin: '10px 0 0', fontSize: 'clamp(42px, 7vw, 88px)', lineHeight: 0.95 }}>
      {title}
    </h1>
    <p style={{ maxWidth: 720, marginTop: 16, color: '#9aa9bd', lineHeight: 1.8 }}>{body}</p>
  </header>
);

function postMeta(post: Post): string {
  const year = new Date(post.updated_at || post.created_at).getFullYear();
  return `${post.category || 'post'} / ${year}`;
}

function sortPosts(items: Post[]): Post[] {
  return [...items].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

function useCategoryPosts(categories: string[]) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const categoryKey = categories.join('|');

  useEffect(() => {
    let active = true;
    const loadPosts = () => {
      setLoading(true);
      Promise.all(categories.map((category) => contentService.getPosts({ category })))
        .then((groups) => {
          if (active) setPosts(sortPosts(groups.flat()));
        })
        .catch(() => {
          if (active) setPosts([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };
    const reloadWhenVisible = () => {
      if (document.visibilityState === 'visible') loadPosts();
    };

    loadPosts();
    window.addEventListener('focus', loadPosts);
    document.addEventListener('visibilitychange', reloadWhenVisible);

    return () => {
      active = false;
      window.removeEventListener('focus', loadPosts);
      document.removeEventListener('visibilitychange', reloadWhenVisible);
    };
  }, [categoryKey]);

  return { posts, loading };
}

const EmptyState: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-3xl p-6 text-sm leading-7" style={{ ...surfaceStyle, color: '#9aa9bd' }}>
    {children}
  </div>
);

const ProjectCard: React.FC<{ post: Post }> = ({ post }) => {
  const cover = getMediaURL(post.cover);

  return (
    <a href={`#/projects/${post.slug}`} className="group overflow-hidden rounded-3xl" style={surfaceStyle}>
      <div style={{ aspectRatio: '16 / 10', overflow: 'hidden' }}>
        {cover ? (
          <img
            src={cover}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-white/5 text-xs uppercase tracking-[0.18em] text-white/35">
            No cover
          </div>
        )}
      </div>
      <div style={{ padding: 18 }}>
        <div className="serif-font" style={{ fontSize: 24, lineHeight: 1.15 }}>
          {post.title}
        </div>
        <div className="mono-font" style={{ marginTop: 8, fontSize: 12, color: '#9aa9bd' }}>
          {postMeta(post)}
        </div>
        {post.summary && (
          <p style={{ marginTop: 14, color: '#9aa9bd', lineHeight: 1.7, fontSize: 14 }}>{post.summary}</p>
        )}
      </div>
    </a>
  );
};

export const ProjectsPage: React.FC = () => {
  const { posts, loading } = useCategoryPosts(['project']);

  return (
    <main style={pageStyle}>
      <PageHeader
        eyebrow="Projects"
        title="可以先去倒杯咖啡"
        body="这里是一些项目，记录了codex的额度是如何被使用掉的。"
      />
      {loading && <EmptyState>加载地形中。</EmptyState>}
      {!loading && posts.length === 0 && (
        <EmptyState>商家正在备餐。</EmptyState>
      )}
      {!loading && posts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <ProjectCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </main>
  );
};

export const ProjectDetailPage: React.FC<{ id: string }> = ({ id }) => <ArticleDetail slug={id} />;

export const FramesPage: React.FC = () => {
  const { posts, loading } = useCategoryPosts(['frame']);

  return (
    <main style={pageStyle}>
      <PageHeader eyebrow="Frames" title="取景器外" body="影像的意义，在于把尽兴的瞬间，变成永恒。" />
      {loading && <EmptyState>正在逆转录存储卡。</EmptyState>}
      {!loading && posts.length === 0 && (
        <EmptyState>相比起知道天下事，留住眼前人或许更重要一点。</EmptyState>
      )}
      {!loading && posts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => {
            const cover = getMediaURL(post.cover);
            return (
              <a key={post.slug} href={`#/article/${post.slug}`} className="overflow-hidden rounded-3xl" style={surfaceStyle}>
                <div style={{ aspectRatio: '16 / 10' }}>
                  {cover ? (
                    <img
                      src={cover}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-white/5 text-xs uppercase tracking-[0.18em] text-white/35">
                      No cover
                    </div>
                  )}
                </div>
                <div style={{ padding: 18 }}>
                  <div className="serif-font" style={{ fontSize: 24 }}>
                    {post.title}
                  </div>
                  <div className="mono-font" style={{ marginTop: 6, fontSize: 12, color: '#9aa9bd' }}>
                    {postMeta(post)}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </main>
  );
};

export const DiaryPage: React.FC = () => {
  const { posts, loading } = useCategoryPosts(['diary', 'writing']);

  return (
    <main style={pageStyle}>
      <PageHeader eyebrow="Diary" title="日记" body="日记可以用于未来治疗阿尔兹海默症。" />
      <div className="rounded-3xl p-5 md:p-7" style={surfaceStyle}>
        {loading && <div style={{ color: '#9aa9bd' }}>读取中。</div>}
        {!loading && posts.length === 0 && (
          <div style={{ color: '#9aa9bd' }}>人，如果你把水倒在石头上，什么都没发生。</div>
        )}
        {!loading &&
          posts.map((post) => (
            <a key={post.slug} href={`#/article/${post.slug}`} className="block border-b border-white/10 py-4 last:border-b-0">
              <div className="serif-font" style={{ fontSize: 26, lineHeight: 1.25 }}>
                {post.title}
              </div>
              <div className="mono-font" style={{ marginTop: 8, fontSize: 12, color: '#9aa9bd' }}>
                {postMeta(post)}
              </div>
            </a>
          ))}
      </div>
    </main>
  );
};
