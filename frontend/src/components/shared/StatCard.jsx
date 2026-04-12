/**
 * StatCard — Reusable KPI stat card component
 */
export default function StatCard({ label, value, sublabel, icon, trend, colorClass = 'text-water-400' }) {
  return (
    <div className="glass-card glass-card-hover p-5 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            trend > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className={`text-2xl font-display font-bold ${colorClass} mb-1`}>
        {value}
      </div>
      <div className="text-sm text-gray-400 font-medium">{label}</div>
      {sublabel && (
        <div className="text-xs text-gray-600 mt-1">{sublabel}</div>
      )}
    </div>
  );
}
