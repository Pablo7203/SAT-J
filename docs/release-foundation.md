# Release foundation

## Baseline identity

The release baseline is the repository's initial commit on `main`, with commit message `chore: establish SAT-J Ent v1 release baseline`. Resolve the immutable full identifier with `git rev-parse HEAD`; the verified value is also recorded in the task completion report. A commit cannot embed its own SHA without changing that SHA, so this document deliberately uses Git as the authoritative identifier.

This baseline is **Staging Candidate 1**, not the final `v1.0.0` release. Create no final release tag until hosted staging security checks, business UAT, content/data approval, backup evidence, and production cutover approval pass.

## Repository safety policy

Never commit `.env` files, service-role keys, database credentials, backups, production exports, real business onboarding files, staff passwords, generated reports, or browser/build output. Safe placeholders belong in `.env.example`. Store owner-supplied onboarding material only under ignored `data/private/`; store local backup output only under ignored `backups/` and encrypt it when it leaves the workstation.

Tracked fixtures use synthetic names, invalid test email domains, and disposable passwords only. Supabase migrations contain schema/static system configuration, not business records. Runtime storage objects and local Supabase state are not source assets.

## Environment separation

Local, staging, and production require separate Supabase and hosting targets. Never reuse production keys, accounts, datasets, or storage in staging. Set `NEXT_PUBLIC_APP_ENV=staging` on staging; the application then returns a site-wide robots disallow rule. Set `production` only on the approved production host.

| Variable | Classification | Staging requirement |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Staging project API URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | Staging publishable key |
| `NEXT_PUBLIC_SITE_URL` | Public | Exact HTTPS staging origin |
| `NEXT_PUBLIC_APP_ENV` | Public | `staging` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Trusted Auth administration only |
| `E2E_ACTIVE_PASSWORD` | Test-only | Synthetic staging test secret if automated setup is authorized |
| `E2E_INACTIVE_PASSWORD` | Test-only | Synthetic staging test secret if automated setup is authorized |
| `OPENING_STOCK_OPERATOR_EMAIL` | Optional operations | Not needed for synthetic smoke unless import is exercised |
| `OPENING_STOCK_OPERATOR_PASSWORD` | Optional server/process secret | Never expose to browser or Git |

## Staging infrastructure prerequisites

Create a separate Supabase staging project with an approved region and securely held database password, project reference, publishable key, and service-role key. Apply migrations using the supported CLI flow: authenticate interactively, run `supabase link --project-ref <staging-project-ref>`, review `supabase migration list`, then run `supabase db push`. Linking state and credentials remain local and untracked.

Configure Auth with the exact staging Site URL and `/auth/callback` redirect, password-reset callback, invitation callback, public signup disabled, minimum 12-character mixed passwords, and an approved SMTP sender. Supabase's default mail service may support limited engineering smoke tests but is rate-limited and is not acceptance evidence. Confirm the private `product-images` bucket and its policies after migration.

Create a Vercel staging project connected to the trusted Git remote. Use pnpm with the committed lockfile, the standard Next.js build (`pnpm build`), the environment variables above, HTTPS, and `/api/health` monitoring. Do not copy local `.env.local` into Vercel.

No Git remote is part of this local baseline. Configure one explicitly using a credential helper or SSH URL with no embedded token/password, then push only after destination ownership is confirmed.

## Staging data and identities

Use synthetic Owner/Super Admin, Branch Manager, Sales, and Inventory identities. Create a deliberately small dataset covering two branches; active/public and private/hidden-price products; opening inventory; purchase and receipt; paid and credit sale; customer payment; transfer; reporting; public quote. Do not place staging fixtures in production migrations or use real staff/customer details.

## Deployment and security gate

Before UAT, the hosted candidate must pass:

- Migration application and `/api/health`.
- Homepage, catalogue/search/filter, product detail, quote submission, and staging no-index response.
- Login, dashboard, customer, completed sale, purchase/receipt, inventory movement, transfer dispatch/receipt, reports, and CSV export.
- Anonymous internal-table denial, inactive-user denial, branch isolation, direct inventory-write denial, cross-branch export denial, private-product denial, hidden-price protection, and quotation isolation.
- Synthetic Owner, Branch Manager, Sales, and Inventory role checks.
- Hosted logs free of credentials and sensitive payloads.

Only after deployment, migrations, health, smoke, and security pass does Staging Candidate 1 become eligible for the UAT plan in `docs/uat-plan.md`.

## Reproducibility

The baseline gate is run from a separate clean checkout: frozen-lockfile install, clean Supabase reset/migration replay, pgTAP suite, typecheck, lint, unit tests, production build, and database lint. Exact outcomes belong in the completion report and CI rather than being hard-coded here where they can become stale.
