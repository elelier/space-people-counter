# Guía de Deployment en Cloudflare Workers con OpenNext

Esta guía te ayudará a desplegar la aplicación Space People Counter en Cloudflare Workers usando OpenNext, un adaptador que convierte aplicaciones Next.js en Workers sin necesidad de reescribir código.

## Requisitos Previos

- Cuenta en [Cloudflare](https://www.cloudflare.com/)
- Node.js 18+ instalado
- Git configurado
- Acceso a línea de comandos

## Instalación Local de Dependencias

Las dependencias ya están configuradas en `package.json`. Para instalar:

```bash
npm install --legacy-peer-deps
```

**Dependencias clave para Cloudflare:**
- `@opennextjs/cloudflare`: Adaptador OpenNext para Cloudflare Workers
- `wrangler`: CLI de Cloudflare para desarrollar y desplegar Workers

## Estructura de Build

El flujo de build funciona así:

```
npm run build → Next.js build → OpenNext compilation
  ↓
.opennext/worker.js → Worker script
.opennext/static/ → Archivos estáticos
  ↓
wrangler.toml → Configuración de Workers
  ↓
Cloudflare Workers
```

## Pasos de Deployment

### 1. Autenticación con Cloudflare

```bash
npx wrangler login
```

Esto abrirá tu navegador para autenticar. Cloudflare guardará el token en `~/.wrangler/config.toml`.

### 2. Configurar Variables de Entorno

Crear archivo `.env.production`:

```bash
ENVIRONMENT=production
NEXT_PUBLIC_APP_URL=https://spacepeople.workers.dev
NEXT_PUBLIC_DEPLOYMENT_PLATFORM=cloudflare-workers
```

Para variables secretas (si las necesitas):

```bash
npx wrangler secret put YOUR_SECRET_NAME
```

Ejemplo para una API key:
```bash
npx wrangler secret put EXTERNAL_API_KEY
```

Luego acceder en tu código:
```typescript
const apiKey = env.EXTERNAL_API_KEY;
```

### 3. Compilación Local

```bash
npm run build
```

Esto ejecutará:
1. `next build` - Construye la aplicación Next.js
2. OpenNext compilará el resultado a `.opennext/`

### 4. Prueba Local con Preview

```bash
npm run preview
```

Esto ejecuta:
1. `opennextjs-cloudflare` - Compila OpenNext si es necesario
2. `wrangler dev` - Inicia servidor local en `http://localhost:8787`

Puedes probar las rutas localmente:
- `http://localhost:8787/` - Página principal
- `http://localhost:8787/api/space-people` - API de astronautas
- `http://localhost:8787/api/iss-location` - API de ubicación ISS
- `http://localhost:8787/api/health` - Health check

### 5. Deployment a Producción

```bash
npm run deploy
```

Esto ejecuta:
1. `opennextjs-cloudflare` - Compila a `.opennext/`
2. `wrangler deploy` - Deploya a Cloudflare Workers

Tu aplicación estará disponible en:
- `https://spacepeople.workers.dev`
- O en tu dominio personalizado (ver sección siguiente)

## Configuración de Dominio Personalizado

### Opción A: Usando un Dominio en Cloudflare

Si tu dominio ya está administrado en Cloudflare:

1. Ve al Dashboard de Cloudflare → Selecciona tu dominio
2. Navega a **Workers & Pages** → **Space People** → **Settings**
3. En "Routes", haz clic en **Add route**
4. Ingresa tu dominio: `spacepeople.example.com`
5. Selecciona la zona (tu dominio) de la lista

### Opción B: Apuntar Dominio Externo

Si tu dominio está en otro registrador:

1. En Cloudflare, obtén el CNAME del Worker:
   - Dashboard → Workers → Space People → Share
   - El CNAME es algo como: `spacepeople-abc.workers.dev`

2. En tu registrador de dominio:
   - Crea un record CNAME:
     ```
     Nombre: spacepeople
     Valor: spacepeople-abc.workers.dev
     ```

3. Espera 24-48h para propagación de DNS

### Opción C: Usando Cloudflare Pages (Alternativa)

Para un setup más simple, puedes usar Cloudflare Pages:

1. Conecta tu repositorio de GitHub
2. Framework: Next.js
3. Build command: `npm run build`
4. Build output directory: `.opennext/static`

Sin embargo, **OpenNext + Workers es la opción recomendada** para mayor control.

## Variables de Entorno en Cloudflare

### Variables Públicas (Accesibles desde el navegador)

Se definen en `wrangler.toml` bajo `[env.production.vars]`:

```toml
[env.production.vars]
NEXT_PUBLIC_APP_NAME = "Space People Counter"
NEXT_PUBLIC_APP_DESCRIPTION = "Real-time space people counter"
```

### Secrets (Variables Privadas)

Para información sensible:

```bash
npx wrangler secret put MY_SECRET_KEY
npx wrangler secret put EXTERNAL_API_TOKEN
```

Acceso en el código (solo lado servidor):
```typescript
// En route handlers (app/api/*)
const secret = env.MY_SECRET_KEY;
```

Ver todos los secrets:
```bash
npx wrangler secret list
```

Borrar un secret:
```bash
npx wrangler secret delete MY_SECRET_KEY
```

## Monitoreo y Logs

### Ver logs en tiempo real

```bash
npx wrangler tail
```

### Ver últimas invocaciones

```bash
npx wrangler deployments list
```

### Detalles de un deployment

```bash
npx wrangler deployments view <DEPLOYMENT_ID>
```

## Solución de Problemas

### Error: "Module not found: 'fs'"

**Problema**: Cloudflare Workers no soporta módulos Node.js como `fs`, `path`, etc.

**Solución**: 
- Reemplaza `fs` con Web APIs (Fetch, etc.)
- Usa `nodejs_compat` en `wrangler.toml` (ya configurado)
- Migra datos a un servicio externo si es necesario

Verifica si hay imports nodosos:
```bash
grep -r "import.*from.*['\"]fs['\"]" src/
grep -r "import.*from.*['\"]path['\"]" src/
```

### Error: "Maximum bundle size exceeded"

**Problema**: El Worker es muy grande.

**Soluciones**:
1. Usa dynamic imports:
   ```typescript
   const module = await import('some-large-lib');
   ```

2. Divide en múltiples Workers

3. Mueve lógica pesada a un servicio externo

### Route handlers no funcionan

**Verificar**:
1. ¿El archivo está en `app/api/*/route.ts`? ✓
2. ¿Usas Web APIs (fetch)? ✓
3. ¿Sin imports node-only? ✓
4. Ver logs: `npx wrangler tail`

### Imágenes no cargan

**Verificar**:
1. Los hosts están en `remotePatterns` en `next.config.mjs`
2. Las URLs son HTTPS
3. No hay CORS issues

Hosts actualmente permitidos:
- `upload.wikimedia.org`
- `cdn-icons-png.flaticon.com`
- `**.githubusercontent.com`

Añadir nuevos hosts en `next.config.mjs`:
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'new-domain.com',
      pathname: '/**',
    },
  ],
}
```

## Optimizaciones para Cloudflare

### 1. Caché de Assets Estáticos

Configurado en `wrangler.toml`:
```toml
site = { bucket = ".opennext/static" }
```

Los archivos estáticos se cachean automáticamente en la red global de Cloudflare.

### 2. Revalidación de ISR (Incremental Static Regeneration)

Para actualizaciones periódicas sin rebuild completo:

```typescript
// En app/page.tsx
export const revalidate = 3600; // Revalidar cada hora
```

### 3. Usar KV para Cache Distribuido

Si necesitas cache global distribuido:

```bash
npx wrangler kv:namespace create "CACHE_KV"
npx wrangler kv:namespace create "CACHE_KV" --preview
```

Luego en `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "CACHE_KV"
id = "tu-namespace-id"
preview_id = "tu-preview-id"
```

## CI/CD con GitHub Actions

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm install --legacy-peer-deps
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        run: npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

Necesitas agregar estos secrets en GitHub:
1. Settings → Secrets and variables → Actions
2. `CLOUDFLARE_API_TOKEN`: Tu token de Cloudflare
3. `CLOUDFLARE_ACCOUNT_ID`: Tu ID de cuenta (en Dashboard)

## Rollback a Versión Anterior

Si algo sale mal después de un deploy:

```bash
npx wrangler deployments rollback
```

Esto revierte al último deployment exitoso.

## Alternativas y Recursos

- **Documentación oficial OpenNext**: https://opennext.js.org/
- **Documentación Wrangler**: https://developers.cloudflare.com/workers/wrangler/
- **Cloudflare Workers**: https://workers.cloudflare.com/
- **Foro Cloudflare**: https://community.cloudflare.com/

## Preguntas Frecuentes

**P: ¿Costo?**
R: Cloudflare Workers tiene un plan gratuito con 100k requests/día. Después es $0.50/millón de requests.

**P: ¿Velocidad comparada con Netlify?**
R: Cloudflare Workers generalmente es más rápido por su infraestructura global de edge.

**P: ¿Puedo usar mi propia base de datos?**
R: Sí. Usa credenciales en secrets y fetch a tu API desde route handlers.

**P: ¿Funciona con ISR (Incremental Static Regeneration)?**
R: Parcialmente. Usa `revalidate` pero sin rebuild automático.

**P: ¿Soporte para WebSockets?**
R: Sí, a través de Durable Objects (requiere plan pago).

---

**Última actualización**: enero 2026
