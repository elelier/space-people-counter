# Live Site QA Inventory

This document preserves the live-site analysis recovered from the Space People Counter project context so the findings are versioned in the repo instead of living only in chat history.

## Scope

- Project: Space People Counter
- Repo: `elelier/space-people-counter`
- Live URL observed/referenced: `https://spacepeople.elelier.com/`
- Mode: Inventory / PM-PO / QA readiness
- Runtime changes: none
- Core DB / Supabase changes: none

## Live-site findings

The site was observed as a functional public demo with visible reliability and maturity gaps.

### Data freshness and fallback state

The most important live signal was a degraded-data message similar to:

> No se pudo actualizar en vivo, mostrando datos de respaldo

This indicates that the product can render a usable experience when live API calls fail, but it also means the user may be seeing fallback data instead of current people-in-space data.

Risk: fallback data can become stale and may be mistaken for authoritative live data unless the UI clearly labels degraded mode, last successful update, and data source status.

### External API dependency

The app depends heavily on public external APIs:

- Open Notify for people currently in space
- Where the ISS at? for ISS/satellite location

Known/recovered risk: API failures, schema drift, rate limits, CORS, downtime, or unexpected null/undefined payloads can break the live counter, mission cards, or ISS map.

A prior issue was associated with Where the ISS at? payload handling, with an error pattern similar to reading `toString` from `undefined`. That points to defensive parsing and contract tests as a priority before adding features.

### ISS map behavior

The ISS map was reported as slow to load or initially blank. Because Leaflet is browser-only, map behavior needs extra care around hydration, dynamic imports, tile loading, and fallback states.

Risks:

- blank map during hydration/loading
- slow tile loading
- weak fallback when location API fails
- possible visual regressions if map/charts layout changes without smoke testing

### Visual/UI findings

Recovered live QA findings included:

- dark/black blocks or overlays appearing over mission cards
- heavy visual treatment that can reduce readability
- anchors/navigation that can feel confusing on a one-page app
- monolingual experience
- weak accessibility/readability in some states
- Ko-fi CTA may lead to a Cloudflare verification wall, reducing conversion/trust

These are not necessarily production blockers, but they reduce perceived quality and trust.

### Deploy/runtime ambiguity

Repo evidence points to static export plus Cloudflare Pages Functions, but older project history also mentioned GitHub Pages/static export. This is a strategic risk because `/api/*` requires a runtime capable of serving functions.

If deployed to a static-only host without functions, the app cannot reliably serve:

- `/api/space-people`
- `/api/iss-location`
- `/api/health`

## QA readiness gaps

Current gaps to close before feature work:

1. Confirm live hosting owner and deployment pipeline.
2. Confirm that `spacepeople.elelier.com` points to the intended Cloudflare Pages project.
3. Confirm `/api/*` functions work in production and preview.
4. Run `npm run lint`, `npm run type-check`, and `npm run build` in CI.
5. Add manual smoke checklist for:
   - home load
   - people counter
   - degraded/fallback state
   - ISS map load
   - mobile layout
   - mission cards readability
   - external CTA behavior

## Product interpretation

Current state should be treated as:

> public visual demo with promising concept, but not yet a reliable data product.

The next product goal is to turn it into a trustworthy space-data microsite with clear data provenance, stable deploy, and predictable fallbacks.

## Immediate recommendations

1. Keep PRs small and non-runtime until deploy/readiness is confirmed.
2. Add CI first.
3. Add deployment evidence doc.
4. Add live API contract tests or smoke checks.
5. Add UI labels for fallback/stale data.
6. Only then consider migration/persistence work.

## Constraints

- Do not push directly to `main`.
- Do not assume Supabase or Core DB is already wired.
- Do not add secrets.
- Do not modify map/charts without visual smoke coverage.
- Do not use Core DB unless a future story explicitly authorizes the integration.
