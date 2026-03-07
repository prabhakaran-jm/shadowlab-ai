"""
Target API runner – sends requests to the AI API under test.

In the final system, this module will:
- Build request (prompt, system message, etc.) from attack payload
- Call target API with httpx (async)
- Handle auth, timeouts, retries, and rate limiting
"""

import httpx


async def call_target_api(url: str, method: str = "POST", json: dict | None = None) -> dict:
    """
    Simple async helper to call an API using httpx.

    In the final system, will accept target config (auth, headers),
    build the request from attack payload, and return normalized response.
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.request(method, url, json=json or {})
        response.raise_for_status()
        return response.json()
