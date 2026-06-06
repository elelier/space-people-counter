# Production / Preview Smoke Evidence

This document records production and preview smoke evidence for Space People Counter before new feature, monetization, visualization, or persistence work.

## Scope

- Project: Space People Counter
- Repository: `elelier/space-people-counter`
- Base branch: `main`
- Working branch: `docs/prod-preview-smoke-evidence`
- Production URL, owner-confirmed: `https://spacepeople.elelier.com/`
- Hosting, owner-confirmed and dashboard-confirmed: Cloudflare Pages
- Cloudflare Pages project, dashboard-confirmed: `space-people-counter`
- Database: not verified
- Supabase/Core DB: not used
- Functional changes: none
- Map/chart/UI/runtime changes: none

## Verification timestamps

- Initial session attempt UTC timestamp: `2026-06-06T07:10:38Z`
- Owner-provided Cloudflare/browser evidence time: `2026-06-06T13:20Z` through `2026-06-06T13:24Z` approximately, based on screenshot clock and API timestamps.
- `/api/health` payload timestamp observed in browser: `2026-06-06T13:23:25.973Z`.

## Required docs/config reviewed

Reviewed through GitHub connector / merged PR context:

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
- `docs/deploy-evidence.md`

Merged PR context reviewed:

- #2 `Docs update`: added `docs/deploy-runtime-contract.md`.
- #3 `docs: add live QA inventory and migration roadmap`: added live QA inventory and migration roadmap.
- #4 `ci: add readiness checks`: added CI for `npm ci`, lint, type-check, and build.
- #5 `docs: add Cloudflare deploy evidence`: added Cloudflare/static export/Pages Functions evidence and listed remaining gaps for DNS, SSL, preview, Cloudflare dashboard, and production smoke.

## Cloudflare dashboard evidence

Owner-provided Cloudflare dashboard screenshots confirm:

| Area | Evidence |
| --- | --- |
| Cloudflare product area | Workers & Pages |
| Pages project | `space-people-counter` |
| Git repository | `elelier/space-people-counter` |
| Production branch | `main` |
| Automatic deployments | Enabled |
| Production domains | `spacepeople.elelier.com`, `space-people-counter.pages.dev` |
| Custom domain status | `spacepeople.elelier.com` Active |
| Build command | `npm run build` |
| Build output directory | `out` |
| Root directory | blank / repository root implied |
| Build comments | Enabled |
| Build cache | Disabled |
| Build system version | Version 3 |
| Build watch paths | Include paths: `*` |
| Deploy hooks | none defined |
| Visible non-secret variable | `ENVIRONMENT=production` |
| Latest production source visible | `main` commit `cc2a86a`, merge pull request #5 |

Interpretation:

- Cloudflare Pages production deployment is confirmed from dashboard evidence.
- Repo connection to `elelier/space-people-counter` is confirmed.
- Production branch `main`, build command `npm run build`, and output `out` match the repo runtime contract.
- Custom domain `spacepeople.elelier.com` is active in Cloudflare.

## Production smoke target

Expected runtime, based on current repo docs and dashboard evidence:

- Static export from `out/`.
- Cloudflare Pages serving production site.
- Cloudflare Pages Functions serving `/api/*`.

Smoke paths requested:

- `/`
- `/api/health`
- `/api/space-people`
- `/api/iss-location`

## Production browser smoke result

Owner-provided browser screenshots confirm the production site and documented API paths are reachable from a normal external/mobile network.

| Path | Browser result | Evidence status |
| --- | --- | --- |
| `/` | Site loads and renders Space People UI. Counter shows `12`; UI displays degraded banner: `No se pudo actualizar en vivo; mostrando datos de respaldo.` | Confirmed reachable; degraded data state visible |
| `/api/health` | JSON rendered in browser. `overall: down`. Checks for ISS Location, People in Space, and ISS Location Backup show offline/degraded upstream status. | Confirmed reachable; runtime responds; upstream health degraded |
| `/api/space-people` | JSON rendered in browser. `number: 12`, `message: success (fallback)`, people array returned. | Confirmed reachable; fallback response active |
| `/api/iss-location` | JSON rendered in browser. `message: success`, ISS position and telemetry fields returned. | Confirmed reachable; live/location response working |

## Production API observations

### `/api/health`

Observed payload shape from browser screenshot:

