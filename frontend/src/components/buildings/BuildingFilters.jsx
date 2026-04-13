import { motion } from 'framer-motion';

const OPPORTUNITY_TYPES = [
  'Rainfall-Driven',
  'Cooling-Demand-Driven',
  'Balanced Opportunity',
];

export default function BuildingFilters({ filters, onFilterChange, states = [] }) {
  function updateField(field, value) {
    onFilterChange((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function clearAll() {
    onFilterChange({
      state: '',
      opportunityType: '',
      minScore: '',
      minRoofArea: '',
      roofOver100k: false,
      minRainfall: '',
      minHarvest: '',
      requireCooling: false,
      highWaterCost: false,
      strongGeometry: false,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-5 shadow-2xl sticky top-24"
    >
      <div className="mb-5">
        <h3 className="text-white font-semibold text-lg">Filter Prospects</h3>
        <p className="text-zinc-500 text-sm mt-1">
          Narrow buildings using the active viability signals.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
            State
          </label>
          <select
            value={filters.state}
            onChange={(e) => updateField('state', e.target.value)}
            className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2.5 text-sm text-white outline-none"
          >
            <option value="">All states</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
            Opportunity Type
          </label>
          <select
            value={filters.opportunityType}
            onChange={(e) => updateField('opportunityType', e.target.value)}
            className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2.5 text-sm text-white outline-none"
          >
            <option value="">All types</option>
            {OPPORTUNITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
            Minimum Score
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={filters.minScore}
            onChange={(e) => updateField('minScore', e.target.value)}
            placeholder="e.g. 40"
            className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2.5 text-sm text-white outline-none"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
            Minimum Roof Area (sqft)
          </label>
          <input
            type="number"
            min="0"
            value={filters.minRoofArea}
            onChange={(e) => updateField('minRoofArea', e.target.value)}
            placeholder="e.g. 150000"
            className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2.5 text-sm text-white outline-none"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
            Minimum Annual Rainfall (inches)
          </label>
          <input
            type="number"
            min="0"
            value={filters.minRainfall}
            onChange={(e) => updateField('minRainfall', e.target.value)}
            placeholder="e.g. 30"
            className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2.5 text-sm text-white outline-none"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 mb-2">
            Minimum Harvest (gallons)
          </label>
          <input
            type="number"
            min="0"
            value={filters.minHarvest}
            onChange={(e) => updateField('minHarvest', e.target.value)}
            placeholder="e.g. 2000000"
            className="w-full rounded-xl bg-zinc-950 border border-white/10 px-3 py-2.5 text-sm text-white outline-none"
          />
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={filters.roofOver100k}
              onChange={(e) => updateField('roofOver100k', e.target.checked)}
              className="accent-emerald-500"
            />
            Roof over 100k sqft
          </label>

          <label className="flex items-center gap-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={filters.requireCooling}
              onChange={(e) => updateField('requireCooling', e.target.checked)}
              className="accent-cyan-500"
            />
            Strong cooling signal
          </label>

          <label className="flex items-center gap-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={filters.highWaterCost}
              onChange={(e) => updateField('highWaterCost', e.target.checked)}
              className="accent-blue-500"
            />
            High water cost
          </label>

          <label className="flex items-center gap-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={filters.strongGeometry}
              onChange={(e) => updateField('strongGeometry', e.target.checked)}
              className="accent-violet-500"
            />
            Strong roof geometry
          </label>
        </div>

        <button
          onClick={clearAll}
          className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 transition-all"
        >
          Clear All Filters
        </button>
      </div>
    </motion.div>
  );
}