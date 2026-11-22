import 'server-only';
import { demoProvider } from './demo';
import { midtransProvider } from './midtrans';
import type { PaymentProvider } from './types';

export type { Charge, ChargeStatus, PaymentProvider } from './types';

/**
 * Memilih payment gateway.
 * - PAYMENT_PROVIDER=midtrans (atau MIDTRANS_SERVER_KEY terisi) → Midtrans QRIS
 * - PAYMENT_PROVIDER=demo → simulasi (untuk mencoba alur)
 * - Tanpa keduanya: simulasi di lokal, dan MATI di produksi supaya tidak ada yang terbit gratis.
 */
export function getPaymentProvider(): PaymentProvider | null {
  const want = process.env.PAYMENT_PROVIDER;
  if (want === 'demo') return demoProvider;
  if (want === 'midtrans' || (!want && process.env.MIDTRANS_SERVER_KEY)) {
    return process.env.MIDTRANS_SERVER_KEY ? midtransProvider : null;
  }
  return process.env.NODE_ENV === 'production' ? null : demoProvider;
}
