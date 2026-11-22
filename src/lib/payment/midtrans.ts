import { createHash, timingSafeEqual } from 'node:crypto';
import { type ChargeStatus, PAY_WINDOW_MIN, type PaymentProvider } from './types';

/**
 * Midtrans Core API, metode QRIS.
 * Dokumentasi: https://docs.midtrans.com/reference/qris
 *
 * CATATAN: ditulis mengikuti dokumentasi Midtrans dan belum diuji dengan akun sungguhan.
 * Coba dulu di sandbox (MIDTRANS_IS_PRODUCTION kosong) sebelum dipakai jualan.
 */

const serverKey = () => process.env.MIDTRANS_SERVER_KEY ?? '';
const base = () =>
  process.env.MIDTRANS_IS_PRODUCTION === 'true' ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com';
const auth = () => 'Basic ' + Buffer.from(serverKey() + ':').toString('base64');

function mapStatus(s: unknown, fraud?: unknown): ChargeStatus {
  if (s === 'settlement') return 'paid';
  if (s === 'capture') return fraud === 'accept' || fraud === undefined ? 'paid' : 'pending';
  if (s === 'expire' || s === 'cancel' || s === 'deny' || s === 'failure') return 'failed';
  return 'pending';
}

export const midtransProvider: PaymentProvider = {
  id: 'midtrans',

  async createCharge({ orderId, amount }) {
    const res = await fetch(`${base()}/v2/charge`, {
      method: 'POST',
      headers: { Authorization: auth(), 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        payment_type: 'qris',
        transaction_details: { order_id: orderId, gross_amount: amount },
        qris: { acquirer: 'gopay' },
        custom_expiry: { expiry_duration: PAY_WINDOW_MIN, unit: 'minute' },
      }),
      cache: 'no-store',
    });
    const json = (await res.json().catch(() => ({}))) as { status_code?: string; status_message?: string; qr_string?: string };
    if (!res.ok || !json.qr_string) {
      throw new Error(`Midtrans charge gagal (${json.status_code ?? res.status}): ${json.status_message ?? 'tanpa pesan'}`);
    }
    return { qr: json.qr_string, expiresAt: new Date(Date.now() + PAY_WINDOW_MIN * 60_000).toISOString() };
  },

  async getStatus(orderId) {
    const res = await fetch(`${base()}/v2/${encodeURIComponent(orderId)}/status`, {
      headers: { Authorization: auth(), Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return 'pending';
    const json = (await res.json().catch(() => ({}))) as { transaction_status?: string; fraud_status?: string };
    return mapStatus(json.transaction_status, json.fraud_status);
  },
};

/**
 * Memeriksa notifikasi (webhook) Midtrans. Mengembalikan null kalau tanda tangannya tidak cocok.
 * signature_key = SHA512(order_id + status_code + gross_amount + server_key)
 */
export function readMidtransNotification(body: unknown): { orderId: string; status: ChargeStatus; grossAmount: number } | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const orderId = String(b.order_id ?? '');
  const statusCode = String(b.status_code ?? '');
  const gross = String(b.gross_amount ?? '');
  const sig = String(b.signature_key ?? '');
  if (!orderId || !sig || !serverKey()) return null;
  const expected = createHash('sha512').update(orderId + statusCode + gross + serverKey()).digest('hex');
  const a = Buffer.from(expected);
  const c = Buffer.from(sig);
  if (a.length !== c.length || !timingSafeEqual(a, c)) return null;
  return { orderId, status: mapStatus(b.transaction_status, b.fraud_status), grossAmount: Math.round(Number(gross)) };
}
