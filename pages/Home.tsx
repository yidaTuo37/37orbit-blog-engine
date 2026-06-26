import SocialLinks from '../components/SocialLinks';
import React, { useEffect, useState } from 'react';
import { contentService } from '../services/api';
import { Post } from '../types';
import ArticleCard from '../components/ArticleCard';

const Home: React.FC = () => {
  const [articles, setArticles] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await contentService.getPosts();
        setArticles(data);
      } catch (err) {
        console.error('Failed to load articles:', err);
        setArticles([]);
        } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  return (
    <div className="relative min-h-[100svh]">
      {/* ===== Hero 区域：始终存在，不卸载 ===== */}
      <section className="mb-20">
        <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
          S属性大爆发<br/>
          <span className="text-[#FF791B]">SLEEP.</span><br/>

        </h1>
        <p className="max-w-xl text-lg text-gray-400 leading-relaxed border-l-2 border-[#FF791B] pl-8">
          LoveLive | Aqours 🍊🎹🐬♦️⛵️😈💮✨🍭 <br/>
          非专业摄像 | 舞萌·音击·中二 | 乌龟 | 1.5L自吸发动机<br/>
          回复TD退订
        </p>
        <div className="mt-10">
  {/* <button
    onClick={() => {
      window.location.hash = '#/annual/2025';
    }}
    className="
      px-6
      py-3
      border
      border-white/20
      text-white/60
      text-xs
      tracking-[0.35em]
      uppercase
      hover:border-[#FF791B]
      hover:text-[#FF791B]
      transition-all
    "
  >
    Annual Review 2025 →
  </button> */}
</div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {loading && (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-64 rounded-2xl bg-white/5 animate-pulse"
        />
      ))}
    </>
  )}

  {!loading && articles.length > 0 && (
    articles.map((article) => (
      <ArticleCard key={article.id} article={article} />
    ))
  )}

  {!loading && articles.length === 0 && (
    <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
      <p className="text-gray-600">
        Wait...
      </p>
    </div>
  )}
</div>
    </div>
  );
};

export default Home;
