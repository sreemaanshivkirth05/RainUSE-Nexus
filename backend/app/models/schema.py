"""
RainUSE Nexus — Building Schema (Pydantic Model)

This is the LOCKED schema. All components must conform to this structure.
Do not modify without team agreement.
"""

from pydantic import BaseModel
from typing import Optional


class BuildingRecord(BaseModel):
    """
    The canonical building record schema.
    All feature scores are normalized to 0.0–1.0.
    Final viability score is 0–100 (integer).
    """

    # --- Identity & Location ---
    id: str
    name: str
    state: str
    city: str
    latitude: float
    longitude: float

    # --- Physical Catchment Features ---
    roof_area_sqft: float
    roof_over_100k: bool
    annual_rain_inches: float
    annual_capture_gallons: float

    # --- Reuse-Demand Features ---
    cooling_tower_score: float
    cooling_confidence: float
    cooling_degree_days_score: float
    building_type_score: float
    facility_score: float

    # --- Economic Features ---
    water_cost_score: float
    state_policy_score: float
    local_incentive_score: float
    improvement_value_score: float

    # --- Resilience Features ---
    flood_score: float
    water_stress_score: float

    # --- Adoption / Sustainability Features ---
    esg_score: float
    leed_score: float
    energy_star_score: float

    # --- Output Features ---
    base_viability_score: float
    final_viability_score: int
    opportunity_type: str
    explanation: str
    visual_notes: str


class BuildingPreview(BaseModel):
    """Lightweight building record for summary/preview lists."""
    id: str
    name: str
    state: str
    city: str
    final_viability_score: int
    opportunity_type: str


class StateSummary(BaseModel):
    """Aggregated state-level summary."""
    state: str
    building_count: int
    avg_viability_score: float
    avg_rainfall_inches: float
    avg_roof_area_sqft: float
    total_capture_gallons: float
    dominant_opportunity: str
    top_building: str


class SummaryResponse(BaseModel):
    """Overall summary response for the dashboard."""
    total_states: int
    total_buildings: int
    buildings_over_100k: int
    average_viability_score: float
    top_state: str
    total_annual_capture_gallons: float
    top_buildings_preview: list[BuildingPreview]
    state_summaries: list[StateSummary]
