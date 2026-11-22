import { fail, handle, json } from '@/lib/http';
import { createOrder, keysMatch, releaseHold } from '@/lib/orders';
import { allow, clientIp } from '@/lib/ratelimit';
import { SITE } from '@/lib/site';
import { getStore } from '@/lib/store';

/** Asal situs untuk alamat kembali dari halaman pembayaran: harus sama dengan tempat pembeli memesan. */
function originOf(req: Request) {
  try {
    const u = new URL(req.url);
    if (u.protocol === 'https:' || u.hostname === 'localhost' || u.hostname === '127.0.0.1') return u.origin;
  } catch {
    /* jatuh ke alamat situs */
  }
  return SITE.url;
}

/** Membuat pesanan: menyimpan kado (belum terbit) dan meminta tagihan ke payment gateway. */
export async function POST(req: Request) {
  try {
    if (!allow('order:' + clientIp(req), 12, 10 * 60_000)) return fail('Terlalu banyak percobaan. Coba lagi beberapa menit lagi.', 429, 'rate_limited');
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return fail('Permintaan tidak terbaca.');

    // pembuat mengganti link/paket/cara bayar sebelum membayar: alamat pesanan lamanya dilepas dulu
    const rep = body.replaces as { id?: unknown; key?: unknown } | undefined;
    if (rep && typeof rep.id === 'string' && typeof rep.key === 'string') {
      const old = await getStore().getGift(rep.id);
      if (old && old.status === 'pending' && keysMatch(old.editKey, rep.key)) {
        if (!(await releaseHold(old))) {
          return fail('Pesanan sebelumnya ternyata sudah dibayar. Cek menu Kado saya.', 409, 'already_paid');
        }
      }
    }

    const { gift, charge, provider } = await createOrder({
      template: body.template,
      data: body.data,
      slug: body.slug,
      plan: body.plan,
      market: body.market,
      contact: body.contact,
      origin: originOf(req),
    });
    return json({
      id: gift.id,
      slug: gift.slug,
      amount: gift.amount,
      currency: gift.currency,
      editKey: gift.editKey,
      provider: provider.id,
      test: provider.test,
      kind: charge.kind,
      qr: charge.kind === 'qr' ? charge.qr : null,
      payUrl: charge.kind === 'qr' ? charge.payUrl : null,
      url: charge.kind === 'redirect' ? charge.url : null,
      expiresAt: charge.expiresAt,
    });
  } catch (e) {
    return handle(e);
  }
}
