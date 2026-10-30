import { MetadataRoute } from 'next'

// Next.js 15 static export requires explicit prerendering for metadata routes.
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://spacepeople.elelier.com'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
  ]
}
