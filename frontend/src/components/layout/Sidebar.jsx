import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../../utils/constants';

export default function Sidebar() {
  return (
    <aside className="w-[260px] flex-shrink-0 bg-gray-950 border-r border-gray-800/60 flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="p-5 border-b border-gray-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-water-500 to-rain-500 flex items-center justify-center text-lg font-bold shadow-lg shadow-water-500/20">
            💧
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight gradient-text">
              RainUSE Nexus
            </h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
              Rainwater Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-water-600/15 text-water-400 border border-water-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`
            }
          >
            <span className="text-base group-hover:scale-110 transition-transform">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-800/60">
        <div className="glass-card p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">Prototype Mode</span>
          </div>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Using mock data. Connect backend API for live data.
          </p>
        </div>
      </div>
    </aside>
  );
}
