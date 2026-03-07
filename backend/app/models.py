"""
ShadowLab Pydantic models for API request/response schemas.

In the final system, these will include:
- Target (API endpoint, auth, description)
- Scan (target_id, attack_set, status)
- Report (scan_id, findings, severity, recommendations)
- Attack (type, payload, expected_behavior)
"""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "ok"
