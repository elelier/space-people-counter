# Space People Source Audit

Original audit: 2026-06-06; source priority updated 2026-10-24.

## Product semantics

Space People Counter uses this definition for `/api/space-people`:

> Humans currently in orbit aboard active space stations or active orbital missions.

Suborbital flights are intentionally excluded because they can temporarily increase the broader "people in space" count for minutes and would require a separate real-time launch/operator feed. The current product promise is a stable orbital population counter, not a live suborbital flight tracker.

## Decision summary

| Source | Decision | Why |
| --- | --- | --- |
| Community crew roster (corquaid, GitHub Pages) | Primary fetched source | Free public JSON including ISS and Tiangong; independently checked against NASA Expedition 75 and Shenzhou 23 reporting on 2026-10-24. Maintained manually; not guaranteed real-time. |
| Launch Library 2 / The Space Devs astronauts endpoint | Secondary source | Structured `in_space=true` API; unauthenticated 15/hour limit and recent 429s make it unsuitable as the default source. |
| Open Notify astros endpoint | Secondary live source | Simple and compatible with the legacy shape, but historically unstable and schema-light. |
| NASA public APIs | Not used as primary | NASA has authoritative ISS content/news, but no simple official public endpoint found for all humans currently in orbit. |
| WhereTheISS | Not used for people count | Good for ISS location only; not a crew/person source. |
| Wikipedia/current-expedition pages | Audit/reference only | Useful for cross-checking semantics and fallback snapshot context, but not suitable as an automated primary runtime source. |
| News sources for current ISS/Tiangong crew | Audit/reference only | Useful for dated fallback snapshot context; not suitable as runtime API. |
| Static fallback | Last resort only | Explicitly stale snapshot, never live. |

## Source notes

### Community crew roster (primary)

Runtime URL: `https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json`.

- Public MIT-licensed project: https://github.com/corquaid/international-space-station-APIs.
- The `number` field must match the deduplicated roster size; every person must have a non-empty `name`, a boolean `iss` flag, and a non-empty `spacecraft`.
- `iss: true` maps to `ISS`; a non-ISS Shenzhou/Tiangong spacecraft maps to `Tiangong`; other spacecraft retain their names (not every non-ISS mission is Chinese).
- No credentials, new database, or new Cloudflare binding is needed. The existing 30-minute `caches.default` edge response cache remains in place.
- The maintainer updates the roster around crew changes. An HTTP 200 only proves a successful fetch, **not** that human-curated data has zero delay. `status: live` means fetched upstream, not a guarantee of second-by-second accuracy.
- Reference for human cross-check: https://www.nasa.gov/mission/expedition-75/ and https://english.scio.gov.cn/m/chinavoices/2026-05/24/content_118511159.html.

### Launch Library 2 / The Space Devs

Runtime URL used by the app:

```text
https://ll.thespacedevs.com/2.3.0/astronauts/?in_space=true&limit=100
```

Expected role: secondary source if the community feed cannot be validated or fetched.

Coverage intent:

- active astronauts/taikonauts/cosmonauts flagged as in space;
- broader than ISS-only sources;
- structured JSON with `results` and person records.

Implementation rules:

- normalize people from `results`;
- require at least one valid person;
- deduplicate by normalized name;
- preserve craft/station if available;
- use `Unknown spacecraft` only when the upstream has no craft/station metadata;
- reject count mismatches instead of silently accepting inconsistent data.

Known risks:

- public endpoint schema could drift;
- craft/station metadata may be incomplete;
- no durable cache exists, so freshness is request-scoped.

### Open Notify

Runtime URL:

```text
https://api.open-notify.org/astros.json
```

Expected role: secondary live source.

Why not primary:

- historically unstable/down in this project;
- schema is minimal: `number`, `people`, `message`;
- no strong freshness metadata;
- coverage can be ambiguous for non-ISS orbital populations.

Implementation rules:

- accept only valid `people[].name` + `people[].craft` records;
- deduplicate by normalized name;
- reject `number !== people.length` instead of hiding mismatch.

### NASA public sources

Decision: not used as runtime primary.

NASA is authoritative for ISS operations and current crew reporting, but this work did not identify a simple official public API that returns all humans currently in orbit across ISS, Tiangong, and private/orbital missions in a normalized machine-readable shape.

NASA/ISS pages and news remain useful for human audit and documentation, not for stateless runtime fetches in this app.

### Tiangong / CMSA current crew

Decision: the community roster includes Shenzhou/Tiangong. CMSA reporting is audit evidence, not a separate runtime API.

Tiangong coverage is essential for the product semantics, but no stable public JSON API was identified for current Tiangong crew. Recent public reporting is useful for audit and fallback snapshot context only.

As of the audit date, public reporting indicated Shenzhou 23 carried Zhu Yangzhu, Zhang Zhiyuan, and Lai Ka-ying / Li Jiaying to Tiangong, while the Shenzhou 21 crew returned on 2026-05-29.

### WhereTheISS

Runtime URL for the separate endpoint:

```text
https://api.wheretheiss.at/v1/satellites/25544
```

Decision: keep for `/api/iss-location`; do not use for `/api/space-people`.

It answers where the ISS is, not who is currently in space.

## Current fallback snapshot

The static fallback list was refreshed in this PR as a dated stale snapshot from the audit context:

- ISS: Sergey Kud-Sverchkov, Sophie Adenot, Andrey Fedyaev, Jack Hathaway, Jessica Meir, Sergei Mikayev, Christopher Williams.
- Tiangong: Zhu Yangzhu, Zhang Zhiyuan, Lai Ka-ying.

This June snapshot is now known to have outdated ISS members, and is intentionally returned only with:

```json
{
  "status": "fallback",
  "source": "static-fallback",
  "isFallback": true,
  "lastSuccessfulUpdate": null
}
```

It must never be treated as live.

## Runtime architecture rule

`/api/space-people` should stay organized as:

1. source registry;
2. per-source adapter;
3. normalization;
4. validation;
5. dedupe;
6. reliability metadata;
7. fallback only after every live source fails.

## Future candidates

Potential future improvement:

- Cloudflare KV or scheduled build-time snapshot for last-known-good data, if the project accepts a persistence/cache dependency.
- Manual curated station crew file with explicit `validFrom` / `validUntil` windows, if no reliable Tiangong runtime API exists.
- Add a separate definition toggle if the product ever wants to include suborbital flights.
