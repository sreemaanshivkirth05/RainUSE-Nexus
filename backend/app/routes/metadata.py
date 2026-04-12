from fastapi import APIRouter
from app.services.data_service import get_filter_metadata

router = APIRouter(prefix="/metadata", tags=["metadata"])

@router.get("/filters")
def get_filters():
    """
    Get available filter metadata parameters derived from the database.
    """
    return get_filter_metadata()
