/**
 * RainUSE Nexus — Constants
 */

// Feature groups for score breakdown display
export const FEATURE_GROUPS = [
  {
    id: 'physical',
    label: 'Physical / Catchment',
    icon: '🏗️',
    textColor: 'text-blue-400',
    colorLight: 'bg-blue-500/20',
    features: [
      { key: 'roof_area_sqft', label: 'Roof Surface Area', format: 'sqft' },
      { key: 'roof_over_100k', label: '> 100k sqft Threshold', format: 'boolean' },
      { key: 'annual_rain_inches', label: 'NOAA Annual Precip.', format: 'rainfall' },
      { key: 'annual_capture_gallons', label: 'Est. Annual Harvest', format: 'gallons' },
      { key: 'building_type_score', label: 'Typology Fit', format: 'score' },
      { key: 'facility_score', label: 'Facility Suitability', format: 'score' },
    ]
  },
  {
    id: 'demand',
    label: 'Reuse Demand',
    icon: '❄️',
    textColor: 'text-cyan-400',
    colorLight: 'bg-cyan-500/20',
    features: [
      { key: 'cooling_tower_score', label: 'Cooling Tower Presence', format: 'score' },
      { key: 'cooling_degree_days_score', label: 'Regional Cooling Load', format: 'score' },
    ]
  },
  {
    id: 'economic',
    label: 'Economic Viability',
    icon: '💰',
    textColor: 'text-emerald-400',
    colorLight: 'bg-emerald-500/20',
    features: [
      { key: 'water_cost_score', label: 'Utility Water Cost', format: 'score' },
      { key: 'state_policy_score', label: 'State Policy Framework', format: 'score' },
      { key: 'local_incentive_score', label: 'Local Incentives', format: 'score' },
      { key: 'improvement_value_score', label: 'Asset Improvement Value', format: 'score' }
    ]
  },
  {
    id: 'resilience',
    label: 'Strategic Resilience',
    icon: '🛡️',
    textColor: 'text-amber-400',
    colorLight: 'bg-amber-500/20',
    features: [
      { key: 'flood_score', label: 'FEMA Flood Risk', format: 'score' },
      { key: 'water_stress_score', label: 'Aqueduct Water Stress', format: 'score' }
    ]
  },
  {
    id: 'esg',
    label: 'Adoption / ESG',
    icon: '🌿',
    textColor: 'text-violet-400',
    colorLight: 'bg-violet-500/20',
    features: [
      { key: 'esg_score', label: 'Corporate ESG/SBTi', format: 'score' },
      { key: 'leed_score', label: 'LEED Certification', format: 'score' },
      { key: 'energy_star_score', label: 'ENERGY STAR Score', format: 'score' }
    ]
  }
];

// Navigation items
export const NAV_ITEMS = [
  { path: '/', label: 'Explorer', icon: '🗺️' },
  { path: '/buildings', label: 'Prospects', icon: '🏢' },
  { path: '/states', label: 'State Insights', icon: '📊' },
  { path: '/map', label: 'Map View', icon: '📍' },
  { path: '/compare', label: 'Compare', icon: '⚖️' },
  { path: '/methodology', label: 'Methodology', icon: '📐' }
];

// Opportunity types
export const OPPORTUNITY_TYPES = [
  'Cooling-Demand-Driven',
  'Rainfall-Driven',
  'Resilience-Driven',
  'Balanced Opportunity',
];

// States in the dataset
export const TARGET_STATES = [
  'Texas', 'Florida', 'Georgia', 'North Carolina', 'Louisiana', 
  'Alabama', 'South Carolina', 'Tennessee', 'Virginia', 'Mississippi', 
  'Arkansas', 'Kentucky', 'Oklahoma', 'Missouri', 'Maryland', 
  'Delaware', 'Arizona', 'New Mexico', 'Kansas', 'Indiana', 
  'Illinois', 'West Virginia'
];
