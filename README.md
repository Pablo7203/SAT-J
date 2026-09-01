# SAT-J Ent

## Project Overview

SAT-J Ent is a modular business-management platform for a Ghanaian building-materials retailer and distributor. It centralizes branches, products, inventory, purchasing, sales, customers, suppliers, transfers, reporting, and a public catalogue.

## Current Phase

**Release foundation.** Phases 0–9 are engineering-complete locally. Hosted staging configuration, synthetic staging verification, business content/data, UAT, and production cutover remain separate controlled activities.

## Technology Stack

- Next.js 16 App Router, React 19, strict TypeScript, and Tailwind CSS 4
- Supabase (PostgreSQL, Auth, and Storage) via current SSR and JavaScript clients
- React Hook Form and Zod validation
- Vitest, Testing Library, and Playwright
- ESLint, Prettier, pnpm, and GitHub Actions

## Prerequisites

- Node.js 22 LTS (see `.nvmrc`)
- pnpm 10
- Docker Desktop and the pinned Supabase CLI for local database/RLS verification
- A Supabase project for deployed authentication and email recovery

## Installation

```bash
pnpm install --frozen-lockfile
```

## Environment Setup

Copy `.env.example` to `.env.local` and replace placeholders with the public URL and publishable key from Supabase. Never commit `.env.local` or real credentials. `SUPABASE_SERVICE_ROLE_KEY` is server-only, required for Phase 1 employee invitation/Auth administration, and must never be imported into client code.

## Local Development

```bash
pnpm dev
```

Open `http://localhost:3000`. Internal `/app/**` routes require verified Supabase claims, an active profile, a valid role, and `app.access`.

## Testing

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm test:e2e:setup
pnpm test:rls
pnpm test:concurrency
pnpm build
```

Playwright requires its Chromium binary once per workstation: `pnpm exec playwright install chromium`. Run `pnpm test:e2e:setup` after a clean local reset and before browser tests. Unit tests live in `tests/unit`; browser tests live in `tests/e2e`; database integration/security tests live in `supabase/tests`.

## Supabase

Use timestamped SQL files in `supabase/migrations`. Run `pnpm db:start`, `pnpm db:reset`, `pnpm test:rls`, and `pnpm db:lint` locally. Deployed migrations are append-only. Test identities and catalogue fixtures exist only inside transactional RLS tests and are rolled back. See `docs/product-master.md` for Phase 2 rules and operations.

## Authentication operations

Configure Supabase callback URLs for `/auth/callback` and password recovery. Employee accounts are invited by Super Admins; there is no public signup. For the initial administrator, see `docs/auth-runbook.md`. `SUPABASE_SERVICE_ROLE_KEY` is required only for invitation/Auth administration and the explicit bootstrap script.

## Architecture

The platform is a modular monolith: one Next.js application provides public and internal experiences, with server-side business logic backed by Supabase/PostgreSQL. Server Components are preferred; Client Components are limited to interaction. Future capabilities belong in cohesive feature modules rather than a generic data layer. See `docs/architecture.md` and `docs/engineering-guardrails.md`.

## Environments and Deployment

- **Local:** developer credentials and local/isolated data.
- **Preview/Staging:** pull-request validation with non-production credentials.
- **Production:** live data and restricted production credentials, never reused for routine local development.

For staging prerequisites and release gates, see `docs/release-foundation.md`. Do not deploy a working tree: deploy the reviewed staging-candidate commit. CI validates typecheck, lint, unit tests, database security, build, and Playwright workflows.

## Development Phases

1. Phase 0 — Engineering Foundation
2. Phase 1 — Authentication, Branches & Authorization
3. Phase 2 — Product Catalogue
4. Phase 3 — Inventory
5. Phase 4 — Suppliers & Purchasing
6. Phase 5 — Customers, Sales & Payments
7. Phase 6 — Inter-Branch Transfers
8. Phase 7 — Reporting & Dashboard
9. Phase 8 — Public Website
10. Phase 9 — Production Hardening

Phase 6 transfer behavior and operations are documented in [Stock transfers](docs/stock-transfers.md) and the [Stock transfer runbook](docs/stock-transfer-runbook.md).
