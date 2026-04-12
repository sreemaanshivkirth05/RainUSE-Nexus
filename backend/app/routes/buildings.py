from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.services.data_service import get_buildings, get_building_by_id

router = APIRouter(prefix="/buildings", tags=["buildings"])


@router.get("")
def list_buildings(
    state: Optional[str] = Query(None, description="Filter by state name"),
    city: Optional[str] = Query(None, description="Filter by city name"),
    min_score: Optional[int] = Query(None, description="Minimum viability score"),
    max_score: Optional[int] = Query(None, description="Maximum viability score"),
    opportunity_type: Optional[str] = Query(None, description="Filter by opportunity type"),
    roof_area_min: Optional[float] = Query(None, description="Minimum roof area"),
    roof_area_max: Optional[float] = Query(None, description="Maximum roof area"),
    rainfall_min: Optional[float] = Query(None, description="Minimum annual rainfall"),
    rainfall_max: Optional[float] = Query(None, description="Maximum annual rainfall"),
    capture_min: Optional[float] = Query(None, description="Minimum annual capture"),
    capture_max: Optional[float] = Query(None, description="Maximum annual capture"),
    cooling_confidence_min: Optional[float] = Query(None, description="Min cooling confidence"),
    water_cost_min: Optional[float] = Query(None, description="Min water cost score"),
    flood_score_min: Optional[float] = Query(None, description="Min flood score"),
    water_stress_min: Optional[float] = Query(None, description="Min water stress score"),
    esg_min: Optional[float] = Query(None, description="Min ESG score"),
    leed_min: Optional[float] = Query(None, description="Min LEED score"),
    energy_star_min: Optional[float] = Query(None, description="Min Energy Star score"),
    sort_by: str = Query("final_viability_score", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    page: int = Query(1, description="Page number", ge=1),
    page_size: int = Query(20, description="Items per page", ge=1, le=100)
):
    """
    List scored buildings via DB-backed filters, sorting, and pagination.
    """
    return get_buildings(
        state=state, city=city,
        min_score=min_score, max_score=max_score,
        opportunity_type=opportunity_type,
        roof_area_min=roof_area_min, roof_area_max=roof_area_max,
        rainfall_min=rainfall_min, rainfall_max=rainfall_max,
        capture_min=capture_min, capture_max=capture_max,
        cooling_confidence_min=cooling_confidence_min,
        water_cost_min=water_cost_min,
        flood_score_min=flood_score_min,
        water_stress_min=water_stress_min,
        esg_min=esg_min,
        leed_min=leed_min,
        energy_star_min=energy_star_min,
        sort_by=sort_by, sort_order=sort_order,
        page=page, page_size=page_size
    )


@router.get("/{building_id}")
def get_building(building_id: str):
    """
    Get a single building record by ID.
    """
    building = get_building_by_id(building_id)
    if not building:
        raise HTTPException(status_code=404, detail=f"Building '{building_id}' not found")
    return building
