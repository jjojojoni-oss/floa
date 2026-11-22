import type { Metadata } from 'next';
import { PaymentReturn } from '@/components/PaymentReturn';
import { SiteHeader } from '@/components/SiteChrome';

export const metadata: Metadata = { title: 'Pembayaran', robots: { index: false, follow: false } };

export default function PaymentReturnPage() {
  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem]" aria-hidden>
        <div className="absolute inset-0 bg-[url('/art/bg-hero.webp')] bg-cover bg-top" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-paper" />
      </div>
      <div className="relative mx-auto max-w-md px-4">
        <SiteHeader />
        <main className="paper-card mt-6 rounded-[1.75rem] px-5 py-8 sm:px-7">
          <PaymentReturn />
        </main>
      </div>
    </div>
  );
}
