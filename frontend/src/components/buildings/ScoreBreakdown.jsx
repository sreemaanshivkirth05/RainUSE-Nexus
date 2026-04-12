import { FEATURE_GROUPS } from '../../utils/constants';
import { getScoreColor } from '../../utils/formatters';
import { motion } from 'framer-motion';

/**
 * ScoreBreakdown — Visual breakdown of all feature scores grouped by category
 */
export default function ScoreBreakdown({ building }) {
  if (!building) return null;

  return (
    <div className="space-y-5">
      {FEATURE_GROUPS.map((group) => (
        <div key={group.id} className="p-4 rounded border border-white/5 bg-zinc-900/50">
          {/* Group header */}
          <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
            <span className="text-base text-zinc-500 opacity-60">{group.icon}</span>
            <h4 className={`text-sm font-medium text-zinc-200 uppercase tracking-widest`}>
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
                    <span className="text-xs text-zinc-500">{feature.label}</span>
                    <span className="text-xs font-mono text-zinc-300">{displayValue}</span>
                  </div>
                  {isScore && (
                    <div className="w-full h-[3px] bg-zinc-800 rounded-full overflow-hidden mt-1">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(value || 0) * 100}%` }}
                        viewport={{ once: true, amount: 0.8 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className={`h-full rounded-full ${getScoreColor(value || 0)}`}
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
