# Cloudflare KV Last Known Good Cache

This document describes the optional Cloudflare KV setup for `/api/space-people` last-known-good data.

## Goal

If Launch Library 2, the optional custom source, and Open Notify fail temporarily, `/api/space-people` should try to serve the most recent valid live payload before falling back to the static stale snapshot.

The cached payload is always degraded/fallback data. It must never be marked as live.

## Runtime contract

Binding name:

```text
SPACE_PEOPLE_KV
```

KV key:

```text
space-people:last-known-good
```

Logical TTL:

```text
24h
```

24h is intentionally conservative: it covers short upstream outages without letting a cached astronaut list become a long-lived hidden truth source.

## What gets saved

When a live source returns valid people data, the Pages Function attempts to save:

- `people`
- `number`
- `message`
- original live `source`
- live `timestamp`
- `savedAt`
- `lastSuccessfulUpdate`

KV write failures are non-fatal. The live response still returns `status: "live"`, `isFallback: false`, and the original live `source`.

## Fallback order

`/api/space-people` resolves data in this order:

1. Launch Library 2 live source.
2. Optional custom Open Notify-compatible source.
3. Open Notify live source.
4. Cloudflare KV last-known-good cache when `SPACE_PEOPLE_KV` exists and the cached payload is valid and <=24h old.
5. Static fallback snapshot.

## Cached response shape

When KV cache is used, the public response must keep the existing reliability contract:

```json
{
  "status": "fallback",
  "source": "last-known-good-cache",
  "isFallback": true,
  "lastSuccessfulUpdate": "2026-06-06T00:00:00.000Z",
  "error": "... serving cached last-known-good data ..."
}
```

`lastSuccessfulUpdate` is the original live timestamp saved in KV. `timestamp` is the current response time.

## Manual Cloudflare setup

Use Cloudflare dashboard access for the Pages project.

1. Go to Cloudflare Dashboard.
2. Open Workers & Pages.
3. Create a KV namespace for this app, for example `space-people-last-known-good`.
4. Open the Space People Counter Pages project.
5. Go to Settings -> Functions -> KV namespace bindings.
6. Add binding:
   - Variable name: `SPACE_PEOPLE_KV`
   - KV namespace: the namespace created above.
7. Save.
8. Redeploy the Pages project so the Functions runtime receives the binding.

Do not store secrets in this binding. The payload is public people-in-space data and reliability metadata only.

## Verification checklist

After deploy:

1. Call `/api/health` and confirm the API list includes `People in Space cache (KV binding)` with `source: "last-known-good-cache"`.
2. Call `/api/space-people` while at least one live source is healthy. Expected:
   - `status: "live"`
   - `isFallback: false`
   - `source` is one of the live sources.
3. Temporarily point live source env vars to failing fixture URLs in a non-production preview, or use a local/mock Cloudflare Pages test, then call `/api/space-people`. Expected if KV has a saved payload:
   - `status: "fallback"`
   - `source: "last-known-good-cache"`
   - `isFallback: true`
   - `lastSuccessfulUpdate` is not null.
4. Test missing/expired/invalid KV in preview. Expected:
   - `status: "fallback"`
   - `source: "static-fallback"`
   - `isFallback: true`
   - `lastSuccessfulUpdate: null`.

## Local/dev behavior

`SPACE_PEOPLE_KV` is optional. Without it, local/dev should still work through live sources and static fallback.

Missing KV is visible in `/api/health`, but it is not a hard requirement for healthy dev/local API checks.
