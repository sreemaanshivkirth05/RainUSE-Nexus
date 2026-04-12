import { FEATURE_GROUPS } from '../utils/constants';

/**
 * Methodology — Explains the scoring logic, datasets, and approach
 */
export default function Methodology() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-100">
          Methodology
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          How RainUSE Nexus evaluates and ranks buildings for rainwater reuse potential
        </p>
      </div>

      {/* Overview */}
      <section className="glass-card p-6 rounded-xl">
        <h2 className="font-display text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
          <span>🎯</span> Overview
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          RainUSE Nexus identifies and ranks commercial and industrial buildings that are strong candidates
          for rainwater harvesting and reuse solutions. Each building receives a <strong className="text-gray-200">Viability Score (0–100)</strong> based
          on a weighted analysis of physical, economic, resilience, and sustainability features.
        </p>
      </section>

      {/* Workflow */}
      <section className="glass-card p-6 rounded-xl">
        <h2 className="font-display text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <span>🔄</span> Workflow
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { step: '1', label: 'Load States', desc: 'Select target geographies' },
            { step: '2', label: 'Identify Buildings', desc: 'From footprint datasets' },
            { step: '3', label: 'Enrich', desc: 'Climate, visual, economic signals' },
            { step: '4', label: 'Compute Features', desc: 'Normalize to 0–1 scale' },
            { step: '5', label: 'Score', desc: 'Weighted formula' },
            { step: '6', label: 'Adjust', desc: 'Confidence multiplier' },
            { step: '7', label: 'Classify', desc: 'Opportunity type' },
            { step: '8', label: 'Display', desc: 'Ranked dashboard' },
          ].map((item) => (
            <div key={item.step} className="bg-gray-800/40 rounded-lg p-3 text-center">
              <div className="text-xs font-bold text-water-400 mb-1">Step {item.step}</div>
              <div className="text-sm font-medium text-gray-300">{item.label}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Groups */}
      <section className="glass-card p-6 rounded-xl">
        <h2 className="font-display text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <span>📊</span> Feature Groups & Weights
        </h2>
        <div className="space-y-4">
          {FEATURE_GROUPS.map((group) => (
            <div key={group.id} className="border border-gray-800/60 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>{group.icon}</span>
                <h3 className={`font-semibold ${group.textColor}`}>{group.label}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {group.features.map((f) => (
                  <div key={f.key} className="text-xs text-gray-400 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${group.color}`} />
                    {f.label} <span className="text-gray-600">({f.key})</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scoring formula */}
      <section className="glass-card p-6 rounded-xl">
        <h2 className="font-display text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
          <span>🧮</span> Scoring Formula
        </h2>
        <div className="bg-gray-900/80 rounded-lg p-4 font-mono text-xs text-gray-400 leading-relaxed overflow-x-auto">
          <div className="text-gray-300 mb-2">Base Score =</div>
          <div className="pl-4 space-y-0.5">
            <div><span className="text-water-400">0.12</span> × roof_area_score +</div>
            <div><span className="text-water-400">0.05</span> × roof_threshold_bonus +</div>
            <div><span className="text-water-400">0.05</span> × annual_precip_score +</div>
            <div><span className="text-water-400">0.08</span> × annual_capture_score +</div>
            <div><span className="text-cyan-400">0.12</span> × cooling_tower_score +</div>
            <div><span className="text-cyan-400">0.06</span> × cooling_degree_days_score +</div>
            <div><span className="text-cyan-400">0.04</span> × building_type_score +</div>
            <div><span className="text-cyan-400">0.03</span> × facility_score +</div>
            <div><span className="text-emerald-400">0.08</span> × water_cost_score +</div>
            <div><span className="text-emerald-400">0.05</span> × state_policy_score +</div>
            <div><span className="text-emerald-400">0.04</span> × local_incentive_score +</div>
            <div><span className="text-emerald-400">0.03</span> × improvement_value_score +</div>
            <div><span className="text-amber-400">0.08</span> × flood_score +</div>
            <div><span className="text-amber-400">0.07</span> × water_stress_score +</div>
            <div><span className="text-violet-400">0.04</span> × esg_score +</div>
            <div><span className="text-violet-400">0.03</span> × leed_score +</div>
            <div><span className="text-violet-400">0.03</span> × energy_star_score</div>
          </div>
        </div>
      </section>

      {/* Confidence adjustment */}
      <section className="glass-card p-6 rounded-xl">
        <h2 className="font-display text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
          <span>🎚️</span> Confidence Adjustment
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          The final score is adjusted based on the confidence level of cooling tower detection:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left py-2 px-3 font-medium">Confidence Range</th>
                <th className="text-left py-2 px-3 font-medium">Multiplier</th>
                <th className="text-left py-2 px-3 font-medium">Effect</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr className="border-t border-gray-800/40">
                <td className="py-2 px-3">≥ 0.80</td>
                <td className="py-2 px-3 text-emerald-400 font-medium">1.00</td>
                <td className="py-2 px-3">No adjustment</td>
              </tr>
              <tr className="border-t border-gray-800/40">
                <td className="py-2 px-3">0.60 – 0.79</td>
                <td className="py-2 px-3 text-amber-400 font-medium">0.97</td>
                <td className="py-2 px-3">-3% penalty</td>
              </tr>
              <tr className="border-t border-gray-800/40">
                <td className="py-2 px-3">0.40 – 0.59</td>
                <td className="py-2 px-3 text-orange-400 font-medium">0.93</td>
                <td className="py-2 px-3">-7% penalty</td>
              </tr>
              <tr className="border-t border-gray-800/40">
                <td className="py-2 px-3">{'<'} 0.40</td>
                <td className="py-2 px-3 text-red-400 font-medium">0.88</td>
                <td className="py-2 px-3">-12% penalty</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 bg-gray-900/80 rounded-lg p-3 font-mono text-xs text-gray-400">
          <span className="text-gray-300">Final Score</span> = round(Base Score × Confidence Multiplier × 100)
        </div>
      </section>

      {/* Opportunity types */}
      <section className="glass-card p-6 rounded-xl">
        <h2 className="font-display text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <span>🏷️</span> Opportunity Types
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { type: 'Rainfall-Driven', icon: '🌧️', desc: 'Physical catchment features are the strongest group. Large roofs with high rainfall.', color: 'border-blue-500/30' },
            { type: 'Cooling-Demand-Driven', icon: '❄️', desc: 'Reuse-demand features (cooling) dominate. Buildings with confirmed cooling towers.', color: 'border-cyan-500/30' },
            { type: 'Resilience-Driven', icon: '🛡️', desc: 'Resilience features (flood + water stress) are the strongest. Stormwater management value.', color: 'border-amber-500/30' },
            { type: 'Balanced Opportunity', icon: '⚖️', desc: 'No single group dominates. Well-rounded candidate across all dimensions.', color: 'border-violet-500/30' },
          ].map((opp) => (
            <div key={opp.type} className={`border ${opp.color} rounded-lg p-4 bg-gray-800/20`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{opp.icon}</span>
                <h3 className="font-semibold text-gray-300 text-sm">{opp.type}</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{opp.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data sources */}
      <section className="glass-card p-6 rounded-xl">
        <h2 className="font-display text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <span>📚</span> Data Sources
        </h2>
        <div className="space-y-2">
          {[
            'Microsoft U.S. Building Footprints — building geometry & roof area',
            'NOAA U.S. Climate Normals — annual precipitation',
            'DOE / FEMP Methodology — capture calculation',
            'NOAA Climate at a Glance — cooling degree days',
            'Google Imagery — rooftop visual inspection',
            'FEMA National Risk Index — flood risk',
            'WRI Aqueduct — water stress',
            'EPA ECHO — facility permits',
            'USGBC — LEED certifications',
            'EPA ENERGY STAR — building efficiency',
            'SBTi — corporate sustainability targets',
          ].map((source) => (
            <div key={source} className="flex items-start gap-2 text-sm text-gray-400">
              <span className="text-water-500 mt-0.5">•</span>
              <span>{source}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
