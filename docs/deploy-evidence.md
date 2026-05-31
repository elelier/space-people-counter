# Deploy Evidence

This document records deployment/runtime evidence for Space People Counter before new feature work. It separates confirmed repository evidence from owner-confirmed context and from evidence that still needs to be collected in Cloudflare.

## Scope

- Project: Space People Counter
- Repository: `elelier/space-people-counter`
- Branch: `docs/deploy-evidence-cloudflare`
- Production domain confirmed by owner: `spacepeople.elelier.com`
- Hosting confirmed by owner: Cloudflare
- Database: not verified
- Supabase/Core DB: not used
- Functional/UI/runtime changes: none

## Evidence sources reviewed

- `README.md`
- `package.json`
- `next.config.mjs`
- `wrangler.toml`
- `.env.example`
- `.github/workflows/ci.yml`
- `docs/deploy-runtime-contract.md`
- `docs/live-site-qa-inventory.md`
- `docs/roadmap-techstack-migration.md`
- `docs/qa-readiness.md`

Merged PR context reviewed:

- PR #2 `Docs update`: deployment/runtime contract.
- PR #3 `docs: add live QA inventory and migration roadmap`: live QA inventory and migration roadmap.
- PR #4 `ci: add readiness checks`: CI readiness for install, lint, type-check, and build.

## Confirmed from repository files

### Runtime shape

The repository points to a static export plus Cloudflare Pages Functions model:

- `next.config.mjs` sets `output: 'export'`.
- `next.config.mjs` sets `trailingSlash: true`.
- `wrangler.toml` defines `pages_build_output_dir = "out"`.
- `wrangler.toml` names the Cloudflare project/runtime as `spacepeople`.
- `wrangler.toml` sets `compatibility_date = "2025-01-01"`.
- `wrangler.toml` includes `[env.production]` with `ENVIRONMENT = "production"`.

Operational interpretation:

- The public app is expected to build into `out/`.
- Cloudflare Pages is expected to serve the static export.
- Cloudflare Pages Functions are expected to serve `/api/*`.

### Build and validation commands

`package.json` defines:

- `npm run build`
- `npm run lint`
- `npm run type-check`

The build command is `cross-env NODE_ENV=production next build`.

`.github/workflows/ci.yml` defines the automated readiness flow:

- `npm ci`
- `npm run lint`
- `npm run type-check`
- `npm run build`

The workflow runs for PRs targeting `main`, pushes to `main`, and manual `workflow_dispatch`.

### Production domain

Repository configuration documents `spacepeople.elelier.com` as the app URL in `.env.example`. The owner also confirmed this production domain for this story.

### Runtime APIs

The documented Cloudflare Pages Functions endpoints are:

- `/api/space-people`
- `/api/iss-location`
- `/api/health`

The deploy/runtime contract states these endpoints are expected to be served by Cloudflare Pages Functions. It also warns that a static-only host would not serve them.

### External data sources

The documented upstream public APIs are:

- Open Notify for people currently in space.
- Where the ISS at? for ISS location.

`.env.example` includes optional function override variables:

- `SPACE_PEOPLE_API`
- `ISS_API`

No secret values are documented or required for the current runtime contract.

## Owner-confirmed context

Accepted as owner-confirmed for this story:

- Production URL: `spacepeople.elelier.com`
- Hosting provider: Cloudflare

These should still be backed by Cloudflare dashboard, CLI, or API evidence in a future evidence pass.

## Not verified from repository alone

The following cannot be proven from repository files alone:

- Exact Cloudflare Pages project ID.
- Exact Cloudflare account ID.
- Whether Cloudflare Pages is connected to `elelier/space-people-counter` directly.
- Whether the connected production branch is `main`.
- Whether preview deploys are enabled and what preview URL is canonical.
- Current Cloudflare dashboard build command.
- Current Cloudflare dashboard output directory.
- Current Cloudflare Functions deployment status.
- Current DNS record type and target for `spacepeople.elelier.com`.
- Current SSL/TLS mode and certificate status.
- Current production response status for `/` and `/api/*` from an external network.

## Live check status

A live production smoke check was attempted from this execution environment for the production domain and the documented `/api/*` endpoints.

Result: this environment could not resolve the production hostname. This is treated as an execution-environment limitation, not as proof of a production outage.

Because of that limitation, this story does not independently confirm DNS, SSL, response headers, or endpoint payloads.

## Production vs preview vs local

### Production

Expected production domain: `spacepeople.elelier.com`.

Expected runtime:

- Static assets from `out/`.
- `/api/*` served by Cloudflare Pages Functions.

Production status still needs an external verification pass with DNS/HTTP access.

### Preview

Preview deployment behavior is not verified.

Evidence still needed:

- Cloudflare Pages preview URL.
- Whether preview builds run for PR branches.
- Whether preview Functions behave the same as production Functions.

### Local

Local static/functions smoke path is documented in `docs/deploy-runtime-contract.md` using `npm run build` and `wrangler pages dev out`.

Expected local smoke paths:

- `/`
- `/api/space-people`
- `/api/iss-location`
- `/api/health`

## Evidence still needed from Cloudflare

Collect and attach/document one or more of the following in a future PR or issue:

1. Cloudflare Pages project settings evidence showing project name, GitHub repo, production branch, build command, output directory, and Functions behavior.
2. Cloudflare deployment log showing a successful production deploy from `main`.
3. DNS evidence for `spacepeople.elelier.com`, including record type, target, and proxied status.
4. SSL/TLS evidence showing certificate and browser lock status.
5. Production smoke result for `/`, `/api/health`, `/api/space-people`, and `/api/iss-location`.
6. Preview smoke result for the same paths.

## Risks before next product phase

- Static export plus Functions must remain aligned; deploying only static files without Functions would break `/api/*`.
- External public APIs may fail, change schema, rate-limit, or return partial data.
- Fallback astronaut data can become stale and must be labeled clearly before the product is treated as a reliable data product.
- ISS map behavior depends on browser-only Leaflet behavior and should not be changed without smoke coverage.
- Cloudflare dashboard settings may drift from repository intent unless evidence is periodically refreshed.

## Validation performed for this story

Repository review via GitHub connector:

- Confirmed repo metadata: `elelier/space-people-counter`, public, default branch `main`.
- Confirmed latest merged PR #4 and its next recommended story points to deployment evidence.
- Reviewed required docs/config listed above.
- Confirmed no database/Supabase/Core DB evidence was introduced.

Commands not run locally in this environment:

- `npm ci`
- `npm run lint`
- `npm run type-check`
- `npm run build`

Reason: this session used the GitHub connector rather than a local clone. CI in `.github/workflows/ci.yml` is the authoritative validation path after the PR is opened.

## Constraints preserved

- No secrets added.
- No Supabase added.
- No Core DB added.
- No database assumptions added.
- No map changes.
- No chart changes.
- No UI changes.
- No runtime behavior changes.

## Recommended next story

Story C — Production and preview smoke evidence.

Goal: verify the Cloudflare deployment externally and record real HTTP/DNS evidence for production and preview.

Acceptance criteria:

- Production `/` returns expected HTML.
- Production `/api/health` returns expected JSON/status.
- Production `/api/space-people` returns expected JSON or documented degraded response.
- Production `/api/iss-location` returns expected JSON or documented degraded response.
- DNS and SSL evidence for `spacepeople.elelier.com` is captured.
- Cloudflare Pages project settings are captured without exposing secrets.
