"""Pytest fixtures and config."""
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)


class MockResult:
    """Minimal result-like object for scoring tests."""

    def __init__(self, verdict: str, severity: str = "low"):
        self.verdict = verdict
        self.severity = severity
