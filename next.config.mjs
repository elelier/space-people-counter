// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['upload.wikimedia.org', 'cdn-icons-png.flaticon.com', 'same-assets.com'],
  },
  // Configuración para SSR en Netlify
  trailingSlash: true,
};

export default nextConfig;
