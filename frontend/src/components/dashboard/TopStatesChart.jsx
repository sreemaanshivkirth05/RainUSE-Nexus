import { getViabilityColor } from '../../utils/formatters';

/**
 * TopStatesChart — Horizontal bar chart of top states by avg viability score
 */
export default function TopStatesChart({ states }) {
  if (!states || !states.length) return null;

  const sorted = [...states].sort((a, b) => b.avg_viability_score - a.avg_viability_score);
  const maxScore = Math.max(...sorted.map(s => s.avg_viability_score), 1);

  return (
    <div className="glass-card p-5 rounded-xl">
      <h3 className="font-display font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <span>📊</span> States by Average Viability Score
      </h3>
      <div className="space-y-3">
        {sorted.map((state, index) => (
          <div key={state.state} className="flex items-center gap-3" style={{ animationDelay: `${index * 80}ms` }}>
            <div className="w-28 text-sm text-gray-400 truncate">{state.state}</div>
            <div className="flex-1 h-6 bg-gray-800/60 rounded-lg overflow-hidden relative">
              <div
                className="h-full rounded-lg bg-gradient-to-r from-water-600/80 to-rain-500/80 transition-all duration-1000 ease-out flex items-center"
                style={{ width: `${(state.avg_viability_score / maxScore) * 100}%` }}
              >
                <span className="text-xs font-semibold text-white ml-2 whitespace-nowrap">
                  {state.avg_viability_score}
                </span>
              </div>
            </div>
            <div className="w-8 text-xs text-gray-500 text-right">{state.building_count}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-2">
        <span className="text-[10px] text-gray-600">Building count →</span>
      </div>
    </div>
  );
}
