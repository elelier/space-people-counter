# Guía de Desarrollo y Deployment - Space People Counter

## 🚀 Desarrollo Local

### Iniciar servidor de desarrollo
```bash
npm run dev
```
El servidor estará disponible en `http://localhost:3000`

### Cómo probar
- **Página principal**: http://localhost:3000
- **Datos en vivo**: se consumen desde `/api/*` (Pages Functions)

### Linter
```bash
npm run lint
```

### Type checking
```bash
npm run type-check
```

---

## 🌐 Deployment en Cloudflare Pages (static + functions)

### Requisitos previos
1. Repositorio en GitHub/GitLab
2. Cuenta en Cloudflare

### Cloudflare Pages
1. Crea un proyecto en Pages y conecta el repo.
2. Build command: `npm run build`
3. Output directory: `out`
4. Functions directory: `functions` (auto-detectado)
5. (Opcional) Variables de entorno:
   - `SPACE_PEOPLE_API`
   - `ISS_API`

### Dominio personalizado
1. En Pages, agrega el dominio en Custom Domains.
2. Configura el DNS (CNAME/ALIAS) según indique Cloudflare.
3. SSL: **Full** (o el recomendado por Cloudflare)

---

## 📝 Notas Importantes

- La exportación estática genera la carpeta `out/`.
- Las Pages Functions viven en `functions/api/*` y responden a `/api/*`.
- Para builds locales, usa `NODE_ENV=production npm run build` si tienes un `NODE_ENV` no estándar.
- Para probar UI + funciones: `npx wrangler pages dev out --compatibility-date=2025-01-01`.

---

## 🔧 Archivos de Configuración

| Archivo | Propósito |
|---------|-----------|
| `wrangler.toml` | Config de Pages dev y output |
| `functions/api/*.ts` | Pages Functions para `/api/*` |
| `next.config.mjs` | Configuración de export estático |
| `public/_headers` | Headers de Cloudflare Pages |
| `.env.example` | Variables de entorno de ejemplo |

---

## 🧪 Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para export estático
npm run start        # Ejecutar build de producción (no recomendado en export)
npm run lint         # Linter ESLint
npm run type-check   # Verificar tipos TypeScript
npm run build:analyze # Analizar tamaño del build
```

---

## 🧰 Solución de problemas

### "404 /api/*" en local
1. Ejecuta `npm run build` y luego `npx wrangler pages dev out --compatibility-date=2025-01-01`
2. Verifica que exista `functions/api/*`

### Problemas de CORS con APIs públicas
- Usa `/api/*` (Pages Functions) para evitar CORS en el cliente.

---

## 📚 Recursos

- Documentación de Cloudflare Pages
- Documentación de Cloudflare Pages Functions
- Documentación de Next.js (Static Export)

---

**Última actualización**: 2026-01-25
