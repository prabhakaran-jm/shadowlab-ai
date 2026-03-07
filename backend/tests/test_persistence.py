"""Tests for SQLite-backed persistence (targets + reports)."""

import pytest

from app.services.storage import (
    get_target,
    init_db,
    list_reports,
    list_targets,
    save_report,
    save_target,
)


def test_storage_persists_targets_and_reports_across_reinit():
    """Data remains after DB re-initialization (simulated restart)."""
    target = {
        "id": "target-1",
        "name": "Support Bot",
        "base_url": "https://api.example.com",
        "endpoint": "/chat",
        "method": "POST",
    }
    report = {
        "target_url": "https://api.example.com/chat",
        "total_tests": 3,
        "failed_tests": 1,
        "safety_score": 80,
        "results": [],
        "gradient_used": False,
    }

    save_target(target)
    save_report(report)

    # Simulate restart path where app boots and runs init again.
    init_db()

    assert get_target("target-1") is not None
    assert any(t["id"] == "target-1" for t in list_targets())
    reports = list_reports(limit=10)
    assert reports
    assert reports[0]["target_url"] == "https://api.example.com/chat"


@pytest.mark.asyncio
async def test_scan_demo_writes_report_to_persistent_store(client):
    """Running demo scan appends a report retrievable via /reports."""
    r = await client.get("/scan/demo")
    assert r.status_code == 200

    reports_resp = await client.get("/reports")
    assert reports_resp.status_code == 200
    data = reports_resp.json()
    assert "reports" in data
    assert len(data["reports"]) >= 1
    assert "safety_score" in data["reports"][0]
