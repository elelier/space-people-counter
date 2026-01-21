# 🚀 Guía Paso a Paso: Deploy en Cloudflare Pages

## Requisitos Previos
- Cuenta en Cloudflare (gratis)
- Repositorio en GitHub (ya tienes: elelier/space-people-counter)

---

## Paso 1: Acceder a Cloudflare Pages

1. Ve a https://dash.cloudflare.com/
2. Haz login con tu cuenta
3. En el menú lateral izquierdo, selecciona **"Workers & Pages"**
4. Haz clic en el botón **"Create application"**
5. Selecciona la pestaña **"Pages"**
6. Haz clic en **"Connect to Git"**

---

## Paso 2: Conectar tu Repositorio de GitHub

1. Haz clic en **"Connect GitHub"** o **"Connect to GitHub"**
2. Cloudflare te pedirá autorización para acceder a tu GitHub
3. Haz clic en **"Authorize Cloudflare-Pages"**
4. Selecciona:
   - **Opción A**: Dar acceso a todos los repositorios (más fácil)
   - **Opción B**: Solo al repositorio `space-people-counter` (más seguro)
5. Haz clic en **"Install & Authorize"**

---

## Paso 3: Seleccionar el Repositorio

1. Verás una lista de tus repositorios
2. Busca `elelier/space-people-counter`
3. Haz clic en **"Begin setup"**

---

## Paso 4: Configurar el Build

En la página de configuración, ingresa lo siguiente:

### **Project name**
```
space-people-counter
```
*(o el nombre que prefieras, debe ser único en Cloudflare)*

### **Production branch**
```
main
```

### **Framework preset**
Selecciona: **Next.js**

### **Build command**
```
npm run build
```

### **Build output directory**
```
.vercel/output/static
```

### **Root directory (optional)**
Déjalo vacío: `/`

---

## Paso 5: Variables de Entorno (Opcional)

Si necesitas variables de entorno:

1. Haz clic en **"Add variable"**
2. Agrega las siguientes (si las necesitas):

```
NEXT_PUBLIC_APP_NAME = Space People Counter
NEXT_PUBLIC_APP_DESCRIPTION = Real-time space people counter
ENVIRONMENT = production
```

**Nota**: Las variables `NEXT_PUBLIC_*` estarán disponibles en el cliente (navegador).

---

## Paso 6: Iniciar el Deploy

1. Revisa toda la configuración
2. Haz clic en **"Save and Deploy"**
3. Cloudflare comenzará a:
   - Clonar tu repositorio
   - Instalar dependencias (`npm install`)
   - Ejecutar el build (`npm run build`)
   - Desplegar la aplicación

**Tiempo estimado**: 2-5 minutos

---

## Paso 7: Monitorear el Deploy

Verás una pantalla con logs en tiempo real:

```
✓ Cloning repository
✓ Installing dependencies
✓ Building application
✓ Deploying to Cloudflare Pages
```

Si todo sale bien, verás:
```
✅ Success! Your site is live!
```

---

## Paso 8: Acceder a tu Aplicación

Una vez completado, verás:

### **URL de tu aplicación**:
```
https://space-people-counter-xxx.pages.dev
```

*(xxx será un identificador único generado por Cloudflare)*

### **Acciones disponibles**:
- **Visit site**: Ver tu app en vivo
- **View build log**: Ver logs del deploy
- **Manage deployments**: Ver historial de deployments

---

## Paso 9: Configurar Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio:

1. Ve a tu proyecto en Cloudflare Pages
2. Selecciona la pestaña **"Custom domains"**
3. Haz clic en **"Set up a custom domain"**
4. Ingresa tu dominio: `spacepeople.tudominio.com`
5. Cloudflare te dará instrucciones para:
   - Agregar un registro CNAME en tu DNS
   - O transferir tu dominio a Cloudflare (más fácil)

---

## Paso 10: Auto-Deploy (Ya Configurado)

**¡Buenas noticias!** Cada vez que hagas un `git push` a la rama `main`, Cloudflare automáticamente:

1. Detectará los cambios
2. Ejecutará un nuevo build
3. Desplegará la nueva versión

**No necesitas hacer nada más.**

---

## 🎯 Resumen de Configuración Final

| Configuración | Valor |
|---------------|-------|
| **Framework** | Next.js |
| **Build Command** | `npm run build` |
| **Output Directory** | `.vercel/output/static` |
| **Node Version** | 18+ (automático) |
| **Branch** | main |

---

## 🔧 Comandos para Desarrollo Local

```bash
# Desarrollo local (Next.js tradicional)
npm run dev
# → http://localhost:3000

# Build para producción
npm run build

# Preview local con Cloudflare Workers
npm run preview
# → http://localhost:8788

# Deploy manual (desde línea de comandos)
npm run deploy
# Requiere: npx wrangler login
```

---

## 📊 Panel de Control de Cloudflare Pages

En el dashboard podrás:

- ✅ Ver todas las deployments
- ✅ Ver logs de cada build
- ✅ Rollback a versiones anteriores
- ✅ Ver métricas de uso (requests, bandwidth)
- ✅ Configurar dominios personalizados
- ✅ Configurar variables de entorno
- ✅ Ver Analytics en tiempo real

---

## 🚨 Troubleshooting

### Build Falla

**Ver logs completos**:
1. En Cloudflare Pages, haz clic en el deployment fallido
2. Haz clic en **"View build log"**
3. Busca el error específico

**Errores comunes**:

#### "Module not found"
```bash
# Solución: Verificar que todas las dependencias están en package.json
npm install
npm run build  # Probar localmente primero
```

#### "Build timeout"
```bash
# Solución: El build tarda mucho
# Cloudflare Pages tiene timeout de 20 minutos
```

#### "Invalid wrangler.toml"
```bash
# Solución: Verificar sintaxis TOML
# Tu wrangler.toml actual debería funcionar
```

---

## ✨ Funcionalidades Incluidas

Tu aplicación en Cloudflare Pages tendrá:

- ✅ **CDN Global**: Servido desde 300+ ubicaciones
- ✅ **HTTPS automático**: SSL/TLS configurado
- ✅ **Auto-deploy**: Cada push deploya automáticamente
- ✅ **Preview deployments**: Branches y PRs tienen URLs únicas
- ✅ **Rollback instantáneo**: Vuelve a versiones anteriores en 1 clic
- ✅ **Analytics**: Métricas de tráfico y rendimiento
- ✅ **DDoS protection**: Protección automática
- ✅ **100GB bandwidth/mes**: En plan gratuito
- ✅ **500 builds/mes**: En plan gratuito

---

## 🔗 URLs Útiles

- **Dashboard Cloudflare**: https://dash.cloudflare.com/
- **Docs Next.js on Pages**: https://developers.cloudflare.com/pages/framework-guides/nextjs/
- **Documentación Pages**: https://developers.cloudflare.com/pages/
- **Community Forum**: https://community.cloudflare.com/

---

## 🎉 ¡Listo!

Tu aplicación **Space People Counter** estará disponible en:

```
https://space-people-counter-xxx.pages.dev
```

**Cada push a `main` desplegará automáticamente.**

No necesitas crear Workers manualmente - Cloudflare Pages lo maneja todo.

---

**Última actualización**: 20 de enero 2026
