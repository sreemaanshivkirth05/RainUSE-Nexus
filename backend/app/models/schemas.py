"""
RainUSE Nexus — Pydantic Request/Response Schemas

These models define the API contract. Frontend and backend must agree on these shapes.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ---------------------------------------------------------------------------
# Search Request
# ---------------------------------------------------------------------------

class SearchFilters(BaseModel):
    """Filter criteria for building search."""
    states: Optional[list[str]] = None
    cities: Optional[list[str]] = None
    opportunity_types: Optional[list[str]] = None
    min_roof_area_sqft: Optional[float] = None
    max_roof_area_sqft: Optional[float] = None
    min_viability_score: Optional[int] = None
    max_viability_score: Optional[int] = None
    min_annual_capture_gallons: Optional[float] = None
    min_annual_rain_inches: Optional[float] = None
    min_cooling_tower_score: Optional[float] = None
    min_water_stress_score: Optional[float] = None
    min_esg_score: Optional[float] = None
    roof_over_100k: Optional[bool] = None


class SortSpec(BaseModel):
    """Sort specification."""
    field: str = "final_viability_score"
    direction: str = Field(default="desc", pattern="^(asc|desc)$")


class BuildingSearchRequest(BaseModel):
    """POST body for /buildings/search."""
    filters: SearchFilters = Field(default_factory=SearchFilters)
    sort: SortSpec = Field(default_factory=SortSpec)
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=25, ge=1, le=100)


# ---------------------------------------------------------------------------
# Search Response
# ---------------------------------------------------------------------------

class BuildingResult(BaseModel):
    """Single building in search results."""
    building_id: str
    name: str
    state: str
    city: str
    latitude: float
    longitude: float
    roof_area_sqft: float
    roof_over_100k: bool
    annual_rain_inches: float
    annual_capture_gallons: float
    cooling_tower_score: float
    cooling_confidence: float
    water_cost_score: float
    state_policy_score: float
    flood_score: float
    water_stress_score: float
    esg_score: float
    leed_score: float
    energy_star_score: float
    final_viability_score: int
    opportunity_type: str
    explanation: str


class BuildingSearchResponse(BaseModel):
    """Response for /buildings/search."""
    total: int
    page: int
    page_size: int
    total_pages: int
    items: list[BuildingResult]


# ---------------------------------------------------------------------------
# Building Detail
# ---------------------------------------------------------------------------

class BuildingDetail(BuildingResult):
    """Full building detail (extends search result with extra fields)."""
    cooling_degree_days_score: float = 0.0
    building_type_score: float = 0.0
    facility_score: float = 0.0
    local_incentive_score: float = 0.0
    improvement_value_score: float = 0.0
    base_viability_score: float = 0.0
    # ESG enrichment fields
    leed_certified: Optional[bool] = None
    energy_star_certified: Optional[bool] = None
    leed_level: Optional[str] = None
    leed_match_method: Optional[str] = None
    es_match_method: Optional[str] = None
    state_esg_baseline: Optional[float] = None
    sustainability_tier: Optional[str] = None
    esg_comp_a_policy: Optional[float] = None
    esg_comp_b_cert: Optional[float] = None
    esg_comp_c_type: Optional[float] = None
    esg_comp_d_compliance: Optional[float] = None
    esg_component_breakdown: Optional[str] = None
    # Enriched address / visual fields
    building_name: Optional[str] = None
    short_address: Optional[str] = None
    zip_code: Optional[str] = None
    global_rank: Optional[int] = None
    visual_notes: Optional[str] = None
    roof_geometry_quality_score: Optional[float] = None
    annual_precip_score: Optional[float] = None
    annual_capture_score: Optional[float] = None
    roof_area_score: Optional[float] = None
    confidence_multiplier: Optional[float] = None


# ---------------------------------------------------------------------------
# Filter Metadata
# ---------------------------------------------------------------------------

class FilterOption(BaseModel):
    """Single option in a multi-select filter."""
    value: str
    count: int


class RangeInfo(BaseModel):
    """Min/max range for a numeric filter."""
    min: float
    max: float


class FilterMetadataResponse(BaseModel):
    """Response for GET /filters/metadata."""
    states: list[FilterOption]
    cities: list[FilterOption]
    opportunity_types: list[FilterOption]
    score_range: RangeInfo
    roof_area_range: RangeInfo
    annual_capture_range: RangeInfo
    total_buildings: int
