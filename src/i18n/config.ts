/** Bahasa yang didukung floa. Urutan = urutan di pemilih bahasa. */
export const LOCALES = ['id', 'ms', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'id';

/** Cookie pilihan bahasa manual (dari pemilih bahasa). Tanpa cookie, bahasa mengikuti negara pengunjung. */
export const LANG_COOKIE = 'floa_lang';

export const LOCALE_NAMES: Record<Locale, string> = { id: 'Bahasa Indonesia', ms: 'Bahasa Melayu', en: 'English' };
export const LOCALE_SHORT: Record<Locale, string> = { id: 'ID', ms: 'MY', en: 'EN' };
/** Untuk atribut <html lang> dan og:locale. */
export const HTML_LANG: Record<Locale, string> = { id: 'id', ms: 'ms', en: 'en' };
export const OG_LOCALE: Record<Locale, string> = { id: 'id_ID', ms: 'ms_MY', en: 'en_US' };

export function isLocale(v: unknown): v is Locale {
  return typeof v === 'string' && (LOCALES as readonly string[]).includes(v);
}

/** Indonesia → Bahasa Indonesia, Malaysia → Bahasa Melayu, negara lain → English. Tanpa info negara (mis. di lokal) → Indonesia. */
export function localeFromCountry(country: string | null | undefined): Locale {
  const c = (country ?? '').toUpperCase();
  if (!c || c === 'ID') return 'id';
  if (c === 'MY') return 'ms';
  return 'en';
}
