# Project Stack Specification - labeling-rules

> Executable commands and repository metadata.

## 1. Core Stack & Metadata
- Runtime / package manager: Bun
- Framework / validation: TypeScript, Zod
- Database / ORM / codegen: none
- Specs path: `docs/anvisa/`
- Target branch: `main`
- PR checks: `pr_checks: none`
- Obsidian project: unknown

## 2. Deterministic Commands
- Install: `bun install`
- Run: `bun run index.ts`
- Static check (typecheck + lint + format): not configured
- Unit test (single file): `bun test {path}`
- Full test suite: `bun test`
- Codegen / migrations: none

## 3. Universal Gate Contract (`scripts/check.sh`)
- **gate_fast:** `./scripts/check.sh fast {path}` (currently prints `ok`; does not run tests)
- **gate_phase:** `./scripts/check.sh phase` (runs the full test suite)
- **gate_qa:** `./scripts/check.sh qa` (runs the full test suite)
- **gate_ci:** `./scripts/check.sh ci` (runs the full test suite)

## 4. Recommended Stack Skills (On Demand)
- Global: `none`
- Repo-local: none

## 5. Evidence
- Manifests & configs inspected: `package.json`, `bun.lock`, `tsconfig.json`
- Gate script: `scripts/check.sh`
