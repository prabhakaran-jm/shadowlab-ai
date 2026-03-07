"""
Targets API routes – list and manage registered AI API targets.
"""

from fastapi import APIRouter

from app.models import Target

router = APIRouter(prefix="/targets", tags=["targets"])

# In-memory store for demo; replace with DB for persistence.
_targets: list[Target] = []


@router.get("", response_model=dict)
async def list_targets():
    """List registered targets. Returns empty list until targets are added via POST."""
    return {"targets": [t.model_dump() for t in _targets]}


@router.get("/{target_id}", response_model=dict)
async def get_target(target_id: str):
    """Get a target by id."""
    from fastapi import HTTPException
    for t in _targets:
        if t.id == target_id:
            return t.model_dump()
    raise HTTPException(status_code=404, detail="Target not found")
