import React from 'react';

const iconClass =
  'w-5 h-5 text-white/50 group-hover:text-[#FF791B] transition-colors';

const SocialLinks: React.FC = () => {
  return (
    <div className="flex gap-4">
      {/* X / Twitter */}
      <a
        href="https://x.com/yidatuo37"
        target="_blank"
        rel="noopener noreferrer"
        className="group p-3 bg-white/5 rounded-full hover:bg-[#FF791B]/20 transition-all"
        aria-label="X"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={iconClass}
        >
          <path d="M18.244 2H21l-6.52 7.455L22 22h-6.82l-5.35-7.06L4.2 22H1l7.01-8.02L2 2h6.82l4.82 6.36L18.244 2z" />
        </svg>
      </a>

      {/* Bilibili */}
      <a
        href="https://space.bilibili.com/108402088"
        target="_blank"
        rel="noopener noreferrer"
        className="group p-3 bg-white/5 rounded-full hover:bg-[#FF791B]/20 transition-all"
        aria-label="Bilibili"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={iconClass}
        >
          <path d="M17.813 4.653h-1.978l1.052-1.058a.993.993 0 0 0-1.406-1.405l-2.47 2.478H10.99L8.52 2.19a.993.993 0 1 0-1.406 1.405l1.052 1.058H6.188C3.875 4.653 2 6.542 2 8.875v8.25C2 19.458 3.875 21.347 6.188 21.347h11.625C20.125 21.347 22 19.458 22 17.125v-8.25c0-2.333-1.875-4.222-4.187-4.222zM8.5 15.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
        </svg>
      </a>

      {/* GitHub */}
      <a
        href="https://github.com/yidaTuo37"
        target="_blank"
        rel="noopener noreferrer"
        className="group p-3 bg-white/5 rounded-full hover:bg-[#FF791B]/20 transition-all"
        aria-label="GitHub"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={iconClass}
        >
          <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.4c.58.11.79-.25.79-.55v-1.9c-3.22.7-3.9-1.55-3.9-1.55-.53-1.36-1.3-1.73-1.3-1.73-1.07-.73.08-.72.08-.72 1.18.09 1.8 1.2 1.8 1.2 1.05 1.8 2.76 1.28 3.43.98.11-.77.41-1.28.75-1.57-2.57-.29-5.27-1.28-5.27-5.7 0-1.26.45-2.3 1.2-3.11-.12-.3-.52-1.5.11-3.13 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.5 3.17-1.18 3.17-1.18.64 1.63.24 2.83.12 3.13.75.81 1.19 1.85 1.19 3.1 0 4.44-2.71 5.4-5.29 5.69.42.36.8 1.07.8 2.17v3.21c0 .3.21.66.8.55A11.5 11.5 0 0 0 12 .5Z" />
        </svg>
      </a>
    </div>
  );
};

export default SocialLinks;
