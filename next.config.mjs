// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Cloudflare Pages con OpenNext
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-progress",
      "@radix-ui/react-tooltip",
      "lucide-react",
    ],
  },
  
  reactStrictMode: true,
  
  // Deshabilitar pre-rendering de páginas problemáticas  
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  
  // Configuración de imágenes optimizada para Cloudflare Pages
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Configuración para mejor rendimiento
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Configuración de rutas
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_APP_NAME: 'Space People Counter',
    NEXT_PUBLIC_APP_DESCRIPTION: 'Real-time space people counter with ISS tracking',
  },
  
  // Configuración de webpack para optimización
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones para producción
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
    }
    
    return config;
  },
};

export default nextConfig;
