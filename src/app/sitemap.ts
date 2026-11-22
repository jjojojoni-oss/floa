import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { TEMPLATES } from '@/templates/registry';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, changeFrequency: 'weekly', priority: 1 },
    ...TEMPLATES.map((t) => ({ url: `${SITE.url}/demo/${t.id}`, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ];
}
