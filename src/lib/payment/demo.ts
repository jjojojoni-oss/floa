import { PAY_WINDOW_MIN, type PaymentProvider } from './types';

/**
 * Pembayaran simulasi untuk mencoba alur tanpa payment gateway.
 * QR-nya bukan QRIS asli, dan "lunas" dipicu lewat tombol di layar bayar.
 */
export const demoProvider: PaymentProvider = {
  id: 'demo',
  async createCharge({ orderId, amount }) {
    return {
      qr: `FLOA-DEMO|${orderId}|${amount}|bukan-qris-asli`,
      expiresAt: new Date(Date.now() + PAY_WINDOW_MIN * 60_000).toISOString(),
    };
  },
  async getStatus() {
    // status demo hanya berubah lewat POST /api/pay/demo
    return 'pending';
  },
};
