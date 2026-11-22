import { getDict } from '@/i18n/dict';
import { localeOf } from '@/i18n/server';
import { OG_SIZE, ogCard } from '@/lib/og';

export const alt = 'floa';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const t = getDict(await localeOf(params));
  return ogCard({
    eyebrow: t.meta.ogEyebrow,
    title: t.meta.ogTitle,
    sub: t.meta.ogSub,
    bg: '#fbf6ee',
    ink: '#1e1b18',
    accent: '#f2542d',
  });
}
