import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.arknet.co.ao'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/cliente',
          '/cliente/*',
          '/api/*',
          '/login',
          '/registo',
          '/loja/checkout',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/cliente',
          '/cliente/*',
          '/api/*',
          '/login',
          '/registo',
          '/loja/checkout',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
