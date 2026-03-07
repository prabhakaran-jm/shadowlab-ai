"""
ShadowLab Pydantic models for API request/response schemas.
"""

from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "ok"


class Target(BaseModel):
    """Registered AI API target."""

    id: str
    name: str
    base_url: str
    endpoint: str
    method: str = "POST"


class ScanRequest(BaseModel):
    """Request body for starting a scan."""

    target_url: str
    target_description: str
    target_body_format: Literal["message", "messages"] = "message"
    target_authorization: str | None = None  # e.g. "Bearer <key>" for authenticated APIs (demo only)
    target_model: str | None = None  # for "messages" format; e.g. "llama3.3-70b-instruct" (Gradient)


class AttackResult(BaseModel):
    """Result of a single adversarial test."""

    attack_type: str
    prompt: str
    response_excerpt: str
    verdict: str
    severity: str
    reason: str
    suggested_fix: str | None = None


class ScanResult(BaseModel):
    """Aggregate result of a scan."""

    total_tests: int
    failed_tests: int
    safety_score: int
    results: list[AttackResult]
    gradient_used: bool = False
