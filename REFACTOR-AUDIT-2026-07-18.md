# offline-bible — Refactor & Optimization Audit (2026-07-18)

> **STATUS: PLAN ONLY — NOTHING EXECUTED YET.**
> **Next step:** commit the untracked `scripts/etl/01d-fetch-fbc.ts` (referenced by an already-landed commit!), then hand this file to Codex.

## Verdict in one line

Small, framework-free Vite PWA (~1.6k LOC TS) with a healthy DECISIONS.md habit — the gaps are **zero tests**, an ETL step that exists only on disk, and commit hygiene.

## P0 — The repo doesn't build its own history

- `scripts/etl/01d-fetch-fbc.ts` is **untracked**, but commit c8f58fa's message describes it and 854ce81 wired per-verse FBC commentary through. Anyone cloning this repo cannot regenerate the FBC data. Commit it now.
- `.claudeignore` also untracked — commit; `.DS_Store` ×3 — add to `.gitignore`.

## P1 — Zero tests on pure-transform code

The ETL chain (`02-parse-cuv` … `07-index`) is pure text→JSON transformation — the easiest possible test target, and the highest risk (a silent parse regression corrupts every verse downstream). Add vitest + one golden-file test per parser (input snippet → expected JSON). Also cover `sw/` cache-versioning logic — a bad service-worker change is the classic PWA footgun (stale app forever).

## P2 — Hygiene

- Commit messages are prose dumps ("Per-verse FBC commentary is wired through now.") — switch to conventional commits per global CLAUDE.md.
- No lint config — add eslint flat config + prettier (tiny codebase, 5-minute setup, keeps agent edits consistent).
- Root clutter: 5 loose `.html` architecture/dependency-map files — move to `docs/`.
- `npm run typecheck` exists — wire it + tests into a pre-commit or at least document "run before commit" in a repo-local CLAUDE.md (currently the repo has only the global symlink; add a real local one with the ETL data-flow diagram — DECISIONS.md content is halfway there).

## Explicitly do NOT

- Don't add a framework (React/etc.) — vanilla TS + router is a deliberate, documented choice.
- Don't re-fetch source texts as part of tests (network-free golden files only; some sources have licensing constraints — keep raw dumps out of git if not already).

## Codex order

1. P0 (one commit: ETL script + claudeignore + gitignore).
2. P1 vitest + parser golden tests (one commit per parser is fine).
3. P2 opportunistically.
