# Clinical Trial Risk Monitor

Frontend-only enterprise oversight workspace for reviewing fictional clinical-trial sites, findings, protocol checks, CAPA, reports, and coded participant records.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/clinical-trial-risk-monitor/src/App.tsx` — routed application shell and page composition
- `artifacts/clinical-trial-risk-monitor/src/data/mockData.ts` — fictional domain records and chart data
- `artifacts/clinical-trial-risk-monitor/src/lib/mockDataService.ts` — service boundary for replacing mock records with API calls later
- `artifacts/clinical-trial-risk-monitor/src/lib/semantics.ts` — centralized status-to-semantic presentation mapping
- `artifacts/clinical-trial-risk-monitor/src/index.css` — shared theme tokens, responsive shell behavior, and reduced-motion support

## Architecture decisions

- The first release is frontend-only and uses fictional data; no clinical decisions, authentication, or backend writes are represented.
- Pages consume the `ClinicalTrialDataService` contract so a future API-backed repository can replace mock data without rewriting UI components.
- Risk and workflow language is deliberately separated between automated checks, review-required signals, and confirmed deviations.
- Theme, role, and sidebar preferences persist locally to make the demo feel stable across sessions without pretending to provide authentication.

## Product

Risk managers can review portfolio-level site risk, findings, protocol rules, CAPA, reports, and audit history. Site administrators can preview coded participant records and enter visit, dosing, and adverse-event records through validated prototype forms.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
