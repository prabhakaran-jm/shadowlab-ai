"""
Targets API routes.

In the final system, these endpoints will:
- CRUD for registered AI API targets (URL, auth, description)
- Validate target connectivity before scans
"""

from fastapi import APIRouter

router = APIRouter(prefix="/targets", tags=["targets"])


# Placeholder: will add GET /targets, POST /targets, GET /targets/{id}, etc.
