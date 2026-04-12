"""
RainUSE Nexus — Processed Output Builder

Generates the final processed JSON files consumed by the backend API.
Produces:
  - buildings_scored.json (full building records with scores)
  - summary.json (aggregated dashboard data)

Usage:
    python scripts/export/build_processed_outputs.py
"""

import json
import sys
from pathlib import Path
from collections import defaultdict

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"
BUILDINGS_PATH = PROCESSED_DATA_DIR / "buildings_scored.json"
SUMMARY_PATH = PROCESSED_DATA_DIR / "summary.json"


def build_summary(buildings: list[dict]) -> dict:
    """
    Build summary.json from scored building records.

    Computes:
      - Overall KPIs
      - Top buildings preview
      - State-level summaries
    """
    if not buildings:
        return {
            "total_states": 0,
            "total_buildings": 0,
            "buildings_over_100k": 0,
            "average_viability_score": 0,
            "top_state": "",
            "total_annual_capture_gallons": 0,
            "top_buildings_preview": [],
            "state_summaries": [],
        }

    # --- Overall KPIs ---
    total_buildings = len(buildings)
    buildings_over_100k = sum(1 for b in buildings if b.get("roof_over_100k", False))
    avg_score = sum(b.get("final_viability_score", 0) for b in buildings) / total_buildings
    total_capture = sum(b.get("annual_capture_gallons", 0) for b in buildings)

    # --- State summaries ---
    state_groups = defaultdict(list)
    for b in buildings:
        state_groups[b.get("state", "Unknown")].append(b)

    state_summaries = []
    for state, state_buildings in state_groups.items():
        count = len(state_buildings)
        avg_viability = sum(b["final_viability_score"] for b in state_buildings) / count
        avg_rainfall = sum(b.get("annual_rain_inches", 0) for b in state_buildings) / count
        avg_roof = sum(b.get("roof_area_sqft", 0) for b in state_buildings) / count
        state_capture = sum(b.get("annual_capture_gallons", 0) for b in state_buildings)

        # Determine dominant opportunity type
        opp_types = [b.get("opportunity_type", "") for b in state_buildings]
        dominant = max(set(opp_types), key=opp_types.count) if opp_types else "Unknown"
        if len(set(opp_types)) > 1 and opp_types.count(dominant) == 1:
            dominant = "Mixed"

        # Top building in state
        top = max(state_buildings, key=lambda b: b["final_viability_score"])

        state_summaries.append({
            "state": state,
            "building_count": count,
            "avg_viability_score": round(avg_viability, 1),
            "avg_rainfall_inches": round(avg_rainfall, 1),
            "avg_roof_area_sqft": round(avg_roof, 0),
            "total_capture_gallons": round(state_capture, 0),
            "dominant_opportunity": dominant,
            "top_building": top["name"],
        })

    state_summaries.sort(key=lambda s: s["avg_viability_score"], reverse=True)

    # Determine top state
    top_state = state_summaries[0]["state"] if state_summaries else ""

    # --- Top buildings preview ---
    sorted_buildings = sorted(buildings, key=lambda b: b["final_viability_score"], reverse=True)
    top_preview = [
        {
            "id": b["id"],
            "name": b["name"],
            "state": b["state"],
            "city": b["city"],
            "final_viability_score": b["final_viability_score"],
            "opportunity_type": b["opportunity_type"],
        }
        for b in sorted_buildings[:5]
    ]

    return {
        "total_states": len(state_groups),
        "total_buildings": total_buildings,
        "buildings_over_100k": buildings_over_100k,
        "average_viability_score": round(avg_score, 1),
        "top_state": top_state,
        "total_annual_capture_gallons": round(total_capture, 0),
        "top_buildings_preview": top_preview,
        "state_summaries": state_summaries,
    }


def main():
    """Build processed output files."""
    print("=" * 60)
    print("RainUSE Nexus — Building Processed Outputs")
    print("=" * 60)

    # Load scored buildings
    print(f"\nLoading: {BUILDINGS_PATH}")
    with open(BUILDINGS_PATH, "r") as f:
        buildings = json.load(f)
    print(f"Loaded {len(buildings)} buildings")

    # Build summary
    print("\nBuilding summary...")
    summary = build_summary(buildings)

    # Save summary
    print(f"Saving summary to: {SUMMARY_PATH}")
    with open(SUMMARY_PATH, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\nSummary stats:")
    print(f"  States: {summary['total_states']}")
    print(f"  Buildings: {summary['total_buildings']}")
    print(f"  Avg Score: {summary['average_viability_score']}")
    print(f"  Top State: {summary['top_state']}")
    print(f"  Total Capture: {summary['total_annual_capture_gallons']:,.0f} gallons")

    print("\n[DONE] Processed outputs built.")


if __name__ == "__main__":
    main()
