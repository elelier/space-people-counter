# Roadmap: Tech Stack Migration and Product Hardening

This roadmap preserves the recovered PM-PO analysis for moving Space People Counter from a fragile public demo into the Elelier operating stack.

## Current baseline

- Repo: `elelier/space-people-counter`
- Current stack: Next.js 14 + React 18 + TypeScript + Tailwind
- Visualization: Leaflet / React Leaflet, Chart.js dependencies, Framer Motion
- Runtime evidence: static export + Cloudflare Pages Functions
- Live site referenced: `https://spacepeople.elelier.com/`
- Database: not verified
- Supabase: not wired/assumed
- Core DB: do not use unless a future story explicitly authorizes it

## Product goal

Move from:

> impressive visual demo dependent on fragile public API calls

To:

> reliable, observable, versioned space-data product running on the Elelier stack.

## Target operating stack

The intended Elelier stack direction is:

1. GitHub as source of truth for code, docs, PRs, and CI.
2. Cloudflare Pages as production hosting for the public app.
3. Cloudflare Pages Functions or Workers as the runtime boundary for external API calls.
4. Optional Supabase persistence for snapshots, freshness, history, and observability.
5. Optional Core DB integration only if the project becomes part of a shared Elelier portfolio/CRM/intake system.

Important: Supabase/Core DB are migration targets, not current verified implementation.

## Migration principles

- Stabilize before expanding.
- Document before changing runtime.
- Do not break map/charts.
- Avoid direct browser calls to fragile external APIs.
- Make stale/degraded data explicit to users.
- Keep Core DB separate unless a story explicitly defines the contract.

## Phase 0 — Inventory and contract

Status: in progress via docs PR.

Deliverables:

- deploy/runtime contract
- live-site QA inventory
- migration roadmap
- README alignment for Next.js 14 vs README references
- confirmation of Cloudflare vs GitHub Pages deploy history

Acceptance criteria:

- repo has versioned operational docs
- next agents do not need chat memory to understand state
- ambiguity is documented, not hidden

## Phase 1 — QA and deploy readiness

Goal: make the current app safe to change.

Stories:

1. Add GitHub Actions CI for:
   - `npm run lint`
   - `npm run type-check`
   - `npm run build`
2. Add deployment evidence doc:
   - Cloudflare Pages project name
   - production domain
   - build command
   - output directory
   - functions behavior
3. Add manual smoke checklist:
   - home route
   - people counter
   - fallback message
   - ISS map
   - mission cards
   - mobile layout
   - external CTA

Exit criteria:

- build/readiness is repeatable
- deploy target is confirmed
- no runtime feature work proceeds blind

## Phase 2 — Data reliability hardening

Goal: make live/fallback data trustworthy.

Stories:

1. Defensive parsing for Open Notify and Where the ISS at? responses.
2. Clear fallback/stale UI contract:
   - last successful update
   - source status
   - degraded mode label
3. API response contract docs for `/api/space-people`, `/api/iss-location`, and `/api/health`.
4. Basic smoke test for API functions.

Exit criteria:

- failed external APIs do not silently look like valid live data
- API failures are visible and understandable
- map and counter degrade gracefully

## Phase 3 — Visual trust and UX cleanup

Goal: improve perceived quality without redesigning the whole app.

Stories:

1. Fix mission-card overlays/black blocks.
2. Improve readability and contrast.
3. Make anchor navigation clearer.
4. Add loading and empty states for the ISS map.
5. Review Ko-fi CTA placement and risk if it triggers verification friction.
6. Add basic accessibility checklist.

Exit criteria:

- mobile and desktop are visually stable
- mission cards remain readable
- map blank/loading states are handled

## Phase 4 — Optional persistence layer

Goal: decide whether the app needs data storage.

Possible use cases:

- store API snapshots
- track historical people-in-space counts
- track ISS location snapshots
- track API health/latency over time
- power historical charts from real collected data instead of static/fallback data

Options:

1. Cloudflare-only: Workers + KV/D1/R2 depending on needs.
2. Supabase project: if persistent relational history is needed.
3. Elelier Core DB: only for shared Elelier operational objects, not raw telemetry by default.

Recommendation:

Start with Cloudflare runtime hardening and only introduce Supabase after a clear data model and product reason exist.

## Phase 5 — Supabase/Core DB decision gate

Core DB should not be used just because it exists.

Use Supabase/Core DB only if at least one of these becomes true:

- Space People Counter becomes part of Elelier portfolio analytics.
- The project needs shared admin visibility.
- The project needs lead capture, feedback, CRM, or cross-project observability.
- There is a defined contract with `elelier/elelier-core-db`.

Do not use Core DB for:

- raw ISS polling telemetry by default
- high-frequency location snapshots without retention strategy
- secrets or external API keys
- quick fixes to public API fragility

## Recommended next stories

### Story A — CI readiness

Add CI workflow that runs install, lint, type-check, and build on PRs.

### Story B — Deployment evidence

Document live Cloudflare Pages configuration and verify production `/api/*` behavior.

### Story C — Live API resilience

Harden `/api/*` response parsing, fallback labeling, and stale data messaging.

### Story D — Visual smoke checklist

Create checklist for map, mission cards, mobile layout, and fallback state.

### Story E — Data persistence spike

Create a short architecture spike deciding between Cloudflare-only, Supabase, or Core DB integration.

## Non-goals for now

- No direct Core DB work.
- No Supabase tables yet.
- No new secrets.
- No major UI redesign.
- No rewiring hosting without confirmed deploy evidence.
