import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/test/', '/kofi-test/'],
    },
    sitemap: 'https://space-people.netlify.app/sitemap.xml',
  }
}
