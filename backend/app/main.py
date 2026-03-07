"""
ShadowLab – Chaos Engineering for AI APIs
FastAPI application entry point.

In the final system, this app will:
- Expose REST API for targets, scans, and reports
- Orchestrate attack generation, execution, and evaluation
- Integrate with DigitalOcean Gradient AI for model inference
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import reports, scans, targets

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s %(name)s: %(message)s",
)

app = FastAPI(
    title="ShadowLab API",
    description="Chaos Engineering for AI APIs – adversarial testing and evaluation",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(targets.router)
app.include_router(scans.router)
app.include_router(reports.router)


@app.get("/health")
def health():
    """Health check for load balancers and monitoring."""
    return {"status": "ok"}
