"""
RainUSE Nexus — Summary & States API Routes
"""

from fastapi import APIRouter, Query

from app.services.data_service import get_summary, get_state_summaries, get_state_buildings

router = APIRouter(tags=["summary"])


@router.get("/summary")
def summary():
    """
    Get dashboard summary data including KPIs, top buildings preview,
    and state-level summaries.
    """
    return get_summary()


@router.get("/states")
def list_states():
    """
    Get state-level summary data for the State Insights page.

    Returns aggregated metrics per state: building count, avg score,
    avg rainfall, total capture, dominant opportunity type.
    """
    state_summaries = get_state_summaries()

    # Sort by average viability score descending
    state_summaries = sorted(
        state_summaries,
        key=lambda s: s.get("avg_viability_score", 0),
        reverse=True,
    )

    return {
        "count": len(state_summaries),
        "states": state_summaries,
    }


@router.get("/states/{state_code}/buildings")
def state_buildings(
    state_code: str,
    limit: int = Query(default=200, ge=1, le=500),
    min_score: int = Query(default=0, ge=0, le=100),
    sort: str = Query(default="final_viability_score"),
):
    """
    Get top buildings for a specific state by 2-letter state code (e.g. TX, FL).
    Supports ?limit=200&min_score=0&sort=viability_score
    """
    return get_state_buildings(state_code, limit=limit, min_score=min_score, sort_by=sort)
