import { getDict } from '@/i18n/dict';
import { fmt } from '@/i18n/fmt';
import { localeOf } from '@/i18n/server';
import { OG_SIZE, ogCard } from '@/lib/og';
import { isGiftPath } from '@/lib/slug';
import { getStore } from '@/lib/store';
import { getTemplate } from '@/templates/registry';

export const alt = 'floa';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { slug } = await params;
  const gift = !isGiftPath(slug) ? null : await getStore().getGiftBySlug(slug).catch(() => null);
  const meta = gift && gift.status === 'live' ? getTemplate(gift.template) : undefined;
  if (!gift || !meta) {
    const t = getDict(await localeOf(params));
    return ogCard({ eyebrow: t.meta.ogEyebrow, title: t.gift.titleAnon, sub: t.gift.ogAnonSub, bg: '#fbf6ee', ink: '#1e1b18', accent: '#f2542d' });
  }
  // gambar pratinjau ikut bahasa pengirim (perayap WhatsApp dkk. datang dari IP mana saja)
  const t = getDict(gift.lang).gift;
  return ogCard({
    eyebrow: t.ogEyebrow,
    title: gift.data.to || t.ogYou,
    sub: gift.data.from ? fmt(t.ogFrom, { from: gift.data.from }) : t.ogSoft,
    bg: meta.palette.bg,
    ink: meta.palette.ink,
    accent: meta.palette.accent,
  });
}
