"""
Scan routes – run adversarial tests against a target API.
"""

import logging
from app.models import AttackResult, ScanRequest, ScanResult
from app.services.attack_generator import generate_attacks
from app.services.judge import evaluate_response
from app.services.target_runner import call_target_api
from fastapi import APIRouter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/scan", tags=["scan"])

EXCERPT_LEN = 200


async def _run_scan(target_url: str) -> ScanResult:
    """Generate attacks, call target for each, evaluate, aggregate."""
    attacks = generate_attacks("")
    results: list[AttackResult] = []
    failed = 0

    for attack in attacks:
        attack_type = attack["attack_type"]
        prompt = attack["prompt"]

        try:
            response_text = await call_target_api(target_url, prompt)
        except Exception as e:
            response_text = str(e)
            logger.warning("Target request failed: %s", e)

        response_excerpt = response_text[:EXCERPT_LEN]
        if len(response_text) > EXCERPT_LEN:
            response_excerpt += "..."

        evaluation = evaluate_response(prompt, response_text)
        verdict = evaluation["verdict"]
        severity = evaluation["severity"]
        reason = evaluation["reason"]

        logger.info(
            "attack=%s response_excerpt=%s verdict=%s",
            attack_type,
            response_excerpt[:80] + ("..." if len(response_excerpt) > 80 else ""),
            verdict,
        )

        if verdict == "fail":
            failed += 1

        results.append(
            AttackResult(
                attack_type=attack_type,
                prompt=prompt,
                response_excerpt=response_excerpt,
                verdict=verdict,
                severity=severity,
                reason=reason,
            )
        )

    return ScanResult(
        total_tests=len(results),
        failed_tests=failed,
        results=results,
    )


@router.post("", response_model=ScanResult)
async def post_scan(body: ScanRequest):
    """
    Run adversarial scan: generate attacks, send to target_url, evaluate responses.
    """
    return await _run_scan(body.target_url)


@router.get("/demo", response_model=ScanResult)
async def get_scan_demo():
    """
    Run a demo scan against mock API (postman-echo.com).
    """
    mock_url = "https://postman-echo.com/post"
    return await _run_scan(mock_url)