```json
{
  "overall": "down",
  "apis": [
    {
      "name": "ISS Location (wheretheiss.at)",
      "url": "https://api.wheretheiss.at/v1/satellites/25544",
      "status": "offline",
      "responseTime": 5000,
      "lastChecked": "2026-06-06T13:23:25.973Z",
      "error": "The operation was aborted"
    },
    {
      "name": "People in Space (open-notify)",
      "url": "https://api.open-notify.org/astros.json",
      "status": "offline",
      "responseTime": 1190,
      "lastChecked": "2026-06-06T13:23:22.163Z",
      "error": "HTTP 521"
    },
    {
      "name": "ISS Location Backup (open-notify)",
      "url": "https://api.open-notify.org/iss-now.json",
      "status": "offline",
      "responseTime": 5000,
      "lastChecked": "2026-06-06T13:23:25.973Z",
      "error": "The operation was aborted"
    }
  ],
  "timestamp": "2026-06-06T13:23:25.973Z"
}
```

Interpretation:

- `/api/health` is served in production.
- Cloudflare Pages Functions runtime is effectively confirmed because `/api/health` responds at the production domain.
- The endpoint reports upstream/API degradation: overall health is `down`.
- This is not a hosting outage; it is a data-source/upstream reliability issue.

### `/api/space-people`

Observed payload shape from browser screenshot:

```json
{
  "number": 12,
  "message": "success (fallback)",
  "people": [
    { "name": "Oleg Kononenko", "craft": "ISS" },
    { "name": "Nikolai Chub", "craft": "ISS" },
    { "name": "Tracy Caldwell Dyson", "craft": "ISS" },
    { "name": "Matthew Dominick", "craft": "ISS" },
    { "name": "Michael Barratt", "craft": "ISS" },
    { "name": "Jeanette Epps", "craft": "ISS" },
    { "name": "Alexander Grebenkin", "craft": "ISS" },
    { "name": "Butch Wilmore", "craft": "ISS" },
    { "name": "Sunita Williams", "craft": "ISS" },
    { "name": "Li Guangsu", "craft": "Tiangong" },
    { "name": "Li Cong", "craft": "Tiangong" },
    { "name": "Ye Guangfu", "craft": "Tiangong" }
  ]
}
```

Interpretation:

- `/api/space-people` is served in production.
- The endpoint returns fallback data, not verified live data.
- The UI correctly surfaces a degraded data message on the home page.
- This validates the existing fallback path but also confirms the main reliability gap.

### `/api/iss-location`

Observed payload shape from browser screenshot:

```json
{
  "message": "success",
  "timestamp": 1780752270343,
  "iss_position": {
    "latitude": "45.462225536792",
    "longitude": "-50.256584512092"
  },
  "altitude": 421.19476502105,
  "velocity": 27594.005689761,
  "visibility": "daylight",
  "footprint": 4513.5369007233,
  "solar_lat": 22.688179978751,
  "solar_lon": 338.55387579291,
  "units": "kilometers"
}
```

Interpretation:

- `/api/iss-location` is served in production.
- The endpoint returns a successful ISS location payload.
- Even though `/api/health` marked ISS Location as offline during its check window, the direct ISS location endpoint returned success in the browser smoke.
- This points to intermittent upstream latency/timeout behavior rather than a complete runtime failure.

## Initial execution-environment smoke attempt

Before owner-provided dashboard/browser evidence, a production HTTP smoke was attempted from this ChatGPT execution environment. It could not be completed because DNS resolution failed for the production hostname from that environment.

This is no longer treated as unresolved production evidence because owner-provided browser evidence confirms the hostname and routes are reachable externally.

Command attempted:

```bash
for p in / /api/health /api/space-people /api/iss-location; do
  curl -sS -D - -o /tmp/body.txt --max-time 20 "https://spacepeople.elelier.com$p"
done
```

Observed result from the ChatGPT execution environment:

```text
curl: (6) Could not resolve host: spacepeople.elelier.com
```

Interpretation:

- This was an execution-environment DNS limitation.
- It is not proof of outage.
- External/mobile browser evidence supersedes the environment limitation for production reachability.

## Headers captured

No HTTP headers were captured in this pass because the successful production smoke was performed through browser screenshots, not a network inspector or CLI.

Still pending for a future evidence pass:

