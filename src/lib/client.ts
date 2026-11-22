'use client';

import { del, get, set } from 'idb-keyval';
import type { Currency } from '@/lib/site';
import type { GiftData } from '@/templates/types';

/* ───────── draf (IndexedDB, per template) ───────── */

export type Draft = { v: 1; data: GiftData; touched: string[] };

const draftKey = (template: string) => `floa:draft:${template}`;

export async function loadDraft(template: string): Promise<Draft | null> {
  try {
    const d = (await get(draftKey(template))) as Draft | undefined;
    return d && d.v === 1 && d.data ? d : null;
  } catch {
    return null;
  }
}

export async function saveDraft(template: string, draft: Draft) {
  try {
    await set(draftKey(template), draft);
    return true;
  } catch {
    return false;
  }
}

export async function clearDraft(template: string) {
  try {
    await del(draftKey(template));
  } catch {
    /* abaikan */
  }
}

/* ───────── "Kado saya" (localStorage) ───────── */

/** Pesanan seperti yang dikembalikan POST /api/orders. */
export type OrderInfo = {
  id: string;
  slug: string;
  amount: number;
  currency: Currency;
  editKey: string;
  provider: 'borderpay' | 'creem' | 'demo';
  /** mode uji: tidak ada uang nyata */
  test: boolean;
  /** 'qr' = QRIS ditampilkan di floa, 'redirect' = bayar di halaman checkout penyedia */
  kind: 'qr' | 'redirect';
  qr: string | null;
  payUrl: string | null;
  url: string | null;
  expiresAt: string;
};

export type MyGift = {
  id: string;
  slug: string;
  template: string;
  to: string;
  from?: string;
  editKey: string;
  amount: number;
  /** pesanan lama tanpa kolom ini selalu rupiah */
  currency?: Currency;
  status: 'pending' | 'live';
  createdAt: string;
  /** hanya selama menunggu bayar, supaya bisa dilanjutkan */
  pay?: Pick<OrderInfo, 'provider' | 'test' | 'kind' | 'qr' | 'payUrl' | 'url' | 'expiresAt'>;
};

export function findMyGift(id: string): MyGift | undefined {
  return readMyGifts().find((g) => g.id === id);
}

const GIFTS_KEY = 'floa:gifts';

export function readMyGifts(): MyGift[] {
  try {
    const raw = window.localStorage.getItem(GIFTS_KEY);
    const arr = raw ? (JSON.parse(raw) as MyGift[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function upsertMyGift(g: MyGift) {
  try {
    const rest = readMyGifts().filter((x) => x.id !== g.id);
    window.localStorage.setItem(GIFTS_KEY, JSON.stringify([g, ...rest].slice(0, 50)));
  } catch {
    /* abaikan */
  }
}

export function removeMyGift(id: string) {
  try {
    window.localStorage.setItem(GIFTS_KEY, JSON.stringify(readMyGifts().filter((x) => x.id !== id)));
  } catch {
    /* abaikan */
  }
}

/* ───────── foto ───────── */

const MAX_SIDE = 1400;
const TARGET_BYTES = 520 * 1024;

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Foto ini tidak bisa dibaca.'));
    };
    img.src = url;
  });
}

const dataUrlBytes = (u: string) => Math.floor(((u.length - u.indexOf(',') - 1) * 3) / 4);

/** Mengecilkan foto di browser jadi JPEG ringan (data URL), supaya unggah cepat dan hemat kuota. */
export async function compressImage(file: File): Promise<string> {
  const img = await loadImage(file);
  let side = MAX_SIDE;
  let quality = 0.82;
  for (let attempt = 0; attempt < 5; attempt++) {
    const scale = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const g = canvas.getContext('2d');
    if (!g) throw new Error('Browser ini tidak bisa memproses foto.');
    g.fillStyle = '#fff';
    g.fillRect(0, 0, w, h);
    g.drawImage(img, 0, 0, w, h);
    const out = canvas.toDataURL('image/jpeg', quality);
    if (dataUrlBytes(out) <= TARGET_BYTES || attempt === 4) return out;
    side = Math.round(side * 0.82);
    quality = Math.max(0.6, quality - 0.07);
  }
  throw new Error('Foto terlalu besar.');
}

async function dataUrlToBlob(u: string) {
  return (await fetch(u)).blob();
}

/** Mengunggah foto yang masih berupa data URL; yang sudah berupa URL dibiarkan. */
export async function uploadPhotos(photos: string[], onProgress?: (done: number, total: number) => void): Promise<string[]> {
  const out: string[] = [];
  const total = photos.filter((p) => p.startsWith('data:')).length;
  let done = 0;
  for (const p of photos) {
    if (!p.startsWith('data:')) {
      out.push(p);
      continue;
    }
    const form = new FormData();
    form.append('file', await dataUrlToBlob(p), 'foto.jpg');
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok || !json.url) throw new Error(json.error ?? 'Gagal mengunggah foto.');
    out.push(json.url);
    done += 1;
    onProgress?.(done, total);
  }
  return out;
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers,
  });
  const json = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(json.error ?? 'Ada yang tidak beres. Coba lagi ya.');
  return json;
}
