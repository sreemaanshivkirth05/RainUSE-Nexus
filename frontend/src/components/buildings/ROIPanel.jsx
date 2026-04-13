import { Droplets, DollarSign, Clock, Leaf, HardHat, Activity, TrendingUp, Shield, Star } from 'lucide-react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SYSTEM_COST = 45_000;          // USD
const DEFAULT_WATER_RATE = 0.006;    // $/gallon
const CO2_PER_GALLON = 0.00035;      // kg CO2 / gallon
const RAINFALL_COEFFICIENT = 0.623;  // roof sqft × rain inches × 0.623 = gallons

// ---------------------------------------------------------------------------
// "Why This Building?" dimension config
// ---------------------------------------------------------------------------
const DIMENSIONS = [
  {
    id: 'physical',
    label: 'Physical / Catchment',
    icon: HardHat,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    description: 'Large, accessible roof area with favorable geometry for collection infrastructure.',
    opportunityTypes: ['Rainfall-Driven', 'Balanced Opportunity'],
    scoreKeys: ['roof_area_score', 'roof_geometry_quality_score', 'facility_score'],
  },
  {
    id: 'cooling',
    label: 'Cooling Demand',
    icon: Activity,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    description: 'Significant mechanical cooling load creates ongoing high-volume demand for harvested make-up water.',
    opportunityTypes: ['Cooling-Demand-Driven'],
    scoreKeys: ['cooling_tower_score', 'cooling_degree_days_score'],
  },
  {
    id: 'economic',
    label: 'Economic Viability',
    icon: DollarSign,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    description: 'Elevated local water rates, state incentive programs, and supportive policy frameworks strengthen the financial case.',
    opportunityTypes: ['Balanced Opportunity'],
    scoreKeys: ['water_cost_score', 'state_policy_score', 'local_incentive_score'],
  },
  {
    id: 'resilience',
    label: 'Strategic Resilience',
    icon: Shield,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    description: 'Water stress or flood-risk context makes on-site storage a strategic hedge against supply disruptions.',
    opportunityTypes: ['Resilience-Driven'],
    scoreKeys: ['flood_score', 'water_stress_score'],
  },
  {
    id: 'esg',
    label: 'ESG / Adoption',
    icon: Star,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    description: 'Corporate sustainability commitments (LEED, ESG, SBTi) create organizational demand for measurable water reduction projects.',
    opportunityTypes: [],
    scoreKeys: ['esg_score', 'leed_score', 'energy_star_score'],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function dimensionAvgScore(building, keys) {
  const vals = keys
    .map((k) => Number(building[k] || 0))
    .filter((v) => v > 0);
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function getRankedDimensions(building, opportunityType) {
  return DIMENSIONS
    .map((dim) => {
      const avg = dimensionAvgScore(building, dim.scoreKeys);
      const isPrimary = dim.opportunityTypes.includes(opportunityType);
      return { ...dim, avg, isPrimary };
    })
    .sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return b.avg - a.avg;
    });
}

function MetricCard({ icon: Icon, label, value, sub, color, bgColor }) {
  return (
    <div className={`p-5 rounded border border-white/5 ${bgColor} flex flex-col gap-3`}>
      <div className={`${color} opacity-70`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className={`text-2xl font-display font-medium ${color} leading-tight`}>{value}</div>
        {sub && <div className="text-xs text-zinc-500 mt-0.5">{sub}</div>}
      </div>
      <div className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 mt-auto">{label}</div>
    </div>
  );
}

function ScoreBar({ score }) {
  const pct = Math.round(Math.min(score, 1) * 100);
  const color = pct >= 60 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-zinc-600';
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono text-zinc-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ROIPanel({ building }) {
  const roofSqft   = Number(building.roof_area_sqft || 0);
  const rainIn     = Number(building.annual_rain_inches || 0);
  const waterCost  = Number(building.water_cost || 0);

  // Derive water rate: building.water_cost is in $/kgal → convert to $/gal
  // If not available, fall back to default
  const waterRatePerGal =
    waterCost > 0 ? waterCost / 1000 : DEFAULT_WATER_RATE;

  const capturedGal   = roofSqft * rainIn * RAINFALL_COEFFICIENT;
  const annualSavings = capturedGal * waterRatePerGal;
  const paybackYears  = annualSavings > 0 ? SYSTEM_COST / annualSavings : null;
  const co2Kg         = capturedGal * CO2_PER_GALLON;

  const formatMoney = (n) =>
    n >= 1000
      ? `$${(n / 1000).toFixed(1)}K`
      : `$${n.toFixed(0)}`;

  const formatGalShort = (n) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(2)}M gal`
      : `${(n / 1_000).toFixed(1)}K gal`;

  const formatCO2 = (kg) =>
    kg >= 1000 ? `${(kg / 1000).toFixed(2)} t CO₂` : `${kg.toFixed(0)} kg CO₂`;

  const metrics = [
    {
      icon: Droplets,
      label: 'Annual Rainfall Capture',
      value: formatGalShort(capturedGal),
      sub: `${roofSqft.toLocaleString()} sqft × ${rainIn.toFixed(1)} in × 0.623`,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/5',
    },
    {
      icon: DollarSign,
      label: 'Annual Water Cost Savings',
      value: formatMoney(annualSavings),
      sub: `@ $${(waterRatePerGal * 1000).toFixed(2)}/kgal${waterCost > 0 ? ' (site rate)' : ' (default rate)'}`,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/5',
    },
    {
      icon: Clock,
      label: 'Est. Payback Period',
      value: paybackYears != null ? `${paybackYears.toFixed(1)} yr` : '—',
      sub: `$${SYSTEM_COST.toLocaleString()} system ÷ annual savings`,
      color: paybackYears != null && paybackYears <= 10 ? 'text-emerald-400' : 'text-amber-400',
      bgColor: 'bg-zinc-900/60',
    },
    {
      icon: Leaf,
      label: 'CO₂ Equivalent Saved',
      value: formatCO2(co2Kg),
      sub: `${CO2_PER_GALLON} kg CO₂ / gallon displaced`,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/5',
    },
  ];

  const rankedDims = getRankedDimensions(building, building.opportunity_type);

  return (
    <div className="space-y-6">
      {/* ROI Metrics 2×2 grid */}
      <section className="p-6 md:p-8 rounded bg-zinc-900/30 border border-white/5">
        <h3 className="font-display font-medium text-xl text-zinc-200 mb-6 tracking-wide flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          ROI Calculator
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        <p className="text-[11px] text-zinc-600 mt-4 leading-relaxed">
          Estimates assume a ${SYSTEM_COST.toLocaleString()} installed system cost and{' '}
          {waterCost > 0
            ? `the building's reported water cost of $${(waterRatePerGal * 1000).toFixed(2)}/kgal`
            : `a default water rate of $${(DEFAULT_WATER_RATE * 1000).toFixed(0)}/kgal`}
          . Actual savings vary by system design, local tariffs, and usage patterns.
        </p>
      </section>

      {/* Why This Building? */}
      <section className="p-6 md:p-8 rounded bg-zinc-900/30 border border-white/5">
        <h3 className="font-display font-medium text-xl text-zinc-200 mb-2 tracking-wide">
          Why This Building?
        </h3>
        <p className="text-zinc-500 text-sm mb-6">
          Score driver analysis across the five viability dimensions.
        </p>

        <div className="space-y-3">
          {rankedDims.map((dim, i) => {
            const Icon = dim.icon;
            return (
              <div
                key={dim.id}
                className={`p-4 rounded border ${dim.isPrimary ? `${dim.borderColor} ${dim.bgColor}` : 'border-white/5 bg-zinc-900/20'} transition-colors`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${dim.isPrimary ? dim.color : 'text-zinc-600'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-sm font-medium ${dim.isPrimary ? dim.color : 'text-zinc-400'}`}>
                        {dim.label}
                      </span>
                      {i === 0 && dim.isPrimary && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 font-mono uppercase tracking-wide">
                          Primary Driver
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      {dim.description}
                    </p>
                    <ScoreBar score={dim.avg} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
