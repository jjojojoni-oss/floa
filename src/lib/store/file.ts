import { randomBytes } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Gift } from '../gift';
import type { Store } from './types';

/**
 * Penyimpanan berkas lokal untuk pengembangan (`npm run dev`).
 * Tidak dipakai di produksi: di Vercel sistem berkasnya tidak permanen.
 */
const ROOT = path.join(process.cwd(), '.data');
const dir = (name: string) => path.join(ROOT, name);

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as T;
  } catch {
    return null;
  }
}

const safe = (s: string) => s.replace(/[^a-zA-Z0-9._-]/g, '');

export const UPLOAD_DIR = dir('uploads');

export const fileStore: Store = {
  kind: 'file',

  async getGift(id) {
    const g = await readJson<Omit<Gift, 'currency' | 'lang' | 'providerRef' | 'payExpiresAt' | 'passHash' | 'passHint'> & Partial<Gift>>(
      path.join(dir('gifts'), `${safe(id)}.json`),
    );
    // pesanan lama (sebelum ada pilihan mata uang) selalu rupiah
    return g ? { ...g, currency: g.currency ?? 'IDR', lang: g.lang ?? 'id', passHash: g.passHash ?? null, passHint: g.passHint ?? null, providerRef: g.providerRef ?? null, payExpiresAt: g.payExpiresAt ?? null } : null;
  },

  async getGiftBySlug(slug) {
    const ref = await readJson<{ id: string }>(path.join(dir('slugs'), `${safe(slug)}.json`));
    return ref ? this.getGift(ref.id) : null;
  },

  async insertGift(gift) {
    await mkdir(dir('gifts'), { recursive: true });
    await mkdir(dir('slugs'), { recursive: true });
    try {
      // flag 'wx' = gagal kalau berkas sudah ada, jadi slug tidak bisa dipakai dua kali
      await writeFile(path.join(dir('slugs'), `${safe(gift.slug)}.json`), JSON.stringify({ id: gift.id }), { flag: 'wx' });
    } catch {
      return false;
    }
    await writeFile(path.join(dir('gifts'), `${safe(gift.id)}.json`), JSON.stringify(gift, null, 2));
    return true;
  },

  async updateGift(id, patch) {
    const cur = await this.getGift(id);
    if (!cur) return null;
    const next = { ...cur, ...patch, id: cur.id, slug: cur.slug };
    await writeFile(path.join(dir('gifts'), `${safe(id)}.json`), JSON.stringify(next, null, 2));
    return next;
  },

  async renameSlug(id, slug) {
    const cur = await this.getGift(id);
    if (!cur) return false;
    if (cur.slug === slug) return true;
    try {
      await writeFile(path.join(dir('slugs'), `${safe(slug)}.json`), JSON.stringify({ id }), { flag: 'wx' });
    } catch {
      return false;
    }
    await rm(path.join(dir('slugs'), `${safe(cur.slug)}.json`), { force: true });
    await writeFile(path.join(dir('gifts'), `${safe(id)}.json`), JSON.stringify({ ...cur, slug }, null, 2));
    return true;
  },

  async deleteGift(id) {
    const cur = await this.getGift(id);
    if (!cur) return;
    await rm(path.join(dir('slugs'), `${safe(cur.slug)}.json`), { force: true });
    await rm(path.join(dir('gifts'), `${safe(id)}.json`), { force: true });
  },

  async putPhoto(bytes, _contentType, ext) {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${randomBytes(12).toString('hex')}.${safe(ext)}`;
    await writeFile(path.join(UPLOAD_DIR, name), bytes);
    return `/api/file/${name}`;
  },

  ownsPhoto(url) {
    return /^\/api\/file\/[a-f0-9]{24}\.(jpg|png|webp)$/.test(url);
  },
};
