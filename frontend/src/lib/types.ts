/**
 * RainUSE Nexus — TypeScript API Types
 *
 * These types mirror the backend Pydantic schemas exactly.
 * If the backend schema changes, update these types to match.
 */

// ---------------------------------------------------------------------------
// Search Request
// ---------------------------------------------------------------------------

export interface SearchFilters {
  states?: string[];
  cities?: string[];
  opportunity_types?: string[];
  min_roof_area_sqft?: number;
  max_roof_area_sqft?: number;
  min_viability_score?: number;
  max_viability_score?: number;
  min_annual_capture_gallons?: number;
  min_annual_rain_inches?: number;
  min_cooling_tower_score?: number;
  min_water_stress_score?: number;
  min_esg_score?: number;
  roof_over_100k?: boolean;
}

export interface SortSpec {
  field: string;
  direction: "asc" | "desc";
}

export interface BuildingSearchRequest {
  filters?: SearchFilters;
  sort?: SortSpec;
  page?: number;
  page_size?: number;
}

// ---------------------------------------------------------------------------
// Search Response
// ---------------------------------------------------------------------------

export interface BuildingResult {
  building_id: string;
  name: string;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  roof_area_sqft: number;
  roof_over_100k: boolean;
  annual_rain_inches: number;
  annual_capture_gallons: number;
  cooling_tower_score: number;
  cooling_confidence: number;
  water_cost_score: number;
  state_policy_score: number;
  flood_score: number;
  water_stress_score: number;
  esg_score: number;
  leed_score: number;
  energy_star_score: number;
  final_viability_score: number;
  opportunity_type: string;
  explanation: string;
}

export interface BuildingSearchResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: BuildingResult[];
}

// ---------------------------------------------------------------------------
// Filter Metadata
// ---------------------------------------------------------------------------

export interface FilterOption {
  value: string;
  count: number;
}

export interface RangeInfo {
  min: number;
  max: number;
}

export interface FilterMetadataResponse {
  states: FilterOption[];
  cities: FilterOption[];
  opportunity_types: FilterOption[];
  score_range: RangeInfo;
  roof_area_range: RangeInfo;
  annual_capture_range: RangeInfo;
  total_buildings: number;
}
