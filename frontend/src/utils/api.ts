/**
 * RainUSE Nexus — Typed API Client
 *
 * Reads VITE_API_URL from the environment. If unset, `isApiConfigured` is
 * false and every method throws, letting hooks fall back to mock data.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Building {
  id: string;
  name: string;
  state: string;
  city: string;
  latitude?: number;
  longitude?: number;
  roof_area_sqft: number;
  roof_over_100k?: boolean;
  annual_rain_inches: number;
  annual_capture_gallons: number;
  final_viability_score: number;
  base_viability_score?: number;
  opportunity_type: string;
  explanation?: string;
  visual_notes?: string;
  imagery_note?: string;
  global_rank?: number;
  water_cost?: number;
  // Component score fields (0–1 range)
  roof_area_score?: number;
  roof_threshold_bonus?: number;
  annual_precip_score?: number;
  annual_capture_score?: number;
  cooling_tower_score?: number;
  cooling_degree_days_score?: number;
  cooling_confidence?: number;
  confidence_multiplier?: number;
  facility_score?: number;
  water_cost_score?: number;
  state_policy_score?: number;
  local_incentive_score?: number;
  roof_geometry_quality_score?: number;
  building_type_score?: number;
  improvement_value_score?: number;
  flood_score?: number;
  water_stress_score?: number;
  esg_score?: number;
  leed_score?: number;
  energy_star_score?: number;
  rectangularity_score?: number;
  shape_compactness?: number;
  [key: string]: unknown;
}

export interface StateSummary {
  state: string;
  building_count: number;
  avg_viability_score: number;
  avg_rainfall_inches: number;
  avg_roof_area_sqft: number;
  total_capture_gallons: number;
  dominant_opportunity: string;
  top_building: string;
}

export interface Summary {
  total_states: number;
  total_buildings: number;
  buildings_over_100k: number;
  average_viability_score: number;
  top_state: string | null;
  total_annual_capture_gallons: number;
  top_buildings_preview: Partial<Building>[];
  state_summaries: StateSummary[];
  source_summary?: Record<string, unknown>;
}

export interface BuildingsResponse {
  count: number;
  buildings: Building[];
}

export interface StatesResponse {
  count: number;
  states: StateSummary[];
}

export interface StateBuildingsResponse {
  state_code: string;
  state_name: string;
  count: number;
  total_in_state: number;
  buildings: Building[];
}

export interface HealthResponse {
  status: string;
}

export interface BuildingsParams {
  state?: string;
  limit?: number;
  page_size?: number;
  page?: number;
  min_score?: number;
  offset?: number;
}

// ---------------------------------------------------------------------------
// HTTP layer
// ---------------------------------------------------------------------------

export const BASE_URL: string | undefined = import.meta.env.VITE_API_URL as string | undefined;
export const isApiConfigured: boolean = !!BASE_URL;

async function get<T>(path: string): Promise<T> {
  if (!BASE_URL) throw new Error('VITE_API_URL is not set — no live API available');

  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

function toQueryString(params: BuildingsParams): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && String(v) !== '') {
      p.append(k, String(v));
    }
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

// ---------------------------------------------------------------------------
// API client
// ---------------------------------------------------------------------------

export const apiClient = {
  health: (): Promise<HealthResponse> =>
    get<HealthResponse>('/health'),

  summary: (): Promise<Summary> =>
    get<Summary>('/summary'),

  states: (): Promise<StatesResponse> =>
    get<StatesResponse>('/states'),

  buildings: (params: BuildingsParams = {}): Promise<BuildingsResponse> =>
    get<BuildingsResponse>(`/buildings${toQueryString(params)}`),

  topBuildings: (limit = 1000): Promise<BuildingsResponse> =>
    get<BuildingsResponse>(`/buildings/top?limit=${limit}`),

  topBuildingsByState: (state: string, limit = 500): Promise<BuildingsResponse> =>
    get<BuildingsResponse>(
      `/buildings/top?state=${encodeURIComponent(state)}&limit=${limit}`
    ),

  buildingDetail: (id: string): Promise<Building> =>
    get<Building>(`/buildings/${id}`),

  stateBuildings: (
    stateCode: string,
    params: { limit?: number; min_score?: number; sort?: string } = {}
  ): Promise<StateBuildingsResponse> => {
    const p = new URLSearchParams();
    if (params.limit   != null) p.append('limit',     String(params.limit));
    if (params.min_score != null) p.append('min_score', String(params.min_score));
    if (params.sort)              p.append('sort',      params.sort);
    const qs = p.toString() ? `?${p.toString()}` : '';
    return get<StateBuildingsResponse>(`/states/${encodeURIComponent(stateCode)}/buildings${qs}`);
  },
};
