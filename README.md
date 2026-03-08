# 🛡️ ShadowLab – Chaos Engineering for AI APIs

**Automatically discover adversarial failures in AI APIs before users exploit them.**

> **Built for the DigitalOcean Gradient AI Hackathon** 🎉
>
> Adversarial testing platform powered by **DigitalOcean Gradient™ AI** for attack generation, deep vulnerability analysis, iterative refinement, and developer-friendly fix suggestions.

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-DigitalOcean%20App%20Platform-blue.svg)](https://docs.digitalocean.com/products/app-platform/)
[![AI](https://img.shields.io/badge/AI-DigitalOcean%20Gradient-purple.svg)](https://www.digitalocean.com/products/ai)
[![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20FastAPI-black.svg)](#-technology-stack)

---

## 🎯 Quick Demo for Judges

**🌐 Live app:** [https://shadowlab-h9yu6.ondigitalocean.app/](https://shadowlab-h9yu6.ondigitalocean.app/)  
*(Gradient AI is pre-configured — scans use AI-generated attacks and AI-powered analysis)*

### Run locally with Gradient AI (≈2 min)

```bash
# 1. Clone and configure
git clone https://github.com/prabhakaran-jm/shadowlab-ai.git
cd shadowlab-ai

# 2. Backend: set GRADIENT_MODEL_ACCESS_KEY in backend/.env (see docs/GRADIENT_SETUP.md)
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env: GRADIENT_MODEL_ACCESS_KEY=<your key>, ALLOW_LOCALHOST_TARGET=1 for local demo
uvicorn app.main:app --reload
```

```bash
# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

**4.** Open [http://localhost:3000](http://localhost:3000)

**5. Try the mock vulnerable API:**
- **API Endpoint:** `http://localhost:8000/mock-vulnerable-api`
- Ensure `ALLOW_LOCALHOST_TARGET=1` in `backend/.env`
- Click **Start Scan** — you’ll see failures, a lower safety score, and AI-generated fix suggestions

---

## 🔥 The Problem

AI APIs often fail under adversarial or edge-case inputs. Common failure modes include:

| Risk | Description |
|------|-------------|
| **Prompt injection** | Users override system instructions or inject malicious prompts |
| **System prompt leakage** | Internal instructions or system prompts exposed in responses |
| **Policy bypass** | Guardrails circumvented via hypotheticals, roleplay, or phrasing |
| **Edge-case inputs** | Unexpected or malformed inputs that trigger unsafe behavior |

Developers lack tools to **proactively test** these vulnerabilities before they are exploited in production.

---

## ✅ The Solution

ShadowLab is an **adversarial testing platform** that:

- **Generates adversarial prompts** via **DigitalOcean Gradient AI** or a curated seed set (15 payloads)
- **Runs automated red-team scans** against HTTP AI APIs (POST with JSON: `message` or OpenAI-style `messages`)
- **Detects vulnerabilities** using heuristic rules **and** Gradient AI–powered deep analysis on every response
- **Iteratively refines attacks** — when a target defends successfully, Gradient generates follow-up bypass attempts
- **Suggests fixes** with developer-friendly remediation (including Gradient-generated suggestions)
- **Computes a safety score** (0–100) so you can track and compare API robustness over time

---

## 🤖 How Gradient AI Powers ShadowLab

ShadowLab uses **DigitalOcean Gradient™ AI** in four distinct ways:

| Use case | Model | What it does |
|----------|-------|----------------|
| **Attack generation** | GPT-OSS-20B | Generates targeted adversarial prompts from the target API description |
| **Vulnerability detection** | Llama 3.3 70B | Analyzes every API response for security failures (paraphrased leakage, roleplay compliance, tone shifts) |
| **Attack refinement** | GPT-OSS-20B | Generates follow-up attacks that bypass the target’s specific defenses (adaptive multi-round testing) |
| **Fix suggestions** | Llama 3.3 70B | Provides developer-friendly remediation for each finding |

This **two-model design** optimizes performance and cost. Without a Model Access Key, the app falls back to seed attacks and heuristic-only judging.

📖 **Setup:** [docs/GRADIENT_SETUP.md](docs/GRADIENT_SETUP.md) for `GRADIENT_MODEL_ACCESS_KEY` and optional overrides.

---

## 🏗️ Architecture

| Component | Description |
|-----------|-------------|
| **Frontend** | Next.js dashboard — scan form, Gradient status indicator, security report, filterable results table |
| **Backend** | FastAPI scan engine — `/scan`, `/scan/demo`, `/gradient/status`, health check |
| **DigitalOcean Gradient AI** | GPT-OSS-20B (prompt generation + refinement); Llama 3.3 70B (vulnerability detection + fix suggestions) |
| **Attack generator** | Gradient AI when `GRADIENT_MODEL_ACCESS_KEY` is set; else 15 seed attacks (JSON) |
| **Target runner** | POST with `message` or OpenAI-style `messages` body; returns response text for judging |
| **Response judge** | Two-layer: heuristic rules + Gradient AI deep analysis (either can flag a failure) |
| **Iterative refinement** | When some attacks pass, Gradient generates targeted follow-up attacks (up to 2 rounds) |
| **Safety scoring** | 0–100; only failed tests reduce the score |
| **Persistence** | SQLite-backed storage for targets and recent reports (survives restarts) |
| **Deployment** | DigitalOcean App Platform (optional); storage: DigitalOcean Spaces (optional) |

---

## 📊 Key Features

### 🎯 Adversarial Testing

- **Attack generation** — Gradient AI–generated or seed-based (15 payloads: prompt injection, system prompt extraction, policy bypass, encoding bypass, multi-language, and more)
- **AI-powered detection** — Gradient AI analyzes **all** responses, not only heuristic matches (subtle leakage, compliance, tone)
- **Iterative refinement** — Multi-round adaptive testing that learns from the target’s defenses

### 📋 Reporting & UX

- **Safety score** — 0–100 derived from severity of findings
- **Developer-friendly fix recommendations** — Actionable suggestions (including Gradient AI–enhanced)
- **Security report dashboard** — Summary, vulnerability counts, filterable/sortable results table, recommended fixes
- **Gradient connectivity indicator** — Real-time badge showing whether Gradient AI is connected
- **Honest loading state** — Real scan progress with status indicator (no fake logs)

### 🔧 Production-Ready

- **Persistent data** — Targets and recent reports stored in SQLite (not in-memory only)
- **Target URL guard** — Private and localhost URLs rejected unless `ALLOW_LOCALHOST_TARGET=1` (for local demo)

---

## 🚀 Quick Start (3 commands)

```bash
cd backend && pip install -r requirements.txt && cp .env.example .env && uvicorn app.main:app --reload
# In another terminal:
cd frontend && npm install && npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

- **Optional:** Set `GRADIENT_MODEL_ACCESS_KEY` (or `GRADIENT_API_KEY`) in `backend/.env` for Gradient AI → [docs/GRADIENT_SETUP.md](docs/GRADIENT_SETUP.md)
- **Local mock demo:** Set `ALLOW_LOCALHOST_TARGET=1` in `backend/.env` and use target `http://localhost:8000/mock-vulnerable-api`

---

## 📖 Running Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # then set GRADIENT_MODEL_ACCESS_KEY or GRADIENT_API_KEY for Gradient AI
uvicorn app.main:app --reload
```

- **API:** [http://localhost:8000](http://localhost:8000)  
- **Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

**Target URL guard:** Private and localhost URLs are rejected unless `ALLOW_LOCALHOST_TARGET=1` (use for the mock-vulnerable-api demo).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- **Dashboard:** [http://localhost:3000](http://localhost:3000)  
- **Production:** Set `NEXT_PUBLIC_API_URL` to your backend URL.  
- **Production build locally:** `npm run build` then `npm start` (port 3000 unless `PORT` is set).

### Tests

**Backend (pytest):**

```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v
# CI: pytest tests/ -v --timeout=10
```

**Frontend (Jest + React Testing Library):**

```bash
cd frontend
npm install
npm run test
```

---

## 🌐 Deployment (DigitalOcean App Platform)

1. Push this repo to GitHub and connect it in the [Apps](https://cloud.digitalocean.com/apps) dashboard (or use `doctl apps create --spec .do/app.yaml` after setting your repo in `.do/app.yaml`).
2. Add two services: **backend** (source dir `backend`, run `sh run.sh`, port 8080) and **frontend** (source dir `frontend`, `npm run build` / `npm start`, port 8080).
3. **Backend env:** `CORS_ORIGINS` = your frontend Live URL; optionally `GRADIENT_MODEL_ACCESS_KEY`.
4. **Frontend env:** `NEXT_PUBLIC_API_URL` = your backend Live URL, then redeploy the frontend.

📖 **Full guide:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 📚 Documentation

| Doc | Description |
|-----|-------------|
| [docs/GRADIENT_SETUP.md](docs/GRADIENT_SETUP.md) | Gradient AI API key and model configuration |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | DigitalOcean App Platform deployment |
| [docs/DEMO_REAL_API.md](docs/DEMO_REAL_API.md) | Testing with Gradient as the scan target |
| [docs/demo-script.md](docs/demo-script.md) | Demo flow and talking points |

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js, TypeScript, Tailwind CSS |
| **Backend** | Python, FastAPI, Pydantic, httpx |
| **AI** | DigitalOcean Gradient™ AI (GPT-OSS-20B, Llama 3.3 70B) |
| **Storage** | SQLite (targets + reports) |
| **Deploy** | DigitalOcean App Platform (optional) |

---

## 🎬 Demo Flow

1. **Start the stack** — run backend (`uvicorn`) and frontend (`npm run dev`).
2. **Open the dashboard** — go to the frontend URL (e.g. `http://localhost:3000`).
3. **Check Gradient status** — scan form shows whether Gradient AI is connected.
4. **Enter a target** — API endpoint URL and optional target description.
5. **Start scan** — click **Start Scan**; status indicator shows real progress. With Gradient configured, attacks are **generated by DigitalOcean Gradient AI** and responses are **analyzed by Gradient AI**.
6. **View report** — Safety Score (with round count if refinement ran), vulnerability summary, filterable results table, and recommended fixes.
7. **Filter findings** — use severity filter (All / High / Medium / Low) to focus on issues.
8. **Optional** — try `GET /scan/demo` for a quick scan against a mock endpoint.

---

## 🏆 Hackathon Submission

**Built for the DigitalOcean Gradient AI Hackathon.** The app integrates Gradient AI for attack generation, deep vulnerability detection, iterative refinement, and fix suggestions as described above.

**Before submitting:**

- **Demo video:** <!-- TODO: Replace with your YouTube/Vimeo URL -->
- **Live demo:** [https://shadowlab-h9yu6.ondigitalocean.app/](https://shadowlab-h9yu6.ondigitalocean.app/)

**For judges:** Set `GRADIENT_MODEL_ACCESS_KEY` in the backend ([docs/GRADIENT_SETUP.md](docs/GRADIENT_SETUP.md)) so scans use Gradient. Without it, the app uses seed attacks and heuristic-only judging; the report should show *"Adversarial attacks generated by DigitalOcean Gradient™ AI."*

**Note:** Targets and reports are persisted in SQLite (`backend/shadowlab.db` by default; `SHADOWLAB_DB_PATH`). Up to 50 recent reports are retained automatically.

---

## 🔮 Future Improvements

- **Real-time attack streaming** — stream attack events and judge results as they complete
- **CI/CD integration** — fail builds or block deploys when safety score or critical findings exceed thresholds
- **Advanced adversarial mutation** — multi-generation attack evolution for broader coverage
- **Comparative reporting** — track safety score trends across scan history

---

**Built with ❤️ for the DigitalOcean Gradient AI Hackathon**

*Chaos engineering for AI APIs — find vulnerabilities before attackers do.*
