/**
 * OpenNext Configuration for Cloudflare Workers
 * 
 * Esta configuración optimiza la compilación de Next.js 15 para Cloudflare Workers
 * manteniendo la compatibilidad total con Route Handlers en app/api/*
 */

export default {
  default: {
    // Usar Cloudflare como destino
    override: {
      wrapper: 'cloudflare-workers',
    },
  },

  // Configuración específica para Workers
  imageOptimization: {
    // Desabilitar optimización de imágenes en el Worker
    // (Cloudflare manejar esto automáticamente)
    disable: false,
  },

  // Configuración de estilos
  minify: true,

  // Split chunks para reducir tamaño del bundle
  optimization: {
    minify: true,
  },

  // Configuración de tiempos de espera
  timeout: {
    // Máximo tiempo de ejecución en Cloudflare Workers (30 segundos)
    default: 30000,
    // API routes pueden tardar más
    apiRoutes: 30000,
  },

  // Incluir rutas estáticas
  staticRoutes: {
    // Asegurar que las imágenes públicas se sirvan como estáticas
    include: ['/images/**', '/public/**'],
  },
};
