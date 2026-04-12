import { useState, useMemo } from 'react';
import BuildingTable from '../components/buildings/BuildingTable';
import BuildingFilters from '../components/buildings/BuildingFilters';
import BuildingDetailDrawer from '../components/buildings/BuildingDetailDrawer';
import mockBuildings from '../data/mockBuildings.json';

/**
 * TopBuildings — Filterable, sortable building list with detail drawer
 */
export default function TopBuildings() {
  const [filters, setFilters] = useState({
    state: '',
    opportunityType: '',
    minScore: '',
    roofOver100k: false,
  });
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  // Apply filters
  const filteredBuildings = useMemo(() => {
    let result = [...mockBuildings];

    if (filters.state) {
      result = result.filter((b) => b.state === filters.state);
    }
    if (filters.opportunityType) {
      result = result.filter((b) => b.opportunity_type === filters.opportunityType);
    }
    if (filters.minScore) {
      result = result.filter((b) => b.final_viability_score >= parseInt(filters.minScore));
    }
    if (filters.roofOver100k) {
      result = result.filter((b) => b.roof_over_100k);
    }

    return result;
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-100">
          Top Buildings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {filteredBuildings.length} buildings ranked by viability score
        </p>
      </div>

      {/* Filters */}
      <BuildingFilters filters={filters} onFilterChange={setFilters} />

      {/* Table */}
      <BuildingTable
        buildings={filteredBuildings}
        onSelectBuilding={setSelectedBuilding}
      />

      {/* Detail Drawer */}
      {selectedBuilding && (
        <BuildingDetailDrawer
          building={selectedBuilding}
          onClose={() => setSelectedBuilding(null)}
        />
      )}
    </div>
  );
}
