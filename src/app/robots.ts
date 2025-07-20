import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/profile/', '/sign-in/', '/sign-up/'],
    },
    sitemap: 'https://argenstats.com/sitemap.xml',
  }
}