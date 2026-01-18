# OpenNext Build Output - Estructura

Cuando ejecutas `npm run build`, OpenNext genera la siguiente estructura en `.opennext/`:

```
.opennext/
├── worker.js              # 🔴 Worker principal de Cloudflare (punto de entrada)
├── static/                # 📁 Archivos estáticos (CSS, JS, imágenes)
│   ├── index.html
│   ├── _next/
│   │   ├── static/
│   │   │   ├── chunks/
│   │   │   │   ├── main-HASH.js
│   │   │   │   └── ...
│   │   │   └── css/
│   │   │       └── styles-HASH.css
│   │   ├── image-HASH.json
│   │   └── ...
│   ├── public/            # Archivos públicos (imágenes, iconos, etc.)
│   ├── robots.txt
│   ├── sitemap.xml
│   └── ...
├── server/                # 📁 Código servidor compilado
│   ├── pages.js
│   ├── routes.js
│   └── ...
├── config.json            # ⚙️ Configuración compilada
└── package.json           # 📦 Dependencias de runtime
```

## 📍 Archivos Clave

### `worker.js`
```typescript
// Este es el archivo que Cloudflare ejecuta
// No necesitas tocarlo, es generado automáticamente

// Maneja:
// - Rutas de tu aplicación (pages)
// - API routes (/api/*)
// - Assets estáticos
// - SSR cuando es necesario
```

**Ubicación en wrangler.toml**:
```toml
main = ".opennext/worker.js"
```

### `static/` (Assets)
- Archivos CSS, JavaScript y fuentes compilados
- Imágenes optimizadas por Next.js
- Se sirven directamente desde Cloudflare CDN
- Caché global automático

**Configuración en wrangler.toml**:
```toml
site = { bucket = ".opennext/static" }
```

### `server/`
- Código transpilado de tus route handlers
- Funciones de servidor compiladas
- Compatibles con Cloudflare Workers

## 🔄 Flujo de Build

```
npm run build
    ↓
Next.js compilation (.next/)
    ↓
OpenNext transformation (.opennext/)
    ↓
[.opennext/]
├── worker.js        ← Ejecutar en Cloudflare
├── static/          ← Servir como assets
└── server/          ← Lógica de servidor
    ↓
npm run preview / npm run deploy
    ↓
Wrangler lee wrangler.toml
    ↓
Sube a Cloudflare Workers
```

## 📦 En Producción

Cuando hace deploy con `npm run deploy`:

1. **worker.js** se sube como Worker Script
2. **static/** se distribuye en el CDN global de Cloudflare
3. **Requests** se enrutan:
   - Assets estáticos → CDN (caché)
   - API routes → Worker (dinámico)
   - Pages SSR → Worker (cuando es necesario)

## 🔒 Nota de Seguridad

- ❌ **NO** commites `.opennext/` a git (archivo generado)
- ✅ **SÍ** commites `wrangler.toml` y `.opennext.config.ts`

Agrega a `.gitignore`:
```bash
echo ".opennext/" >> .gitignore
```

## 📊 Tamaño Típico

```
.opennext/worker.js      ~2-5 MB
.opennext/static/        ~1-3 MB
Total                    ~3-8 MB
```

Si es muy grande:
- Revisa `TROUBLESHOOTING.md`
- Optimiza dependencias
- Usa dynamic imports

## 🧪 Verificar Salida

```bash
# Ver qué se generó
ls -la .opennext/

# Ver tamaño del worker
du -h .opennext/worker.js

# Listar assets estáticos
find .opennext/static -type f | head -20
```

## 🔗 Relación con wrangler.toml

```toml
# 1. Le decimos dónde está el worker
main = ".opennext/worker.js"

# 2. Le decimos dónde están los assets estáticos
site = { bucket = ".opennext/static" }

# 3. Cloudflare automáticamente:
#    - Ejecuta worker.js en cada request
#    - Sirve static/* desde CDN
#    - Combina ambos para respuesta completa
```

## ⚙️ Configuración en Código

Si necesitas acceder a variables o configuración en el Worker:

```typescript
// En route handler
export async function GET(request: Request, { params }: any) {
  // Configuración compilada disponible automáticamente
  const env = process.env.ENVIRONMENT || 'production';
  
  // Secrets se pasan a través de Cloudflare
  const secret = await env.MY_SECRET; // Si la configuraste
  
  return NextResponse.json({ env, secret });
}
```

## 📝 Cambios Entre Builds

```bash
# Ver qué cambió
git diff .opennext/

# O simplemente:
npm run build    # Sobrescribe automáticamente
```

## 🚀 Ejemplo Completo

```bash
# 1. Compilar
npm run build

# 2. Verificar salida
ls .opennext/worker.js      # ✓ Debe existir
ls .opennext/static/        # ✓ Debe tener archivos

# 3. Probar localmente
npm run preview
# Cloudflare simula:
# - worker.js maneja lógica
# - static/* sirve assets

# 4. Deploy
npm run deploy
# Sube todo a Cloudflare Workers
```

---

**Documento de referencia** para entender la estructura de salida de OpenNext.

Para más detalles → [docs/DEPLOY_CLOUDFLARE.md](docs/DEPLOY_CLOUDFLARE.md)
