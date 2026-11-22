import { OG_SIZE, ogCard } from '@/lib/og';
import { isGiftPath } from '@/lib/slug';
import { getStore } from '@/lib/store';
import { getTemplate } from '@/templates/registry';

export const alt = 'Ada kado untukmu';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gift = !isGiftPath(slug) ? null : await getStore().getGiftBySlug(slug).catch(() => null);
  const meta = gift && gift.status === 'live' ? getTemplate(gift.template) : undefined;
  if (!gift || !meta) {
    return ogCard({ eyebrow: 'Kado digital', title: 'Ada kado untukmu', sub: 'Buka dari HP, tanpa aplikasi.', bg: '#fbf6ee', ink: '#1e1b18', accent: '#f2542d' });
  }
  return ogCard({
    eyebrow: 'Ada kado untuk',
    title: gift.data.to || 'kamu',
    sub: gift.data.from ? `dari ${gift.data.from}` : 'Buka pelan-pelan ya.',
    bg: meta.palette.bg,
    ink: meta.palette.ink,
    accent: meta.palette.accent,
  });
}
