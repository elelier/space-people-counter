// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  
  // Deshabilitar prerendering de páginas de error
  staticPageGenerationTimeout: 120,
  
  // Configuración experimental
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-progress",
      "@radix-ui/react-tooltip",
      "lucide-react",
      "framer-motion"
    ],
  },
  
  // Deshabilitar pre-rendering de páginas problemáticas  
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  
  // Configuración de imágenes optimizada para Cloudflare Pages
  images: {
    unoptimized: true,
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
  
  // Configuración de rutas
  trailingSlash: true,
  
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
