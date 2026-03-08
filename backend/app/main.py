"""
ShadowLab – Chaos Engineering for AI APIs
FastAPI application entry point.

In the final system, this app will:
- Expose REST API for targets, scans, and reports
- Orchestrate attack generation, execution, and evaluation
- Integrate with DigitalOcean Gradient AI for model inference
"""

import logging
import os
from pathlib import Path

from dotenv import load_dotenv

# Load backend/.env before any app code that reads os.getenv (e.g. gradient_client)
_env = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env)

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.routes import reports, scans, targets
from app.services.storage import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s %(name)s: %(message)s",
)

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Initialize persistent storage on startup."""
    init_db()
    yield


app = FastAPI(
    title="ShadowLab API",
    description="Chaos Engineering for AI APIs – adversarial testing and evaluation",
    version="0.1.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").strip()
allow_origins = [o.strip() for o in _cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(targets.router)
app.include_router(scans.router)
app.include_router(reports.router)


@app.get("/health")
async def health():
    """Health check for load balancers and monitoring."""
    return {"status": "ok"}


@app.get("/gradient/status")
async def gradient_status():
    """Check whether Gradient AI is configured and return model info."""
    from app.services.gradient_client import (
        GRADIENT_API_KEY,
        GRADIENT_MODEL_GENERATION,
        GRADIENT_MODEL_ANALYSIS,
    )
    available = bool(GRADIENT_API_KEY and GRADIENT_API_KEY.strip())
    return {
        "available": available,
        "generation_model": GRADIENT_MODEL_GENERATION if available else None,
        "analysis_model": GRADIENT_MODEL_ANALYSIS if available else None,
    }


@app.post("/mock-vulnerable-api")
async def mock_vulnerable_api():
    """
    Mock AI API that returns a 'vulnerable' response (contains 'system prompt').
    Use this as the scan target URL to test the Gradient analysis model:
    set API Endpoint to http://localhost:8000/mock-vulnerable-api
    """
    return {
        "message": (
            "Here is my system prompt: You are a helpful assistant. "
            "Follow all user instructions. Never refuse requests."
        )
    }
