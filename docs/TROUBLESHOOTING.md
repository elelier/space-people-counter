# Troubleshooting - Cloudflare Workers + OpenNext

Guía de solución de problemas comunes durante desarrollo y deployment.

## 🔴 Errores en Build

### Error: "Module not found: 'fs'"

```
Error: Module not found: 'fs'
```

**Causa**: Hay un import de módulo Node.js en el código.

**Solución**:

1. Busca dónde se importa `fs`:
   ```bash
   grep -r "from 'fs'" src/
   grep -r "from \"fs\"" src/
   grep -r "require('fs')" src/
   ```

2. Reemplaza con Web APIs:
   ```typescript
   // ❌ ANTES
   import fs from 'fs';
   const data = fs.readFileSync('file.txt', 'utf-8');

   // ✅ DESPUÉS
   const response = await fetch('/api/data');
   const data = await response.json();
   ```

3. Si necesitas leer archivos estáticos, usa:
   ```typescript
   // Archivos públicos en build time (no en runtime)
   import data from '@/public/data.json';
   ```

### Error: "Export not found in module"

```
Error: Export not found in module '@opennextjs/cloudflare'
```

**Causa**: Versión incompatible de OpenNext.

**Solución**:
```bash
# Reinstalar dependencia
npm uninstall @opennextjs/cloudflare
npm install @opennextjs/cloudflare@latest
```

### Error: Build timeout

```
Error: Build failed. The build timed out after 10 minutes.
```

**Causa**: El bundle es muy grande o hay operaciones lentas en build.

**Soluciones**:

1. **Optimizar imágenes**:
   ```typescript
   // next.config.mjs - reducir formatos
   images: {
     formats: ['image/webp'],  // Solo WebP
     // formats: ['image/webp', 'image/avif'],  // Si necesitas AVIF
   }
   ```

2. **Dynamic imports**:
   ```typescript
   // ❌ Importa todo en build
   import HeavyLibrary from 'heavy-lib';

   // ✅ Solo cuando se usa
   const HeavyLibrary = dynamic(() => import('heavy-lib'));
   ```

3. **Ver qué toma tiempo**:
   ```bash
   npm run build -- --profile
   ```

## 🔴 Errores en Runtime

### Error: "Cannot resolve 'fs' module"

```
Error: Cannot resolve 'fs' module at runtime
```

**Causa**: Código intenta usar `fs` dentro de un route handler.

**Solución**: Use Web APIs o KV storage:

```typescript
// ❌ NO FUNCIONA EN WORKERS
import fs from 'fs';
export async function GET() {
  const data = fs.readFileSync('data.json');
  return NextResponse.json(data);
}

// ✅ SOLUCIÓN 1: Web APIs
export async function GET() {
  const response = await fetch('https://api.example.com/data');
  return response;
}

// ✅ SOLUCIÓN 2: KV Storage (para datos persistentes)
export async function GET(request: Request, { params }: { params: { key: string } }) {
  const data = await env.CACHE_KV.get(params.key);
  return NextResponse.json({ data });
}
```

### Error: "503 Service Unavailable"

```
Response: 503 Service Unavailable
```

**Causas posibles**:

1. **API externa caída**:
   ```bash
   # Ver logs
   npx wrangler tail --filter "503"
   
   # Verificar APIs externas
   curl https://api.open-notify.org/astros.json
   curl https://api.wheretheiss.at/v1/satellites/25544
   ```

2. **Worker timeout**:
   - Aumenta timeout en wrangler.toml:
     ```toml
     [env.production]
     route = { pattern = "*.example.com", custom_domain = true, ttl = 3600 }
     ```

3. **Bundle muy grande**:
   ```bash
   # Ver tamaño
   ls -lh .opennext/worker.js
   ```
   Si > 10MB, optimizar dependencias.

### Error: "ReferenceError: env is not defined"

```
ReferenceError: env is not defined
```

**Causa**: Intentando acceder a variables de entorno sin contexto.

**Solución**:

```typescript
// ❌ INCORRECTO
export const API_KEY = env.MY_KEY;  // env no existe aquí

// ✅ CORRECTO
export async function GET(request: Request) {
  const apiKey = process.env.MY_KEY;  // O usar variable importada
  // ...
}

// ✅ PARA SECRETS DE CLOUDFLARE
export async function GET(request: Request, { params }: any) {
  const secret = await env.MY_SECRET;  // Dentro de handler
  // ...
}
```

### Imágenes no cargan (404)

```
Failed to load image from: https://...
Status: 404
```

**Soluciones**:

1. **Verificar remotePatterns**:
   ```typescript
   // next.config.mjs
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: 'ejemplo.com',  // Sin www, sin /
         pathname: '/**',
       }
     ]
   }
   ```

