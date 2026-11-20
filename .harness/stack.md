# Project Stack Specification

> labeling-rules — pure ANVISA norm helpers (Bun). Commands authoritative for kn-dev gates.

## 1. Core technologies

- Runtime: **Bun**
- Tests: `bun test` co-located under `tests/`
- Package: consumed by axiom-api via git tag (no HTTP surface)

## 2. Architecture and layout

- `src/` rule modules + `src/data/*.json`
- `docs/anvisa/rotulagem-nutricional.md` coverage map

## 3. Deterministic commands

- Install: `bun install`
- Gate fast: `bun test {path}` (single test file)
- Gate phase: `bun test tests/<related>.test.ts` (owned module tests)
- Gate CI: `bun test` (full suite — small; use at delivery when profile is full)

## 3b. Harness delivery hints

- `pr_checks: none` (no `.github/workflows` PR CI)
- Delivery profile: global `risk_based`; norm changes are often Track A when bundled with API — label `delivery:full` when solo release needs full film

## 4. Spec and harness

- No `AGENTS.md` harness block; read `~/.agents/HARNESS.md` and parent axiom-api delivery when issue spans both repos.

## 5. Evidence

- `package.json`, `bun test`, `README.md`