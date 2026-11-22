import 'server-only';

/**
 * Pembatas sederhana per alamat IP, disimpan di memori proses.
 * Di serverless tiap instance punya hitungannya sendiri, jadi ini hanya rem darurat,
 * bukan perlindungan penuh.
 */
const hits = new Map<string, { n: number; reset: number }>();

export function allow(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  }
  const cur = hits.get(key);
  if (!cur || cur.reset < now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  cur.n += 1;
  return cur.n <= limit;
}

export function clientIp(req: Request) {
  const xf = req.headers.get('x-forwarded-for');
  return (xf ? xf.split(',')[0] : req.headers.get('x-real-ip') ?? 'local').trim();
}
