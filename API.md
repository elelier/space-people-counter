# Documentación de Integración de Datos - Space People Counter

## Fuentes de datos

Este proyecto es estático y usa **Cloudflare Pages Functions** para `/api/*`.

- **/api/space-people** → Open Notify (`https://api.open-notify.org/astros.json`)
- **/api/iss-location** → Where the ISS at? (`https://api.wheretheiss.at/v1/satellites/25544`)
- **/api/health** → checks de salud de APIs externas

## Configuración (opcional)

Puedes sobreescribir los endpoints de las functions con variables de entorno en Cloudflare:

- `SPACE_PEOPLE_API`
- `ISS_API`

## Notas

- Al usar `/api/*`, el cliente evita problemas de CORS.
- El sistema incluye fallback y caché para evitar bloqueos y reducir llamadas.
