import type { Metadata } from 'next';
import { MyGifts } from '@/components/MyGifts';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';

export const metadata: Metadata = { title: 'Kado saya', robots: { index: false } };

export default function KadoSayaPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6">
      <SiteHeader />
      <main className="pt-4">
        <h1 className="font-display text-4xl font-semibold">Kado saya</h1>
        <p className="mt-2 text-[15px] text-ink-2">Kado yang kamu buat di perangkat ini. Tanpa akun, jadi daftarnya tersimpan di browser ini saja.</p>
        <MyGifts />
      </main>
      <SiteFooter />
    </div>
  );
}
