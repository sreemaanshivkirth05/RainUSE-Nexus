import { FEATURE_GROUPS } from '../../utils/constants';
import { getScoreColor } from '../../utils/formatters';

/**
 * ScoreBreakdown — Visual breakdown of all feature scores grouped by category
 */
export default function ScoreBreakdown({ building }) {
  if (!building) return null;

  return (
    <div className="space-y-5">
      {FEATURE_GROUPS.map((group) => (
        <div key={group.id} className="glass-card p-4 rounded-xl">
          {/* Group header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">{group.icon}</span>
            <h4 className={`text-sm font-semibold ${group.textColor}`}>
              {group.label}
            </h4>
          </div>

          {/* Feature scores */}
          <div className="space-y-2.5">
            {group.features.map((feature) => {
              const value = building[feature.key];
              const isScore = feature.format === 'score';
              const displayValue = isScore
                ? `${Math.round((value || 0) * 100)}%`
                : feature.format === 'boolean'
                  ? (value ? 'Yes' : 'No')
                  : feature.format === 'gallons'
                    ? `${((value || 0) / 1_000_000).toFixed(2)}M`
                    : feature.format === 'rainfall'
                      ? `${(value || 0).toFixed(1)} in`
                      : feature.format === 'sqft'
                        ? `${(value || 0).toLocaleString()}`
                        : value;

              return (
                <div key={feature.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">{feature.label}</span>
                    <span className="text-xs font-medium text-gray-300">{displayValue}</span>
                  </div>
                  {isScore && (
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${getScoreColor(value || 0)}`}
                        style={{ width: `${(value || 0) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
