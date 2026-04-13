"""
RainUSE Nexus — Data Service

Loads and caches building and summary data from processed JSON files.
This is the single data access layer for all API routes.

TODO: Replace JSON file reads with database queries or live data service calls
      when moving beyond the hackathon prototype.
"""

import json
from collections import defaultdict
from functools import lru_cache
from pathlib import Path
from typing import Optional

from app.core.config import BUILDINGS_SCORED_PATH, SUMMARY_PATH


def _load_json(path: Path) -> dict | list:
    """Load and parse a JSON file."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _normalize_building(building: dict) -> dict:
    """Fill gaps from processed data so the frontend can render safely."""
    normalized = dict(building)
    normalized["name"] = normalized.get("name") or f"Candidate {normalized['id']}"
    normalized["city"] = normalized.get("city") or "Unknown City"
    normalized["final_viability_score"] = round(
        float(normalized.get("final_viability_score", 0)),
        2,
    )
    return normalized


@lru_cache(maxsize=1)
def get_buildings() -> list[dict]:
    """
    Load all scored building records from the processed JSON file.

    Returns buildings sorted by final_viability_score descending.

    TODO: In production, this would query a database or data warehouse.
    """
    buildings = [_normalize_building(building) for building in _load_json(BUILDINGS_SCORED_PATH)]
    return sorted(buildings, key=lambda b: b["final_viability_score"], reverse=True)


@lru_cache(maxsize=1)
def get_state_summaries() -> list[dict]:
    """
    Build state summaries from scored buildings.
    """
    states: dict[str, list[dict]] = defaultdict(list)
    for building in get_buildings():
        states[building["state"]].append(building)

    summaries = []
    for state, buildings in states.items():
        building_count = len(buildings)
        avg_viability_score = round(
            sum(b.get("final_viability_score", 0) for b in buildings) / building_count,
            2,
        )
        avg_rainfall_inches = round(
            sum(b.get("annual_rain_inches", 0) for b in buildings) / building_count,
            2,
        )
        avg_roof_area_sqft = round(
            sum(b.get("roof_area_sqft", 0) for b in buildings) / building_count,
            2,
        )
        opportunity_counts = {}
        for b in buildings:
            op_type = b.get("opportunity_type", "Balanced Opportunity")
            opportunity_counts[op_type] = opportunity_counts.get(op_type, 0) + 1
        
        dominant_opportunity = max(opportunity_counts.items(), key=lambda x: x[1])[0] if opportunity_counts else "Balanced Opportunity"

        total_capture_gallons = round(
            sum(b.get("annual_capture_gallons", 0) for b in buildings),
            2,
        )
        top_building = buildings[0]["name"]

        summaries.append(
            {
                "state": state,
                "building_count": building_count,
                "avg_viability_score": avg_viability_score,
                "avg_rainfall_inches": avg_rainfall_inches,
                "avg_roof_area_sqft": avg_roof_area_sqft,
                "total_capture_gallons": total_capture_gallons,
                "dominant_opportunity": dominant_opportunity,
                "top_building": top_building,
            }
        )

    return sorted(
        summaries,
        key=lambda summary: summary["avg_viability_score"],
        reverse=True,
    )


@lru_cache(maxsize=1)
def get_summary() -> dict:
    """
    Return a frontend-friendly dashboard summary payload.
    """
    raw_summary = _load_json(SUMMARY_PATH)
    buildings = get_buildings()
    state_summaries = get_state_summaries()

    top_buildings_preview = [
        {
            "id": building["id"],
            "name": building["name"],
            "state": building["state"],
            "city": building["city"],
            "final_viability_score": building["final_viability_score"],
            "opportunity_type": building["opportunity_type"],
        }
        for building in buildings[:5]
    ]

    total_buildings = len(buildings)
    total_states = len({building["state"] for building in buildings})
    buildings_over_100k = sum(1 for building in buildings if building.get("roof_over_100k"))
    average_viability_score = round(
        sum(building.get("final_viability_score", 0) for building in buildings) / total_buildings,
        2,
    )
    total_annual_capture_gallons = round(
        sum(building.get("annual_capture_gallons", 0) for building in buildings),
        2,
    )

    return {
        "total_states": total_states,
        "total_buildings": total_buildings,
        "buildings_over_100k": buildings_over_100k,
        "average_viability_score": average_viability_score,
        "top_state": state_summaries[0]["state"] if state_summaries else None,
        "total_annual_capture_gallons": total_annual_capture_gallons,
        "top_buildings_preview": top_buildings_preview,
        "state_summaries": state_summaries,
        "source_summary": raw_summary,
    }


def get_building_by_id(building_id: str) -> Optional[dict]:
    """
    Find a single building by its ID.

    TODO: In production, this would be an indexed lookup.
    """
    buildings = get_buildings()
    for building in buildings:
        if building["id"] == building_id:
            return building
    return None


def get_buildings_by_state(state: str) -> list[dict]:
    """
    Filter buildings by state name (case-insensitive).

    TODO: In production, this would be a filtered query.
    """
    buildings = get_buildings()
    return [b for b in buildings if b["state"].lower() == state.lower()]


def get_top_buildings(limit: int = 50) -> list[dict]:
    """Return the highest scoring buildings."""
    return get_buildings()[:limit]


def get_top_buildings_by_state(state: str, limit: int = 25) -> list[dict]:
    """Return the highest scoring buildings for a state."""
    return get_buildings_by_state(state)[:limit]


def clear_cache():
    """Clear cached data. Call after re-processing data files."""
    get_buildings.cache_clear()
    get_state_summaries.cache_clear()
    get_summary.cache_clear()
