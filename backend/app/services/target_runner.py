"""
Target API runner – sends prompt to the AI API under test.
Supports two common request body formats so more HTTP AI APIs work out of the box.
"""

import json
import httpx

# Body format: "message" = {"message": "<prompt>"}, "messages" = OpenAI-style {"messages": [{"role":"user","content":"<prompt>"}]}
DEFAULT_BODY_FORMAT = "message"


def _build_body(
    prompt: str,
    body_format: str,
    model: str | None = None,
) -> dict:
    if body_format == "messages":
        body = {"messages": [{"role": "user", "content": prompt}]}
        if model:
            body["model"] = model
        return body
    return {"message": prompt}


def _extract_text_from_response(response_text: str) -> str:
    """If response looks like JSON (e.g. OpenAI-style), try to extract the assistant text."""
    stripped = response_text.strip()
    if not stripped.startswith("{"):
        return response_text
    try:
        data = json.loads(response_text)
        if isinstance(data, dict):
            choices = data.get("choices")
            if isinstance(choices, list) and choices:
                msg = choices[0].get("message") or choices[0].get("delta")
                if isinstance(msg, dict) and "content" in msg:
                    return (msg.get("content") or "").strip() or response_text
            if "content" in data:
                return (data.get("content") or "").strip() or response_text
            if "text" in data:
                return (data.get("text") or "").strip() or response_text
    except (json.JSONDecodeError, TypeError):
        pass
    return response_text


async def call_target_api(
    url: str,
    prompt: str,
    body_format: str = DEFAULT_BODY_FORMAT,
    model: str | None = None,
    authorization: str | None = None,
) -> str:
    """
    POST JSON to url with the prompt. body_format: "message" (default) or "messages" (OpenAI/Gradient).
    Optional model for messages format; optional authorization (e.g. "Bearer <key>") for authenticated APIs.
    Returns response text; if JSON, attempts to extract assistant content for judging.
    """
    fmt = body_format if body_format in ("message", "messages") else DEFAULT_BODY_FORMAT
    body = _build_body(prompt, fmt, model=model)
    headers = {}
    if authorization and authorization.strip():
        headers["Authorization"] = authorization.strip()
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=body, headers=headers or None)
        response.raise_for_status()
        raw = response.text
        return _extract_text_from_response(raw)
