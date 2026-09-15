# Staging deployment

## Current status

Hosted staging is not deployed yet. Local source inspection, site URL hardening, and the complete local release gate are finished. Cloud provisioning is pending authenticated Supabase and Vercel access.

## Source revision

- GitHub repository: `https://github.com/Pablo7203/SAT-J.git`
- Branch: `main`
- Inspected local and remote commit: `c4ccec3edb15fc64b9faef9348c3aa4a3b75e243`
- Local `HEAD` matched `origin/main` after a successful fetch.
- The immutable staging-fix commit is recorded by Git after this document and the implementation are committed together.

## Local verification

| Check                            | Result                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | Completed with the committed lockfile; copy mode was required in the OneDrive workspace.                      |
| Typecheck                        | Passed.                                                                                                       |
| Lint                             | Passed with zero warnings.                                                                                    |
| Unit tests                       | Passed: 7 files and 21 tests.                                                                                  |
| Production build                 | Passed, including TypeScript, page-data collection, and 17 static pages.                                       |
| Database and RLS                 | Passed: 11 files and 343 pgTAP tests after a clean local migration replay.                                     |
| Concurrency                      | Passed for inventory, sales, and transfers.                                                                    |
| E2E                              | Passed: 35 tests across desktop, mobile, and tablet; 7 project-defined skips.                                  |

## Site URL behavior

Site URL resolution is centralized in `src/lib/env/site-url.ts`.

1. A nonblank `NEXT_PUBLIC_SITE_URL` is validated as an absolute HTTP or HTTPS URL.
2. Blank, whitespace, or missing configuration falls back to `VERCEL_URL`, using HTTPS.
3. Local execution falls back to `http://localhost:3000` when neither value is available.
4. An invalid nonblank configured value fails with a clear configuration message.

Metadata, robots, sitemap entries, structured data, public product links, and password-reset redirects use this shared resolver. Unit coverage is present in `tests/unit/site-url.test.ts`.

## Required Vercel variables

| Variable                               | Classification | Staging value                                                            |
| -------------------------------------- | -------------- | ------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | Public         | Separate Supabase staging project URL                                    |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public         | Staging publishable key                                                  |
| `NEXT_PUBLIC_SITE_URL`                 | Public         | Stable absolute HTTPS staging URL; omit for the first build if not known |
| `NEXT_PUBLIC_APP_ENV`                  | Public         | `staging`                                                                |
| `SUPABASE_SERVICE_ROLE_KEY`            | Server-only    | Configure only if trusted Auth administration is required                |

Test and import credentials from `.env.example` are optional and must use synthetic values. Blank optional variables should be omitted rather than created with empty values.

## Supabase staging

- Project name: pending; recommended `SAT-J Ent Staging`.
- Project reference: pending.
- Region: pending owner selection or existing project discovery.
- Migration dry run and apply: pending authenticated CLI access.
- Latest expected migration: `20260901020000_production_security_hardening.sql`.
- RLS, functions, database lint, and private `product-images` storage verification: pending hosted project access.
- Public signup must remain disabled; email/password login for provisioned users must remain enabled.
- Site URL and redirect URLs must be set to the eventual stable staging origin and actual auth routes.
- SMTP: configuration required unless an approved staging SMTP service already exists.

## Vercel staging

- Dedicated project: pending; recommended `sat-j-ent-staging`.
- Git source: `Pablo7203/SAT-J`, branch `main`.
- Framework/root: Next.js at repository root.
- Package manager/build: pnpm and `pnpm build`.
- Deployment URL, deployment ID, build result, and deployed commit: pending authenticated Vercel access.

## Synthetic fixtures and hosted acceptance

No staging business fixtures or users have been created. When infrastructure is available, use clearly synthetic branches, Owner, Branch Manager, Sales, and Inventory identities and the minimum controlled product/customer/supplier transactions described by the staging plan. Do not import real SAT-J business data.

Hosted login, health, business workflows, public catalogue, quotation flow, branch isolation, export denial, private-product and hidden-price protections, responsive behavior, and Vercel/Supabase logs remain pending. No hosted item is marked as passed until tested against the separate staging environment.

## Remaining external setup

1. Provide or authorize authenticated access to a separate Supabase staging project.
2. Select or approve its region and securely retain its database password and keys.
3. Provide or authorize authenticated Vercel access and GitHub integration.
4. Configure staging variables, Auth URLs, and SMTP if email-dependent flows are required.
5. Apply migrations, create synthetic fixtures, and run the complete hosted acceptance and security gate.

## Exit status

`BLOCKED`

Reason: the separate hosted Supabase and Vercel staging infrastructure is not yet authenticated or linked in the current environment.
