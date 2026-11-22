import 'server-only';
import { DEFAULT_LOCALE, type Locale, isLocale } from './config';
import { getDict } from './dict';

/** Bahasa dari segmen [lang] (diisi proxy). */
export async function localeOf(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  return isLocale(lang) ? lang : DEFAULT_LOCALE;
}

export async function dictOf(params: Promise<{ lang: string }>) {
  const locale = await localeOf(params);
  return { locale, t: getDict(locale) };
}
