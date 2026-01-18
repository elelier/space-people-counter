# 🚀 Space People Counter

Una aplicación web moderna que muestra en tiempo real cuántas personas están actualmente en el espacio exterior, sus misiones activas y la ubicación de la Estación Espacial Internacional (ISS).

## ✨ Características

- 🧑‍🚀 **Contador en tiempo real** de personas en el espacio
- 🚀 **Misiones activas** con información detallada de astronautas
- 🗺️ **Mapa interactivo** de la ubicación de la ISS en tiempo real
- 📊 **Datos históricos** con gráficos y visualizaciones
- 🎨 **Temas personalizables** (Espacio y Star Wars)
- 📱 **Diseño responsive** para móviles y desktop
- ⚡ **APIs optimizadas** con sistema de caché y fallback
- 🔍 **Monitoreo de salud** de APIs externas

## 🛠️ Tecnologías

- **Next.js 15** con App Router
- **React 18** + **TypeScript**
- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones
- **React Leaflet** para mapas interactivos
- **Chart.js** para gráficos históricos
- **Radix UI** para componentes de UI

## 📡 APIs Utilizadas

- [Open Notify API](http://open-notify.org/) - Astronautas en el espacio
- [Where the ISS at?](https://wheretheiss.at/) - Ubicación de la ISS en tiempo real

## 🚀 Inicio Rápido

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/space-people-counter.git
   cd space-people-counter
   ```

2. **Instalar dependencias**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📦 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run start` - Ejecutar build de producción
- `npm run lint` - Linter ESLint

## 🔧 API Endpoints

- `/api/space-people` - Datos de astronautas en el espacio
- `/api/iss-location` - Ubicación actual de la ISS
- `/api/health` - Estado de salud de las APIs externas

## 🎨 Temas

La aplicación incluye dos temas:
- **Tema Espacio**: Colores azules profundos que simulan el espacio
- **Tema Star Wars**: Fondo negro con texto amarillo característico

## 🌟 Características Destacadas

### Sistema de Caché Inteligente
- Caché de 5 minutos para datos de astronautas
- Caché de 5 segundos para ubicación de la ISS
- Fallback automático a datos simulados

### Monitoreo de APIs
- Health checks automáticos
- Métricas de rendimiento
- Detección de APIs lentas o caídas

### Optimización para Producción
- Static generation cuando es posible
- Optimización de imágenes con Next.js
- Lazy loading de componentes
- Despliegue en Cloudflare Pages para rendimiento global

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API routes
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI base
│   └── ...               # Componentes específicos
├── lib/                  # Utilidades
└── services/             # Servicios y APIs
```

## 🚀 Despliegue

Este proyecto está optimizado para **Cloudflare Workers** usando **OpenNext**:

### Cloudflare Workers (Recomendado)

La aplicación se despliega como un Worker serverless en Cloudflare con Next.js 15 + App Router:

```bash
npm run build    # Build con Next.js + OpenNext
npm run preview  # Prueba local (http://localhost:8787)
npm run deploy   # Deploya a Cloudflare Workers
```

**Ventajas**:
- Mayor rendimiento gracias a edge computing global
- Deploy automático desde Git
- Plan gratuito generoso (100k requests/día)
- Compatibilidad total con API routes (`app/api/*`)

Para más detalles, consulta [docs/DEPLOY_CLOUDFLARE.md](docs/DEPLOY_CLOUDFLARE.md).

### Desarrollo Local

1. **Instalar dependencias**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Variables de entorno** (crear `.env.local`):
   ```bash
   cp .env.example .env.local
   ```

3. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```
   Accesible en `http://localhost:3000`

4. **Probar build para Workers**:
   ```bash
   npm run preview
   ```
   Accesible en `http://localhost:8787`

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ por [elelier](https://www.elelier.com)

## 🙏 Agradecimientos

- [Open Notify](http://open-notify.org/) por la API gratuita de astronautas
- [Where the ISS at?](https://wheretheiss.at/) por la API de ubicación de la ISS
- La comunidad de Next.js y React

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!
