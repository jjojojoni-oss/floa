import { handle, json } from '@/lib/http';
import { slugTaken } from '@/lib/orders';
import { allow, clientIp } from '@/lib/ratelimit';
import { slugProblem, slugify } from '@/lib/slug';

/** Cek ketersediaan alamat kado. */
export async function GET(req: Request) {
  try {
    if (!allow('slug:' + clientIp(req), 120, 60_000)) return json({ ok: false, reason: 'slow_down' }, 429);
    const raw = new URL(req.url).searchParams.get('s') ?? '';
    const slug = raw.trim().toLowerCase();
    const problem = slugProblem(slug);
    if (problem) return json({ ok: false, reason: problem });
    if (!(await slugTaken(slug))) return json({ ok: true });

    // sudah dipakai → tawarkan beberapa alternatif yang masih kosong
    for (const cand of [`${slug}-ku`, `${slug}-${new Date().getFullYear()}`, `${slug}-${Math.floor(10 + Math.random() * 89)}`]) {
      const s = slugify(cand);
      if (!slugProblem(s) && !(await slugTaken(s))) return json({ ok: false, reason: 'taken', suggestion: s });
    }
    return json({ ok: false, reason: 'taken' });
  } catch (e) {
    return handle(e);
  }
}
