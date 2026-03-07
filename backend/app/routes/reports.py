"""
Reports API routes – list and fetch scan reports.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/reports", tags=["reports"])

# In-memory store for last N scan results; replace with DB for persistence.
_reports: list[dict] = []
_MAX_REPORTS = 50


@router.get("", response_model=dict)
async def list_reports(limit: int = 20):
    """List recent scan reports. Returns empty until scans complete."""
    return {"reports": _reports[: min(max(1, limit), _MAX_REPORTS)]}


def append_report(report: dict) -> None:
    """Called by scan routes to store a report. Internal use."""
    global _reports
    _reports.insert(0, report)
    _reports = _reports[:_MAX_REPORTS]
