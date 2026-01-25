# Configuración rápida: Cloudflare Pages

## 1) Crear proyecto en Pages
1. En Cloudflare, ve a Pages y crea un proyecto
2. Conecta el repositorio

## 2) Configurar build
- Build command: `npm run build`
- Output directory: `out`
- Functions directory: `functions` (auto-detectado)

## 3) Variables de entorno (opcional)
- `SPACE_PEOPLE_API`
- `ISS_API`

## 4) Dominio personalizado
1. En Pages -> Custom Domains, agrega `spacepeople.elelier.com`
2. Configura los DNS según indique Cloudflare
3. SSL/TLS: **Full** (o recomendado por Cloudflare)

## 5) Verificación rápida
- `https://spacepeople.elelier.com` carga correctamente
- `/api/health` responde JSON
