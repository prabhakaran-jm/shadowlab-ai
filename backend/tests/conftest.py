"""Pytest fixtures and config."""
import pytest
import httpx

from app.main import app
from app.services.storage import init_db


@pytest.fixture
async def client():
    """ASGI client fixture; avoids TestClient hangs on current runtime."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.fixture(autouse=True)
def isolate_db(tmp_path, monkeypatch):
    """Use a fresh SQLite DB per test for deterministic persistence behavior."""
    db_path = tmp_path / "shadowlab-test.db"
    monkeypatch.setenv("SHADOWLAB_DB_PATH", str(db_path))
    init_db()
    yield


class MockResult:
    """Minimal result-like object for scoring tests."""

    def __init__(self, verdict: str, severity: str = "low"):
        self.verdict = verdict
        self.severity = severity
