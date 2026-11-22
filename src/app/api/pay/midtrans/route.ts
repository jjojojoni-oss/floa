import { handle, json } from '@/lib/http';
import { activateGift } from '@/lib/orders';
import { readMidtransNotification } from '@/lib/payment/midtrans';
import { getStore } from '@/lib/store';

/**
 * Notifikasi pembayaran dari Midtrans (isi URL ini di dashboard Midtrans → Payment Notification URL).
 * Kado hanya diterbitkan kalau tanda tangannya sah dan jumlahnya cocok.
 */
export async function POST(req: Request) {
  try {
    const note = readMidtransNotification(await req.json().catch(() => null));
    if (!note) return json({ ok: false }, 401);
    const gift = await getStore().getGift(note.orderId);
    // pesanan tak dikenal tetap dijawab 200 supaya Midtrans tidak mengulang terus
    if (!gift) return json({ ok: true, ignored: true });
    if (note.status === 'paid' && gift.provider === 'midtrans' && note.grossAmount === gift.amount) {
      await activateGift(gift);
    }
    return json({ ok: true });
  } catch (e) {
    return handle(e);
  }
}
