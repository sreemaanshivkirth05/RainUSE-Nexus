import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../utils/constants';

export default function Header() {
  const location = useLocation();

  return (
    <header className="h-16 flex-shrink-0 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-between px-8 text-zinc-300 sticky top-0 z-50">
      {/* Brand & Nav */}
      <div className="flex items-center gap-10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded bg-zinc-900 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold group-hover:border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.1)] transition-all">
            RN
          </div>
          <span className="font-display font-medium text-lg text-zinc-100 hidden sm:block tracking-wide">
            RainUSE <span className="text-emerald-500/80">Nexus</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-zinc-800 text-emerald-400 border border-white/5 shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                <div className={`${isActive ? 'opacity-100' : 'opacity-60'} transition-opacity`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Status badge */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-full bg-zinc-900 border border-white/[0.04] text-xs font-medium">
          <span className="text-zinc-500">22 States Supported</span>
          <span className="text-zinc-800">|</span>
          <div className="flex items-center gap-2 text-emerald-500/80 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            SYSTEM.LIVE
          </div>
        </div>
      </div>
    </header>
  );
}
