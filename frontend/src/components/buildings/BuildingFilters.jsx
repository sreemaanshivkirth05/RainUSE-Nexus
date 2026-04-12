/**
 * BuildingFilters — Sidebar filter controls for the buildings table
 * Sourced dynamically from backend filter metadata.
 */
export default function BuildingFilters({ filters, metadata, onFilterChange }) {

  const handleInput = (key, value) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  const handleCheckboxScore = (key, threshold) => {
    // Treat the checkbox as a toggle for setting a minimum threshold vs ignoring it
    onFilterChange({ ...filters, [key]: filters[key] ? "" : threshold, page: 1 });
  };

  const clearFilters = () => {
    onFilterChange({
      state: "",
      city: "",
      min_score: "",
      max_score: "",
      opportunity_type: "",
      roof_area_min: "",
      roof_area_max: "",
      rainfall_min: "",
      rainfall_max: "",
      capture_min: "",
      capture_max: "",
      cooling_confidence_min: "",
      water_cost_min: "",
      flood_score_min: "",
      water_stress_min: "",
      esg_min: "",
      leed_min: "",
      energy_star_min: "",
      sort_by: filters.sort_by || "final_viability_score",
      sort_order: filters.sort_order || "desc",
      page: 1,
      page_size: filters.page_size || 50
    });
  };

  if (!metadata) {
    return (
      <div className="glass-card rounded-2xl p-5 sticky top-24 bg-zinc-900/50 animate-pulse h-[600px]">
         <div className="h-6 bg-zinc-800 rounded w-1/3 mb-10"></div>
         <div className="h-4 bg-zinc-800 rounded w-2/3 mb-4"></div>
         <div className="h-10 bg-zinc-800 rounded w-full mb-8"></div>
         <div className="h-4 bg-zinc-800 rounded w-1/2 mb-4"></div>
         <div className="h-10 bg-zinc-800 rounded w-full mb-8"></div>
      </div>
    );
  }

  const { states = [], cities_by_state = {}, opportunity_types = [] } = metadata;
  const cities = filters.state ? (cities_by_state[filters.state] || []) : [];

  return (
    <div className="glass-card rounded-2xl p-5 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-gray-200">Filters</h3>
        <button
          onClick={clearFilters}
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
            value={filters.state || ""}
            onChange={(e) => {
              // Reset city when state changes
              onFilterChange({ ...filters, state: e.target.value, city: "", page: 1 });
            }}
            className="w-full bg-gray-900/80 border border-gray-800/60 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
          >
            <option value="">All Regions</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          
          <select
            value={filters.city || ""}
            onChange={(e) => handleInput('city', e.target.value)}
            disabled={!filters.state || cities.length === 0}
            className="w-full bg-gray-900/80 border border-gray-800/60 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <option value="">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Opportunity Type */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Opportunity Model</label>
          <select
            value={filters.opportunity_type || ""}
            onChange={(e) => handleInput('opportunity_type', e.target.value)}
            className="w-full bg-gray-900/80 border border-gray-800/60 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
          >
            <option value="">All Types</option>
            {opportunity_types.map((type) => (
              <option key={type} value={type}>{type}</option>
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
              checked={filters.roof_area_min === 100000 || filters.roof_area_min === "100000"}
              onChange={() => handleCheckboxScore('roof_area_min', 100000)}
              className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-blue-500 focus:ring-blue-500/20"
            />
            Target 100k sqft Roof
          </label>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Min Harvest (Gallons)</label>
            <input
              type="number"
              value={filters.capture_min || ""}
              onChange={(e) => handleInput('capture_min', e.target.value)}
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
              checked={!!filters.cooling_confidence_min}
              onChange={() => handleCheckboxScore('cooling_confidence_min', 0.7)}
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
              checked={!!filters.water_cost_min}
              onChange={() => handleCheckboxScore('water_cost_min', 0.7)}
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
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">
              <input
                type="checkbox"
                checked={!!filters.flood_score_min}
                onChange={() => handleCheckboxScore('flood_score_min', 0.7)}
                className="w-4 h-4 rounded border-white/10 bg-zinc-900"
              />
              Mitigates Urban Flooding
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">
              <input
                type="checkbox"
                checked={!!filters.water_stress_min}
                onChange={() => handleCheckboxScore('water_stress_min', 0.7)}
                className="w-4 h-4 rounded border-white/10 bg-zinc-900"
              />
              High Water Stress Region
            </label>
          </div>
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
                checked={!!filters.esg_min}
                onChange={() => handleCheckboxScore('esg_min', 0.5)}
                className="w-4 h-4 rounded border-white/10 bg-zinc-900"
              />
              Strong ESG / SBTi Profile
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">
              <input
                type="checkbox"
                checked={!!filters.leed_min}
                onChange={() => handleCheckboxScore('leed_min', 0.5)}
                className="w-4 h-4 rounded border-white/10 bg-zinc-900"
              />
              LEED Certified
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">
              <input
                type="checkbox"
                checked={!!filters.energy_star_min}
                onChange={() => handleCheckboxScore('energy_star_min', 0.5)}
                className="w-4 h-4 rounded border-white/10 bg-zinc-900"
              />
              Energy Star Rated
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
