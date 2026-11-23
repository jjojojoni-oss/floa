import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { GiftView } from '@/components/GiftView';
import { Logo } from '@/components/Logo';
import { I18nProvider } from '@/i18n/client';
import { HTML_LANG, OG_LOCALE } from '@/i18n/config';
import { getDict } from '@/i18n/dict';
import { fmt } from '@/i18n/fmt';
import { dictOf } from '@/i18n/server';
import { isExpired } from '@/lib/gift';
import { isGiftPath } from '@/lib/slug';
import { getStore } from '@/lib/store';
import { getTemplate } from '@/templates/registry';

// isi kado dibaca dari penyimpanan tiap kali dibuka, supaya perubahan langsung terlihat
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ lang: string; slug: string }> };

const loadGift = cache(async (slug: string) => {
  if (!isGiftPath(slug)) return null;
  const gift = await getStore().getGiftBySlug(slug);
  return gift && gift.status === 'live' ? gift : null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const gift = await loadGift(slug).catch(() => null);
  const base: Metadata = { robots: { index: false, follow: false } };
  if (!gift) return { ...base, title: (await dictOf(params)).t.gift.notFoundTitle };
  // pratinjau link memakai bahasa pengirim, bukan bahasa yang menebak dari IP perayap
  const t = getDict(gift.lang).gift;
  const title = gift.data.to ? fmt(t.titleFor, { to: gift.data.to }) : t.titleAnon;
  const description = gift.data.from ? fmt(t.descFrom, { from: gift.data.from }) : t.desc;
  return {
    ...base,
    title: { absolute: title },
    description,
    openGraph: { title, description, locale: OG_LOCALE[gift.lang] },
  };
}

export default async function GiftPage({ params }: Props) {
  const { slug } = await params;
  const gift = await loadGift(slug);
  if (!gift) notFound();
  const meta = getTemplate(gift.template, gift.lang);
  if (!meta) notFound();
  const dict = getDict(gift.lang);

  if (isExpired(gift)) {
    // pesan ini untuk pengunjung, jadi pakai bahasa pengunjung
    const { t } = await dictOf(params);
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <Logo />
        <h1 className="font-display mt-8 text-3xl font-semibold">{t.gift.expiredTitle}</h1>
        <p className="mt-3 text-ink-2">{t.gift.expiredSub}</p>
        <Link href="/" className="btn btn-ink mt-7 h-12 px-6">
          {t.gift.makeOwn}
        </Link>
      </main>
    );
  }

  // kado terkunci: halaman ini hanya membawa nama & petunjuk; isinya diambil setelah kata sandinya benar
  const locked = !!gift.passHash;
  // isi kado (tombol, sapaan, penutup) tampil dalam bahasa pengirimnya
  return (
    <I18nProvider locale={gift.lang} dict={dict}>
      <div lang={HTML_LANG[gift.lang]}>
        <GiftView
          slug={slug}
          templateId={meta.id}
          data={locked ? null : gift.data}
          lock={locked ? { hint: gift.passHint, to: gift.data.to, from: gift.data.from, shape: gift.passShape } : null}
        />
      </div>
    </I18nProvider>
  );
}
