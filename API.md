# Documentación de Integración de Datos - Space People Counter

## Fuentes de datos

Este proyecto es 100% estático. Los datos se consumen directamente desde APIs públicas en el cliente:

- **Open Notify**: `https://api.open-notify.org/astros.json` (personas en el espacio)
- **Where the ISS at?**: `https://api.wheretheiss.at/v1/satellites/25544` (ubicación ISS)

## Configuración (opcional)

Puedes sobreescribir los endpoints con variables de entorno:

- `NEXT_PUBLIC_SPACE_PEOPLE_API`
- `NEXT_PUBLIC_ISS_API`

Estas variables se resuelven en build time (export estático).

## Notas

- Si alguna API no permite CORS, necesitarás un proxy (por ejemplo, Cloudflare Worker).
- El sistema incluye fallback y caché en cliente para evitar bloqueos y reducir llamadas.
