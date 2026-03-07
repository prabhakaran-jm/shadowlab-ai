"""
Targets API routes – list and manage registered AI API targets.
"""

from fastapi import APIRouter, HTTPException

from app.models import Target
from app.services.storage import get_target as db_get_target
from app.services.storage import list_targets as db_list_targets
from app.services.storage import save_target

router = APIRouter(prefix="/targets", tags=["targets"])


@router.get("", response_model=dict)
async def list_targets():
    """List registered targets."""
    return {"targets": db_list_targets()}


@router.get("/{target_id}", response_model=dict)
async def get_target(target_id: str):
    """Get a target by id."""
    target = db_get_target(target_id)
    if target:
        return target
    raise HTTPException(status_code=404, detail="Target not found")


@router.post("", response_model=dict)
async def post_target(body: Target):
    """Create or update a target."""
    target = save_target(body.model_dump())
    return target
