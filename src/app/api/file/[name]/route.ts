import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getStore } from '@/lib/store';
import { UPLOAD_DIR } from '@/lib/store/file';

const TYPES: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

/** Menyajikan foto dari penyimpanan lokal. Hanya aktif saat pengembangan (di produksi foto ada di Supabase). */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const m = /^[a-f0-9]{24}\.(jpg|png|webp)$/.exec(name);
  let kind: string;
  try {
    kind = getStore().kind;
  } catch {
    kind = 'none';
  }
  if (!m || kind !== 'file') return new Response('Not found', { status: 404 });
  try {
    const buf = await readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(buf), {
      headers: {
        'Content-Type': TYPES[m[1]],
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