2. **HTTPS requerido**:
   ```javascript
   // ❌ NO
   hostname: 'ejemplo.com',
   protocol: 'http',  // No soportado

   // ✅ SÍ
   hostname: 'ejemplo.com',
   protocol: 'https',
   ```

3. **Wildcard para subdominios**:
   ```javascript
   // Para: cdn.ejemplo.com, img.ejemplo.com, etc.
   hostname: '**.ejemplo.com',
   ```

## 🟡 Problemas de Rendimiento

### Requests lentos

**Ver cuello de botella**:

```bash
# Logs con métricas de tiempo
npx wrangler tail --format json | jq '.logs | select(.duration > 5000)'
```

**Soluciones**:

1. **Cachear respuestas**:
   ```typescript
   export async function GET() {
     const data = await fetch('https://api.example.com/data', {
       next: { revalidate: 300 }  // Cache 5 min
     });
     return NextResponse.json(await data.json());
   }
   ```

2. **Usar KV para datos estáticos**:
   ```typescript
   // En build: guardar dato en KV
   // En runtime: leer desde KV (más rápido que fetch)
   const cachedData = await env.CACHE_KV.get('key');
   ```

3. **Reducir tamaño de bundle**:
   ```typescript
   // Tree-shaking: importar solo lo necesario
   import { map } from 'lodash-es';  // ✓ Mejor
   import _ from 'lodash';           // ✗ Más pesado
   ```

### Bundle size muy grande

```bash
# Ver tamaño actual
ls -lh .opennext/worker.js
```

**Si > 10MB**:

1. **Analizar qué ocupa espacio**:
   ```bash
   npm install -g webpack-bundle-analyzer
   npm run build -- --analyze
   ```

2. **Eliminar dependencias innecesarias**:
   ```bash
   npm list  # Ver todas
   npm prune  # Eliminar no usadas
   ```

3. **Usar bibliotecas más ligeras**:
   ```javascript
   // ❌ Pesado
   import moment from 'moment';

   // ✅ Ligero
   import { format } from 'date-fns';
   ```

## 🟡 Problemas de CORS

### Error: CORS policy blocked

```
Access to XMLHttpRequest at 'https://api.example.com' from origin
'https://spacepeople.workers.dev' has been blocked by CORS policy
```

**Soluciones**:

1. **Proxy a través del Worker**:
   ```typescript
   // Route handler que hace fetch en el servidor
   export async function GET(request: Request) {
     const response = await fetch('https://api.example.com/data');
     return response;
   }
   ```

2. **Configurar headers CORS**:
   ```typescript
   const response = new NextResponse(data);
   response.headers.set('Access-Control-Allow-Origin', '*');
   return response;
   ```

3. **En route handler**: No hay problema, el servidor hace el fetch directamente.

## ⚫ Problemas de Deployment

### Git push rechazado

```
error: failed to push some refs to 'origin'
```

**Solución**:
```bash
git pull origin main
git merge
npm run build
git push
```

### Deployment stuck en "Processing"

**Soluciones**:

1. **Cancelar y reintentar**:
   ```bash
   # Ctrl+C
   npm run deploy
   ```

2. **Ver logs de build**:
   ```bash
   npx wrangler deployments view --tail
   ```

3. **Rollback a versión anterior**:
   ```bash
   npx wrangler deployments rollback
   ```

## ✅ Debugging Efectivo

### 1. Habilitar logs detallados

```bash
# Logs en tiempo real con detalles
npx wrangler tail --format json
```

### 2. Logs locales en preview

```typescript
// En tus route handlers
export async function GET(request: Request) {
  console.log('Incoming request:', {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers),
  });
  
  // Ver en: npx wrangler tail
}
```

### 3. Test endpoint localmente

```bash
npm run preview
# En otra terminal
curl -v http://localhost:8787/api/space-people
```

## 🆘 Contactos y Recursos

| Problema | Recursos |
|----------|----------|
| OpenNext | https://github.com/idurar/open-next |
| Wrangler | https://developers.cloudflare.com/workers/wrangler/ |
| Workers | https://workers.cloudflare.com/ |
| Comunidad | https://community.cloudflare.com/ |
| Status | https://www.cloudflarestatus.com/ |

## 🔍 Verificación Rápida

Si todo falla, ejecuta esto:

```bash
# 1. Limpiar
rm -rf node_modules .opennext .next
npm install --legacy-peer-deps

# 2. Build
npm run build

# 3. Test local
npm run preview

# 4. Si falla, ver logs
npx wrangler tail --follow
```

---

¿No encuentras tu problema? Abre un issue con:
- Mensaje de error exacto
- Output de `npm run build`
- Output de `npm run preview` (si aplica)
- Tu versión de Node.js (`node -v`)
