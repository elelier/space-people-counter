# Documentación de Integración de Datos - Space People Counter

## Fuentes de datos

Este proyecto es estático y usa **Cloudflare Pages Functions** para `/api/*`.

- **/api/space-people** → cadena multi-source:
  1. Launch Library 2 / The Space Devs (`https://ll.thespacedevs.com/2.3.0/astronauts/?in_space=true&limit=100`) como fuente primaria viva (`source: launch-library-2`).
  2. Endpoint custom opcional (`SPACE_PEOPLE_API` o `NEXT_PUBLIC_SPACE_PEOPLE_API`) como fuente intermedia (`source: custom-space-people-api`).
  3. Open Notify (`https://api.open-notify.org/astros.json`) como fuente secundaria (`source: open-notify`).
  4. Fallback estático sólo como último recurso (`source: static-fallback`, `isFallback: true`).
- **/api/iss-location** → Where the ISS at? (`https://api.wheretheiss.at/v1/satellites/25544`)
- **/api/health** → checks de salud de APIs externas

## Configuración (opcional)

Puedes sobreescribir los endpoints de las functions con variables de entorno en Cloudflare:

- `SPACE_PEOPLE_PRIMARY_API` para sustituir la fuente primaria viva.
- `SPACE_PEOPLE_API` o `NEXT_PUBLIC_SPACE_PEOPLE_API` para agregar un endpoint custom compatible con Open Notify entre la primaria y Open Notify.
- `SPACE_PEOPLE_OPEN_NOTIFY_API` para sustituir la fuente secundaria Open Notify.
- `ISS_API`

## Contrato de confiabilidad

Las respuestas de `/api/*` preservan metadata operativa para no ocultar degradaciones:

- `source`
- `isFallback`
- `status`
- `timestamp`
- `lastSuccessfulUpdate`
- `responseTime`
- `error`

`/api/space-people` sólo debe devolver `isFallback: true` cuando todas las fuentes vivas fallan o regresan datos inválidos.

## Notas

- Al usar `/api/*`, el cliente evita problemas de CORS.
- El sistema incluye fallback y caché para evitar bloqueos y reducir llamadas.
- El fallback estático no debe tratarse como dato actual.
