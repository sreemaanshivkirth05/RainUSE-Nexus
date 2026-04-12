"""
RainUSE Nexus — Summary & States API Routes
"""

from fastapi import APIRouter

from app.services.data_service import get_summary, get_state_summaries

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
