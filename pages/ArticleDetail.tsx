import React, { useEffect, useState } from 'react';
import { cmsService, contentMediaOrigin, describeCmsError, getMediaURL } from '../services/api';
import { rewriteCmsMediaUrls, sanitizeCmsHtml } from '../services/contentSource';
import type { Post } from '../types';

export default function ArticleDetail({ slug }: { slug: string }) {
  const articleSlug = decodeURIComponent(slug.split('?')[0]).replace(/\/+$/, '');
  const [article, setArticle] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [coverFailed, setCoverFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setCoverFailed(false);
    cmsService.getArticleBySlug(articleSlug)
      .then((post) => { if (active) setArticle(post); })
      .catch((cause) => { if (active) setError(describeCmsError(cause)); })
      .finally(() => { active && setLoading(false); });
    return () => { active = false; };
  }, [articleSlug]);

  useEffect(() => {
    const updateProgress = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(100, Math.max(0, window.scrollY / height * 100)) : 0);
    };
    window.addEventListener('scroll', updateProgress);
    updateProgress();
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  if (loading) return <div className="orbit-article-status">正在读取文章…</div>;
  if (error || !article) return <div className="orbit-article-status" role="alert">文章无法加载：{error || '未找到这篇文章'}</div>;

  const coverUrl = getMediaURL(article.cover);
  const html = sanitizeCmsHtml(rewriteCmsMediaUrls(contentMediaOrigin, article.html ?? ''));
  const readingMinutes = Math.max(1, Math.round(html.replace(/<[^>]*>/g, ' ').length / 400));

  return <>
    <div className="orbit-reading-progress" style={{ width: `${progress}%` }} />
    <article className="orbit-article">
      <a className="orbit-article-back" href="#/journey">← 返回文章目录</a>
      <header className="orbit-article-header">
        <span className="orbit-kicker">{article.category || 'ARTICLE'} / {new Date(article.updatedAt).toLocaleDateString('zh-CN')}</span>
        <h1>{article.title}</h1>
        {article.summary && <p>{article.summary}</p>}
        <small>阅读约 {readingMinutes} 分钟</small>
      </header>
      {coverUrl && !coverFailed && <button className="orbit-article-cover" onClick={() => setPreviewImage(coverUrl)} aria-label="查看封面大图"><img src={coverUrl} alt={article.title} onError={() => setCoverFailed(true)} /></button>}
      <div className="post-content orbit-article-content" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
    {previewImage && <div className="orbit-image-lightbox" onClick={() => setPreviewImage(null)} role="presentation"><button onClick={() => setPreviewImage(null)} aria-label="关闭图片预览">×</button><img src={previewImage} alt={article.title} /></div>}
  </>;
}
