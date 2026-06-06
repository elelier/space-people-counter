# Production / Preview Smoke Evidence

This document records the production and preview smoke evidence pass for Space People Counter before new feature, monetization, visualization, or persistence work.

## Scope

- Project: Space People Counter
- Repository: `elelier/space-people-counter`
- Base branch: `main`
- Working branch: `docs/prod-preview-smoke-evidence`
- Production URL, owner-confirmed: `https://spacepeople.elelier.com/`
- Hosting, owner-confirmed: Cloudflare
- Database: not verified
- Supabase/Core DB: not used
- Functional changes: none
- Map/chart/UI/runtime changes: none

## Verification timestamp

- UTC timestamp: `2026-06-06T07:10:38Z`
- Execution environment: ChatGPT session with GitHub connector plus local shell/network tools.

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

## Production smoke target

Expected runtime, based on current repo docs:

- Static export from `out/`.
- Cloudflare Pages serving production site.
- Cloudflare Pages Functions serving `/api/*`.

Smoke paths requested:

- `/`
- `/api/health`
- `/api/space-people`
- `/api/iss-location`

## Production HTTP smoke result

The production HTTP smoke could not be completed from this execution environment because DNS resolution failed for the production hostname.

This is not treated as proof of a production outage. It is treated as an environment/network blocker unless reproduced from a normal external network or from Cloudflare.

Command attempted:

```bash
for p in / /api/health /api/space-people /api/iss-location; do
  curl -sS -D - -o /tmp/body.txt --max-time 20 "https://spacepeople.elelier.com$p"
done
```

Observed result for every requested path:

```text
curl: (6) Could not resolve host: spacepeople.elelier.com
```

| Path | Result | Evidence status |
| --- | --- | --- |
| `/` | DNS resolution failed before HTTP request | Blocked; no status/header/body captured |
| `/api/health` | DNS resolution failed before HTTP request | Blocked; no status/header/body captured |
| `/api/space-people` | DNS resolution failed before HTTP request | Blocked; no status/header/body captured |
| `/api/iss-location` | DNS resolution failed before HTTP request | Blocked; no status/header/body captured |

## Headers captured

No HTTP headers were captured because the hostname did not resolve from this execution environment.

Requested non-sensitive headers to capture on a successful pass:

- HTTP status
- `content-type`
- `cache-control`
- `cf-ray`, if present
- `cf-cache-status`, if present

## DNS observable result

Command attempted:

```bash
getent hosts spacepeople.elelier.com
```

Observed result:

```text
# no host result returned
```

Interpretation:

- DNS could not be confirmed from this environment.
- This does not prove the DNS record is missing globally.
- DNS needs confirmation from a reliable external resolver or Cloudflare DNS dashboard.

## TLS / SSL observable result

Command attempted:

```bash
echo | openssl s_client -connect spacepeople.elelier.com:443 -servername spacepeople.elelier.com
```

Observed result:

```text
BIO_lookup_ex:system lib: Temporary failure in name resolution
connect:errno=11
```

Interpretation:

- TLS certificate validity could not be checked because DNS failed before the TLS handshake.
- SSL/TLS remains pending, not failed.

## Web fetch attempt

A web fetch attempt for the production URL and `/api/*` paths was also attempted from the session. It did not return usable HTTP evidence. A search query for indexed content under `site:spacepeople.elelier.com` returned no search results.

Interpretation:

- No usable production HTTP evidence was produced by the web fetch path.
- Search indexing is not an uptime signal and should not be used as production evidence.

## Preview smoke result

No preview URL was identified from repository files or public PR metadata during this pass.

Preview status: pending.

Do not claim preview exists until at least one of these is captured:

- Cloudflare Pages preview deployment URL.
- GitHub PR deployment environment URL.
- Cloudflare deployment log showing preview URL.
- A successful HTTP smoke against that preview URL.

## Production vs preview vs local

### Production

- Production URL is owner-confirmed: `https://spacepeople.elelier.com/`.
- HTTP/DNS/TLS could not be externally confirmed from this environment because DNS resolution failed.
- `/api/*` runtime remains unconfirmed in production.

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

## Evidence pending

The following remain pending with exact cause:

1. Production `/` HTTP status/header/body shape.
   - Cause: DNS resolution failed from this environment.
2. Production `/api/health` HTTP status/header/body shape.
   - Cause: DNS resolution failed from this environment.
3. Production `/api/space-people` HTTP status/header/body shape.
   - Cause: DNS resolution failed from this environment.
4. Production `/api/iss-location` HTTP status/header/body shape.
   - Cause: DNS resolution failed from this environment.
5. DNS record type/target/proxied status.
   - Cause: no Cloudflare dashboard/API access used and local resolver failed.
6. SSL/TLS certificate validity.
   - Cause: DNS failed before TLS handshake.
7. Cloudflare Pages dashboard settings.
   - Cause: no Cloudflare token/API/dashboard evidence used.
8. Preview URL and preview smoke.
   - Cause: no preview URL was discovered from repo/public PR metadata.

## Updated risks

- Production may be healthy, but this session could not prove it because DNS failed in the execution environment.
- If production is actually serving only static output without Cloudflare Pages Functions, `/api/*` will fail even if `/` works.
- Preview cannot be used as a release safety gate until the preview URL and `/api/*` behavior are captured.
- Cloudflare dashboard configuration can still drift from repo intent until project settings are verified directly.
- Current app should still be treated as a public demo/productizing app, not a fully verified reliable data product.

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

Story D — Cloudflare runtime evidence from authoritative source.

Goal: capture Cloudflare dashboard or CLI evidence without exposing secrets.

Acceptance criteria:

- Cloudflare Pages project name captured.
- GitHub repository and production branch captured.
- Build command and output directory captured.
- Latest production deploy from `main` captured.
- Production URL smoke from a working external network captured for `/`, `/api/health`, `/api/space-people`, and `/api/iss-location`.
- Preview URL captured if available.
- Preview smoke captured if available.
- DNS target and SSL certificate status captured.
