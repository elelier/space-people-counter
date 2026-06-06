# API Data Reliability Contract

This document defines the current reliability and fallback contract for Space People Counter `/api/*` endpoints.

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

The product must not present fallback or simulated data as authoritative live data. Each endpoint must expose enough metadata for the UI, smoke checks, and future agents to distinguish:

- live upstream data
- fallback/static data
- simulated ISS location data
- upstream health degradation
- client-side fallback after `/api/*` cannot be reached

## Shared response fields

Every public `/api/*` response should include these fields when applicable:

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `status` | string | yes | Data status for the response. For data endpoints: `live` or `fallback`. For health: `healthy`, `degraded`, or `down`. |
| `source` | string | yes | Source identifier such as `launch-library-2`, `open-notify`, `wheretheiss`, `static-fallback`, `simulated-fallback`, or `cloudflare-pages-functions-health-check`. |
| `isFallback` | boolean | yes | `true` only when the payload is fallback/simulated rather than verified live upstream data. |
| `timestamp` | string or number | yes | Time the response was created. Data endpoint shape preserves existing timestamp compatibility. |
| `lastSuccessfulUpdate` | string \| null | yes | Time of a successful upstream read within the current request. This is not durable across requests because no database/cache persistence is currently used. |
| `responseTime` | number | yes | Milliseconds spent resolving the upstream check or data fetch path. |
| `error` | string \| null | yes | Null when the response is healthy/live; otherwise the upstream/client error that triggered fallback or degraded health. |

Important limitation: without persistence, `lastSuccessfulUpdate` is request-scoped. A future Cloudflare KV/D1/Supabase spike may decide whether durable freshness history is worth adding.

## `/api/space-people`

### Source order

The endpoint now resolves people-in-space data through an explicit multi-source chain:

1. Primary live source: Launch Library 2 / The Space Devs astronauts endpoint with `in_space=true`, exposed as `source: "launch-library-2"`.
2. Optional custom source: `SPACE_PEOPLE_API` or `NEXT_PUBLIC_SPACE_PEOPLE_API`, exposed as `source: "custom-space-people-api"`.
3. Secondary live source: Open Notify `https://api.open-notify.org/astros.json`, exposed as `source: "open-notify"`.
4. Last-resort static fallback: local stale list, exposed as `source: "static-fallback"` and `isFallback: true`.

Static fallback must only happen after every live source fails or returns invalid people data.

### Live response

Expected when Launch Library 2, custom source, or Open Notify returns valid people data.

```json
{
  "number": 12,
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

Expected when Launch Library 2, custom source if configured, and Open Notify are down, time out, or return invalid data. The endpoint intentionally preserves the current fallback people list but marks it explicitly.

```json
{
  "number": 12,
  "people": [{ "name": "Oleg Kononenko", "craft": "ISS" }],
  "message": "success (fallback)",
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

## `/api/iss-location`

### Live response

Expected when Where the ISS at? returns valid latitude/longitude data.

```json
{
  "message": "success",
  "timestamp": 1780752270343,
  "status": "live",
  "source": "wheretheiss",
  "isFallback": false,
  "lastSuccessfulUpdate": "2026-06-06T00:00:00.000Z",
  "responseTime": 120,
  "error": null,
  "iss_position": {
    "latitude": "45.462225536792",
    "longitude": "-50.256584512092"
  },
  "altitude": 421.19,
  "velocity": 27594.01,
  "visibility": "daylight",
  "footprint": 4513.54,
  "units": "kilometers"
}
```

### Simulated fallback response

Expected when the ISS upstream is unavailable or returns invalid coordinates.

```json
{
  "message": "success (simulated)",
  "timestamp": 1780752270343,
  "status": "fallback",
  "source": "simulated-fallback",
  "isFallback": true,
  "lastSuccessfulUpdate": null,
  "responseTime": 5000,
  "error": "The operation was aborted",
  "iss_position": {
    "latitude": "19.4326",
    "longitude": "-99.1332"
  },
  "altitude": 408,
  "velocity": 27600,
  "visibility": "daylight",
  "footprint": 4500
}
```

UI rule: if `isFallback === true`, technical details may say `Simulación` and `Precisión: Baja`; map rendering should remain stable.

## `/api/health`

Health is not a data fallback endpoint. It reports the function runtime's view of upstream availability.

```json
{
  "overall": "degraded",
  "status": "degraded",
  "source": "cloudflare-pages-functions-health-check",
  "isFallback": false,
  "apis": [
    {
      "name": "People in Space (launch-library-2)",
      "url": "https://ll.thespacedevs.com/2.3.0/astronauts/?in_space=true&limit=100",
      "status": "online",
      "source": "launch-library-2",
      "isFallback": false,
      "lastSuccessfulUpdate": "2026-06-06T00:00:00.000Z",
      "responseTime": 1190,
      "lastChecked": "2026-06-06T00:00:00.000Z",
      "error": null
    },
    {
      "name": "People in Space (open-notify)",
      "url": "https://api.open-notify.org/astros.json",
      "status": "offline",
      "source": "open-notify",
      "isFallback": false,
      "lastSuccessfulUpdate": null,
      "responseTime": 1190,
      "lastChecked": "2026-06-06T00:00:00.000Z",
      "error": "HTTP 521"
    }
  ],
  "timestamp": "2026-06-06T00:00:00.000Z",
  "lastSuccessfulUpdate": "2026-06-06T00:00:00.000Z",
  "responseTime": 5000,
  "error": "People in Space (open-notify): HTTP 521"
}
```

`/api/health` may report `down` even if a direct endpoint succeeds moments later. Treat that as upstream intermittency unless production smoke proves a runtime outage.

## Client contract

Client services must preserve reliability metadata from `/api/*` instead of reducing responses to only business fields.

- `src/services/spaceApi.ts` preserves `source`, `isFallback`, `status`, `timestamp`, `lastSuccessfulUpdate`, `responseTime`, and `error`.
- `src/services/issLocationApi.ts` preserves the same metadata and accepts both nested `iss_position` and root `latitude`/`longitude` for defensive compatibility.
- UI fallback detection should prefer `isFallback === true`, with legacy message text only as a compatibility fallback.

## Validation contract

The repo includes `npm run check:api-contract`, a static source-level check that prevents accidental removal of required contract tokens from endpoint, client, and docs files.

The repo also includes `npm run check:space-people-sources`, a mocked source-chain check for these scenarios:

- primary live OK
- primary fail + secondary live OK
- all live sources fail + explicit static fallback

These checks do not call external APIs and are safe for CI because upstream health is intentionally unstable.

## Non-goals

- No Supabase.
- No Core DB.
- No database or durable cache.
- No secrets.
- No major map/chart/UI redesign.
- No claim that fallback astronaut data is current.

## Next recommended story

Add a Cloudflare Pages Functions local smoke harness that executes `/api/space-people`, `/api/iss-location`, and `/api/health` against mocked fixture URLs through the real Pages runtime instead of only source-level checks.
