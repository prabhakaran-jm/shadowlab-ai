# ShadowLab Demo Script

## Purpose

Outline for demonstrating ShadowLab – Chaos Engineering for AI APIs.

## Steps (planned)

1. **Intro**  
   Show landing: "ShadowLab – AI Adversarial API Tester".

2. **Add target**  
   Register an AI API endpoint (e.g. OpenAI-compatible or custom). Show target list.

3. **Run scan**  
   Select target and attack set (e.g. prompt injection, system prompt extraction, policy bypass). Start scan, show progress.

4. **View report**  
   Open report: list of findings with severity, prompt/response snippets, judge reasoning. Highlight critical/high items.

5. **Remediation**  
   Briefly discuss how findings map to hardening (input validation, system prompt protection, policy enforcement).

## Notes

- Use seed attacks from `backend/app/data/seed_attacks.json` for demo payloads.
- Judge and Gradient integration can be shown once implemented.
