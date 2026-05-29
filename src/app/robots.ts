import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/checkout', '/login', '/register'],
      },
    ],
    sitemap: 'https://8ballafrica.com/sitemap.xml',
  }
}
