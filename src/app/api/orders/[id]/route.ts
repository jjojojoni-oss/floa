import { fail, handle, json } from '@/lib/http';
import { refreshOrder } from '@/lib/orders';

/** Status pesanan, dipanggil berkala oleh layar bayar. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!/^floa-[a-f0-9]{18}$/.test(id)) return fail('Pesanan tidak ditemukan.', 404, 'not_found');
    const gift = await refreshOrder(id);
    if (!gift) return fail('Pesanan tidak ditemukan.', 404, 'not_found');
    return json({ status: gift.status, slug: gift.slug });
  } catch (e) {
    return handle(e);
  }
}
