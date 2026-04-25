# IPL Team Insight Tool

## Overview

Full-stack web app with a marketing-grade "Stadium Night" dark UI: a hero banner over the TATA IPL artwork, a 10-card grid of franchises (each with its real club logo and brand-color gradient), and a deep team-insight page with animated stat tiles, Performance / Top Players / Records tabs, donut + area + bar charts, a pull-quote auto-summary, and a horizontal switcher to jump between teams. Hash-based shareable URLs (`#/team/csk`). Live cricket strip in the footer is wired to the real CricketData.org API.

## Stack

- **Monorepo**: pnpm workspaces, TypeScript 5.9
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + shadcn/ui + Recharts (`artifacts/ipl-insight`)
- **Backend**: Node.js + Express 5 (`artifacts/api-server`)
- **API contract**: OpenAPI 3.1 (`lib/api-spec/openapi.yaml`) → Orval → typed React Query hooks (`lib/api-client-react`) + Zod schemas (`lib/api-zod`)
- **Data source**: Curated IPL franchise dataset bundled in the server (`artifacts/api-server/src/data/iplTeams.ts`) + CricketData.org API for live matches.
- **No database** — the dataset is small, fixed, and reviewable as code. See README for the rationale.

## API

- `GET /api/healthz` — health check
- `GET /api/teams` — list of all 10 IPL franchises
- `GET /api/teams/:teamId` — full team insight (stats, top performers, season-wise wins, summary)
- `GET /api/live` — live cricket matches via CricketData.org (60s cache); returns a friendly note if `CRICKET_API_KEY` is not set

## Optional secrets

- `CRICKET_API_KEY` — free at cricketdata.org. Only required for the live-matches footer.

## Key Commands

- `pnpm --filter @workspace/api-spec run codegen` — regenerate hooks + Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run backend
- `pnpm --filter @workspace/ipl-insight run dev` — run frontend
- `pnpm run typecheck` — full typecheck across all packages

## Notes

- After any change to `lib/api-spec/openapi.yaml`, re-run codegen before using the updated types on either side.
- The "AI/logic-based" team summary lives in `artifacts/api-server/src/data/buildSummary.ts`.
- See `README.md` for the full assignment write-up: what was built, why each decision was made, and where everything lives.
