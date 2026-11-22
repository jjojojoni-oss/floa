import { sanitizeData } from '@/lib/gift';
import { fail, handle, json } from '@/lib/http';
import { keysMatch } from '@/lib/orders';
import { allow, clientIp } from '@/lib/ratelimit';
import { getStore } from '@/lib/store';
import { getTemplate } from '@/templates/registry';

async function authorize(req: Request, id: string, key: string) {
  if (!allow('gift:' + clientIp(req), 60, 10 * 60_000)) return { error: fail('Terlalu banyak percobaan.', 429, 'rate_limited') };
  if (!/^floa-[a-f0-9]{18}$/.test(id) || !key) return { error: fail('Kado tidak ditemukan.', 404, 'not_found') };
  const gift = await getStore().getGift(id);
  // jawaban yang sama untuk "tidak ada" dan "kunci salah", supaya id tidak bisa ditebak-tebak
  if (!gift || !keysMatch(gift.editKey, key)) return { error: fail('Kado tidak ditemukan.', 404, 'not_found') };
  return { gift };
}

/** Mengambil isi kado untuk diubah. Butuh kunci ubah milik pembuatnya. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const key = new URL(req.url).searchParams.get('key') ?? '';
    const { gift, error } = await authorize(req, id, key);
    if (error) return error;
    return json({
      id: gift.id,
      slug: gift.slug,
      template: gift.template,
      data: gift.data,
      status: gift.status,
      plan: gift.plan,
      expiresAt: gift.expiresAt,
    });
  } catch (e) {
    return handle(e);
  }
}

/** Menyimpan perubahan isi kado yang sudah terbit. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await req.json().catch(() => null)) as { key?: unknown; data?: unknown } | null;
    const key = typeof body?.key === 'string' ? body.key : '';
    const { gift, error } = await authorize(req, id, key);
    if (error) return error;
    const meta = getTemplate(gift.template);
    if (!meta) return fail('Template tidak dikenal.');
    const store = getStore();
    const data = sanitizeData(meta, body?.data, (u) => store.ownsPhoto(u));
    if (!data.to) return fail('Nama penerima belum diisi.', 400, 'no_recipient');
    await store.updateGift(gift.id, { data });
    return json({ ok: true, slug: gift.slug });
  } catch (e) {
    return handle(e);
  }
}
