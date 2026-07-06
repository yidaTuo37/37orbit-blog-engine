import React, { useEffect, useState } from 'react';
import { contentService, getMediaURL } from '../services/api';
import { Post } from '../types';
import ArticleDetail from './ArticleDetail';
import { withMinimumDelay } from '../utils/loading';
import { getFrameTheme, groupFramePostsByTheme } from '../utils/frameShowcase';

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
      ← return to orbit
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
      withMinimumDelay(Promise.all(categories.map((category) => contentService.getPosts({ category }))))
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

const FrameImageFallback: React.FC<{ title: string }> = ({ title }) => (
  <div
    className="flex h-full w-full items-center justify-center bg-white/[0.04] px-8 text-center"
    style={{ color: 'rgba(238, 243, 248, 0.42)' }}
  >
    <span className="mono-font text-xs uppercase" style={{ letterSpacing: '0.18em' }}>
      {title || 'No cover'}
    </span>
  </div>
);

function frameMeta(post: Post): string {
  const year = new Date(post.updated_at || post.created_at).getFullYear();
  const theme = getFrameTheme(post);
  return `${theme === 'Unsorted' ? 'Frames' : theme} / ${year}`;
}

const FrameTile: React.FC<{ post: Post; featured?: boolean }> = ({ post, featured = false }) => {
  const cover = getMediaURL(post.cover);

  return (
    <a
      href={`#/article/${post.slug}`}
      className="group block overflow-hidden rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#FF791B]/80"
      style={surfaceStyle}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: featured ? '16 / 10' : '4 / 3' }}>
        {cover ? (
          <img
            src={cover}
            alt={post.title}
            loading={featured ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <FrameImageFallback title={post.title} />
        )}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{
            padding: featured ? 'clamp(18px, 3vw, 30px)' : 18,
            background: 'linear-gradient(180deg, rgba(5, 8, 13, 0), rgba(5, 8, 13, 0.82))',
          }}
        >
          <div className="mono-font" style={{ fontSize: 11, color: '#9ed0cf', letterSpacing: '0.12em' }}>
            {frameMeta(post)}
          </div>
          <div
            className="serif-font"
            style={{
              marginTop: 8,
              fontSize: featured ? 'clamp(28px, 4vw, 52px)' : 24,
              lineHeight: 1.05,
              color: '#eef3f8',
            }}
          >
            {post.title}
          </div>
        </div>
      </div>
      {post.summary && (
        <div style={{ padding: featured ? '18px clamp(18px, 3vw, 28px) 22px' : '16px 18px 18px' }}>
          <p className="line-clamp-2" style={{ margin: 0, color: '#9aa9bd', fontSize: 14, lineHeight: 1.7 }}>
            {post.summary}
          </p>
        </div>
      )}
    </a>
  );
};

const FrameThemeSection: React.FC<{ theme: string; posts: Post[] }> = ({ theme, posts }) => (
  <section>
    <div className="mb-4 flex items-end justify-between gap-4 border-b border-white/10 pb-3">
      <h2 className="mono-font text-xs uppercase" style={{ color: '#9ed0cf', letterSpacing: '0.16em' }}>
        {theme}
      </h2>
      <div className="mono-font text-xs" style={{ color: '#6f7b8c' }}>
        {posts.length.toString().padStart(2, '0')}
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <FrameTile key={post.slug} post={post} />
      ))}
    </div>
  </section>
);

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
        <EmptyState>我建议你喝摩卡。</EmptyState>
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
  const featuredPosts = posts.slice(0, 3);
  const themeGroups = groupFramePostsByTheme(posts.slice(3));

  return (
    <main style={pageStyle}>
      <PageHeader eyebrow="Frames" title="取景器外" body="影像先作为现场感出现；需要说明时，再进入文字。" />
      {loading && <EmptyState>正在逆转录存储卡。</EmptyState>}
      {!loading && posts.length === 0 && (
        <EmptyState>还没有发布的影像。等第一张照片进入轨道后，这里会成为它的房间。</EmptyState>
      )}
      {!loading && posts.length > 0 && (
        <div className="space-y-10">
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
            {featuredPosts[0] && <FrameTile post={featuredPosts[0]} featured />}
            {featuredPosts.length > 1 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {featuredPosts.slice(1).map((post) => (
                  <FrameTile key={post.slug} post={post} />
                ))}
              </div>
            )}
          </section>

          {themeGroups.length > 0 && (
            <div className="space-y-8">
              {themeGroups.map((group) => (
                <FrameThemeSection key={group.theme} theme={group.theme} posts={group.posts} />
              ))}
            </div>
          )}
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
