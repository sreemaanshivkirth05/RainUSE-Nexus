import { useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../utils/constants';

export default function Header() {
  const location = useLocation();
  const currentNav = NAV_ITEMS.find(
    (item) => item.path === location.pathname
  ) || NAV_ITEMS[0];

  return (
    <header className="h-16 flex-shrink-0 border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-sm flex items-center justify-between px-6">
      {/* Page title */}
      <div className="flex items-center gap-3">
        <span className="text-xl">{currentNav.icon}</span>
        <div>
          <h2 className="font-display font-semibold text-lg text-gray-100">
            {currentNav.label}
          </h2>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Search placeholder */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/80 border border-gray-800/60 text-gray-500 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Search buildings...</span>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900/60 border border-gray-800/60 text-xs">
          <span className="text-gray-400">7 States</span>
          <span className="text-gray-700">|</span>
          <span className="text-gray-400">10 Buildings</span>
        </div>
      </div>
    </header>
  );
}
