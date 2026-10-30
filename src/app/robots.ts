import { MetadataRoute } from 'next'

// Next.js 15 static export requires explicit prerendering for metadata routes.
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: 'https://spacepeople.elelier.com/sitemap.xml',
  }
}
