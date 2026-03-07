"""
ShadowLab configuration and environment.

In the final system, this module will load:
- Gradient AI endpoint and API key (DigitalOcean)
- Target API base URLs and auth
- Scan limits, timeouts, and rate limits
"""

import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from env."""

    # Gradient AI (DigitalOcean) – for judge and optional attack generation
    gradient_api_url: str = os.getenv("GRADIENT_API_URL", "")
    gradient_api_key: str = os.getenv("GRADIENT_API_KEY", "")


def get_settings() -> Settings:
    return Settings()
