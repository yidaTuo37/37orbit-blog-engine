import React from 'react';
import { Post } from '../types';
import { getMediaURL } from '../services/api';

interface Props {
  article: Post;
}

const ArticleCard: React.FC<Props> = ({ article }) => {
  const imageUrl = getMediaURL(article.cover);
  return (
    <a
      href={`#/article/${article.slug}`}
      className="group block overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-[#FF791B]/40 hover:bg-white/[0.055]"
    >
      <div className="aspect-[16/10] overflow-hidden relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-white/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] to-transparent opacity-60"></div>
      </div>
      
      <div className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-bold tracking-widest text-[#FF791B] uppercase px-2 py-1 bg-[#FF791B]/10 rounded border border-[#FF791B]/20">
            ARTICLE
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            {new Date(article.updated_at || article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        
        <h3 className="text-2xl font-bold text-white group-hover:text-[#FF791B] transition-colors leading-tight mb-4">
          {article.title}
        </h3>
        {article.summary && (
          <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-2">{article.summary}</p>
        )}
        
        <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
          <span>Read Mission Briefing</span>
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </a>
  );
};

export default ArticleCard;
