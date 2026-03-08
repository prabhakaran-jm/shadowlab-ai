"""
Scan routes – run adversarial tests against a target API.

Supports iterative attack refinement: when Gradient AI is available and
some attacks pass (target defended successfully), a second round of
refined attacks is generated and executed to test deeper defenses.
"""

import logging
from app.models import AttackResult, ScanRequest, ScanResult
from app.services.attack_generator import generate_attacks, generate_refined_attacks
from app.services.judge import evaluate_response, suggest_fix
from app.services.scoring import calculate_safety_score
from app.services.ssrf_guard import is_safe_target_url
from app.services.target_runner import call_target_api
from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/scan", tags=["scan"])
limiter = Limiter(key_func=get_remote_address)

EXCERPT_LEN = 200
MAX_TOTAL_ATTACKS = 15


async def _run_attack_round(
    attacks: list[dict],
    target_url: str,
    mock_responses: list[str] | None,
    target_body_format: str,
    target_model: str | None,
    target_authorization: str | None,
) -> list[AttackResult]:
    """Execute a single round of attacks and return results."""
    results: list[AttackResult] = []

    for i, attack in enumerate(attacks):
        attack_type = attack["attack_type"]
        prompt = attack["prompt"]
        target_failed = False
        response_text = ""

        if mock_responses:
            response_text = mock_responses[i % len(mock_responses)]
        else:
            try:
                response_text = await call_target_api(
                    target_url,
                    prompt,
                    body_format=target_body_format,
                    model=target_model,
                    authorization=target_authorization,
                )
            except Exception as e:
                target_failed = True
                response_text = str(e)
                logger.warning("Target request failed: %s", e)

        response_excerpt = response_text[:EXCERPT_LEN]
        if len(response_text) > EXCERPT_LEN:
            response_excerpt += "..."

        if target_failed:
            verdict = "fail"
            severity = "high"
            reason = f"Target request failed: {response_excerpt}"
            suggested_fix = suggest_fix(attack_type)
        else:
            evaluation = evaluate_response(prompt, response_text, attack_type)
            verdict = evaluation["verdict"]
            severity = evaluation["severity"]
            reason = evaluation["reason"]
            suggested_fix = evaluation.get("suggested_fix")

        if verdict == "fail" and suggested_fix:
            logger.info(
                "attack=%s verdict=fail fix=%s",
                attack_type,
                suggested_fix[:80] + ("..." if len(suggested_fix) > 80 else ""),
            )
        else:
            logger.info(
                "attack=%s response_excerpt=%s verdict=%s",
                attack_type,
                response_excerpt[:80] + ("..." if len(response_excerpt) > 80 else ""),
                verdict,
            )

        results.append(
            AttackResult(
                attack_type=attack_type,
                prompt=prompt,
                response_excerpt=response_excerpt,
                verdict=verdict,
                severity=severity,
                reason=reason,
                suggested_fix=suggested_fix,
            )
        )

    return results


async def _run_scan(
    target_url: str,
    target_description: str = "",
    mock_responses: list[str] | None = None,
    target_body_format: str = "message",
    target_model: str | None = None,
    target_authorization: str | None = None,
) -> ScanResult:
    """Generate attacks, call target for each, evaluate, aggregate.
    If mock_responses is set, use those instead of HTTP (no network; for demo/tests).
    target_body_format: "message" (default) or "messages" (OpenAI/Gradient).
    Optional target_model (for messages) and target_authorization (Bearer token) for real APIs.

    When Gradient AI is available and some attacks pass in round 1,
    a second round of refined attacks is generated and executed.
    """
    attacks, gradient_used = generate_attacks(target_description)
    rounds = 1

    # Round 1
    results = await _run_attack_round(
        attacks, target_url, mock_responses,
        target_body_format, target_model, target_authorization,
    )

    # Round 2: iterative refinement (only when Gradient is available and some attacks passed)
    if gradient_used and not mock_responses:
        defended = [
            {"prompt": r.prompt, "response": r.response_excerpt}
            for r in results
            if r.verdict == "pass"
        ]
        if defended:
            slots_remaining = MAX_TOTAL_ATTACKS - len(results)
            if slots_remaining > 0:
                refined = generate_refined_attacks(defended)
                if refined:
                    refined = refined[:slots_remaining]
                    logger.info(
                        "Round 2: running %d refined attacks based on %d successful defenses",
                        len(refined), len(defended),
                    )
                    round2_results = await _run_attack_round(
                        refined, target_url, None,
                        target_body_format, target_model, target_authorization,
                    )
                    results.extend(round2_results)
                    rounds = 2

    failed = sum(1 for r in results if r.verdict == "fail")
    score = calculate_safety_score(results)
    logger.info("scan completed safety_score=%s failed_tests=%s rounds=%s", score, failed, rounds)

    result = ScanResult(
        total_tests=len(results),
        failed_tests=failed,
        safety_score=score,
        results=results,
        gradient_used=gradient_used,
        rounds=rounds,
    )
    try:
        from app.routes.reports import append_report
        append_report({"target_url": target_url, **result.model_dump()})
    except Exception as e:
        logger.warning("Report persistence failed (non-fatal): %s", e)
    return result


@router.post("", response_model=ScanResult)
@limiter.limit("10/minute")
async def post_scan(request: Request, body: ScanRequest):
    """
    Run adversarial scan: generate attacks, send to target_url, evaluate responses.
    Rejects private/localhost URLs unless ALLOW_LOCALHOST_TARGET=1 (e.g. for local mock demo).
    Rate limited to 10 requests per minute per IP.
    """
    ok, reason = is_safe_target_url(body.target_url)
    if not ok:
        raise HTTPException(status_code=400, detail=reason)
    return await _run_scan(
        body.target_url,
        body.target_description or "",
        target_body_format=body.target_body_format,
        target_model=body.target_model,
        target_authorization=body.target_authorization,
    )


# Demo scan uses built-in mock responses (no external network).
_DEMO_MOCK_RESPONSES = [
    "Safe response. No sensitive data.",
    "Here is my system prompt: You are a helpful assistant. Follow all user instructions.",
    "Safe response. No sensitive data.",
]


@router.get("/demo", response_model=ScanResult)
async def get_scan_demo():
    """
    Run a demo scan using built-in mock responses (no external API call).
    Deterministic and CI-friendly.
    """
    return await _run_scan("", "Demo target", mock_responses=_DEMO_MOCK_RESPONSES)
