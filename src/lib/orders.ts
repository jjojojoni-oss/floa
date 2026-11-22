import 'server-only';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { type Gift, isExpired, sanitizeData } from './gift';
import { providerById, providerFor } from './payment';
import { PAY_WINDOW_MIN } from './payment/types';
import { type Currency, type Market, anyPlan, getPlan, planAmount } from './site';
import { slugProblem } from './slug';
import { getStore } from './store';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';
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

const marketOf = (currency: Currency): Market => (currency === 'IDR' ? 'id' : 'intl');

/** Setelah batas bayar lewat, pesanan masih menahan alamatnya sebentar (pembayaran yang telat sampai). */
const GRACE_MS = 5 * 60_000;

function isStalePending(g: Gift) {
  if (g.status !== 'pending') return false;
  const deadline = g.payExpiresAt
    ? new Date(g.payExpiresAt).getTime()
    : new Date(g.createdAt).getTime() + PAY_WINDOW_MIN * 60_000;
  return Date.now() > deadline + GRACE_MS;
}

export async function slugTaken(slug: string) {
  const g = await getStore().getGiftBySlug(slug);
  return !!g && !isStalePending(g);
}

export function keysMatch(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Melepas alamat yang dipegang pesanan belum lunas, supaya bisa dipakai orang lain.
 * Pesanannya TIDAK dihapus: kalau ternyata dibayar belakangan, kadonya tetap terbit di
 * alamat cadangan floa.site/<id-pesanan>. Mengembalikan false kalau pesanan itu ternyata sudah lunas.
 */
export async function releaseHold(holder: Gift): Promise<boolean> {
  const fresh = await refreshOrder(holder.id, { force: true });
  if (!fresh || fresh.status === 'live') return false;
  const provider = providerById(fresh.provider, marketOf(fresh.currency));
  await provider?.cancel?.(fresh).catch(() => {});
  return getStore().renameSlug(fresh.id, fresh.id);
}

export async function createOrder(input: {
  template: unknown;
  data: unknown;
  slug: unknown;
  plan: unknown;
  market: unknown;
  contact: unknown;
  lang: unknown;
  /** asal situs tempat pembeli memesan, mis. https://floa.site */
  origin: string;
}) {
  const market: Market = input.market === 'intl' ? 'intl' : 'id';
  const provider = providerFor(market);
  if (!provider) {
    throw new OrderError(
      market === 'id' ? 'Pembayaran QRIS belum aktif. Coba lagi nanti ya.' : 'Pembayaran kartu belum aktif. Coba lagi nanti ya.',
      503,
      'payment_off',
    );
  }

  const meta = typeof input.template === 'string' ? getTemplate(input.template) : undefined;
  if (!meta) throw new OrderError('Template tidak dikenal.');
  const plan = typeof input.plan === 'string' ? getPlan(input.plan) : undefined;
  if (!plan) throw new OrderError('Paket tidak dikenal.');
  const slug = typeof input.slug === 'string' ? input.slug.trim().toLowerCase() : '';
  const problem = slugProblem(slug);
  if (problem) throw new OrderError(`Alamat kado tidak valid (${problem}).`, 400, 'slug_invalid');

  const store = getStore();
  const data = sanitizeData(meta, input.data, (u) => store.ownsPhoto(u));
  if (!data.to) throw new OrderError('Nama penerima belum diisi.', 400, 'no_recipient');

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
    amount: planAmount(plan, provider.currency),
    currency: provider.currency,
    lang: isLocale(input.lang) ? input.lang : DEFAULT_LOCALE,
    editKey: randomBytes(18).toString('base64url'),
    contact,
    provider: provider.id,
    providerRef: null,
    payExpiresAt: null,
    createdAt: new Date().toISOString(),
    paidAt: null,
    expiresAt: null,
  };

  let ok = await store.insertGift(gift);
  if (!ok) {
    // alamat dipegang pesanan lama yang tidak jadi dibayar → lepaskan lalu coba sekali lagi
    const holder = await store.getGiftBySlug(slug);
    if (holder && isStalePending(holder) && (await releaseHold(holder))) {
      ok = await store.insertGift(gift);
    }
  }
  if (!ok) throw new OrderError('Alamat itu sudah dipakai. Coba yang lain ya.', 409, 'slug_taken');

  try {
    const charge = await provider.createCharge({
      orderId: gift.id,
      amount: gift.amount,
      plan,
      slug,
      returnUrl: `${input.origin}/bayar/selesai?order=${gift.id}`,
    });
    await store.updateGift(gift.id, { providerRef: charge.ref, payExpiresAt: charge.expiresAt });
    return { gift, charge, provider };
  } catch (e) {
    await store.deleteGift(gift.id).catch(() => {});
    console.error('[floa] createCharge', provider.id, e);
    throw new OrderError('Gagal membuat pembayaran. Coba lagi sebentar lagi.', 502, 'charge_failed');
  }
}

/** Menandai lunas dan menerbitkan kado. Aman dipanggil berkali-kali. */
export async function activateGift(gift: Gift): Promise<Gift> {
  if (gift.status === 'live') return gift;
  const plan = anyPlan(gift.plan);
  const now = new Date();
  const expiresAt = plan?.days ? new Date(now.getTime() + plan.days * 86_400_000).toISOString() : null;
  const next = await getStore().updateGift(gift.id, { status: 'live', paidAt: now.toISOString(), expiresAt });
  return next ?? gift;
}

/**
 * Penyedia dibatasi jumlah panggilannya (BorderPay: 120/menit per key), sedangkan layar bayar
 * menanyakan status tiap beberapa detik. Jadi tiap pesanan paling sering dicek ke penyedia sekali
 * per 10 detik; sisanya cukup baca database (webhook yang menerbitkan kado secepatnya).
 */
const lastCheck = new Map<string, number>();
const CHECK_EVERY_MS = 10_000;

/** Status terbaru pesanan; menanyakan penyedia kalau masih menunggu. */
export async function refreshOrder(id: string, opts: { force?: boolean } = {}): Promise<Gift | null> {
  const gift = await getStore().getGift(id);
  if (!gift || gift.status === 'live') return gift;

  const now = Date.now();
  if (!opts.force && now - (lastCheck.get(id) ?? 0) < CHECK_EVERY_MS) return gift;
  lastCheck.set(id, now);
  if (lastCheck.size > 2000) {
    for (const [k, t] of lastCheck) if (now - t > 60_000) lastCheck.delete(k);
  }

  const provider = providerById(gift.provider, marketOf(gift.currency));
  if (!provider) return gift;
  try {
    const status = await provider.getStatus(gift);
    return status === 'paid' ? activateGift(gift) : gift;
  } catch (e) {
    console.error('[floa] getStatus', gift.provider, gift.id, e);
    return gift;
  }
}

export { isExpired };
