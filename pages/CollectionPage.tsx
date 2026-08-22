import React, { useEffect, useState } from 'react';
import { contentService, getMediaURL } from '../services/api';
import { Post } from '../types';
import ArticleDetail from './ArticleDetail';
import { withMinimumDelay } from '../utils/loading';
import { getFrameTheme, groupFramePostsByTheme } from '../utils/frameShowcase';

const PageHeader: React.FC<{ eyebrow: string; title: string; body: string; signal: string }> = ({ eyebrow, title, body, signal }) => (
  <header className="orbit-collection-header">
    <div>
      <a href="#/" className="orbit-back-link">← return to orbit</a>
      <div className="orbit-kicker">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{body}</p>
    </div>
    <div className="orbit-collection-signal" aria-label={`${eyebrow} status`}>
      <div><span>SECTOR</span><b>37° ORBIT</b></div>
      <div><span>CHANNEL</span><b>{signal}</b></div>
      <div><span>STATUS</span><b>RECEIVING</b></div>
    </div>
  </header>
);

function postMeta(post: Post): string {
  const year = new Date(post.updated_at || post.created_at).getFullYear();
  return `${post.category || 'post'} / ${year}`;
}

function sortPosts(items: Post[]): Post[] {
  return [...items].sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
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
          if (active) setPosts(sortPosts(groups.flat().filter((post) => post.status === 'published')));
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
  <div className="orbit-empty-state">{children}</div>
);

const ProjectCard: React.FC<{ post: Post; index: number }> = ({ post, index }) => {
  const cover = getMediaURL(post.cover);
  return (
    <a href={`#/projects/${post.slug}`} className="orbit-collection-card">
      <div className="orbit-card-media">
        {cover ? <img src={cover} alt="" loading="lazy" decoding="async" /> : <div className="orbit-empty-state">NO VISUAL SIGNAL</div>}
      </div>
      <div className="orbit-card-copy">
        <div className="orbit-card-meta"><span>{String(index + 1).padStart(2, '0')} / PROJECT</span><span>{postMeta(post)}</span></div>
        <h2>{post.title}</h2>
        {post.summary && <p>{post.summary}</p>}
      </div>
    </a>
  );
};

const FrameImageFallback: React.FC<{ title: string }> = ({ title }) => (
  <div className="orbit-empty-state" style={{ height: '100%', border: 0, borderRadius: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
    <span className="orbit-kicker">{title || 'NO VISUAL SIGNAL'}</span>
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
    <a href={`#/article/${post.slug}`} className={`orbit-frame-tile${featured ? ' orbit-frame-feature' : ''}`}>
      <div className="orbit-frame-media">
        {cover ? <img src={cover} alt="" loading={featured ? 'eager' : 'lazy'} decoding="async" /> : <FrameImageFallback title={post.title} />}
        <div className="orbit-frame-overlay">
          <div className="orbit-frame-meta">{frameMeta(post)}</div>
          <h2>{post.title}</h2>
        </div>
      </div>
      {post.summary && <div className="orbit-frame-copy"><p>{post.summary}</p></div>}
    </a>
  );
};

const FrameThemeSection: React.FC<{ theme: string; posts: Post[] }> = ({ theme, posts }) => (
  <section className="orbit-topic-section">
    <div className="orbit-topic-heading">
      <div><div className="orbit-kicker">FRAME THEME</div><h2>{theme}</h2></div>
      <div className="orbit-topic-count">{String(posts.length).padStart(2, '0')} FRAMES</div>
    </div>
    <div className="orbit-collection-grid">{posts.map((post) => <FrameTile key={post.slug} post={post} />)}</div>
  </section>
);

export const ProjectsPage: React.FC = () => {
  const { posts, loading } = useCategoryPosts(['project']);
  return (
    <main className="orbit-collection">
      <PageHeader eyebrow="PROJECT ARCHIVE" title="可以先去倒杯咖啡" body="一些被做出来、被放下，或仍在轨道上运行的项目记录。" signal="PROJECTS" />
      <div className="orbit-collection-body">
        {loading && <EmptyState>SCANNING PROJECT ARCHIVE.</EmptyState>}
        {!loading && posts.length === 0 && <EmptyState>当前轨道没有项目记录。建议先喝一杯摩卡。</EmptyState>}
        {!loading && posts.length > 0 && <div className="orbit-collection-grid">{posts.map((post, index) => <ProjectCard key={post.slug} post={post} index={index} />)}</div>}
      </div>
    </main>
  );
};

export const ProjectDetailPage: React.FC<{ id: string }> = ({ id }) => <ArticleDetail slug={id} />;

export const FramesPage: React.FC = () => {
  const { posts, loading } = useCategoryPosts(['frame']);
  const featuredPosts = posts.slice(0, 3);
  const themeGroups = groupFramePostsByTheme(posts.slice(3));
  return (
    <main className="orbit-collection">
      <PageHeader eyebrow="FRAME ARCHIVE" title="取景器外" body="影像的意义，在于把尽兴的瞬间，变成永恒。" signal="FRAMES" />
      <div className="orbit-collection-body">
        {loading && <EmptyState>READING MEMORY CARD.</EmptyState>}
        {!loading && posts.length === 0 && <EmptyState>相比起知道天下事，留住眼前人或许更重要一点。</EmptyState>}
        {!loading && posts.length > 0 && <>
          <section className="orbit-frame-featured">
            {featuredPosts[0] && <FrameTile post={featuredPosts[0]} featured />}
            {featuredPosts.length > 1 && <div>{featuredPosts.slice(1).map((post) => <FrameTile key={post.slug} post={post} />)}</div>}
          </section>
          {themeGroups.length > 0 && <div>{themeGroups.map((group) => <FrameThemeSection key={group.theme} theme={group.theme} posts={group.posts} />)}</div>}
        </>}
      </div>
    </main>
  );
};

export const DiaryPage: React.FC = () => {
  const { posts, loading } = useCategoryPosts(['diary', 'writing']);
  return (
    <main className="orbit-collection">
      <PageHeader eyebrow="WRITTEN TRANSMISSIONS" title="日记" body="一些尚未被归档成结论的想法、观察与路过。" signal="DIARY" />
      <div className="orbit-collection-body">
        {loading && <EmptyState>RECEIVING TRANSMISSION.</EmptyState>}
        {!loading && posts.length === 0 && <EmptyState>人，如果你把水倒在石头上，什么都没发生。</EmptyState>}
        {!loading && posts.length > 0 && <div className="orbit-diary-list">{posts.map((post, index) => (
          <a key={post.slug} href={`#/article/${post.slug}`} className="orbit-diary-item">
            <div className="orbit-diary-index">{String(index + 1).padStart(2, '0')}</div>
            <div><div className="orbit-diary-title">{post.title}</div>{post.summary && <div className="orbit-diary-summary">{post.summary}</div>}</div>
            <div className="orbit-diary-meta"><div>{postMeta(post)}</div><div className="orbit-diary-arrow" aria-hidden="true">→</div></div>
          </a>
        ))}</div>}
      </div>
    </main>
  );
};
