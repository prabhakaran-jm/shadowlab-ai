"""
Attack payload generator – loads seed attacks and returns prompts for scanning.
"""

import json
from pathlib import Path


def _load_seed_attacks() -> list[dict]:
    """Load seed attacks from app/data/seed_attacks.json."""
    data_dir = Path(__file__).resolve().parent.parent / "data"
    path = data_dir / "seed_attacks.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def generate_attacks(target_description: str) -> list[dict]:
    """
    Return a list of attack prompts from seed data.
    Each item has attack_type and prompt.
    """
    seeds = _load_seed_attacks()
    return [
        {"attack_type": item["type"], "prompt": item["payload"]}
        for item in seeds
    ]
