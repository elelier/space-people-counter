# Cloudflare Workers - Referencia Rápida

## Comandos Esenciales

```bash
# Desarrollo local
npm run dev              # Next.js dev en localhost:3000

# Cloudflare Workers
npm run build            # Build Next.js + OpenNext
npm run preview          # Prueba local Workers en localhost:8787
npm run deploy           # Deploya a Cloudflare Workers
```

## Primera vez en Cloudflare

1. **Autenticarse**:
   ```bash
   npx wrangler login
   ```

2. **Instalar dependencias**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Build y deploy**:
   ```bash
   npm run build
   npm run deploy
   ```

4. **Tu app estará en**:
   - `https://spacepeople.workers.dev` (subdominio por defecto)

## Comandos Útiles

```bash
# Ver logs en vivo
npx wrangler tail

# Listar deployments
npx wrangler deployments list

# Revertir a versión anterior
npx wrangler deployments rollback

# Agregar variable secreta
npx wrangler secret put MY_SECRET

# Listar variables secretas
npx wrangler secret list

# Borrar variable secreta
npx wrangler secret delete MY_SECRET

# Ver configuración del proyecto
npx wrangler publish --dry-run
```

## URLs Importantes

- **Dashboard**: https://dash.cloudflare.com/
- **Tu Worker**: https://spacepeople.workers.dev
- **API Health**: https://spacepeople.workers.dev/api/health
- **API Astronautas**: https://spacepeople.workers.dev/api/space-people
- **API ISS**: https://spacepeople.workers.dev/api/iss-location

## Archivo de Configuración

**wrangler.toml** - Configuración principal del Worker:

```toml
name = "spacepeople"
main = ".opennext/worker.js"
site = { bucket = ".opennext/static" }
```

## Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| "Module not found" | Revisa que no uses módulos Node.js en `app/api/*` |
| Tamaño de bundle grande | Usa dynamic imports o divide en múltiples Workers |
| Las imágenes no cargan | Verifica `remotePatterns` en `next.config.mjs` |
| 503 Service Unavailable | Ver logs con `npx wrangler tail` |
| Deploy timeout | Reduce tamaño del bundle o aumenta timeout en wrangler.toml |

## Documentación Completa

→ Ver [docs/DEPLOY_CLOUDFLARE.md](DEPLOY_CLOUDFLARE.md)

## CI/CD (Próximo paso)

Para auto-deploy desde GitHub, crear `.github/workflows/deploy.yml` con:

```yaml
- run: npm run build
- run: npm run deploy
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

---

**¿Necesitas ayuda?** Consulta:
- Docs de OpenNext: https://opennext.js.org/
- Docs de Wrangler: https://developers.cloudflare.com/workers/wrangler/
- Community: https://community.cloudflare.com/
