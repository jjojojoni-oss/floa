export type ChargeStatus = 'pending' | 'paid' | 'failed';

export type Charge = {
  /** isi QRIS (string EMV) untuk dijadikan gambar QR di browser */
  qr: string;
  /** batas waktu bayar, ISO */
  expiresAt: string;
};

export interface PaymentProvider {
  readonly id: 'demo' | 'midtrans';
  createCharge(order: { orderId: string; amount: number }): Promise<Charge>;
  getStatus(orderId: string): Promise<ChargeStatus>;
}

export const PAY_WINDOW_MIN = 15;
