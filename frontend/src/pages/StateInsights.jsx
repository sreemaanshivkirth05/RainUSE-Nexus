import StateInsightsTable from '../components/states/StateInsightsTable';
import StatCard from '../components/shared/StatCard';
import { formatGallons } from '../utils/formatters';
import mockSummary from '../data/mockSummary.json';

/**
 * StateInsights — State-level summary and analysis page
 */
export default function StateInsights() {
  const summary = mockSummary;
  const states = summary.state_summaries || [];

  // Compute state-level aggregates
  const avgRainfall = states.length
    ? (states.reduce((sum, s) => sum + s.avg_rainfall_inches, 0) / states.length).toFixed(1)
    : 0;
  const totalCapture = states.reduce((sum, s) => sum + s.total_capture_gallons, 0);
  const topState = states[0] || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-100">
          State Insights
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Aggregated analysis across {states.length} target states
        </p>
      </div>

      {/* State-level KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="🗺️"
          label="States Analyzed"
          value={states.length}
          colorClass="text-water-400"
        />
        <StatCard
          icon="🌧️"
          label="Avg Rainfall"
          value={`${avgRainfall} in`}
          sublabel="across all states"
          colorClass="text-blue-400"
        />
        <StatCard
          icon="💧"
          label="Total Capture"
          value={formatGallons(totalCapture)}
          sublabel="all states combined"
          colorClass="text-rain-400"
        />
        <StatCard
          icon="🏆"
          label="Top State"
          value={topState.state || '—'}
          sublabel={`Score: ${topState.avg_viability_score || 0}`}
          colorClass="text-amber-400"
        />
      </div>

      {/* Opportunity type distribution */}
      <div className="glass-card p-5 rounded-xl">
        <h3 className="font-display font-semibold text-gray-200 mb-4">
          Opportunity Type Distribution by State
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Cooling-Demand-Driven', 'Rainfall-Driven', 'Resilience-Driven', 'Balanced Opportunity', 'Mixed'].map((type) => {
            const count = states.filter(s => s.dominant_opportunity === type).length;
            if (count === 0) return null;
            return (
              <div key={type} className="bg-gray-800/40 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-200">{count}</div>
                <div className="text-xs text-gray-500 mt-0.5">{type}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* State details table */}
      <div>
        <h3 className="font-display font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <span>📋</span> State Detail Table
        </h3>
        <StateInsightsTable states={states} />
      </div>
    </div>
  );
}
