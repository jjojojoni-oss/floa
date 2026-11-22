import { fail, handle, json } from '@/lib/http';
import { allow, clientIp } from '@/lib/ratelimit';
import { getStore } from '@/lib/store';

const MAX_BYTES = 700 * 1024;

/** Mengenali jenis gambar dari isi berkasnya, bukan dari nama atau header kiriman. */
function sniff(b: Uint8Array): { type: string; ext: string } | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { type: 'image/jpeg', ext: 'jpg' };
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { type: 'image/png', ext: 'png' };
  if (b.length > 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50)
    return { type: 'image/webp', ext: 'webp' };
  return null;
}

/** Unggah satu foto (sudah dikecilkan di browser). Mengembalikan URL-nya. */
export async function POST(req: Request) {
  try {
    if (!allow('upload:' + clientIp(req), 40, 10 * 60_000)) return fail('Terlalu banyak unggahan. Coba lagi beberapa menit lagi.', 429, 'rate_limited');
    const declared = Number(req.headers.get('content-length') ?? 0);
    if (declared > MAX_BYTES + 4096) return fail('Foto terlalu besar.', 413, 'too_large');

    const form = await req.formData().catch(() => null);
    const file = form?.get('file');
    if (!(file instanceof Blob)) return fail('Tidak ada foto yang dikirim.');
    if (file.size > MAX_BYTES) return fail('Foto terlalu besar.', 413, 'too_large');

    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = sniff(bytes);
    if (!kind) return fail('Berkas ini bukan foto JPG, PNG, atau WebP.', 415, 'bad_type');

    const url = await getStore().putPhoto(bytes, kind.type, kind.ext);
    return json({ url });
  } catch (e) {
    return handle(e);
  }
}
