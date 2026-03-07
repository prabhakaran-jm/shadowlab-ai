"""
Reports API routes.

In the final system, these endpoints will:
- Fetch report for a completed scan
- List reports with filters (target, severity, date)
- Export reports (JSON, PDF)
"""

from fastapi import APIRouter

router = APIRouter(prefix="/reports", tags=["reports"])


# Placeholder: will add GET /reports?scan_id=, GET /reports/{id}, export options, etc.
