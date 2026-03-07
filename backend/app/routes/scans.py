"""
Scans API routes.

In the final system, these endpoints will:
- Start a new scan (target + attack set)
- Poll scan status and progress
- Cancel running scans
"""

from fastapi import APIRouter

router = APIRouter(prefix="/scans", tags=["scans"])


# Placeholder: will add POST /scans, GET /scans/{id}, POST /scans/{id}/cancel, etc.
