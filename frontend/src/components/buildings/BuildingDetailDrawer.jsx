import { getScoreClass, getViabilityColor, formatGallons, formatSqft, formatRainfall } from '../../utils/formatters';
import OpportunityBadge from './OpportunityBadge';
import ScoreBreakdown from './ScoreBreakdown';

/**
 * BuildingDetailDrawer — Slide-in detail panel for a selected building
 */
export default function BuildingDetailDrawer({ building, onClose }) {
  if (!building) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="drawer-overlay"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-gray-950 border-l border-gray-800/60 z-50 overflow-y-auto animate-slide-in-right shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="sticky top-0 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800/60 p-5 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-lg text-gray-100 truncate" id="drawer-building-name">
                {building.name}
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">
                {building.city}, {building.state}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-3 p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="Close detail drawer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Score + Opportunity banner */}
          <div className="flex items-center gap-3 mt-4">
            <div className={`score-badge px-4 py-2 text-xl ${getScoreClass(building.final_viability_score)}`}>
              {building.final_viability_score}
            </div>
            <div>
              <OpportunityBadge type={building.opportunity_type} />
              <div className="text-xs text-gray-500 mt-1">
                Base: {(building.base_viability_score * 100).toFixed(1)} → Final: {building.final_viability_score}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Roof Area</div>
              <div className="text-sm font-semibold text-gray-200">{formatSqft(building.roof_area_sqft)}</div>
              {building.roof_over_100k && (
                <span className="text-[10px] text-emerald-400 font-medium">✓ Large Roof</span>
              )}
            </div>
            <div className="glass-card p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Annual Capture</div>
              <div className="text-sm font-semibold text-water-400">{formatGallons(building.annual_capture_gallons)}</div>
            </div>
            <div className="glass-card p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Annual Rainfall</div>
              <div className="text-sm font-semibold text-gray-200">{formatRainfall(building.annual_rain_inches)}</div>
            </div>
            <div className="glass-card p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Cooling Confidence</div>
              <div className="text-sm font-semibold text-cyan-400">{Math.round(building.cooling_confidence * 100)}%</div>
            </div>
          </div>

          {/* Explanation */}
          <div className="glass-card p-4 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <span>💡</span> Explanation
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              {building.explanation}
            </p>
          </div>

          {/* Visual notes */}
          {building.visual_notes && (
            <div className="glass-card p-4 rounded-xl">
              <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <span>👁️</span> Visual Notes
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                {building.visual_notes}
              </p>
            </div>
          )}

          {/* Location */}
          <div className="glass-card p-4 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <span>📍</span> Location
            </h4>
            <div className="text-sm text-gray-400">
              <p>{building.city}, {building.state}</p>
              <p className="text-xs text-gray-600 mt-1">
                {building.latitude.toFixed(4)}, {building.longitude.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <span>📊</span> Score Breakdown
            </h4>
            <ScoreBreakdown building={building} />
          </div>
        </div>
      </div>
    </>
  );
}
