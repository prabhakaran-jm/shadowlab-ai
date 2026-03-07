"""Pytest fixtures and config."""
import pytest
import httpx

from app.main import app


@pytest.fixture
async def client():
    """ASGI client fixture; avoids TestClient hangs on current runtime."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


class MockResult:
    """Minimal result-like object for scoring tests."""

    def __init__(self, verdict: str, severity: str = "low"):
        self.verdict = verdict
        self.severity = severity
