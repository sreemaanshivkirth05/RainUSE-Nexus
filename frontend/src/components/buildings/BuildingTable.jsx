import { useState } from 'react';
import { getScoreClass, getViabilityColor, formatGallons, formatSqft } from '../../utils/formatters';
import OpportunityBadge from './OpportunityBadge';
import EmptyState from '../shared/EmptyState';

/**
 * BuildingTable — Sortable ranked building table
 */
export default function BuildingTable({ buildings, onSelectBuilding }) {
  const [sortField, setSortField] = useState('final_viability_score');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sorted = [...buildings].sort((a, b) => {
    const aVal = a[sortField] ?? 0;
    const bVal = b[sortField] ?? 0;
    if (typeof aVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const SortHeader = ({ field, children, className = '' }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-water-400 transition-colors select-none ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-water-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  );

  if (!buildings.length) {
    return <EmptyState message="No buildings match your filters" icon="🏢" />;
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" id="buildings-table">
          <thead>
            <tr className="border-b border-gray-800/60">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-8">#</th>
              <SortHeader field="name">Building</SortHeader>
              <SortHeader field="state">State</SortHeader>
              <SortHeader field="final_viability_score">Score</SortHeader>
              <SortHeader field="opportunity_type">Opportunity</SortHeader>
              <SortHeader field="roof_area_sqft">Roof Area</SortHeader>
              <SortHeader field="annual_capture_gallons">Capture</SortHeader>
              <SortHeader field="cooling_tower_score">Cooling</SortHeader>
            </tr>
          </thead>
          <tbody>
            {sorted.map((building, index) => (
              <tr
                key={building.id}
                id={`building-row-${building.id}`}
                className="table-row-hover border-b border-gray-800/30 last:border-0"
                onClick={() => onSelectBuilding(building)}
              >
                <td className="px-4 py-3.5 text-xs text-gray-600 font-mono">{index + 1}</td>
                <td className="px-4 py-3.5">
                  <div>
                    <div className="text-sm font-medium text-gray-200">{building.name}</div>
                    <div className="text-xs text-gray-500">{building.city}, {building.state}</div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-400">{building.state}</td>
                <td className="px-4 py-3.5">
                  <span className={`score-badge px-2.5 py-1 text-sm ${getScoreClass(building.final_viability_score)}`}>
                    {building.final_viability_score}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <OpportunityBadge type={building.opportunity_type} />
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-400">
                  {formatSqft(building.roof_area_sqft)}
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-400">
                  {formatGallons(building.annual_capture_gallons)}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${(building.cooling_tower_score || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round((building.cooling_tower_score || 0) * 100)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
