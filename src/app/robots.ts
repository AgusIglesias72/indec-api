import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://argenstats.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/profile/',
          '/sign-in/',
          '/sign-up/',
          '/_next/',
          '/admin/',
          '/dashboard/',
          '/private/'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/dolar',
          '/conversor-dolar-peso-argentino',
          '/indicadores/*',
          '/ipc',
          '/pobreza-argentina',
          '/calendario',
          '/documentacion',
          '/contacto'
        ],
        disallow: ['/api/', '/profile/', '/sign-in/', '/sign-up/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'bingbot',
        allow: [
          '/',
          '/dolar',
          '/conversor-dolar-peso-argentino',
          '/indicadores/*',
          '/ipc',
          '/pobreza-argentina'
        ],
        crawlDelay: 2,
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}