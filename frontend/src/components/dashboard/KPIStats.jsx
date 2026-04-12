import StatCard from '../shared/StatCard';
import { formatNumber, formatGallons } from '../../utils/formatters';

/**
 * KPIStats — Dashboard KPI stat cards
 */
export default function KPIStats({ summary }) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon="🏢"
        label="Total Buildings"
        value={formatNumber(summary.total_buildings)}
        sublabel={`${summary.buildings_over_100k} with large roofs`}
        colorClass="text-water-400"
      />
      <StatCard
        icon="🗺️"
        label="States Covered"
        value={summary.total_states}
        sublabel={`Top: ${summary.top_state}`}
        colorClass="text-rain-400"
      />
      <StatCard
        icon="⭐"
        label="Avg Viability Score"
        value={summary.average_viability_score}
        sublabel="out of 100"
        colorClass="text-nexus-400"
      />
      <StatCard
        icon="💧"
        label="Total Capture Potential"
        value={formatGallons(summary.total_annual_capture_gallons)}
        sublabel="annual gallons"
        colorClass="text-emerald-400"
      />
    </div>
  );
}
