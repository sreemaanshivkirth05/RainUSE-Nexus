/**
 * RainUSE Nexus — Constants
 */

// API base URL — switch to real backend when ready
// TODO (Person 3): Toggle this to use live API
export const API_BASE_URL = 'http://localhost:8000';

// Use mock data by default (set to false when backend is running)
export const USE_MOCK_DATA = true;

// Feature groups for score breakdown display
export const FEATURE_GROUPS = [
  {
    id: 'physical',
    label: 'Physical Catchment',
    color: 'bg-blue-500',
    colorLight: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    icon: '🏗️',
    features: [
      { key: 'roof_area_sqft', label: 'Roof Area', format: 'sqft' },
      { key: 'roof_over_100k', label: 'Large Roof (>100K)', format: 'boolean' },
      { key: 'annual_rain_inches', label: 'Annual Rainfall', format: 'rainfall' },
      { key: 'annual_capture_gallons', label: 'Annual Capture', format: 'gallons' },
    ],
  },
  {
    id: 'cooling',
    label: 'Reuse Demand',
    color: 'bg-cyan-500',
    colorLight: 'bg-cyan-500/20',
    textColor: 'text-cyan-400',
    icon: '❄️',
    features: [
      { key: 'cooling_tower_score', label: 'Cooling Tower', format: 'score' },
      { key: 'cooling_confidence', label: 'Cooling Confidence', format: 'score' },
      { key: 'cooling_degree_days_score', label: 'Cooling Degree Days', format: 'score' },
      { key: 'building_type_score', label: 'Building Type', format: 'score' },
      { key: 'facility_score', label: 'Facility', format: 'score' },
    ],
  },
  {
    id: 'economic',
    label: 'Economic',
    color: 'bg-emerald-500',
    colorLight: 'bg-emerald-500/20',
    textColor: 'text-emerald-400',
    icon: '💰',
    features: [
      { key: 'water_cost_score', label: 'Water Cost', format: 'score' },
      { key: 'state_policy_score', label: 'State Policy', format: 'score' },
      { key: 'local_incentive_score', label: 'Local Incentive', format: 'score' },
      { key: 'improvement_value_score', label: 'Improvement Value', format: 'score' },
    ],
  },
  {
    id: 'resilience',
    label: 'Resilience',
    color: 'bg-amber-500',
    colorLight: 'bg-amber-500/20',
    textColor: 'text-amber-400',
    icon: '🛡️',
    features: [
      { key: 'flood_score', label: 'Flood Risk', format: 'score' },
      { key: 'water_stress_score', label: 'Water Stress', format: 'score' },
    ],
  },
  {
    id: 'adoption',
    label: 'Adoption / Sustainability',
    color: 'bg-violet-500',
    colorLight: 'bg-violet-500/20',
    textColor: 'text-violet-400',
    icon: '🌿',
    features: [
      { key: 'esg_score', label: 'ESG / SBTi', format: 'score' },
      { key: 'leed_score', label: 'LEED', format: 'score' },
      { key: 'energy_star_score', label: 'ENERGY STAR', format: 'score' },
    ],
  },
];

// Navigation items
export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/buildings', label: 'Top Buildings', icon: '🏢' },
  { path: '/states', label: 'State Insights', icon: '🗺️' },
  { path: '/methodology', label: 'Methodology', icon: '📐' },
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
  'Texas', 'Georgia', 'Arizona', 'Florida',
  'North Carolina', 'Louisiana', 'Colorado',
];
