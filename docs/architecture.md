# ShadowLab Architecture

## Overview

**ShadowLab** is a chaos engineering tool for AI APIs. It runs adversarial tests (prompt injection, system prompt extraction, policy bypass, etc.) against target APIs and evaluates responses using an AI judge (e.g. DigitalOcean Gradient AI).

## Components

- **Backend (FastAPI)**  
  REST API for targets, scans, and reports. Orchestrates attack generation, target execution, and judge evaluation.

- **Frontend (Next.js)**  
  Dashboard to register targets, launch scans, and view reports.

- **AI orchestration**  
  Prepared for DigitalOcean Gradient AI: judge evaluation and optional attack generation.

## Data flow (planned)

1. User registers a target (API URL, auth, description).
2. User starts a scan (target + attack set).
3. Backend loads/generates attacks → runs each against target via `target_runner` → sends prompt/response to `judge` (Gradient) → stores findings.
4. User views report (findings, severity, recommendations).

## Repo layout

- `backend/` – FastAPI app, routes, services, seed data.
- `frontend/` – Next.js app and UI.
- `docs/` – Architecture and demo script.
