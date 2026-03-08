# ShadowLab -- Chaos Engineering for AI APIs

**Automatically discover adversarial failures in AI APIs before users exploit them.**

---

## Quick Demo for Judges

**Live app:** https://shadowlab-h9yu6.ondigitalocean.app/
(Gradient AI is pre-configured -- scans use AI-generated attacks and AI-powered analysis)

**To run locally with Gradient AI:**
1. Clone the repo
2. Set `GRADIENT_MODEL_ACCESS_KEY=<your key>` in `backend/.env`
3. `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`
4. `cd frontend && npm install && npm run dev`
5. Open http://localhost:3000

**Try scanning the mock vulnerable API:**
- API Endpoint: http://localhost:8000/mock-vulnerable-api
- Set `ALLOW_LOCALHOST_TARGET=1` in `backend/.env`
- Click "Start Scan" -- you'll see failures, a lower safety score, and AI-generated fix suggestions

---

## Problem

AI APIs often fail under adversarial or edge-case inputs. Common failure modes include:

- **Prompt injection** -- users override system instructions or inject malicious prompts
- **System prompt leakage** -- internal instructions or system prompts exposed in responses
- **Policy bypass** -- guardrails circumvented via hypotheticals, roleplay, or phrasing
- **Edge-case inputs** -- unexpected or malformed inputs that trigger unsafe behavior

Developers lack tools to proactively test these vulnerabilities before they are exploited in production.

---

## Solution

ShadowLab is an adversarial testing platform that:

- **Generates adversarial prompts** via **DigitalOcean Gradient AI** or a curated seed set (15 payloads)
- **Executes automated red-team scans** against HTTP AI APIs that accept POST with a JSON body (`message` or OpenAI-style `messages`)
- **Detects vulnerabilities** using heuristic rules AND **Gradient AI-powered deep analysis** on every response
- **Iteratively refines attacks** -- when a target defends successfully, Gradient generates follow-up bypass attempts
- **Suggests fixes** with developer-friendly remediation (including Gradient-generated suggestions)
- **Computes a safety score** so you can track and compare API robustness over time

---

## How Gradient AI Powers ShadowLab

ShadowLab uses **DigitalOcean Gradient AI** in four distinct, meaningful ways:

| Use Case | Model | What It Does |
|----------|-------|-------------|
| **Attack Generation** | GPT-OSS-20B | Generates targeted adversarial prompts based on the target API description |
| **Vulnerability Detection** | Llama 3.3 70B | Analyzes every API response for security failures -- detects subtle issues like paraphrased leakage, roleplay compliance, and tone shifts |
| **Attack Refinement** | GPT-OSS-20B | Generates follow-up attacks that bypass the target's specific defenses (adaptive multi-round testing) |
| **Fix Suggestions** | Llama 3.3 70B | Provides developer-friendly remediation for each finding |

This two-model design optimizes both performance and cost. When no Model Access Key is set, the app falls back to seed attacks and heuristic-only judging.

---

## Architecture

| Component | Description |
|----------|-------------|
| **Frontend** | Next.js dashboard -- scan form, Gradient status indicator, security report, filterable results table |
| **Backend** | FastAPI scan engine -- `/scan`, `/scan/demo`, `/gradient/status`, health check |
| **DigitalOcean Gradient AI** | GPT-OSS-20B for prompt generation + refinement; Llama 3.3 70B for vulnerability detection + fix suggestions |
| **Attack generator** | Calls Gradient AI when `GRADIENT_MODEL_ACCESS_KEY` is set; else uses 15 seed attacks (JSON) |
| **Target runner** | POST with `message` or OpenAI-style `messages` body; returns response text for judging |
| **Response judge** | Two-layer: heuristic rules + Gradient AI deep analysis. Either can flag a failure. |
| **Iterative refinement** | When some attacks pass, Gradient generates targeted follow-up attacks (up to 2 rounds) |
| **Safety scoring** | 0-100; only failed tests reduce the score (passing tests do not deduct) |
| **Persistence** | SQLite-backed storage for targets and recent reports (survives process restarts) |
| **Deployment** | DigitalOcean App Platform (optional). Storage: DigitalOcean Spaces (optional) |

