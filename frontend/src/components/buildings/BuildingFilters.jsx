import { OPPORTUNITY_TYPES, TARGET_STATES } from '../../utils/constants';

/**
 * BuildingFilters — Filter controls for the buildings table
 */
export default function BuildingFilters({ filters, onFilterChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      {/* State filter */}
      <select
        id="filter-state"
        value={filters.state}
        onChange={(e) => onFilterChange({ ...filters, state: e.target.value })}
        className="bg-gray-900/80 border border-gray-800/60 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-water-500/50 transition-colors"
      >
        <option value="">All States</option>
        {TARGET_STATES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Opportunity type filter */}
      <select
        id="filter-opportunity"
        value={filters.opportunityType}
        onChange={(e) => onFilterChange({ ...filters, opportunityType: e.target.value })}
        className="bg-gray-900/80 border border-gray-800/60 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-water-500/50 transition-colors"
      >
        <option value="">All Opportunity Types</option>
        {OPPORTUNITY_TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* Min score filter */}
      <div className="flex items-center gap-2">
        <label htmlFor="filter-min-score" className="text-xs text-gray-500">Min Score:</label>
        <input
          id="filter-min-score"
          type="number"
          min={0}
          max={100}
          value={filters.minScore}
          onChange={(e) => onFilterChange({ ...filters, minScore: e.target.value })}
          className="w-16 bg-gray-900/80 border border-gray-800/60 rounded-lg px-2 py-2 text-sm text-gray-300 focus:outline-none focus:border-water-500/50 transition-colors"
          placeholder="0"
        />
      </div>

      {/* Large roof filter */}
      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400 hover:text-gray-300 transition-colors">
        <input
          type="checkbox"
          checked={filters.roofOver100k}
          onChange={(e) => onFilterChange({ ...filters, roofOver100k: e.target.checked })}
          className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-water-500 focus:ring-water-500/20"
        />
        Large Roof ({'>'}100K sqft)
      </label>

      {/* Reset */}
      {(filters.state || filters.opportunityType || filters.minScore || filters.roofOver100k) && (
        <button
          onClick={() => onFilterChange({ state: '', opportunityType: '', minScore: '', roofOver100k: false })}
          className="text-xs text-gray-500 hover:text-water-400 transition-colors underline"
        >
          Reset filters
        </button>
      )}
    </div>
  );
}
