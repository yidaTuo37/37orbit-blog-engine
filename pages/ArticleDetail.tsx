import React, { useEffect, useMemo, useState } from 'react';
import 'katex/dist/katex.min.css';
import { contentService, getMediaURL } from '../services/api';
import { Post } from '../types';

type Props = {
  slug: string;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function estimateReadTime(post: Post): number {
  const text = post.content || stripHtml(post.html || '');
  return Math.max(1, Math.round(text.length / 400));
}

function getParentCollection(post: Post): { href: string; label: string } {
  if (post.category === 'project') return { href: '#/projects', label: 'projects' };
  if (post.category === 'frame') return { href: '#/frames', label: 'frames' };
  return { href: '#/diary', label: 'diary' };
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
        const data = await contentService.getPostBySlug(normalizedSlug);
        if (!data) throw new Error('Article not found');
        if (active) {
          setArticle(data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load article:', err);
        if (active) setError('Transmission failed.');
      } finally {
        if (active) setLoading(false);
      }
    };
    const reloadWhenVisible = () => {
      if (document.visibilityState === 'visible') void loadArticle();
    };

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
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setProgress(0);
        return;
      }
      const scrolled = (scrollTop / docHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrolled)));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const coverUrl = useMemo(() => getMediaURL(article?.cover), [article?.cover]);

  if (loading) {
    return <div className="py-40 text-center font-mono animate-pulse">DECRYPTING PACKET.</div>;
  }

  if (error || !article) {
    return <div className="py-40 text-center text-red-400">Article not found in current sector.</div>;
  }

  const readMinutes = estimateReadTime(article);
  const displayDate = article.updated_at || article.created_at;
  const parentCollection = getParentCollection(article);

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-[2px] z-50 bg-transparent">
        <div
          className="h-full bg-[#FF791B] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article className="max-w-4xl mx-auto">
        <div className="mb-8 md:mb-10">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex flex-col items-start gap-1">
              <a href="#/" className="text-sm font-black tracking-[0.12em] text-[#FF791B] hover:underline md:text-base">
                ← return to orbit
              </a>
              <a href={parentCollection.href} className="text-[11px] font-bold tracking-[0.1em] text-gray-500 hover:text-gray-300 hover:underline">
                ← {parentCollection.label}
              </a>
            </div>
            <div className="h-px bg-white/10 flex-grow"></div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-[#FF791B] rounded-full"></div>
              <span>Published {new Date(displayDate).toLocaleDateString()}</span>
            </div>
            <span>•</span>
            <span>{readMinutes} min read</span>
          </div>
        </div>

        {coverUrl && (
          <div className="rounded-3xl overflow-hidden mb-10 md:mb-12 border border-white/5 shadow-2xl">
            <img
              src={coverUrl}
              alt={article.title}
              className="cursor-zoom-in w-full"
              onClick={() => setPreviewImage(coverUrl)}
            />
          </div>
        )}

        <div className="h-px bg-white/5 mb-8"></div>

        <div
          className="prose prose-invert max-w-none"
          onClick={(event) => {
            const target = event.target;
            if (target instanceof HTMLImageElement && target.currentSrc) {
              setPreviewImage(target.currentSrc);
            }
          }}
          dangerouslySetInnerHTML={{ __html: article.html || '' }}
        />
      </article>

      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative" onClick={(event) => event.stopPropagation()}>
            <button
              aria-label="Close image preview"
              className="
                absolute -top-3 -left-3 z-[110]
                w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm
                flex items-center justify-center text-2xl leading-none
                transition hover:bg-black/80
              "
              style={{ color: '#FF791B' }}
              onClick={() => setPreviewImage(null)}
            >
              ×
            </button>

            <img
              src={previewImage}
              alt="Preview"
              className="max-w-[90vw] max-h-[90vh] object-contain cursor-zoom-out"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ArticleDetail;
