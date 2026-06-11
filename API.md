# Documentacion de Integracion de Datos - Space People Counter

## Definicion del dato

`/api/space-people` cuenta humanos actualmente en orbita a bordo de estaciones espaciales activas o misiones orbitales activas.

No incluye vuelos suborbitales de minutos. Si el producto decide incluirlos despues, debe tratarse como una nueva definicion de dato y no como un cambio silencioso del conteo actual.

## Fuentes de datos

Este proyecto es estatico y usa Cloudflare Pages Functions para `/api/*`.

- `/api/space-people` usa cadena multi-source con arquitectura de adaptadores:
  1. Launch Library 2 / The Space Devs (`https://ll.thespacedevs.com/2.3.0/astronauts/?in_space=true&limit=100`) como fuente primaria viva (`source: launch-library-2`).
  2. Endpoint custom opcional (`SPACE_PEOPLE_API` o `NEXT_PUBLIC_SPACE_PEOPLE_API`) como fuente intermedia compatible con Open Notify (`source: custom-space-people-api`).
  3. Open Notify (`https://api.open-notify.org/astros.json`) como fuente secundaria (`source: open-notify`).
  4. Cloudflare KV opcional para ultimo dato vivo exitoso (`source: last-known-good-cache`, `isFallback: true`) cuando todas las fuentes vivas fallan.
  5. Fallback estatico fechado solo como ultimo recurso (`source: static-fallback`, `isFallback: true`).
- `/api/iss-location` usa Where the ISS at? (`https://api.wheretheiss.at/v1/satellites/25544`).
- `/api/health` revisa APIs externas realmente usadas y refleja si existe el binding KV opcional.

## Configuracion opcional

Puedes sobreescribir los endpoints de las functions con variables de entorno en Cloudflare:

- `SPACE_PEOPLE_PRIMARY_API` para sustituir la fuente primaria viva.
- `SPACE_PEOPLE_API` o `NEXT_PUBLIC_SPACE_PEOPLE_API` para agregar un endpoint custom compatible con Open Notify entre la primaria y Open Notify.
- `SPACE_PEOPLE_OPEN_NOTIFY_API` para sustituir la fuente secundaria Open Notify.
- `SPACE_PEOPLE_KV` como binding opcional de Cloudflare KV para last-known-good cache.
- `ISS_API`

## Last Known Good cache

`/api/space-people` puede usar Cloudflare KV como cache opcional y no obligatorio:

- Binding: `SPACE_PEOPLE_KV`.
- Key: `space-people:last-known-good`.
- TTL logico: 24h.
- Cuando una fuente live entrega payload valido, la function intenta guardar `people`, `number`, `message`, source live original, timestamp live, `savedAt` y `lastSuccessfulUpdate`.
- Si KV falla durante una respuesta live, la respuesta live no se rompe.
- Si todas las fuentes live fallan, la function intenta servir cache KV valido antes del fallback estatico.
- El cache nunca se marca como live: debe responder `status: "fallback"`, `source: "last-known-good-cache"` e `isFallback: true`.

La configuracion manual esta en `docs/cloudflare-kv-last-known-good.md`.

## Contrato de confiabilidad

Las respuestas de `/api/*` preservan metadata operativa para no ocultar degradaciones:

- `source`
- `isFallback`
- `status`
- `timestamp`
- `lastSuccessfulUpdate`
- `responseTime`
- `error`

`/api/space-people` solo debe devolver `isFallback: true` cuando todas las fuentes vivas fallan o regresan datos invalidos, o cuando sirve explicitamente el cache last-known-good como degradacion.

## Reglas de calidad de `/api/space-people`

- Las fuentes se declaran en un registry interno.
- Cada fuente tiene adapter/normalizer propio.
- La respuesta se deduplica por nombre normalizado.
- El conteo final live debe coincidir con `people.length`; si una fuente reporta `number` inconsistente, se rechaza y se intenta la siguiente fuente.
- Si una fuente live no entrega nave/estacion, se usa `Unknown spacecraft`; no se inventa craft.
- El last-known-good cache es degradado y conserva `lastSuccessfulUpdate` del dato live original.
- El fallback estatico es un snapshot fechado y nunca debe tratarse como dato actual.

## Documentacion relacionada

- `docs/api-data-reliability-contract.md`
- `docs/space-people-source-audit.md`
- `docs/cloudflare-kv-last-known-good.md`

## Notas

- Al usar `/api/*`, el cliente evita problemas de CORS.
- El sistema incluye fallback y cache para evitar bloqueos y reducir llamadas.
- El fallback estatico no debe tratarse como dato actual.
- No hay Supabase, Core DB, base de datos tradicional, secrets ni analytics para esta historia.
