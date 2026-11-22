import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteChrome';
import { SimulatedCheckout } from '@/components/SimulatedCheckout';
import { dictOf } from '@/i18n/server';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await dictOf(params);
  return { title: t.payReturn.simTitle, robots: { index: false, follow: false } };
}

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
