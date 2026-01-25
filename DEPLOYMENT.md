# Guía de Desarrollo y Deployment - Space People Counter

## 🚀 Desarrollo Local

### Iniciar servidor de desarrollo
```bash
npm run dev
```
El servidor estará disponible en `http://localhost:3000`

### Cómo probar
- **Página principal**: http://localhost:3000
- **Datos en vivo**: se consumen directamente desde APIs públicas en el cliente

### Linter
```bash
npm run lint
```

### Type checking
```bash
npm run type-check
```

---

## 🌐 Deployment en GitHub Pages + Cloudflare

### Requisitos previos
1. Repositorio en GitHub
2. Dominio en Cloudflare (opcional, recomendado)

### GitHub Pages (build automático)

El workflow `.github/workflows/pages.yml`:
1. Ejecuta `npm ci`
2. Ejecuta `npm run build` (genera `out/`)
3. Publica `out/` en GitHub Pages

### Dominio personalizado con Cloudflare
1. En Cloudflare DNS, crea un CNAME `spacepeople` → `<tu-usuario>.github.io`
2. Activa el proxy (nube naranja)
3. SSL: **Full**
4. El archivo `public/CNAME` ya incluye `spacepeople.elelier.com`

---

## 📝 Notas Importantes

- La exportación estática genera la carpeta `out/`.
- Para builds locales, usa `NODE_ENV=production npm run build` si tienes un `NODE_ENV` no estándar.
- El archivo `public/.nojekyll` evita que GitHub Pages ignore `_next/`.

---

## 🔧 Archivos de Configuración

| Archivo | Propósito |
|---------|-----------|
| `.github/workflows/pages.yml` | Deploy automático a GitHub Pages |
| `next.config.mjs` | Configuración de export estático |
| `public/CNAME` | Dominio personalizado |
| `public/.nojekyll` | Compatibilidad con `_next/` |
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

### "404 - Página no encontrada" en GitHub Pages
1. Verifica que el workflow publique `out/`
2. Asegúrate de que `public/.nojekyll` exista
3. Revisa el entorno de GitHub Pages (Settings → Pages)

### Problemas de CORS con APIs públicas
- Si una API no permite CORS, necesitarás un proxy (por ejemplo, Cloudflare Worker).

---

## 📚 Recursos

- Documentación de GitHub Pages
- Documentación de Cloudflare DNS
- Documentación de Next.js (Static Export)

---

**Última actualización**: 2026-01-25
