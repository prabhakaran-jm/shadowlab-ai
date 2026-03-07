# ShadowLab – Chaos Engineering for AI APIs

**Automatically discover adversarial failures in AI APIs before users exploit them.**

---

## Problem

AI APIs often fail under adversarial or edge-case inputs. Common failure modes include:

- **Prompt injection** – users override system instructions or inject malicious prompts
- **System prompt leakage** – internal instructions or system prompts exposed in responses
- **Policy bypass** – guardrails circumvented via hypotheticals, roleplay, or phrasing
- **Edge-case inputs** – unexpected or malformed inputs that trigger unsafe behavior

Developers lack tools to proactively test these vulnerabilities before they are exploited in production.

---

## Solution

ShadowLab is an adversarial testing platform that:

- **Generates adversarial prompts** from a curated and extensible attack set
- **Executes automated red-team scans** against any HTTP AI API endpoint
- **Detects vulnerabilities** using heuristic and rule-based response analysis
- **Suggests fixes** with developer-friendly remediation guidance
- **Computes a safety score** so you can track and compare API robustness over time

---

## Features

- **Adversarial attack generation** – seed attacks for prompt injection, system prompt extraction, and policy bypass
- **Automated vulnerability detection** – run full scans with a single API call or from the dashboard
- **Developer-friendly fix recommendations** – actionable suggestions when issues are found
- **Safety score reporting** – 0–100 score derived from severity of findings
- **Security report dashboard** – summary, vulnerability counts, results table, and recommended fixes
- **Live attack console** – real-time log of attacks as a scan runs

---

## Architecture

| Component | Description |
|----------|-------------|
| **Frontend** | Next.js dashboard – scan form, live console, security report, and results table |
| **Backend** | FastAPI scan engine – `/scan`, `/scan/demo`, health check |
| **Attack generator** | Loads seed attacks (JSON) and returns prompt payloads by type |
| **Target runner** | Sends prompts to the target API via HTTP and returns response text |
| **Response judge** | Evaluates responses with heuristic rules and suggests fixes on failure |
| **Safety scoring** | Computes 0–100 score from result severities (high/medium/low) |

---

## Demo Flow

1. **Start the stack** – run backend (`uvicorn`) and frontend (`npm run dev`).
2. **Open the dashboard** – go to the frontend URL (e.g. `http://localhost:3000`).
3. **Enter a target** – provide an API endpoint URL and optional target description.
4. **Start scan** – click “Start Scan”; the live console shows “Starting ShadowLab scan…” and simulated attack progress.
5. **View report** – when the scan completes, see Safety Score, vulnerability summary (e.g. Prompt Injection / System Prompt Extraction / Policy Bypass counts), results table, and recommended fixes.
6. **Optional** – try `GET /scan/demo` for a quick scan against a mock endpoint.

---

## Running Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API: `http://localhost:8000`  
Docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard: `http://localhost:3000`

---

## Hackathon

Built for the **DigitalOcean Gradient AI Hackathon**. The backend is prepared for integration with DigitalOcean Gradient AI for LLM-based judging and advanced attack generation.

---

## Future Improvements

- **Real-time attack streaming** – stream attack events and judge results as they complete
- **LLM-based vulnerability analysis** – use Gradient (or similar) as a judge for nuanced verdicts
- **CI/CD integration** – fail builds or block deploys when safety score or critical findings exceed thresholds
- **Advanced adversarial mutation** – mutate prompts and evolve attacks for harder red-team coverage