- HTTP status code
- `content-type`
- `cache-control`
- `cf-ray`, if present
- `cf-cache-status`, if present

## DNS / SSL observable result

Dashboard/browser evidence confirms:

- `spacepeople.elelier.com` is active as a Cloudflare Pages custom domain.
- The production site and API routes load over HTTPS in browser.

Still pending for exact DNS/SSL documentation:

- DNS record type.
- DNS target.
- Proxied status, if shown.
- Certificate issuer/details/expiry.

## Preview smoke result

No preview URL was identified in the provided evidence.

Preview status: pending.

Do not claim preview exists until at least one of these is captured:

- Cloudflare Pages preview deployment URL.
- GitHub PR deployment environment URL.
- Cloudflare deployment log showing preview URL.
- A successful HTTP smoke against that preview URL.

## Production vs preview vs local

### Production

- Production URL is owner-confirmed and dashboard/browser-confirmed: `https://spacepeople.elelier.com/`.
- Cloudflare Pages project and deployment settings are dashboard-confirmed.
- `/` is reachable and renders the app.
- `/api/health` is reachable and reports upstream health as down.
- `/api/space-people` is reachable and returns fallback data.
- `/api/iss-location` is reachable and returns success.
- Runtime `/api/*` is confirmed as working in production at the routing/function level.
- Product/data reliability remains degraded because upstream people-in-space data is falling back.

### Preview

- Preview URL not identified.
- Preview `/api/*` behavior not verified.

### Local

A local repository clone was attempted to run install/lint/type-check/build, but the environment could not resolve `github.com`.

Command attempted:

```bash
git clone https://github.com/elelier/space-people-counter.git /tmp/space-people-counter
```

Observed result:

```text
fatal: unable to access 'https://github.com/elelier/space-people-counter.git/': Could not resolve host: github.com
```

Therefore these commands were not run locally:

- `npm ci`
- `npm run lint`
- `npm run type-check`
- `npm run build`

CI in `.github/workflows/ci.yml` remains the authoritative validation path for this PR.

## Evidence resolved in this pass

Resolved from owner-provided dashboard/browser evidence:

1. Cloudflare Pages project name.
2. GitHub repository connection.
3. Production branch.
4. Build command.
5. Build output directory.
6. Active production custom domain.
7. Production `/` reachability.
8. Production `/api/health` reachability.
9. Production `/api/space-people` reachability.
10. Production `/api/iss-location` reachability.
11. Production `/api/*` routing/function behavior at a basic smoke level.

## Evidence still pending

The following remain pending with exact cause:

1. Raw HTTP status codes and headers for production paths.
   - Cause: successful smoke evidence was browser screenshot based, not CLI/network-inspector based.
2. Exact DNS record type/target/proxied status.
   - Cause: provided Cloudflare evidence showed active custom domain, not DNS record details.
3. SSL/TLS certificate issuer/expiry.
   - Cause: browser loaded HTTPS but certificate detail screenshot was not captured.
4. Preview URL and preview smoke.
   - Cause: no preview URL was identified in provided Cloudflare evidence.
5. Deployment log evidence for Functions upload/build step.
   - Cause: provided screenshots confirm `/api/*` behavior but not the deployment log line.

## Updated risks

- Hosting/runtime is no longer the central blocker for production: `/api/*` routes respond.
- Data reliability is the central blocker: `/api/health` reports `overall: down`, `/api/space-people` returns fallback, and the UI shows degraded mode.
- External upstream APIs can fail, time out, or return Cloudflare/upstream errors such as HTTP 521.
- The app is correctly surfacing fallback data, but the fallback data may become stale unless freshness/source metadata is made explicit.
- Preview cannot be used as a release safety gate until preview URL and smoke behavior are captured.

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

Story D — Data source reliability and fallback contract.

Goal: turn the current production finding into a safer data contract without changing the visual direction.

Acceptance criteria:

- Document response contracts for `/api/health`, `/api/space-people`, and `/api/iss-location`.
- Add/confirm explicit fields for `source`, `isFallback`, `lastSuccessfulUpdate`, and `error` where applicable.
- Preserve current fallback behavior but make stale/degraded state unambiguous.
- Add minimal smoke or contract checks for successful, fallback, timeout, and upstream-error responses.
- Do not add Supabase/Core DB/database in this story.
