import { fail, handle, json } from '@/lib/http';
import { activateGift } from '@/lib/orders';
import { getPaymentProvider } from '@/lib/payment';
import { getStore } from '@/lib/store';

/** Menandai pesanan lunas TANPA pembayaran. Hanya hidup saat provider-nya memang "demo". */
export async function POST(req: Request) {
  try {
    if (getPaymentProvider()?.id !== 'demo') return fail('Tidak tersedia.', 404, 'not_found');
    const body = (await req.json().catch(() => null)) as { id?: unknown } | null;
    const id = typeof body?.id === 'string' ? body.id : '';
    const gift = id ? await getStore().getGift(id) : null;
    if (!gift || gift.provider !== 'demo') return fail('Pesanan tidak ditemukan.', 404, 'not_found');
    const live = await activateGift(gift);
    return json({ status: live.status, slug: live.slug });
  } catch (e) {
    return handle(e);
  }
}
