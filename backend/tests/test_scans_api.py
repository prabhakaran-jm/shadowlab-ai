"""Tests for scan API routes."""
import pytest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    """Health check returns ok."""
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_post_scan_rejects_localhost_without_allow_env():
    """POST /scan rejects localhost target URL (SSRF guard)."""
    r = client.post(
        "/scan",
        json={
            "target_url": "http://127.0.0.1:8000/mock",
            "target_description": "local",
        },
    )
    assert r.status_code == 400
    assert "loopback" in r.json()["detail"].lower() or "localhost" in r.json()["detail"].lower()


def test_post_scan_rejects_private_ip():
    """POST /scan rejects private IP target URL."""
    r = client.post(
        "/scan",
        json={
            "target_url": "http://192.168.1.1/api",
            "target_description": "internal",
        },
    )
    assert r.status_code == 400
    assert "private" in r.json()["detail"].lower()


def test_post_scan_accepts_public_url():
    """POST /scan accepts public URL and returns scan result (mocked target)."""
    with patch("app.routes.scans.call_target_api", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = "Safe response with no sensitive phrases."
        r = client.post(
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


def test_get_scan_demo_returns_200():
    """GET /scan/demo runs a demo scan and returns result."""
    r = client.get("/scan/demo")
    assert r.status_code == 200
    data = r.json()
    assert "safety_score" in data
    assert "results" in data
    assert "gradient_used" in data
    assert data["total_tests"] >= 1
