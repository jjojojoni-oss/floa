'use client';

import { type ReactNode, createContext, useContext } from 'react';
import { DEFAULT_LOCALE, type Locale } from './config';
import type { Dict } from './dict';

type Ctx = { locale: Locale; dict: Dict };

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ locale, dict, children }: Ctx & { children: ReactNode }) {
  return <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>;
}

/** Bahasa aktif: 'id' | 'ms' | 'en'. */
export function useLocale(): Locale {
  return useContext(I18nContext)?.locale ?? DEFAULT_LOCALE;
}

/** Kamus teks untuk bahasa aktif. */
export function useT(): Dict {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT dipakai di luar I18nProvider');
  return ctx.dict;
}

/** Pilih teks dari objek per bahasa: pick({ id: 'Halo', ms: 'Hai', en: 'Hi' }). */
export function usePick() {
  const locale = useLocale();
  return <T,>(byLocale: Record<Locale, T>): T => byLocale[locale];
}

export { fmt } from './fmt';
