import type { Metadata } from 'next';
import { MyGifts } from '@/components/MyGifts';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { dictOf } from '@/i18n/server';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await dictOf(params);
  return { title: t.myGifts.title, robots: { index: false } };
}

export default async function KadoSayaPage({ params }: Props) {
  const { t } = await dictOf(params);
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 sm:px-6">
      <SiteHeader />
      <main className="flex-1 pt-4">
        <h1 className="font-display text-4xl font-semibold">{t.myGifts.title}</h1>
        <p className="mt-2 text-[15px] text-ink-2">{t.myGifts.sub}</p>
        <MyGifts />
      </main>
      <SiteFooter />
    </div>
  );
}
