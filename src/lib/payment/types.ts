import type { Currency, Plan } from '../site';

export type ChargeStatus = 'pending' | 'paid' | 'failed';

export type ProviderId = 'demo' | 'borderpay' | 'creem';

/** Cara pembeli membayar: QR ditampilkan di floa, atau pindah ke halaman checkout penyedia. */
export type Charge =
  | {
      kind: 'qr';
      /** isi QRIS (string EMV) untuk dijadikan gambar QR di browser */
      qr: string;
      /** halaman bayar milik penyedia (cadangan, mis. untuk dibuka di HP) */
      payUrl: string | null;
      /** ID transaksi di sisi penyedia */
      ref: string;
      /** batas waktu bayar, ISO */
      expiresAt: string;
    }
  | {
      kind: 'redirect';
      /** halaman checkout penyedia */
      url: string;
      ref: string;
      expiresAt: string;
    };

export type ChargeInput = {
  orderId: string;
  /** dalam satuan terkecil mata uang penyedia (rupiah / sen) */
  amount: number;
  plan: Plan;
  slug: string;
  /** ke mana pembeli diarahkan setelah bayar di halaman penyedia */
  returnUrl: string;
};

/** Data pesanan yang dibutuhkan untuk mengecek pembayaran. */
export type OrderRef = { id: string; amount: number; currency: Currency; providerRef: string | null };

export interface PaymentProvider {
  readonly id: ProviderId;
  readonly currency: Currency;
  /** true = mode uji: tidak ada uang nyata yang berpindah */
  readonly test: boolean;
  createCharge(input: ChargeInput): Promise<Charge>;
  getStatus(order: OrderRef): Promise<ChargeStatus>;
  /** Mode uji saja: tandai lunas tanpa uang nyata. */
  simulate?(order: OrderRef): Promise<void>;
  /** Membatalkan tagihan yang belum dibayar (kalau penyedianya mendukung). */
  cancel?(order: OrderRef): Promise<void>;
}

/** Berapa lama pesanan yang belum dibayar menahan alamat kado, kalau penyedia tidak memberi batas waktu. */
export const PAY_WINDOW_MIN = 60;
