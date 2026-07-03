import SocialLinks from './SocialLinks';
import React from 'react';
import SiteLogo from '../assets/logo/Lumkfs-Logo.png';
const FEATURES = {
  NAV_ITEMS: false,
  COMMAND_CENTER: false,
};

const navItems = [
  { label: 'Journal', href: '#/', enabled: false },
  { label: 'Orbitals', href: '#/projects', enabled: false },
  { label: 'Intelligence', href: '#/about', enabled: false },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
  className="min-h-screen flex flex-col selection:bg-[#ef8d69] selection:text-white"
  style={{ backgroundColor: '#040914' }} >
      {/* <div className="
        fixed
        left -6
        bottom-24
        left-6
        z-40
        md:block
        ">
        <SocialLinks />
      </div> */}
      {/* Space Background Elements */}
      <div className="hidden md:block fixed inset-0 pointer-events-none overflow-hidden -z-10 will-change-transform">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#356aa8]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#ef8d69]/10 rounded-full blur-[100px]"></div>
      </div>

      <header className="sticky top-0 z-50 bg-[#040914]/85 backdrop-blur-md border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full border-2 border-[#ef8d69] flex items-center justify-center group-hover:rotate-[360deg] transition-transform duration-700">
               <div className="w-2 h-2 bg-[#ef8d69] rounded-full"></div>
            </div>
            <span className="text-xl font-bold tracking-tighter orbit-font">
              37<span className="text-[#ef8d69]">ORBIT</span>
            </span>
          </a>

          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
  {navItems
    .filter(item => item.enabled)
    .map(item => (
      <a
        key={item.label}
        href={item.href}
        className="hover:text-[#ef8d69] transition-colors"
      >
        {item.label}
      </a>
    ))}
</div>
          {FEATURES.COMMAND_CENTER && (
  <button className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-semibold hover:border-[#ef8d69] hover:text-[#ef8d69] transition-all">
    COMMAND CENTER
  </button>
)}
        </nav>
      </header>

      <main className="relative flex-grow max-w-7xl mx-auto px-6 py-12 pb-24 w-full">
        <div
          className="
          absolute
          left-6
          bottom-1
          "
          >
          <SocialLinks />
        </div>
        <div
          className="
          absolute
          right-6
          bottom-1
          "
        >
          <a
            href="https://lumkfs.cn"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-3 bg-white/5 rounded-full hover:bg-[#ef8d69]/20 transition-all flex items-center justify-center"
            aria-label="MKFS"
          >
            <img
              src={SiteLogo}
              alt="MKFS"
              className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity"
            />
          </a>
        </div>
        {children}
      </main>

      <footer className="relative border-t border-white/10 py-12 bg-[#040914]">
        {/* Social links: 紧贴 footer 上边线 */}
        {/* <div className="absolute -top-12 left-3">
          <SocialLinks />
        </div> */}
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} 3777
          </div>
          <div className="flex gap-6">
             <div className="w-1.5 h-1.5 bg-[#ef8d69] rounded-full animate-pulse"></div>
             <span className="text-xs tracking-widest text-gray-400 uppercase">System Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
