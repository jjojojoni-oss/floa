import { fail, handle, json } from '@/lib/http';
import { activateGift, refreshOrder } from '@/lib/orders';
import { providerById } from '@/lib/payment';
import { allow, clientIp } from '@/lib/ratelimit';
import { getStore } from '@/lib/store';

/**
 * Menandai pesanan lunas TANPA uang nyata. Hanya untuk pesanan mode uji:
 * - simulasi floa (demo), atau
 * - BorderPay dengan key bp_test_ (memanggil endpoint simulate milik BorderPay, lalu status dicek ulang).
 */
export async function POST(req: Request) {
  try {
    if (!allow('simulate:' + clientIp(req), 30, 10 * 60_000)) return fail('Terlalu banyak percobaan.', 429, 'rate_limited');
    const body = (await req.json().catch(() => null)) as { id?: unknown } | null;
    const id = typeof body?.id === 'string' ? body.id : '';
    const gift = /^floa-[a-f0-9]{18}$/.test(id) ? await getStore().getGift(id) : null;
    if (!gift) return fail('Pesanan tidak ditemukan.', 404, 'not_found');
    if (gift.status === 'live') return json({ status: 'live', slug: gift.slug });

    const provider = providerById(gift.provider, gift.currency === 'IDR' ? 'id' : 'intl');
    if (!provider?.test) return fail('Tidak tersedia.', 404, 'not_found');

    if (provider.id === 'demo') {
      const live = await activateGift(gift);
      return json({ status: live.status, slug: live.slug });
    }
    if (!provider.simulate) return fail('Simulasi tidak tersedia untuk cara bayar ini.', 404, 'not_found');
    await provider.simulate(gift);
    const fresh = await refreshOrder(gift.id, { force: true });
    return json({ status: fresh?.status ?? 'pending', slug: fresh?.slug ?? gift.slug });
  } catch (e) {
    return handle(e);
  }
}
