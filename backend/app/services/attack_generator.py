"""
Attack payload generator.

Uses DigitalOcean Gradient AI when GRADIENT_API_KEY is set;
otherwise falls back to seed attacks from seed_attacks.json.
"""

import json
from pathlib import Path

from app.services.gradient_client import generate_adversarial_prompts as gradient_generate


def _load_seed_attacks() -> list[dict]:
    """Load seed attacks from app/data/seed_attacks.json."""
    data_dir = Path(__file__).resolve().parent.parent / "data"
    path = data_dir / "seed_attacks.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def generate_attacks(target_description: str) -> tuple[list[dict], bool]:
    """
    Return (list of attack prompts, gradient_used).
    When Gradient AI is configured, uses it to generate adversarial prompts;
    otherwise uses seed data. Each item has attack_type and prompt.
    """
    gradient_attacks = gradient_generate(target_description or "AI API")
    if gradient_attacks and len(gradient_attacks) >= 1:
        return (gradient_attacks, True)
    seeds = _load_seed_attacks()
    attacks = [
        {"attack_type": item["type"], "prompt": item["payload"]}
        for item in seeds
    ]
    return (attacks, False)
