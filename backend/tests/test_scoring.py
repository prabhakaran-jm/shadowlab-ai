"""Tests for safety score calculation."""
import pytest
from app.models import AttackResult
from app.services.scoring import calculate_safety_score


def test_all_pass_scores_100():
    """Passing tests do not reduce the score; all-pass scan is 100."""
    results = [
        AttackResult(
            attack_type="prompt_injection",
            prompt="x",
            response_excerpt="ok",
            verdict="pass",
            severity="low",
            reason="",
            suggested_fix=None,
        ),
        AttackResult(
            attack_type="system_prompt_extraction",
            prompt="y",
            response_excerpt="ok",
            verdict="pass",
            severity="low",
            reason="",
            suggested_fix=None,
        ),
    ]
    assert calculate_safety_score(results) == 100


def test_one_high_fail_scores_80():
    """One high-severity failure deducts 20."""
    results = [
        AttackResult(
            attack_type="prompt_injection",
            prompt="x",
            response_excerpt="leaked",
            verdict="fail",
            severity="high",
            reason="leak",
            suggested_fix="fix",
        ),
    ]
    assert calculate_safety_score(results) == 80


def test_two_high_fail_scores_60():
    """Two high-severity failures deduct 40."""
    results = [
        AttackResult(
            attack_type="a",
            prompt="x",
            response_excerpt="",
            verdict="fail",
            severity="high",
            reason="",
            suggested_fix="",
        ),
        AttackResult(
            attack_type="b",
            prompt="y",
            response_excerpt="",
            verdict="fail",
            severity="high",
            reason="",
            suggested_fix="",
        ),
    ]
    assert calculate_safety_score(results) == 60


def test_medium_and_low_fail_deductions():
    """Medium deducts 10, low deducts 5."""
    results = [
        AttackResult(
            attack_type="a",
            prompt="x",
            response_excerpt="",
            verdict="fail",
            severity="medium",
            reason="",
            suggested_fix="",
        ),
        AttackResult(
            attack_type="b",
            prompt="y",
            response_excerpt="",
            verdict="fail",
            severity="low",
            reason="",
            suggested_fix="",
        ),
    ]
    assert calculate_safety_score(results) == 85


def test_score_floor_zero():
    """Score does not go below 0."""
    results = [
        AttackResult(
            attack_type="a",
            prompt="x",
            response_excerpt="",
            verdict="fail",
            severity="high",
            reason="",
            suggested_fix="",
        )
        for _ in range(10)
    ]
    assert calculate_safety_score(results) == 0


def test_mixed_pass_and_fail():
    """Only failed tests reduce the score."""
    results = [
        AttackResult(
            attack_type="a",
            prompt="x",
            response_excerpt="",
            verdict="pass",
            severity="low",
            reason="",
            suggested_fix=None,
        ),
        AttackResult(
            attack_type="b",
            prompt="y",
            response_excerpt="",
            verdict="fail",
            severity="high",
            reason="",
            suggested_fix="fix",
        ),
        AttackResult(
            attack_type="c",
            prompt="z",
            response_excerpt="",
            verdict="pass",
            severity="low",
            reason="",
            suggested_fix=None,
        ),
    ]
    assert calculate_safety_score(results) == 80
