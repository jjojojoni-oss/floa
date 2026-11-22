import type { Locale } from '@/i18n/config';
import type { Currency, PlanId } from './site';
import type { GiftData, TemplateMeta } from '@/templates/types';

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
};

export const EMPTY_DATA: GiftData = { to: '', from: '', title: '', message: '', notes: [], photos: [] };

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

function clean(v: unknown, max: number, multiline = false) {
  if (typeof v !== 'string') return '';
  let s = stripInvisible(v.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10)));
  s = multiline ? s.replace(/\n{3,}/g, '\n\n') : s.replace(/\n+/g, ' ');
  return s.trim().slice(0, max);
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
      const arr = Array.isArray(src.photos) ? src.photos : [];
      out.photos = arr.filter((u): u is string => typeof u === 'string' && allowPhoto(u)).slice(0, f.count);
    } else {
      out[f.key] = clean(src[f.key], f.max, 'multiline' in f && !!f.multiline);
    }
  }
  return out;
}

export function isExpired(gift: Pick<Gift, 'expiresAt'>, now = Date.now()) {
  return !!gift.expiresAt && new Date(gift.expiresAt).getTime() < now;
}
