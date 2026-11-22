import { timingSafeEqual } from 'node:crypto';
import { type ChargeStatus, type OrderRef, PAY_WINDOW_MIN, type PaymentProvider } from './types';

/**
 * BorderPay, untuk pembeli di Indonesia: QRIS dalam rupiah.
 * Dokumentasi: https://borderpay.id/docs dan https://borderpay.id/openapi.json
 *
 * - Mode ditentukan prefix API key: bp_test_ (uji, tanpa uang nyata) atau bp_live_.
 * - reference_id = ID pesanan floa, sehingga satu pesanan tidak pernah tertagih dua kali.
 */

const DEFAULT_BASE = 'https://borderpay.id/api/v1';

function base() {
  // alamat lain hanya untuk uji lokal dengan server tiruan; di produksi selalu alamat resmi
  const override = process.env.BORDERPAY_API_BASE;
  return override && process.env.NODE_ENV !== 'production' ? override.replace(/\/+$/, '') : DEFAULT_BASE;
}

type BpPayment = {
  reference_id?: string;
  status?: 'pending' | 'paid' | 'expired' | 'failed' | 'refunded';
  amount?: number;
  order_amount?: number;
  pay_url?: string | null;
  qr_string?: string | null;
  expires_at?: string | null;
};

type BpError = { error?: { code?: string; message?: string } };

export class BorderpayError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
  }
}

async function call<T>(key: string, path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(base() + path, {
    method: init?.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });
  const json = (await res.json().catch(() => ({}))) as T & BpError;
  if (!res.ok) {
    throw new BorderpayError(json.error?.message ?? `BorderPay ${res.status}`, res.status, json.error?.code ?? 'unknown');
  }
  return json;
}

/** return_url harus https; key uji juga menerima http://localhost. */
function acceptableReturnUrl(url: string, test: boolean) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || (test && u.protocol === 'http:' && u.hostname === 'localhost');
  } catch {
    return false;
  }
}

export function borderpayProvider(): PaymentProvider | null {
  const key = process.env.BORDERPAY_API_KEY ?? '';
  if (!key) return null;
  const test = key.startsWith('bp_test_');
  const ref = (o: OrderRef) => encodeURIComponent(o.providerRef ?? o.id);

  return {
    id: 'borderpay',
    currency: 'IDR',
    test,

    async createCharge({ orderId, amount, returnUrl }) {
      const p = await call<BpPayment>(key, '/payments', {
        method: 'POST',
        body: {
          amount,
          method: 'qris',
          reference_id: orderId,
          ...(acceptableReturnUrl(returnUrl, test) ? { return_url: returnUrl } : {}),
        },
      });
      if (!p.qr_string) throw new BorderpayError('BorderPay tidak mengembalikan QRIS.', 502, 'no_qr');
      return {
        kind: 'qr',
        qr: p.qr_string,
        payUrl: p.pay_url ?? null,
        ref: p.reference_id ?? orderId,
        expiresAt: p.expires_at ?? new Date(Date.now() + PAY_WINDOW_MIN * 60_000).toISOString(),
      };
    },

    async getStatus(order): Promise<ChargeStatus> {
      let p: BpPayment;
      try {
        p = await call<BpPayment>(key, `/payments/${ref(order)}`);
      } catch (e) {
        if (e instanceof BorderpayError && e.status === 404) return 'failed';
        throw e;
      }
      if (p.status === 'paid') {
        // order_amount = nominal tagihan asli; cocokkan supaya pembayaran kurang tidak menerbitkan kado
        const billed = p.order_amount ?? p.amount;
        if (billed !== order.amount) {
          console.error('[floa] borderpay: nominal tidak cocok', { order: order.id, billed, expected: order.amount });
          return 'pending';
        }
        return 'paid';
      }
      if (p.status === 'expired' || p.status === 'failed' || p.status === 'refunded') return 'failed';
      return 'pending';
    },

    simulate: test
      ? async (order) => {
          await call(key, `/payments/${ref(order)}/simulate`, { method: 'POST' });
        }
      : undefined,

    async cancel(order) {
      await call(key, `/payments/${ref(order)}/cancel`, { method: 'POST' }).catch(() => {});
    },
  };
}

/** Webhook BorderPay sah kalau header x-borderpay-token sama dengan verification token project (dashboard). */
export function verifyBorderpayToken(received: string | null) {
  const expected = process.env.BORDERPAY_WEBHOOK_TOKEN ?? '';
  if (!expected || !received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
