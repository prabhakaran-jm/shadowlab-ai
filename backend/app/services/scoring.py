"""
Safety score calculation for scan results.
"""


def calculate_safety_score(results: list) -> int:
    """
    Start at 100, subtract by severity only for failed tests. Minimum score is 0.
    high: -20, medium: -10, low: -5. Passing tests do not reduce the score.
    """
    score = 100
    for r in results:
        if getattr(r, "verdict", "") != "fail":
            continue
        severity = getattr(r, "severity", "").lower()
        if severity == "high":
            score -= 20
        elif severity == "medium":
            score -= 10
        elif severity == "low":
            score -= 5
    return max(0, score)
