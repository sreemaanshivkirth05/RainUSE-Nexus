import { formatNumber, formatGallons, getViabilityColor } from '../../utils/formatters';

/**
 * StateInsightsTable — Detailed state-level summary table
 */
export default function StateInsightsTable({ states }) {
  if (!states || !states.length) return null;

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" id="state-insights-table">
          <thead>
            <tr className="border-b border-gray-800/60">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">State</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Buildings</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Score</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Rainfall</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Roof Area</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Capture</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Dominant Opp.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Top Building</th>
            </tr>
          </thead>
          <tbody>
            {states.map((state) => (
              <tr key={state.state} className="border-b border-gray-800/30 last:border-0 table-row-hover">
                <td className="px-4 py-3.5">
                  <span className="text-sm font-medium text-gray-200">{state.state}</span>
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-400">{state.building_count}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-sm font-bold ${getViabilityColor(state.avg_viability_score)}`}>
                    {state.avg_viability_score}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-400">{state.avg_rainfall_inches.toFixed(1)} in</td>
                <td className="px-4 py-3.5 text-sm text-gray-400">{formatNumber(Math.round(state.avg_roof_area_sqft))} sqft</td>
                <td className="px-4 py-3.5 text-sm text-water-400">{formatGallons(state.total_capture_gallons)}</td>
                <td className="px-4 py-3.5 text-sm text-gray-400">{state.dominant_opportunity}</td>
                <td className="px-4 py-3.5 text-sm text-gray-300 max-w-[200px] truncate" title={state.top_building}>
                  {state.top_building}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
