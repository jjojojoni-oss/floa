import { type NextRequest, NextResponse } from 'next/server';
import { LANG_COOKIE, LOCALES, isLocale, localeFromCountry } from './i18n/config';

/**
 * Memilih bahasa tanpa mengubah URL:
 * 1. ?lang=en (dari pemilih bahasa) → simpan di cookie, lalu kembali ke URL yang bersih.
 * 2. Ada cookie pilihan manual → pakai itu.
 * 3. Selain itu → dari negara pengunjung (header Vercel): Indonesia → id, Malaysia → ms, lainnya → en.
 * Halaman lalu dilayani dari /[lang]/... di balik layar (rewrite), jadi tetap bisa di-cache per bahasa.
 */
export function proxy(req: NextRequest) {
  const url = req.nextUrl;

  const asked = url.searchParams.get('lang');
  if (asked !== null) {
    const clean = url.clone();
    clean.searchParams.delete('lang');
    const res = NextResponse.redirect(clean);
    if (isLocale(asked)) {
      res.cookies.set(LANG_COOKIE, asked, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
    }
    return res;
  }

  // jalur internal yang sudah berbahasa (mis. dibuka langsung): biarkan
  const first = url.pathname.split('/')[1];
  if ((LOCALES as readonly string[]).includes(first)) return NextResponse.next();

  const saved = req.cookies.get(LANG_COOKIE)?.value;
  const locale = isLocale(saved) ? saved : localeFromCountry(req.headers.get('x-vercel-ip-country'));
  const target = url.clone();
  target.pathname = `/${locale}${url.pathname === '/' ? '' : url.pathname}`;
  return NextResponse.rewrite(target);
}

export const config = {
  // semua halaman, kecuali API, aset Next, lukisan, dan berkas berekstensi (robots.txt, sitemap.xml, ikon)
  matcher: ['/((?!api|_next|art|.*\\..*).*)'],
};
