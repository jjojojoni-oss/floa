import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { GiftFrame } from '@/components/GiftFrame';
import { Logo } from '@/components/Logo';
import { isExpired } from '@/lib/gift';
import { isGiftPath } from '@/lib/slug';
import { getStore } from '@/lib/store';
import { TemplatePlayer } from '@/templates/Player';
import { getTemplate } from '@/templates/registry';

// isi kado dibaca dari penyimpanan tiap kali dibuka, supaya perubahan langsung terlihat
export const dynamic = 'force-dynamic';

const loadGift = cache(async (slug: string) => {
  if (!isGiftPath(slug)) return null;
  const gift = await getStore().getGiftBySlug(slug);
  return gift && gift.status === 'live' ? gift : null;
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const gift = await loadGift(slug).catch(() => null);
  const base: Metadata = { robots: { index: false, follow: false } };
  if (!gift) return { ...base, title: 'Kado tidak ditemukan' };
  const title = gift.data.to ? `Ada kado untuk ${gift.data.to}` : 'Ada kado untukmu';
  const description = gift.data.from ? `Dari ${gift.data.from}. Ketuk untuk membukanya.` : 'Ketuk untuk membukanya.';
  return { ...base, title: { absolute: title }, description, openGraph: { title, description } };
}

export default async function GiftPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gift = await loadGift(slug);
  if (!gift) notFound();
  const meta = getTemplate(gift.template);
  if (!meta) notFound();

  if (isExpired(gift)) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <Logo />
        <h1 className="font-display mt-8 text-3xl font-semibold">Kado ini sudah tidak aktif</h1>
        <p className="mt-3 text-ink-2">Masa aktif link-nya sudah habis. Kalau kado ini untukmu, kabari pengirimnya ya.</p>
        <Link href="/" className="btn btn-ink mt-7 h-12 px-6">
          Bikin kado sendiri
        </Link>
      </main>
    );
  }

  return (
    <GiftFrame bg={meta.palette.bg}>
      <TemplatePlayer id={meta.id} data={gift.data} mode="live" />
    </GiftFrame>
  );
}
