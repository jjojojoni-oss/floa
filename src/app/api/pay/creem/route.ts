import { handle, json } from '@/lib/http';
import { refreshOrder } from '@/lib/orders';
import { verifyCreemSignature } from '@/lib/payment/creem';

type CreemEvent = {
  eventType?: string;
  object?: {
    request_id?: unknown;
    metadata?: { gift_id?: unknown } | null;
    checkout?: { request_id?: unknown } | null;
  };
};

/**
 * Notifikasi pembayaran dari Creem. Daftarkan URL ini di dashboard Creem (Developers → Webhooks):
 *   https://<domain>/api/pay/creem
 *
 * Tanda tangan creem-signature diperiksa terhadap body mentah, lalu status checkout dicek ulang
 * ke API Creem sebelum kado diterbitkan.
 */
export async function POST(req: Request) {
  try {
    const raw = await req.text();
    if (!verifyCreemSignature(raw, req.headers.get('creem-signature'))) return json({ ok: false }, 401);
    let event: CreemEvent;
    try {
      event = JSON.parse(raw) as CreemEvent;
    } catch {
      return json({ ok: false }, 400);
    }

    if (event.eventType === 'checkout.completed') {
      const o = event.object;
      const ref = [o?.request_id, o?.metadata?.gift_id].find((v): v is string => typeof v === 'string') ?? '';
      if (!/^floa-[a-f0-9]{18}$/.test(ref)) return json({ ok: true, ignored: true });
      const gift = await refreshOrder(ref, { force: true });
      if (!gift) console.error('[floa] creem webhook: pesanan tidak ditemukan', ref);
      else if (gift.status !== 'live') console.error('[floa] creem webhook: checkout selesai tetapi belum terverifikasi', ref);
      return json({ ok: true });
    }

    if (event.eventType === 'refund.created') {
      // kado tidak dimatikan otomatis; pemilik situs yang memutuskan
      const ref = event.object?.checkout?.request_id;
      console.warn('[floa] creem: refund untuk pesanan', typeof ref === 'string' ? ref : '(tidak diketahui)');
    }
    return json({ ok: true });
  } catch (e) {
    return handle(e);
  }
}
