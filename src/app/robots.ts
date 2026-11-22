import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: ['/$', '/demo/', '/syarat', '/privasi'], disallow: ['/api/', '/buat/', '/kado-saya', '/bayar/'] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
