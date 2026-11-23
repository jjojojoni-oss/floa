import type { Locale } from '@/i18n/config';
import type { Currency, PlanId } from './site';
import { cleanMusic } from './music';
import type { GiftAsk, GiftData, TemplateMeta } from '@/templates/types';

export type GiftStatus = 'pending' | 'live';

export type Gift = {
  id: string;
  slug: string;
  template: string;
  data: GiftData;
  status: GiftStatus;
  plan: PlanId;
  /** dalam satuan terkecil `currency` (rupiah, atau sen untuk USD) */
  amount: number;
  currency: Currency;
  /** bahasa pengirim saat memesan: dipakai halaman kado dan pratinjau link-nya */
  lang: Locale;
  /** kunci rahasia untuk mengubah isi kado; hanya dipegang pembuatnya */
  editKey: string;
  contact: string | null;
  /** 'borderpay' | 'creem' | 'demo' */
  provider: string;
  /** ID transaksi di sisi penyedia (checkout Creem / reference BorderPay) */
  providerRef: string | null;
  /** batas waktu bayar dari penyedia; lewat dari ini pesanan berhenti menahan alamat kado */
  payExpiresAt: string | null;
  createdAt: string;
  paidAt: string | null;
  /** null = tidak pernah kedaluwarsa */
  expiresAt: string | null;
  /** hash kata sandi (lihat lib/lock); null = kado tidak dikunci */
  passHash: string | null;
  /** petunjuk kata sandi, terlihat oleh siapa pun yang membuka link */
  passHint: string | null;
  /** bentuk kata sandi untuk layar kunci: 'd6' = 6 angka (papan angka), null = teks bebas */
  passShape: string | null;
};

/** panjang maksimal kalimat pembuka */
export const INTRO_MAX = 200;

export const EMPTY_DATA: GiftData = { to: '', from: '', title: '', message: '', notes: [], photos: [], music: null };

/** Membuang karakter kontrol dan karakter tak terlihat yang bisa dipakai untuk mengelabui tampilan. */
function stripInvisible(s: string) {
  let out = '';
  for (const ch of s) {
    const c = ch.codePointAt(0) ?? 0;
    if (c === 0x2028 || c === 0x2029) {
      out += String.fromCharCode(10);
      continue;
    }
    const drop =
      c <= 0x08 ||
      (c >= 0x0b && c <= 0x1f) ||
      c === 0x7f ||
      c === 0x200b ||
      c === 0x200e ||
      c === 0x200f ||
      (c >= 0x202a && c <= 0x202e) ||
      (c >= 0x2066 && c <= 0x2069) ||
      c === 0xfeff;
    if (!drop) out += ch;
  }
  return out;
}

export function clean(v: unknown, max: number, multiline = false) {
  if (typeof v !== 'string') return '';
  let s = stripInvisible(v.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10)));
  s = multiline ? s.replace(/\n{3,}/g, '\n\n') : s.replace(/\n+/g, ' ');
  return s.trim().slice(0, max);
}

/** Tanggal kalender YYYY-MM-DD yang benar-benar ada, antara 1900 dan besok (zona waktu pembuat bisa lebih maju). */
export function cleanDate(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = Date.UTC(y, mo - 1, d);
  const back = new Date(t);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return null;
  if (y < 1900 || t > Date.now() + 36 * 3600_000) return null;
  return m[0];
}

export const CAPTION_MAX = 80;
export const ASK_Q_MAX = 80;
export const ASK_A_MAX = 24;

/**
 * Template yang catatannya sendiri sudah dipakai sebagai tulisan di bawah tiap foto (notes = keterangan
 * foto), sehingga kolom "cerita foto" terpisah akan dobel. Di template lain, cerita foto muncul dengan
 * tulisan tangan di bawah polaroid di bagian Kenangan setelah surat. Template baru yang memakai catatan
 * sebagai keterangan foto cukup memberi `captions: false` pada kolom fotonya.
 */
const PHOTOS_PAIRED_WITH_NOTES = new Set(['polaroid', 'scrapbook', 'memories']);

export function photoCaptionsOn(meta: TemplateMeta) {
  const spec = meta.fields.find((f) => f.key === 'photos');
  if (!spec || spec.key !== 'photos') return false;
  if (spec.captions === false) return false;
  return !PHOTOS_PAIRED_WITH_NOTES.has(meta.id);
}

function cleanAsk(v: unknown): GiftAsk | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const q = clean(o.q, ASK_Q_MAX);
  if (!q) return null;
  return { q, a: clean(o.a, ASK_A_MAX), b: clean(o.b, ASK_A_MAX) };
}

/**
 * Menyaring isi kado sesuai kolom milik templatenya. Apa pun yang tidak dikenal dibuang,
 * panjang dibatasi, dan foto hanya boleh dari penyimpanan kita sendiri.
 */
export function sanitizeData(meta: TemplateMeta, input: unknown, allowPhoto: (url: string) => boolean): GiftData {
  const src = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const out: GiftData = { ...EMPTY_DATA, notes: [], photos: [] };
  for (const f of meta.fields) {
    if (f.key === 'notes') {
      const arr = Array.isArray(src.notes) ? src.notes : [];
      out.notes = arr.slice(0, f.count).map((n) => clean(n, f.max));
      // catatan boleh kosong di tengah (mis. caption foto), tapi buang ekor yang kosong
      while (out.notes.length && !out.notes[out.notes.length - 1]) out.notes.pop();
    } else if (f.key === 'photos') {
      // foto & ceritanya disaring berpasangan supaya urutannya tetap sejajar
      const arr = Array.isArray(src.photos) ? src.photos : [];
      const caps = Array.isArray(src.captions) ? src.captions : [];
      const photos: string[] = [];
      const captions: string[] = [];
      arr.forEach((u, i) => {
        if (photos.length >= f.count || typeof u !== 'string' || !allowPhoto(u)) return;
        photos.push(u);
        captions.push(clean(caps[i], CAPTION_MAX));
      });
      out.photos = photos;
      if (captions.some(Boolean)) out.captions = captions;
    } else if (f.key === 'date') {
      const d = cleanDate(src.date);
      if (d) out.date = d;
    } else {
      out[f.key] = clean(src[f.key], f.max, 'multiline' in f && !!f.multiline);
    }
  }
  out.music = cleanMusic(src.music, (s, max) => clean(s, max));
  const intro = clean(src.intro, INTRO_MAX, true);
  if (intro) out.intro = intro;
  const ask = cleanAsk(src.ask);
  if (ask) out.ask = ask;
  return out;
}

export function isExpired(gift: Pick<Gift, 'expiresAt'>, now = Date.now()) {
  return !!gift.expiresAt && new Date(gift.expiresAt).getTime() < now;
}
