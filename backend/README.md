# ShadowLab Backend

Python + FastAPI backend for **ShadowLab – Chaos Engineering for AI APIs**.

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs

## Structure

- `app/main.py` – FastAPI app and `/health`
- `app/config.py` – Settings (Gradient AI, etc.)
- `app/models.py` – Pydantic schemas
- `app/routes/` – targets, scans, reports
- `app/services/` – Gradient client, attack generator, judge, target runner
- `app/data/` – seed attack payloads