---

## Features

- **Adversarial attack generation** -- Gradient AI-generated or seed-based (15 payloads covering prompt injection, system prompt extraction, policy bypass, encoding bypass, multi-language, and more)
- **AI-powered vulnerability detection** -- Gradient AI analyzes ALL responses, not just heuristic matches, catching subtle leakage and compliance issues
- **Iterative attack refinement** -- multi-round adaptive testing that learns from the target's defenses
- **Developer-friendly fix recommendations** -- actionable suggestions (including Gradient AI-enhanced)
- **Safety score reporting** -- 0-100 score derived from severity of findings
- **Gradient connectivity indicator** -- real-time status badge showing whether Gradient AI is connected
- **Security report dashboard** -- summary, vulnerability counts, filterable/sortable results table, recommended fixes
- **Real scan progress** -- honest loading state with status indicator (no fake logs)
- **Persistent data** -- targets and recent reports are stored in SQLite (not in-memory only)

---

## Demo Flow

1. **Start the stack** -- run backend (`uvicorn`) and frontend (`npm run dev`).
2. **Open the dashboard** -- go to the frontend URL (e.g. `http://localhost:3000`).
3. **Check Gradient status** -- the scan form shows whether Gradient AI is connected.
4. **Enter a target** -- provide an API endpoint URL and optional target description.
5. **Start scan** -- click "Start Scan"; the status indicator shows real progress. With Gradient configured, attacks are **generated by DigitalOcean Gradient AI** and responses are **analyzed by Gradient AI**.
6. **View report** -- Safety Score (with round count if adaptive refinement ran), vulnerability summary, filterable results table, and recommended fixes.
7. **Filter findings** -- use severity filter buttons (All / High / Medium / Low) to focus on specific issues.
8. **Optional** -- try `GET /scan/demo` for a quick scan against a mock endpoint.

---

## Quick start (3 commands)

```bash
cd backend && pip install -r requirements.txt && cp .env.example .env && uvicorn app.main:app --reload
# In another terminal:
cd frontend && npm install && npm run dev
```

Then open `http://localhost:3000`. Optional: set `GRADIENT_MODEL_ACCESS_KEY` (or `GRADIENT_API_KEY`) in `backend/.env` for Gradient AI; see [docs/GRADIENT_SETUP.md](docs/GRADIENT_SETUP.md). To scan the built-in mock vulnerable API locally, set `ALLOW_LOCALHOST_TARGET=1` in `backend/.env`.

---

## Running Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # then set GRADIENT_MODEL_ACCESS_KEY or GRADIENT_API_KEY for Gradient AI
uvicorn app.main:app --reload
```

API: `http://localhost:8000`
Docs: `http://localhost:8000/docs`

**Target URL guard:** Private and localhost URLs are rejected unless `ALLOW_LOCALHOST_TARGET=1` (use for the mock-vulnerable-api demo).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard: `http://localhost:3000`. For production, set `NEXT_PUBLIC_API_URL` to your backend URL.

To run the production build locally: `npm run build` then `npm start` (still serves on port 3000 unless `PORT` is set).

### Tests

**Backend (pytest):**
```bash
cd backend
pip install -r requirements.txt   # includes pytest, pytest-asyncio, pytest-timeout
pytest tests/ -v
# In CI, use: pytest tests/ -v --timeout=10  (avoids hangs)
```

**Frontend (Jest + React Testing Library):**
```bash
cd frontend
npm install
npm run test
```

---

## Deployment (DigitalOcean App Platform)

To run ShadowLab on [DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/):

