# API Data Reliability Contract

This document defines the reliability and fallback contract for Space People Counter `/api/*` endpoints.

## Scope

- Project: Space People Counter
- Repo: `elelier/space-people-counter`
- Runtime: Cloudflare Pages Functions under `functions/api/*`
- Production domain: `https://spacepeople.elelier.com/`
- Database: not verified and not introduced by this contract
- Supabase: No Supabase work
- Core DB: No Core DB work
- Secrets: none required

## Contract goal

The product must not present fallback or simulated data as authoritative live data. Each endpoint must expose enough metadata for the UI, checks, and future agents to distinguish live upstream data from fallback, simulated, degraded, or client-side fallback states.

## Shared response fields

Every public `/api/*` response should include these fields when applicable:

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `status` | string | yes | Data status for the response. Data endpoints use `live` or `fallback`; health uses `healthy`, `degraded`, or `down`. |
| `source` | string | yes | Source identifier such as `launch-library-2`, `open-notify`, `wheretheiss`, `static-fallback`, `simulated-fallback`, or `cloudflare-pages-functions-health-check`. |
| `isFallback` | boolean | yes | `true` only when the payload is fallback/simulated rather than verified live upstream data. |
| `timestamp` | string or number | yes | Time the response was created. |
| `lastSuccessfulUpdate` | string or null | yes | Time of a successful upstream read within the current request. Not durable across requests. |
| `responseTime` | number | yes | Milliseconds spent resolving the upstream check or data fetch path. |
| `error` | string or null | yes | Null when the response is healthy/live; otherwise the upstream/client error that triggered fallback or degraded health. |

Important limitation: without persistence, `lastSuccessfulUpdate` is request-scoped.

## `/api/space-people`

### Product data definition

`/api/space-people` means: humans currently in orbit aboard active space stations or active orbital missions.

Suborbital flights are excluded because they require a different real-time event model and can change the broad population count only for minutes.

### Source architecture

The endpoint resolves people-in-space data through this explicit source architecture:

1. source registry;
2. per-source adapter/normalizer;
3. payload validation;
4. name-based dedupe;
5. reliability metadata;
6. static fallback only after every live source fails or returns invalid data.

### Source order

1. Primary live source: Launch Library 2 / The Space Devs astronauts endpoint with `in_space=true`, exposed as `source: "launch-library-2"`.
2. Optional custom source: `SPACE_PEOPLE_API` or `NEXT_PUBLIC_SPACE_PEOPLE_API`, exposed as `source: "custom-space-people-api"`.
3. Secondary live source: Open Notify `https://api.open-notify.org/astros.json`, exposed as `source: "open-notify"`.
4. Last-resort static fallback: local stale snapshot, exposed as `source: "static-fallback"` and `isFallback: true`.

Static fallback must only happen after every live source fails or returns invalid people data.

### Data quality rules

- `people` must contain at least one valid `{ name, craft }` record.
- People are deduped by normalized name.
- Live payload `number` must equal the final deduped `people.length`.
- If an upstream reports a mismatched count, that source is rejected and the endpoint tries the next source.
- If a live source lacks craft/station metadata, `craft` is set to `Unknown spacecraft`; the endpoint must not invent a craft.

### Live response

```json
{
  "number": 10,
  "people": [{ "name": "Example", "craft": "ISS" }],
  "message": "success",
  "status": "live",
  "source": "launch-library-2",
  "isFallback": false,
  "timestamp": "2026-06-06T00:00:00.000Z",
  "lastSuccessfulUpdate": "2026-06-06T00:00:00.000Z",
  "responseTime": 120,
  "error": null
}
```

If Launch Library 2 fails but Open Notify succeeds, the same contract applies with `source: "open-notify"`, `status: "live"`, and `isFallback: false`.

### Fallback response

Expected when Launch Library 2, custom source if configured, and Open Notify are down, time out, or return invalid data. The endpoint preserves a dated fallback snapshot but marks it explicitly.

```json
{
  "number": 10,
  "people": [{ "name": "Sergey Kud-Sverchkov", "craft": "ISS" }],
  "message": "success (fallback; stale snapshot)",
  "status": "fallback",
  "source": "static-fallback",
  "isFallback": true,
  "timestamp": "2026-06-06T00:00:00.000Z",
  "lastSuccessfulUpdate": null,
  "responseTime": 120,
  "error": "launch-library-2 responded with HTTP 503; open-notify responded with HTTP 521"
}
```

UI rule: if `isFallback === true`, the counter can render but must keep a degraded/fallback message visible.

See `docs/space-people-source-audit.md` for source decisions.

## `/api/iss-location`

`/api/iss-location` remains scoped to ISS position. It should not be used as a crew or people-count source.

Live source: Where the ISS at? `https://api.wheretheiss.at/v1/satellites/25544`.

Fallback source: `simulated-fallback`, only when upstream is unavailable or returns invalid coordinates.

## `/api/health`

Health is not a data fallback endpoint. It reports the function runtime's view of upstream availability for APIs actually used by the app, including:

- `launch-library-2`
- `open-notify`
- `wheretheiss`

`/api/health` may report `down` even if a direct endpoint succeeds moments later. Treat that as upstream intermittency unless production evidence proves a runtime outage.

## Client contract

Client services must preserve reliability metadata from `/api/*` instead of reducing responses to only business fields.

- `src/services/spaceApi.ts` preserves `source`, `isFallback`, `status`, `timestamp`, `lastSuccessfulUpdate`, `responseTime`, and `error`.
- `src/services/issLocationApi.ts` preserves the same metadata and accepts both nested `iss_position` and root `latitude`/`longitude` for defensive compatibility.
- UI fallback detection should prefer `isFallback === true`, with legacy message text only as a compatibility fallback.

## Validation contract

The repo includes `npm run check:api-contract`, a static source-level check that prevents accidental removal of required contract tokens from endpoint, client, and docs files.

The repo also includes `npm run check:space-people-sources`, a source-chain check for:

- source registry/adapters exist;
- primary live OK;
- primary fail plus secondary live OK;
- all live sources fail plus explicit static fallback;
- dedupe and count validation are preserved.

These checks do not call external APIs and are safe for CI because upstream health is intentionally unstable.

## Non-goals

- No Supabase.
- No Core DB.
- No database or durable cache.
- No secrets.
- No major map/chart/UI redesign.
- No claim that fallback astronaut data is current.

## Next recommended story

Add a manual curated station crew fallback file with explicit `validFrom` and `validUntil` windows, or decide whether Cloudflare KV last-known-good cache is acceptable for this project.
