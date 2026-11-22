import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteChrome';
import { SimulatedCheckout } from '@/components/SimulatedCheckout';

export const metadata: Metadata = { title: 'Simulasi pembayaran', robots: { index: false, follow: false } };

export default function SimulatedCheckoutPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-md px-4">
      <SiteHeader />
      <main className="paper-card mt-6 rounded-[1.75rem] px-5 py-8 sm:px-7">
        <SimulatedCheckout />
      </main>
    </div>
  );
}
