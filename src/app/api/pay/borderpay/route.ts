import { handle, json } from '@/lib/http';
import { refreshOrder } from '@/lib/orders';
import { verifyBorderpayToken } from '@/lib/payment/borderpay';

/**
 * Notifikasi pembayaran dari BorderPay. Isi URL ini di dashboard BorderPay (pengaturan webhook project):
 *   https://<domain>/api/pay/borderpay
 *
 * Isi notifikasi tidak dipercaya mentah-mentah: setelah token cocok, status dicek ulang ke API BorderPay
 * (termasuk nominalnya) sebelum kado diterbitkan, sesuai saran dokumentasi BorderPay.
 */
export async function POST(req: Request) {
  try {
    if (!verifyBorderpayToken(req.headers.get('x-borderpay-token'))) return json({ ok: false }, 401);
    const body = (await req.json().catch(() => null)) as { event?: string; data?: { reference_id?: unknown; status?: unknown } } | null;
    const ref = typeof body?.data?.reference_id === 'string' ? body.data.reference_id : '';
    if (!/^floa-[a-f0-9]{18}$/.test(ref)) return json({ ok: true, ignored: true });

    const gift = await refreshOrder(ref, { force: true });
    if (!gift) {
      // pesanan tak dikenal tetap dijawab 200 supaya BorderPay tidak mengulang terus
      console.error('[floa] borderpay webhook: pesanan tidak ditemukan', ref, body?.event);
      return json({ ok: true, ignored: true });
    }
    if (body?.data?.status === 'paid' && gift.status !== 'live') {
      console.error('[floa] borderpay webhook: dilaporkan lunas tetapi belum terverifikasi', ref);
    }
    return json({ ok: true });
  } catch (e) {
    return handle(e);
  }
}
