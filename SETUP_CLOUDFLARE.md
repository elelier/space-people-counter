# Configuración rápida: Cloudflare (DNS + CDN)

## 1) Añadir el dominio
1. En Cloudflare, agrega `elelier.com` si no está añadido
2. Confirma que los nameservers estén apuntando a Cloudflare

## 2) Crear el DNS para GitHub Pages
1. En **DNS**, crea un registro:
   - **Type**: CNAME
   - **Name**: `spacepeople`
   - **Target**: `<tu-usuario>.github.io`
   - **Proxy**: ON (nube naranja)

## 3) SSL/TLS
1. Ve a **SSL/TLS**
2. Selecciona **Full**

## 4) Revisar el dominio personalizado
1. En GitHub Pages, verifica que el dominio esté configurado
2. Deja `public/CNAME` con `spacepeople.elelier.com`

## 5) (Opcional) Cache recomendado
- Cachear `_next/static/*` por largo tiempo
- Evitar cache agresivo para HTML

## 6) Verificación rápida
- `https://spacepeople.elelier.com` carga correctamente
