# Checklist de Compatibilidad Cloudflare Workers

Use este checklist para verificar que el código sea totalmente compatible con Cloudflare Workers.

## ✅ Compatibilidad Verificada

- [x] No hay imports de módulos Node.js (`fs`, `path`, `os`, `crypto`, `zlib`, `stream`, `child_process`)
- [x] Todos los API routes están en `app/api/*` (Route Handlers)
- [x] Los route handlers usan Web APIs estándar (`fetch`, `NextResponse`)
- [x] Las imágenes remotas están permitidas en `next.config.mjs`
- [x] No hay dependencia de Netlify

## 📋 Verificar Antes de Deploy

### 1. Código Limpio

```bash
# Buscar importaciones nodosas (deben dar 0 resultados)
grep -r "from 'fs'" src/
grep -r "from 'path'" src/
grep -r "from 'os'" src/
grep -r "from 'crypto'" src/
grep -r "from 'child_process'" src/
```

**Resultado esperado**: Sin coincidencias

### 2. Build Local

```bash
npm run build
```

**Resultado esperado**: No hay errores, `.opennext/` se creó

### 3. Preview Local

```bash
npm run preview
```

**Resultado esperado**: Worker ejecutándose en `localhost:8787`

### 4. Test de APIs

```bash
# Abrir en navegador o usar curl
curl http://localhost:8787/api/space-people
curl http://localhost:8787/api/iss-location
curl http://localhost:8787/api/health
```

**Resultado esperado**: Todas las rutas responden correctamente

## 🔍 Checklist de Route Handlers

Para cada archivo en `src/app/api/*/route.ts`:

- [ ] Usa `NextResponse` para respuestas
- [ ] No importa módulos Node.js
- [ ] Usa Web APIs (`fetch`, `AbortController`, etc.)
- [ ] No accede al sistema de archivos
- [ ] Exporta funciones nombradas (GET, POST, PUT, DELETE, etc.)
- [ ] Tiene `export const dynamic = 'force-dynamic'` si no cachea

### Plantilla Segura

```typescript
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Solo Web APIs
    const data = await fetch('https://api.example.com/data', {
      cache: 'no-store'
    });
    
    return NextResponse.json(await data.json());
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed' },
      { status: 500 }
    );
  }
}
```

## 🖼️ Checklist de Imágenes

- [ ] Todos los dominios de imágenes están en `next.config.mjs` bajo `remotePatterns`
- [ ] Las URLs de imágenes usan HTTPS
- [ ] No hay imágenes locales en `public/` que usen Image Optimization

### Hosts Permitidos Actualmente

```javascript
// next.config.mjs
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/**' },
    { protocol: 'https', hostname: 'cdn-icons-png.flaticon.com', pathname: '/**' },
    { protocol: 'https', hostname: '**.githubusercontent.com', pathname: '/**' }
  ],
}
```

Para agregar nuevos:
```javascript
{
  protocol: 'https',
  hostname: 'tu-dominio.com',
  pathname: '/**',
}
```

## 🌍 Checklist de Variables de Entorno

- [ ] Las variables públicas (`NEXT_PUBLIC_*`) están documentadas
- [ ] Las variables privadas usa `npx wrangler secret put`
- [ ] `.env.example` está actualizado
- [ ] No hay secrets hardcodeados en el código

### Variables Actuales

**Públicas (en wrangler.toml)**:
```toml
[env.production.vars]
ENVIRONMENT = "production"
```

**Privadas (si las necesitas)**:
```bash
npx wrangler secret put EXTERNAL_API_KEY
```

## 📦 Checklist de Dependencias

```bash
# Estas dependencias deben estar instaladas
npm ls @opennextjs/cloudflare  # ✓ Debe existir
npm ls wrangler                # ✓ Debe existir
npm ls next                     # ✓ Debe ser 15+
npm ls react                    # ✓ Debe ser 18+
```

## 🚀 Checklist Pre-Deploy

- [ ] `npm run build` ejecuta sin errores
- [ ] `npm run preview` funciona localmente
- [ ] Todas las API routes responden en preview
- [ ] No hay errores en `npx wrangler tail` durante preview
- [ ] El tamaño del bundle es razonable (< 10MB idealmente)
- [ ] Las imágenes cargan correctamente en preview
- [ ] Los datos del cache funcionan (ISS location, astronautas)

## ✅ Listo para Deploy

Si todo está ✓, puedes hacer:

```bash
npm run deploy
```

Y tu app estará en: **https://spacepeople.workers.dev**

## 🆘 Si Algo Falla

1. **Ver logs en tiempo real**:
   ```bash
   npx wrangler tail --follow
   ```

2. **Buscar errores comunes**:
   - ¿Hay módulos Node.js importados?
   - ¿Las variables de entorno están configuradas?
   - ¿El bundle es muy grande?

3. **Rollback rápido**:
   ```bash
   npx wrangler deployments rollback
   ```

4. **Pedir ayuda**:
   - Comunidad Cloudflare: https://community.cloudflare.com/
   - GitHub Issues: Abre un issue en tu repo

---

Última verificación: enero 2026 ✓
