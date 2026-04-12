"""
RainUSE Nexus — Data Service

Loads and caches building and summary data from processed JSON files.
This is the single data access layer for all API routes.

TODO: Replace JSON file reads with database queries or live data service calls
      when moving beyond the hackathon prototype.
"""

import json
from pathlib import Path
from typing import Optional
from functools import lru_cache

from app.core.config import BUILDINGS_SCORED_PATH, SUMMARY_PATH


def _load_json(path: Path) -> dict | list:
    """Load and parse a JSON file."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def get_buildings() -> list[dict]:
    """
    Load all scored building records from the processed JSON file.

    Returns buildings sorted by final_viability_score descending.

    TODO: In production, this would query a database or data warehouse.
    """
    buildings = _load_json(BUILDINGS_SCORED_PATH)
    return sorted(buildings, key=lambda b: b["final_viability_score"], reverse=True)


@lru_cache(maxsize=1)
def get_summary() -> dict:
    """
    Load the summary/dashboard data from the processed JSON file.

    TODO: In production, this would be computed dynamically or cached.
    """
    return _load_json(SUMMARY_PATH)


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


def get_state_summaries() -> list[dict]:
    """
    Extract state summaries from the summary data.

    TODO: In production, compute these from live building data.
    """
    summary = get_summary()
    return summary.get("state_summaries", [])


def clear_cache():
    """Clear cached data. Call after re-processing data files."""
    get_buildings.cache_clear()
    get_summary.cache_clear()
