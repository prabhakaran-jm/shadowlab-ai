"""Tests for scan API routes."""
import pytest
from unittest.mock import AsyncMock, patch


@pytest.mark.asyncio
async def test_health(client):
    """Health check returns ok."""
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_post_scan_rejects_localhost_without_allow_env(client):
    """POST /scan rejects localhost target URL (SSRF guard)."""
    r = await client.post(
        "/scan",
        json={
            "target_url": "http://127.0.0.1:8000/mock",
            "target_description": "local",
        },
    )
    assert r.status_code == 400
    assert "loopback" in r.json()["detail"].lower() or "localhost" in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_post_scan_rejects_private_ip(client):
    """POST /scan rejects private IP target URL."""
    r = await client.post(
        "/scan",
        json={
            "target_url": "http://192.168.1.1/api",
            "target_description": "internal",
        },
    )
    assert r.status_code == 400
    assert "private" in r.json()["detail"].lower()


@patch("app.routes.scans.is_safe_target_url", return_value=(True, ""))
@pytest.mark.asyncio
async def test_post_scan_accepts_public_url(_safe, client):
    """POST /scan accepts public URL and returns scan result (mocked target)."""
    with patch("app.routes.scans.call_target_api", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = "Safe response with no sensitive phrases."
        r = await client.post(
            "/scan",
            json={
                "target_url": "https://api.example.com/chat",
                "target_description": "Example API",
            },
        )
        assert r.status_code == 200
        data = r.json()
        assert "safety_score" in data
        assert "results" in data
        assert data["total_tests"] >= 1
        assert 0 <= data["safety_score"] <= 100


@pytest.mark.asyncio
async def test_get_scan_demo_returns_200(client):
    """GET /scan/demo runs a demo scan and returns result."""
    r = await client.get("/scan/demo")
    assert r.status_code == 200
    data = r.json()
    assert "safety_score" in data
    assert "results" in data
    assert "gradient_used" in data
    assert data["total_tests"] >= 1
