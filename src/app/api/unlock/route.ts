import { isExpired } from '@/lib/gift';
import { fail, handle, json } from '@/lib/http';
import { verifyPassword } from '@/lib/lock';
import { allow, clientIp } from '@/lib/ratelimit';
import { isGiftPath } from '@/lib/slug';
import { getStore } from '@/lib/store';

/**
 * Membuka kado yang dikunci kata sandi. Isi kado (pesan, foto, musik) baru dikirim setelah kata sandinya cocok;
 * halaman kado sendiri tidak pernah memuatnya.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as { slug?: unknown; password?: unknown } | null;
    const slug = typeof body?.slug === 'string' ? body.slug.toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password.slice(0, 100) : '';
    if (!isGiftPath(slug)) return fail('Kado tidak ditemukan.', 404, 'not_found');

    // kata sandi kado sering pendek (tanggal), jadi percobaan dibatasi per perangkat & per kado
    const ip = clientIp(req);
    if (!allow(`unlock:${ip}:${slug}`, 8, 10 * 60_000) || !allow(`unlock:${slug}`, 120, 10 * 60_000)) {
      return fail('Terlalu banyak percobaan. Coba lagi beberapa menit lagi.', 429, 'rate_limited');
    }

    const gift = await getStore().getGiftBySlug(slug);
    if (!gift || gift.status !== 'live' || isExpired(gift)) return fail('Kado tidak ditemukan.', 404, 'not_found');
    if (gift.passHash && !verifyPassword(password, gift.passHash)) return fail('Kata sandinya belum pas.', 401, 'wrong_password');
    return json({ data: gift.data });
  } catch (e) {
    return handle(e);
  }
}
