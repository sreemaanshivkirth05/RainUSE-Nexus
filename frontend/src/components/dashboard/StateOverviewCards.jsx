import { formatNumber, formatGallons, getViabilityColor } from '../../utils/formatters';

/**
 * StateOverviewCards — Cards showing state-level summary data
 */
export default function StateOverviewCards({ states }) {
  if (!states || !states.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {states.map((state, index) => (
        <div
          key={state.state}
          className="glass-card glass-card-hover p-4 animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
          id={`state-card-${state.state.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-gray-200">{state.state}</h4>
              <span className="text-xs text-gray-500">{state.building_count} buildings</span>
            </div>
            <span className={`text-lg font-bold ${getViabilityColor(state.avg_viability_score)}`}>
              {state.avg_viability_score}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Avg Rainfall</span>
              <span className="text-gray-400">{state.avg_rainfall_inches.toFixed(1)} in</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Capture Potential</span>
              <span className="text-water-400">{formatGallons(state.total_capture_gallons)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Dominant Type</span>
              <span className="text-gray-400">{state.dominant_opportunity}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Top Building</span>
              <span className="text-gray-300 truncate ml-2 text-right" title={state.top_building}>
                {state.top_building}
              </span>
            </div>
          </div>

          {/* Score bar */}
          <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-water-600 to-rain-500 transition-all duration-700"
              style={{ width: `${state.avg_viability_score}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
