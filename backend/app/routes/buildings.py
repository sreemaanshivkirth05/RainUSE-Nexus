"""
RainUSE Nexus — Buildings API Routes
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.services.data_service import (
    get_buildings,
    get_building_by_id,
    get_buildings_by_state,
    get_top_buildings,
    get_top_buildings_by_state,
)

router = APIRouter(prefix="/buildings", tags=["buildings"])


@router.get("")
def list_buildings(
    state: Optional[str] = Query(None, description="Filter by state name"),
    min_score: Optional[int] = Query(None, description="Minimum viability score"),
    opportunity_type: Optional[str] = Query(None, description="Filter by opportunity type"),
    sort_by: str = Query("final_viability_score", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    limit: Optional[int] = Query(None, description="Max number of results"),
):
    """
    List all scored buildings with optional filtering, sorting, and pagination.

    Returns buildings sorted by final_viability_score (descending) by default.
    """
    buildings = get_buildings()

    # Apply filters
    if state:
        buildings = [b for b in buildings if b["state"].lower() == state.lower()]

    if min_score is not None:
        buildings = [b for b in buildings if b["final_viability_score"] >= min_score]

    if opportunity_type:
        buildings = [
            b for b in buildings
            if b["opportunity_type"].lower() == opportunity_type.lower()
        ]

    # Apply sorting
    reverse = sort_order.lower() == "desc"
    if sort_by in buildings[0] if buildings else {}:
        buildings = sorted(buildings, key=lambda b: b.get(sort_by, 0), reverse=reverse)

    # Apply limit
    if limit is not None:
        buildings = buildings[:limit]

    return {
        "count": len(buildings),
        "buildings": buildings,
    }


@router.get("/top")
def list_top_buildings(limit: int = Query(50, ge=1, le=500)):
    """
    Return the highest-scoring building shortlist used by the frontend explorer.
    """
    buildings = get_top_buildings(limit)
    return {
        "count": len(buildings),
        "buildings": buildings,
    }


@router.get("/top-by-state")
def list_top_buildings_by_state(
    state: str = Query(..., description="State name"),
    limit: int = Query(25, ge=1, le=100),
):
    """
    Return the highest-scoring buildings for a single state.
    """
    buildings = get_top_buildings_by_state(state, limit)
    return {
        "count": len(buildings),
        "buildings": buildings,
    }


@router.get("/{building_id}")
def get_building(building_id: str):
    """
    Get a single building record by ID.
    """
    building = get_building_by_id(building_id)
    if not building:
        raise HTTPException(status_code=404, detail=f"Building '{building_id}' not found")
    return building
