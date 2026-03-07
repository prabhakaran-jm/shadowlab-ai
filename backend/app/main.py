"""
ShadowLab – Chaos Engineering for AI APIs
FastAPI application entry point.

In the final system, this app will:
- Expose REST API for targets, scans, and reports
- Orchestrate attack generation, execution, and evaluation
- Integrate with DigitalOcean Gradient AI for model inference
"""

from fastapi import FastAPI

from app.routes import reports, scans, targets

app = FastAPI(
    title="ShadowLab API",
    description="Chaos Engineering for AI APIs – adversarial testing and evaluation",
    version="0.1.0",
)


app.include_router(targets.router)
app.include_router(scans.router)
app.include_router(reports.router)


@app.get("/health")
def health():
    """Health check for load balancers and monitoring."""
    return {"status": "ok"}
