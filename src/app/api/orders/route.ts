import { fail, handle, json } from '@/lib/http';
import { createOrder, keysMatch, refreshOrder } from '@/lib/orders';
import { allow, clientIp } from '@/lib/ratelimit';
import { getStore } from '@/lib/store';

/** Membuat pesanan: menyimpan kado (belum terbit) dan meminta QRIS ke payment gateway. */
export async function POST(req: Request) {
  try {
    if (!allow('order:' + clientIp(req), 12, 10 * 60_000)) return fail('Terlalu banyak percobaan. Coba lagi beberapa menit lagi.', 429, 'rate_limited');
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return fail('Permintaan tidak terbaca.');

    // pembuat mengganti link/paket sebelum membayar: pesanan lamanya dilepas dulu
    const rep = body.replaces as { id?: unknown; key?: unknown } | undefined;
    if (rep && typeof rep.id === 'string' && typeof rep.key === 'string') {
      const old = await getStore().getGift(rep.id);
      if (old && old.status === 'pending' && keysMatch(old.editKey, rep.key)) {
        const fresh = await refreshOrder(old.id);
        if (fresh?.status === 'live') {
          return fail('Pesanan sebelumnya ternyata sudah dibayar. Cek menu Kado saya.', 409, 'already_paid');
        }
        await getStore().deleteGift(old.id);
      }
    }
    const { gift, charge, provider } = await createOrder({
      template: body.template,
      data: body.data,
      slug: body.slug,
      plan: body.plan,
      contact: body.contact,
    });
    return json({
      id: gift.id,
      slug: gift.slug,
      amount: gift.amount,
      editKey: gift.editKey,
      qr: charge.qr,
      expiresAt: charge.expiresAt,
      demo: provider === 'demo',
    });
  } catch (e) {
    return handle(e);
  }
}
