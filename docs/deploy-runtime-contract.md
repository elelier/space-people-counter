# Deploy and Runtime Contract

This document captures the current operational contract for Space People Counter before adding new features.

## Project scope

Space People Counter is a public app/demo for counting and visualizing people in space. The current app is a Next.js App Router application with interactive ISS map, mission cards, historical content, and public API fallbacks.

## Current stack

- Next.js 14 (`next` is pinned by `package.json`/`package-lock.json` as `^14.2.35`)
- React 18 + TypeScript
- Tailwind CSS
- Leaflet + React Leaflet for the ISS map
- Chart.js / React Chart.js dependencies are installed for visualizations
- Framer Motion and Lucide React for UI/animation
- Cloudflare Pages Functions for `/api/*`

## Deployment target

The repository currently contains a Cloudflare-oriented runtime contract:

- `next.config.mjs` uses `output: 'export'` and `trailingSlash: true`
- `wrangler.toml` defines `pages_build_output_dir = "out"`
- Cloudflare Pages Functions live under `functions/api/*`
- The documented domain is `https://spacepeople.elelier.com`, but production DNS/hosting ownership still needs external confirmation

The app should be treated as a static export plus Cloudflare Pages Functions project until Cloudflare/GitHub Pages ownership is confirmed with deployment evidence.

## Runtime APIs

The UI consumes internal `/api/*` routes. Those endpoints are expected to be served by Cloudflare Pages Functions:

- `/api/space-people` proxies/falls back around Open Notify people-in-space data
- `/api/iss-location` proxies/falls back around Where the ISS at? satellite data
- `/api/health` checks external API health

If the project is deployed to a static-only host without functions, these `/api/*` routes will not work and the client will rely on fallbacks or fail depending on the path.

## Environment variables

Current documented variables are optional and should not contain secrets:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_DESCRIPTION`
- `NEXT_PUBLIC_APP_URL`
- `SPACE_PEOPLE_API` (optional function override)
- `ISS_API` (optional function override)
- `NEXT_PUBLIC_GA_ID` (optional/future analytics)
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (optional/future analytics)

Do not add Supabase, Core DB, private API keys, or database dependencies unless a future story explicitly requires them.

## QA commands

Preferred local validation sequence:

```bash
npm install --legacy-peer-deps
npm run lint
npm run type-check
npm run build
```

For Cloudflare Pages Functions smoke testing:

```bash
npm run build
npx wrangler pages dev out --compatibility-date=2025-01-01
```

Then verify:

- `/`
- `/api/space-people`
- `/api/iss-location`
- `/api/health`

## Known risks

- README and older PR history have referenced GitHub Pages/static export; current repo files still include Cloudflare Pages Functions.
- `spacepeople.elelier.com` appears in metadata and env examples, but production/hosting evidence should be confirmed externally.
- Fallback astronaut data can become stale and should be treated as degraded-mode data, not authoritative truth.
- The map depends on Leaflet browser-only behavior, so SSR/hydration changes should be tested carefully.
- Do not modify map/charts runtime without a visual smoke test.

## Recommended next PR

After this documentation contract, the next safe PR should add CI/readiness automation or a lightweight smoke checklist:

1. Add/confirm GitHub Actions for `npm run lint`, `npm run type-check`, and `npm run build`.
2. Add a deploy evidence doc confirming Cloudflare Pages project, domain, build command, output directory, and functions behavior.
3. Only after that, address stale fallback data or UX/data freshness indicators.
