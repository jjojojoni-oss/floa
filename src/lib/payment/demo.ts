import type { Currency } from '../site';
import { PAY_WINDOW_MIN, type PaymentProvider } from './types';

/**
 * Pembayaran simulasi untuk mencoba alur tanpa payment gateway.
 * Rupiah meniru QRIS (QR palsu), dolar meniru checkout kartu (diarahkan ke halaman simulasi floa).
 * "Lunas" hanya bisa dipicu lewat tombol simulasi.
 */
export function demoProvider(currency: Currency): PaymentProvider {
  return {
    id: 'demo',
    currency,
    test: true,
    async createCharge({ orderId, amount, returnUrl }) {
      const expiresAt = new Date(Date.now() + PAY_WINDOW_MIN * 60_000).toISOString();
      if (currency === 'IDR') {
        return { kind: 'qr', qr: `FLOA-DEMO|${orderId}|${amount}|bukan-qris-asli`, payUrl: null, ref: orderId, expiresAt };
      }
      const url = new URL(returnUrl);
      url.pathname = '/bayar/simulasi';
      return { kind: 'redirect', url: url.toString(), ref: orderId, expiresAt };
    },
    async getStatus() {
      // status demo hanya berubah lewat POST /api/pay/simulate
      return 'pending';
    },
  };
}
