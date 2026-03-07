"""
Reports API routes – list and fetch scan reports.
"""

from fastapi import APIRouter

from app.services.storage import list_reports as db_list_reports
from app.services.storage import save_report

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=dict)
async def list_reports(limit: int = 20):
    """List recent scan reports."""
    return {"reports": db_list_reports(limit=limit)}


def append_report(report: dict) -> None:
    """Called by scan routes to store a report."""
    save_report(report)