1. Push this repo to GitHub and connect it in the [Apps](https://cloud.digitalocean.com/apps) dashboard (or use the spec: `doctl apps create --spec .do/app.yaml` after setting your repo in `.do/app.yaml`).
2. Add two services: **backend** (source dir `backend`, run `sh run.sh`, port 8080) and **frontend** (source dir `frontend`, `npm run build` / `npm start`, port 8080).
3. Set **backend** env: `CORS_ORIGINS` = your frontend Live URL; optionally `GRADIENT_MODEL_ACCESS_KEY`.
4. Set **frontend** env: `NEXT_PUBLIC_API_URL` = your backend Live URL, then redeploy the frontend.

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for the full step-by-step and troubleshooting.

---

## How we used DigitalOcean Gradient AI

**Setup:** See [docs/GRADIENT_SETUP.md](docs/GRADIENT_SETUP.md) for **GRADIENT_MODEL_ACCESS_KEY** (or **GRADIENT_API_KEY**) and **GRADIENT_API_URL**.

ShadowLab uses **DigitalOcean Gradient AI** with a two-model setup across four integration points:

1. **Adversarial prompt generation** -- A lightweight model (default: **GPT-OSS-20B**) generates attack prompts from the target description. Fast and cost-efficient.
2. **Deep vulnerability detection** -- A stronger model (default: **Llama 3.3 70B**) analyzes **every API response** for security vulnerabilities, detecting subtle issues that heuristic rules miss: paraphrased system prompt leakage, roleplay compliance, encoded content, partial policy bypass, and tone shifts.
3. **Iterative attack refinement** -- After the first scan round, if the target defended against some attacks, Gradient generates **adaptive follow-up attacks** designed to bypass those specific defenses. This tests the target more thoroughly across up to 2 rounds.
4. **Fix suggestions** -- The analysis model provides developer-friendly remediation for each vulnerability found, going beyond generic recommendations.

This keeps the pipeline working without an API key while demonstrating deep Gradient integration for the hackathon. We use a **fast, cheaper model** for bulk prompt generation and refinement, and a **higher-reasoning model** for deep analysis and fix suggestions -- showing production-style use of Gradient's model options.

**Target API contract:** The scan sends `POST` with JSON: default `{"message": "<prompt>"}` or `target_body_format: "messages"` for `{"model": "...", "messages": [...]}` (OpenAI/Gradient). Optional `target_authorization` (Bearer token) and `target_model` for authenticated APIs. Use the built-in mock at `http://localhost:8000/mock-vulnerable-api` with `ALLOW_LOCALHOST_TARGET=1`, or a real API -- see [docs/DEMO_REAL_API.md](docs/DEMO_REAL_API.md) for testing with **Gradient as the scan target** during the demo.

---

## Hackathon submission

Built for the **DigitalOcean Gradient AI Hackathon**. The app integrates Gradient AI for attack generation, deep vulnerability detection, iterative refinement, and fix suggestions as described above.

**Before submitting:** Add your links here (and in the hackathon form):

- **Demo video:** <!-- TODO: Replace with your YouTube/Vimeo URL before submission -->
- **Live demo (optional):** https://shadowlab-h9yu6.ondigitalocean.app/

**For judges:** Set `GRADIENT_MODEL_ACCESS_KEY` in the backend (see [docs/GRADIENT_SETUP.md](docs/GRADIENT_SETUP.md)) so scans use Gradient for attack generation, vulnerability detection, and iterative refinement. Without it, the app uses seed attacks and heuristic-only judging; the video and judged run should show a scan where the report displays *"Adversarial attacks generated by DigitalOcean Gradient AI."*

**Note:** Targets and reports are persisted in SQLite and survive process restarts. The database is stored at `backend/shadowlab.db` by default (configurable via `SHADOWLAB_DB_PATH`). Up to 50 recent reports are retained automatically.

---

## Future Improvements

- **Real-time attack streaming** -- stream attack events and judge results as they complete
- **CI/CD integration** -- fail builds or block deploys when safety score or critical findings exceed thresholds
- **Advanced adversarial mutation** -- multi-generation attack evolution for broader coverage
- **Comparative reporting** -- track safety score trends across scan history
