import React, { useEffect, useMemo, useState } from 'react';
import 'katex/dist/katex.min.css';
import { contentService, getMediaURL } from '../services/api';
import { Post } from '../types';
import { withMinimumDelay } from '../utils/loading';

type Props = { slug: string };

function stripHtml(html: string): string { return html.replace(/<[^>]*>/g, ''); }
function estimateReadTime(post: Post): number {
  const text = post.content || stripHtml(post.html || '');
  return Math.max(1, Math.round(text.length / 400));
}
function getParentCollection(post: Post): { href: string; label: string; type: string } {
  if (post.category === 'project') return { href: '#/projects', label: 'projects', type: 'PROJECT' };
  if (post.category === 'frame') return { href: '#/frames', label: 'frames', type: 'FRAME' };
  return { href: '#/diary', label: 'diary', type: post.tags.find((tag) => tag.trim())?.trim() || 'DIARY' };
}

const ArticleDetail: React.FC<Props> = ({ slug }) => {
  const [progress, setProgress] = useState(0);
  const [article, setArticle] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const normalizedSlug = decodeURIComponent(slug.split('?')[0] || '').replace(/\/+$/, '');

  useEffect(() => {
    let active = true;
    if (!normalizedSlug) {
      setError('Invalid article slug.');
      setLoading(false);
      return;
    }
    const loadArticle = async () => {
      try {
        setLoading(true);
        const data = await withMinimumDelay(contentService.getPostBySlug(normalizedSlug));
        if (!data) throw new Error('Article not found');
        if (active) { setArticle(data); setError(null); }
      } catch (err) {
        console.error('Failed to load article:', err);
        if (active) setError('Transmission failed.');
      } finally {
        if (active) setLoading(false);
      }
    };
    const reloadWhenVisible = () => { if (document.visibilityState === 'visible') void loadArticle(); };
    void loadArticle();
    window.addEventListener('focus', loadArticle);
    document.addEventListener('visibilitychange', reloadWhenVisible);
    return () => {
      active = false;
      window.removeEventListener('focus', loadArticle);
      document.removeEventListener('visibilitychange', reloadWhenVisible);
    };
  }, [normalizedSlug]);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight <= 0 ? 0 : Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100)));
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const coverUrl = useMemo(() => getMediaURL(article?.cover), [article?.cover]);

  if (loading) return <div className="orbit-loading">DECRYPTING PACKET.</div>;
  if (error || !article) return <div className="orbit-error">ARTICLE NOT FOUND IN CURRENT SECTOR.</div>;

  const readMinutes = estimateReadTime(article);
  const displayDate = article.updated_at || article.created_at;
  const parentCollection = getParentCollection(article);
  const topic = article.tags.find((tag) => tag.trim())?.trim() || parentCollection.type;

  return (
    <>
      <div className="fixed left-0 top-0 z-50 h-[2px] w-full bg-transparent"><div className="h-full bg-[#ff7a45] transition-[width] duration-150" style={{ width: `${progress}%` }} /></div>
      <article className="orbit-detail">
        <header className="orbit-detail-header">
          <div className="orbit-detail-path">
            <a href={parentCollection.href}>← {parentCollection.label}</a>
            <span className="orbit-detail-path-separator">/</span>
            <span>{topic}</span>
          </div>
          <h1>{article.title}</h1>
          <div className="orbit-detail-meta">
            <span><strong>{parentCollection.type}</strong></span>
            <span>{new Date(displayDate).toLocaleDateString()}</span>
            <span>{readMinutes} MIN READ</span>
            <a href="#/">RETURN TO ORBIT ↗</a>
          </div>
        </header>

        {coverUrl && <div className="orbit-detail-cover"><img src={coverUrl} alt={article.title} onClick={() => setPreviewImage(coverUrl)} /></div>}

        <div
          className="orbit-detail-body prose prose-invert max-w-none"
          onClick={(event) => {
            const target = event.target;
            if (target instanceof HTMLImageElement && target.currentSrc) setPreviewImage(target.currentSrc);
          }}
          dangerouslySetInnerHTML={{ __html: article.html || '' }}
        />

        <footer className="orbit-detail-footer">
          <a href={parentCollection.href}>← BACK TO {parentCollection.label}</a>
          <a href="#/">37ORBIT / END OF TRANSMISSION →</a>
        </footer>
      </article>

      {previewImage && (
        <div className="orbit-lightbox" role="dialog" aria-label="Image preview" onClick={() => setPreviewImage(null)}>
          <div onClick={(event) => event.stopPropagation()}>
            <button aria-label="Close image preview" onClick={() => setPreviewImage(null)}>×</button>
            <img src={previewImage} alt="Preview" />
          </div>
        </div>
      )}
    </>
  );
};

export default ArticleDetail;
