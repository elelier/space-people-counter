import Script from 'next/script'

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Space People Counter",
    "description": "Contador en tiempo real de personas en el espacio exterior, ubicación de la ISS y datos de misiones espaciales activas",
    "url": "https://spacepeople.elelier.com",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Person",
      "name": "elelier",
      "url": "https://www.elelier.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "elelier",
      "url": "https://www.elelier.com"
    },
    "keywords": "espacio, astronautas, ISS, estación espacial, tiempo real, NASA, Tiangong",
    "inLanguage": "es",
    "datePublished": "2025-07-14",
    "dateModified": new Date().toISOString().split('T')[0],
    "isAccessibleForFree": true,
    "mainEntity": {
      "@type": "Thing",
      "name": "Personas en el Espacio",
      "description": "Información en tiempo real sobre cuántas personas están actualmente en el espacio"
    }
  }

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}
