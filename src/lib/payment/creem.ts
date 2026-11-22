import { createHmac, timingSafeEqual } from 'node:crypto';
import { type ChargeStatus, type OrderRef, PAY_WINDOW_MIN, type PaymentProvider } from './types';

/**
 * Creem, untuk pembeli luar negeri: halaman checkout kartu dalam dolar AS.
 * Dokumentasi: https://docs.creem.io/api-reference/introduction
 *
 * Butuh satu produk sekali bayar (one-time) berharga USD di dashboard Creem. Harga tiap paket floa
 * dikirim per transaksi lewat `custom_price`, jadi harga cukup diubah di src/lib/site.ts.
 */

function isTest(key: string) {
  return process.env.CREEM_TEST_MODE === 'true' || key.startsWith('creem_test_');
}

function base(test: boolean) {
  // alamat lain hanya untuk uji lokal dengan server tiruan; di produksi selalu alamat resmi
  const override = process.env.CREEM_API_BASE;
  if (override && process.env.NODE_ENV !== 'production') return override.replace(/\/+$/, '');
  return test ? 'https://test-api.creem.io' : 'https://api.creem.io';
}

type CreemCheckout = {
  id?: string;
  status?: 'pending' | 'processing' | 'completed' | 'expired';
  request_id?: string;
  checkout_url?: string;
  custom_price?: number;
  order?: { id?: string; status?: 'pending' | 'paid'; amount?: number; currency?: string } | string | null;
};

export class CreemError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function call<T>(key: string, test: boolean, path: string, body?: unknown): Promise<T> {
  const res = await fetch(base(test) + path, {
    method: body ? 'POST' : 'GET',
    headers: { 'x-api-key': key, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const json = (await res.json().catch(() => ({}))) as T & { message?: string | string[]; error?: string };
  if (!res.ok) {
    const msg = Array.isArray(json.message) ? json.message.join('; ') : (json.message ?? json.error);
    throw new CreemError(`Creem ${res.status}: ${msg ?? 'tanpa pesan'}`, res.status);
  }
  return json;
}

export function creemProvider(): PaymentProvider | null {
  const key = process.env.CREEM_API_KEY ?? '';
  const product = process.env.CREEM_PRODUCT_ID ?? '';
  if (!key || !product) return null;
  const test = isTest(key);

  return {
    id: 'creem',
    currency: 'USD',
    test,

    async createCharge({ orderId, amount, plan, slug, returnUrl }) {
      const c = await call<CreemCheckout>(key, test, '/v1/checkouts', {
        product_id: product,
        request_id: orderId,
        units: 1,
        custom_price: amount,
        success_url: returnUrl,
        metadata: { gift_id: orderId, slug, plan: plan.id },
      });
      if (!c.id || !c.checkout_url) throw new CreemError('Creem tidak mengembalikan halaman checkout.', 502);
      return {
        kind: 'redirect',
        url: c.checkout_url,
        ref: c.id,
        expiresAt: new Date(Date.now() + PAY_WINDOW_MIN * 60_000).toISOString(),
      };
    },

    async getStatus(order: OrderRef): Promise<ChargeStatus> {
      if (!order.providerRef) return 'pending';
      let c: CreemCheckout;
      try {
        c = await call<CreemCheckout>(key, test, `/v1/checkouts?checkout_id=${encodeURIComponent(order.providerRef)}`);
      } catch (e) {
        if (e instanceof CreemError && e.status === 404) return 'failed';
        throw e;
      }
      if (c.request_id && c.request_id !== order.id) {
        console.error('[floa] creem: checkout bukan milik pesanan ini', { order: order.id, checkout: c.id });
        return 'pending';
      }
      if (c.status === 'expired') return 'failed';
      if (c.status !== 'completed') return 'pending';
      const o = c.order;
      if (o && typeof o === 'object' && o.status && o.status !== 'paid') return 'pending';
      if (typeof c.custom_price === 'number' && c.custom_price !== order.amount) {
        console.error('[floa] creem: harga tidak cocok', { order: order.id, price: c.custom_price, expected: order.amount });
        return 'pending';
      }
      return 'paid';
    },
  };
}

/** Webhook Creem sah kalau header creem-signature = HMAC-SHA256 (hex) dari body mentah dengan webhook secret. */
export function verifyCreemSignature(rawBody: string, received: string | null) {
  const secret = process.env.CREEM_WEBHOOK_SECRET ?? '';
  if (!secret || !received) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(received.trim().toLowerCase());
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
