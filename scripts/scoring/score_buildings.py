"""
RainUSE Nexus — Main Scoring Pipeline

Computes base viability score and final viability score for all buildings.

This is the main scoring entry point.
Run this script to compute scores for all buildings and export results.

Usage:
    python scripts/scoring/score_buildings.py
"""

import json
import sys
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from scripts.scoring.weights import (
    W_ROOF_AREA, W_ROOF_THRESHOLD, W_ANNUAL_PRECIP, W_ANNUAL_CAPTURE,
    W_COOLING_TOWER, W_COOLING_DEGREE_DAYS, W_BUILDING_TYPE, W_FACILITY,
    W_WATER_COST, W_STATE_POLICY, W_LOCAL_INCENTIVE, W_IMPROVEMENT_VALUE,
    W_FLOOD, W_WATER_STRESS,
    W_ESG, W_LEED, W_ENERGY_STAR,
    get_confidence_multiplier,
)
from scripts.scoring.normalize import normalize_feature, boolean_to_score, clip_score
from scripts.scoring.classify_opportunity import classify_opportunity, generate_explanation


PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"
BUILDINGS_INPUT_PATH = PROCESSED_DATA_DIR / "buildings_scored.json"
BUILDINGS_OUTPUT_PATH = PROCESSED_DATA_DIR / "buildings_scored.json"


def compute_base_score(building: dict) -> float:
    """
    Compute the base viability score using the weighted formula.

    All feature scores should already be normalized to 0-1.
    The base score is also in 0-1 range.

    Formula:
      Base Score =
        0.12 * roof_area_score +
        0.05 * roof_threshold_bonus +
        0.05 * annual_precip_score +
        0.08 * annual_capture_score +
        0.12 * cooling_tower_score +
        0.06 * cooling_degree_days_score +
        0.04 * building_type_score +
        0.03 * facility_score +
        0.08 * water_cost_score +
        0.05 * state_policy_score +
        0.04 * local_incentive_score +
        0.03 * improvement_value_score +
        0.08 * flood_score +
        0.07 * water_stress_score +
        0.04 * esg_score +
        0.03 * leed_score +
        0.03 * energy_star_score
    """

    # --- Physical Catchment Features ---
    roof_area_score = normalize_feature("roof_area_sqft", building.get("roof_area_sqft", 0))
    roof_threshold_bonus = boolean_to_score(building.get("roof_over_100k", False))
    annual_precip_score = normalize_feature("annual_rain_inches", building.get("annual_rain_inches", 0))
    annual_capture_score = normalize_feature("annual_capture_gallons", building.get("annual_capture_gallons", 0))

    # --- Reuse-Demand Features (already 0-1) ---
    cooling_tower_score = clip_score(building.get("cooling_tower_score", 0))
    cooling_degree_days_score = clip_score(building.get("cooling_degree_days_score", 0))
    building_type_score = clip_score(building.get("building_type_score", 0))
    facility_score = clip_score(building.get("facility_score", 0))

    # --- Economic Features (already 0-1) ---
    water_cost_score = clip_score(building.get("water_cost_score", 0))
    state_policy_score = clip_score(building.get("state_policy_score", 0))
    local_incentive_score = clip_score(building.get("local_incentive_score", 0))
    improvement_value_score = clip_score(building.get("improvement_value_score", 0))

    # --- Resilience Features (already 0-1) ---
    flood_score = clip_score(building.get("flood_score", 0))
    water_stress_score = clip_score(building.get("water_stress_score", 0))

    # --- Adoption / Sustainability Features (already 0-1) ---
    esg_score = clip_score(building.get("esg_score", 0))
    leed_score = clip_score(building.get("leed_score", 0))
    energy_star_score = clip_score(building.get("energy_star_score", 0))

    # --- Weighted sum ---
    base_score = (
        W_ROOF_AREA * roof_area_score +
        W_ROOF_THRESHOLD * roof_threshold_bonus +
        W_ANNUAL_PRECIP * annual_precip_score +
        W_ANNUAL_CAPTURE * annual_capture_score +
        W_COOLING_TOWER * cooling_tower_score +
        W_COOLING_DEGREE_DAYS * cooling_degree_days_score +
        W_BUILDING_TYPE * building_type_score +
        W_FACILITY * facility_score +
        W_WATER_COST * water_cost_score +
        W_STATE_POLICY * state_policy_score +
        W_LOCAL_INCENTIVE * local_incentive_score +
        W_IMPROVEMENT_VALUE * improvement_value_score +
        W_FLOOD * flood_score +
        W_WATER_STRESS * water_stress_score +
        W_ESG * esg_score +
        W_LEED * leed_score +
        W_ENERGY_STAR * energy_star_score
    )

    return max(0.0, min(1.0, base_score))


def compute_final_score(base_score: float, cooling_confidence: float) -> int:
    """
    Compute final viability score by applying confidence multiplier.

    Final Score = round(Base Score × Confidence Multiplier × 100)

    Returns integer in range 0-100.
    """
    multiplier = get_confidence_multiplier(cooling_confidence)
    final = base_score * multiplier * 100
    return max(0, min(100, round(final)))


def score_building(building: dict) -> dict:
    """
    Compute all scoring outputs for a single building.

    Updates:
      - base_viability_score
      - final_viability_score
      - opportunity_type
      - explanation
    """
    # Compute base score
    base_score = compute_base_score(building)
    building["base_viability_score"] = round(base_score, 4)

    # Compute final score with confidence adjustment
    cooling_confidence = building.get("cooling_confidence", 0)
    building["final_viability_score"] = compute_final_score(base_score, cooling_confidence)

    # Classify opportunity type
    building["opportunity_type"] = classify_opportunity(building)

    # Generate explanation
    building["explanation"] = generate_explanation(building)

    return building


def score_all_buildings(buildings: list[dict]) -> list[dict]:
    """
    Score all buildings and sort by final viability score descending.
    """
    scored = [score_building(b) for b in buildings]
    scored.sort(key=lambda b: b["final_viability_score"], reverse=True)
    return scored


def main():
    """Main scoring pipeline entry point."""
    print("=" * 60)
    print("RainUSE Nexus — Scoring Pipeline")
    print("=" * 60)

    # Load buildings
    print(f"\nLoading buildings from: {BUILDINGS_INPUT_PATH}")
    with open(BUILDINGS_INPUT_PATH, "r") as f:
        buildings = json.load(f)
    print(f"Loaded {len(buildings)} buildings")

    # Score all buildings
    print("\nScoring buildings...")
    scored = score_all_buildings(buildings)

    # Print results
    print(f"\n{'Rank':<5} {'Score':<7} {'Type':<25} {'Name'}")
    print("-" * 80)
    for i, b in enumerate(scored, 1):
        print(f"{i:<5} {b['final_viability_score']:<7} {b['opportunity_type']:<25} {b['name']}")

    # Save results
    print(f"\nSaving scored buildings to: {BUILDINGS_OUTPUT_PATH}")
    with open(BUILDINGS_OUTPUT_PATH, "w") as f:
        json.dump(scored, f, indent=2)

    print("\n[DONE] Scoring complete.")


if __name__ == "__main__":
    main()
