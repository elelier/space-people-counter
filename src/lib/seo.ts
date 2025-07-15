import { Metadata } from 'next'

export const seoConfig = {
  title: "Space People Counter - ¿Cuántas personas hay en el espacio ahora?",
  description: "Contador en tiempo real de personas en el espacio exterior, ubicación de la ISS y datos de misiones espaciales activas",
  keywords: [
    "espacio", "astronautas", "ISS", "estación espacial", "tiempo real", "NASA",
    "Roscosmos", "SpaceX", "cosmonautas", "Tiangong", "satélites", "órbita",
    "exploración espacial", "misiones espaciales", "tripulación espacial"
  ],
  url: "https://space-people.netlify.app",
  siteName: "Space People Counter",
  
  // Meta tags para SEO
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Configuración de idioma y región
  locale: 'es_ES',
  alternateLocales: ['en_US'],
  
  // JSON-LD estructurado para Google
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Space People Counter",
    "description": "Contador en tiempo real de personas en el espacio exterior",
    "url": "https://space-people.netlify.app",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Person",
      "name": "elelier"
    }
  }
}

export function generateSEOMetadata(
  googleSiteVerification?: string
): Metadata {
  const baseMetadata: Metadata = {
    title: seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
    authors: [{ name: "elelier", url: "https://www.elelier.com" }],
    creator: "elelier",
    publisher: "elelier",
    robots: seoConfig.robots,
    
    // Configuración del favicon y iconos
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon.png', type: 'image/png', sizes: '100x100' },
      ],
      apple: [
        { url: '/favicon.png', sizes: '100x100', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
    },
    
    // Open Graph para redes sociales
    openGraph: {
      title: seoConfig.title,
      description: seoConfig.description,
      url: seoConfig.url,
      siteName: seoConfig.siteName,
      images: [
        {
          url: "/favicon.png",
          width: 100,
          height: 100,
          alt: "Space People Counter Logo",
        },
      ],
      locale: seoConfig.locale,
      type: "website",
    },
    
    // Twitter Cards
    twitter: {
      card: "summary_large_image",
      title: seoConfig.title,
      description: seoConfig.description,
      site: "@elelier",
      creator: "@elelier",
      images: ["/favicon.png"],
    },
    
    // Meta tags para PWA
    manifest: "/manifest.json",
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 1,
    },
    
    // Canonical URL
    alternates: {
      canonical: seoConfig.url,
    },
  }

  // Agregar verificación de Google Search Console si se proporciona
  if (googleSiteVerification) {
    baseMetadata.verification = {
      google: googleSiteVerification,
    }
  }

  return baseMetadata
}
