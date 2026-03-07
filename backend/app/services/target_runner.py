"""
Target API runner – sends prompt to the AI API under test.
"""

import httpx


async def call_target_api(url: str, prompt: str) -> str:
    """
    POST JSON {"message": prompt} to url, return response text.
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json={"message": prompt})
        response.raise_for_status()
        return response.text
