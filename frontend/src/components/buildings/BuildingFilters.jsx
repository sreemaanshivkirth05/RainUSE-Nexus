import { TARGET_STATES } from '../../utils/constants';

/**
 * BuildingFilters — Sidebar filter controls for the buildings table
 */
export default function BuildingFilters({ filters, onFilterChange }) {

  const handleCheckbox = (key) => {
    onFilterChange({ ...filters, [key]: !filters[key] });
  };

  const handleInput = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="glass-card rounded-2xl p-5 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-gray-200">Filters</h3>
        <button
          onClick={() => onFilterChange({
            state: '', minRoofArea: '', roofOver100k: false, minRainfall: '', minHarvest: '',
            requireCooling: false, highWaterCost: false, highFloodRisk: false,
            requireESG: false, requireLEED: false, requireEnergyStar: false
          })}
          className="text-xs text-gray-500 hover:text-emerald-400 transition-colors"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-6">
        {/* Global/Location */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</label>
          <select
            value={filters.state}
            onChange={(e) => handleInput('state', e.target.value)}
            className="w-full bg-gray-900/80 border border-gray-800/60 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
          >
            <option value="">All Regions</option>
            {TARGET_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* 1. Catchment */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            Catchment Match
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">
            <input
              type="checkbox"
              checked={filters.roofOver100k}
              onChange={() => handleCheckbox('roofOver100k')}
              className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-blue-500 focus:ring-blue-500/20"
            />
            Target 100k sqft Roof
          </label>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Min Harvest (Gallons)</label>
            <input
              type="number"
              value={filters.minHarvest}
              onChange={(e) => handleInput('minHarvest', e.target.value)}
              className="w-full bg-gray-900/80 border border-gray-800/60 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50"
              placeholder="e.g. 500000"
            />
          </div>
        </div>

        {/* 2. Demand */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            Demand Fit
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">
            <input
              type="checkbox"
              checked={filters.requireCooling}
              onChange={() => handleCheckbox('requireCooling')}
              className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-cyan-500 focus:ring-cyan-500/20"
            />
            High Cooling Tower Load
          </label>
        </div>

        {/* 3. Economic */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            Economic Viability
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">
            <input
              type="checkbox"
              checked={filters.highWaterCost}
              onChange={() => handleCheckbox('highWaterCost')}
              className="w-4 h-4 rounded border-white/10 bg-zinc-900"
            />
            High Water Cost Margin
          </label>
        </div>

        {/* 4. Resilience */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            Strategic Resilience
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">
            <input
              type="checkbox"
              checked={filters.highFloodRisk}
              onChange={() => handleCheckbox('highFloodRisk')}
              className="w-4 h-4 rounded border-white/10 bg-zinc-900"
            />
            Mitigates Urban Flooding
          </label>
        </div>

        {/* 5. Adoption */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            Adoption Readiness
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">
              <input
                type="checkbox"
                checked={filters.requireESG}
                onChange={() => handleCheckbox('requireESG')}
                className="w-4 h-4 rounded border-white/10 bg-zinc-900"
              />
              Strong ESG / SBTi Profile
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">
              <input
                type="checkbox"
                checked={filters.requireLEED}
                onChange={() => handleCheckbox('requireLEED')}
                className="w-4 h-4 rounded border-white/10 bg-zinc-900"
              />
              LEED Certified
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
