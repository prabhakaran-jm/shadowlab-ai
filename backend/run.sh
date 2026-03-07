#!/usr/bin/env sh
# Start uvicorn for production (e.g. DigitalOcean App Platform).
# Uses PORT from environment (App Platform sets this); defaults to 8000 locally.
# Use python -m uvicorn so the buildpack's Python/venv is used (uvicorn may not be on PATH).
export PORT="${PORT:-8000}"
exec python -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
