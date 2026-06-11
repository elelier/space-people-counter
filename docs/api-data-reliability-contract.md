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

The product must not present fallback, cache, static, or simulated data as authoritative live data. Each endpoint must expose enough metadata for the UI, checks, and future agents to distinguish live upstream data from fallback, simulated, cached/degraded, or client-side fallback states.

## Shared response fields

Every public `/api/*` response should include these fields when applicable:

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `status` | string | yes | Data status for the response. Data endpoints use `live` or `fallback`; health uses `healthy`, `degraded`, or `down`. |
| `source` | string | yes | Source identifier such as `launch-library-2`, `open-notify`, `last-known-good-cache`, `wheretheiss`, `static-fallback`, `simulated-fallback`, or `cloudflare-pages-functions-health-check`. |
| `isFallback` | boolean | yes | `true` only when the payload is fallback/cache/simulated rather than verified live upstream data from the current request. |
| `timestamp` | string or number | yes | Time the response was created. |
| `lastSuccessfulUpdate` | string or null | yes | Time of a successful upstream read. For `last-known-good-cache`, this is the original live timestamp saved in KV. |
| `responseTime` | number | yes | Milliseconds spent resolving the upstream check or data fetch path. |
| `error` | string or null | yes | Null when the response is healthy/live; otherwise the upstream/client/cache error or degradation note that triggered fallback. |

Important limitation: `lastSuccessfulUpdate` is request-scoped for normal live resolution. It becomes durable only when optional Cloudflare KV `SPACE_PEOPLE_KV` is configured and a live payload has been saved.

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
6. optional last-known-good cache via Cloudflare KV after every live source fails;
7. static fallback only after every live source fails and KV is missing, invalid, expired, or unavailable.

### Source order

1. Primary live source: Launch Library 2 / The Space Devs astronauts endpoint with `in_space=true`, exposed as `source: "launch-library-2"`.
2. Optional custom source: `SPACE_PEOPLE_API` or `NEXT_PUBLIC_SPACE_PEOPLE_API`, exposed as `source: "custom-space-people-api"`.
3. Secondary live source: Open Notify `https://api.open-notify.org/astros.json`, exposed as `source: "open-notify"`.
4. Optional last-known-good cache: Cloudflare KV binding `SPACE_PEOPLE_KV`, key `space-people:last-known-good`, exposed as `source: "last-known-good-cache"` and `isFallback: true`.
5. Last-resort static fallback: local stale snapshot, exposed as `source: "static-fallback"` and `isFallback: true`.

Static fallback must only happen after every live source fails or returns invalid people data and the optional KV cache cannot provide a valid <=24h payload.

### Data quality rules

- `people` must contain at least one valid `{ name, craft }` record.
- People are deduped by normalized name.
- Live payload `number` must equal the final deduped `people.length`.
- If an upstream reports a mismatched count, that source is rejected and the endpoint tries the next source.
- If a live source lacks craft/station metadata, `craft` is set to `Unknown spacecraft`; the endpoint must not invent a craft.
- The last-known-good cache preserves the live payload shape plus original source, original live timestamp, `savedAt`, and `lastSuccessfulUpdate`.
- Cache age is validated internally against the 24h TTL and may be described inside `error`; no public `cacheAgeMs` field is required.

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

When a live response is valid and `SPACE_PEOPLE_KV` exists, the function attempts to save a last-known-good payload. KV write failure must not break the live response.

### Last-known-good cache fallback response

Expected when Launch Library 2, custom source if configured, and Open Notify are down, time out, or return invalid data, but KV has a valid payload saved within the 24h TTL.

```json
{
  "number": 10,
  "people": [{ "name": "Example", "craft": "ISS" }],
  "message": "success",
  "status": "fallback",
  "source": "last-known-good-cache",
  "isFallback": true,
  "timestamp": "2026-06-06T01:00:00.000Z",
  "lastSuccessfulUpdate": "2026-06-06T00:00:00.000Z",
  "responseTime": 120,
  "error": "launch-library-2 responded with HTTP 503; open-notify responded with HTTP 521; serving cached last-known-good data from launch-library-2; cacheAgeMs=3600000; static fallback not used"
}
```

This response is useful but degraded. It must never be marked as `status: "live"`.

### Static fallback response

Expected when Launch Library 2, custom source if configured, Open Notify, and optional KV cache are unavailable, invalid, or expired. The endpoint preserves a dated fallback snapshot but marks it explicitly.

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
  "error": "launch-library-2 responded with HTTP 503; open-notify responded with HTTP 521; last-known-good cache unavailable: SPACE_PEOPLE_KV binding is not configured"
}
```

UI rule: if `isFallback === true`, the counter can render but must keep a degraded/fallback message visible.

See `docs/space-people-source-audit.md` and `docs/cloudflare-kv-last-known-good.md` for source decisions and KV setup.

## `/api/iss-location`

`/api/iss-location` remains scoped to ISS position. It should not be used as a crew or people-count source.

Live source: Where the ISS at? `https://api.wheretheiss.at/v1/satellites/25544`.

Fallback source: `simulated-fallback`, only when upstream is unavailable or returns invalid coordinates.

## `/api/health`

Health is not a data fallback endpoint. It reports the function runtime's view of upstream availability for APIs actually used by the app, including:

- `launch-library-2`
- `open-notify`
- `wheretheiss`

It also reports optional cache binding visibility through an API row named `People in Space cache (KV binding)` with `source: "last-known-good-cache"`. Missing `SPACE_PEOPLE_KV` is reflected in that row but is not counted against overall dev/local health.

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
- live valid path stores last-known-good intent;
- primary fail plus secondary live OK;
- all live sources fail plus explicit last-known-good cache before static fallback;
- expired or invalid cache falls through to static fallback;
- static fallback remains last resort;
- dedupe and count validation are preserved.

These checks do not call external APIs and are safe for CI because upstream health is intentionally unstable.

## Non-goals

- No Supabase.
- No Core DB.
- No database.
- No secrets.
- No analytics.
- No major map/chart/UI redesign.
- No claim that cached or fallback astronaut data is current live data.

## Next recommended story

Add a Cloudflare Pages production smoke/checklist after `SPACE_PEOPLE_KV` is manually configured, proving live -> cache -> static fallback behavior in deployed runtime without adding secrets to the repo.
