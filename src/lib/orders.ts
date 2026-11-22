import 'server-only';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { type Gift, isExpired, sanitizeData } from './gift';
import { getPaymentProvider } from './payment';
import { PAY_WINDOW_MIN } from './payment/types';
import { getPlan } from './site';
import { slugProblem } from './slug';
import { getStore } from './store';
import { getTemplate } from '@/templates/registry';

export class OrderError extends Error {
  constructor(
    message: string,
    readonly status = 400,
    readonly code = 'bad_request',
  ) {
    super(message);
  }
}

/** Pesanan yang belum dibayar menahan slug selama ini, lalu slug-nya bisa dipakai orang lain. */
const HOLD_MS = (PAY_WINDOW_MIN + 5) * 60_000;

const isStalePending = (g: Gift) => g.status === 'pending' && Date.now() - new Date(g.createdAt).getTime() > HOLD_MS;

export async function slugTaken(slug: string) {
  const g = await getStore().getGiftBySlug(slug);
  return !!g && !isStalePending(g);
}

export function keysMatch(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function createOrder(input: {
  template: unknown;
  data: unknown;
  slug: unknown;
  plan: unknown;
  contact: unknown;
}) {
  const provider = getPaymentProvider();
  if (!provider) throw new OrderError('Pembayaran belum aktif. Coba lagi nanti ya.', 503, 'payment_off');

  const meta = typeof input.template === 'string' ? getTemplate(input.template) : undefined;
  if (!meta) throw new OrderError('Template tidak dikenal.');
  const plan = typeof input.plan === 'string' ? getPlan(input.plan) : undefined;
  if (!plan) throw new OrderError('Paket tidak dikenal.');
  const slug = typeof input.slug === 'string' ? input.slug.trim().toLowerCase() : '';
  const problem = slugProblem(slug);
  if (problem) throw new OrderError(`Alamat kado: ${problem.toLowerCase()}.`, 400, 'slug_invalid');

  const store = getStore();
  const data = sanitizeData(meta, input.data, (u) => store.ownsPhoto(u));
  if (!data.to) throw new OrderError('Nama penerima belum diisi.');

  const contact =
    typeof input.contact === 'string' && input.contact.trim()
      ? input.contact.replace(/[^\d+@.\w-]/g, '').slice(0, 80)
      : null;

  const gift: Gift = {
    id: 'floa-' + randomBytes(9).toString('hex'),
    slug,
    template: meta.id,
    data,
    status: 'pending',
    plan: plan.id,
    amount: plan.price,
    editKey: randomBytes(18).toString('base64url'),
    contact,
    provider: provider.id,
    createdAt: new Date().toISOString(),
    paidAt: null,
    expiresAt: null,
  };

  let ok = await store.insertGift(gift);
  if (!ok) {
    // slug dipegang pesanan lama yang tidak jadi dibayar → lepaskan lalu coba sekali lagi
    const holder = await store.getGiftBySlug(slug);
    if (holder && isStalePending(holder)) {
      await store.deleteGift(holder.id);
      ok = await store.insertGift(gift);
    }
  }
  if (!ok) throw new OrderError('Alamat itu sudah dipakai. Coba yang lain ya.', 409, 'slug_taken');

  try {
    const charge = await provider.createCharge({ orderId: gift.id, amount: gift.amount });
    return { gift, charge, provider: provider.id };
  } catch (e) {
    await store.deleteGift(gift.id).catch(() => {});
    console.error('[floa] createCharge', e);
    throw new OrderError('Gagal membuat pembayaran. Coba lagi sebentar lagi.', 502, 'charge_failed');
  }
}

/** Menandai lunas dan menerbitkan kado. Aman dipanggil berkali-kali. */
export async function activateGift(gift: Gift): Promise<Gift> {
  if (gift.status === 'live') return gift;
  const plan = getPlan(gift.plan);
  const now = new Date();
  const expiresAt = plan?.days ? new Date(now.getTime() + plan.days * 86_400_000).toISOString() : null;
  const next = await getStore().updateGift(gift.id, { status: 'live', paidAt: now.toISOString(), expiresAt });
  return next ?? gift;
}

/** Status pesanan untuk layar bayar; ikut menanyakan gateway kalau masih menunggu. */
export async function refreshOrder(id: string): Promise<Gift | null> {
  const store = getStore();
  const gift = await store.getGift(id);
  if (!gift || gift.status === 'live') return gift;
  const provider = getPaymentProvider();
  if (!provider || provider.id !== gift.provider) return gift;
  const status = await provider.getStatus(gift.id).catch(() => 'pending' as const);
  return status === 'paid' ? activateGift(gift) : gift;
}

export { isExpired };
