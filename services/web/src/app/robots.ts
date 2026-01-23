import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/demo',
          '/demo/*',
          '/en/demo',
          '/en/demo/*',
          '/fr/demo',
          '/fr/demo/*',
        ],
      },
    ],
    sitemap: 'https://www.themossyroots.com/sitemap.xml',
    host: 'https://www.themossyroots.com',
  };
}
