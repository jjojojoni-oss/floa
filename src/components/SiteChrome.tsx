'use client';

import Link from 'next/link';
import { useLocale, useT } from '@/i18n/client';
import { LOCALES, LOCALE_NAMES, LOCALE_SHORT } from '@/i18n/config';
import { SITE } from '@/lib/site';
import { Logo } from './Logo';

/**
 * Pemilih bahasa. Tautan biasa (bukan navigasi klien) ke ?lang=xx: proxy menyimpan pilihan di cookie
 * lalu kembali ke halaman yang sama dalam bahasa baru.
 */
export function LangSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale();
  const t = useT();
  return (
    <nav aria-label={t.nav.language} className={'glass inline-flex rounded-full p-1 text-[12px] font-extrabold ' + className}>
      {LOCALES.map((l) => (
        <a
          key={l}
          href={`?lang=${l}`}
          hrefLang={l}
          lang={l}
          title={LOCALE_NAMES[l]}
          aria-current={l === locale ? 'true' : undefined}
          className={
            'grid h-8 min-w-9 place-items-center rounded-full px-2 transition-colors ' +
            (l === locale ? 'bg-ink text-[#fff6e6]' : 'text-ink-2 hover:text-ink')
          }
        >
          {LOCALE_SHORT[l]}
        </a>
      ))}
    </nav>
  );
}

export function SiteHeader() {
  const t = useT();
  // di HP header diberi jarak dari bilah alamat browser supaya logo & tombolnya tidak mepet. Pakai padding (dengan
  // tinggi yang ditambah), BUKAN margin: margin atas "bocor" ke pembungkus halaman sehingga lukisan latarnya ikut turun
  // dan menyisakan strip putih di paling atas.
  return (
    <header className="flex h-[4.75rem] items-center justify-between gap-2 pt-3 sm:h-20 sm:pt-0">
      <Link href="/" aria-label={t.nav.home} className="glass rounded-full py-2 pl-2.5 pr-4">
        <Logo />
      </Link>
      <div className="flex items-center gap-2">
        {/* di HP pemilih bahasa hanya di footer, supaya header lega */}
        <LangSwitcher className="max-sm:hidden" />
        <Link href="/kado-saya" className="btn btn-ghost h-10 px-4 text-[13px]">
          {t.nav.myGifts}
        </Link>
      </div>
    </header>
  );
}

/** Label tautan kredit foto (sengaja di sini, bukan di kamus). */
const PHOTO_CREDITS: Record<string, string> = { id: 'Kredit foto', ms: 'Kredit foto', en: 'Photo credits' };

export function SiteFooter() {
  const t = useT();
  const locale = useLocale();
  return (
    <footer className="relative mt-20 pb-40 pt-8 text-sm text-ink-2 sm:pb-52">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo size={22} />
          <p className="font-hand mt-1 text-xl">{t.nav.footerTag}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 font-bold">
          <Link href="/#template">{t.nav.templates}</Link>
          <Link href="/kado-saya">{t.nav.myGifts}</Link>
          <Link href="/syarat">{t.nav.terms}</Link>
          <Link href="/privasi">{t.nav.privacy}</Link>
          <Link href="/kredit-foto">{PHOTO_CREDITS[locale] ?? PHOTO_CREDITS.en}</Link>
          <a href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</a>
          <LangSwitcher />
        </nav>
      </div>
      {/* taman lukisan di kaki halaman */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/art/taman.webp"
        alt=""
        loading="lazy"
        className="pointer-events-none absolute bottom-0 left-1/2 h-36 w-screen max-w-none -translate-x-1/2 object-cover object-top sm:h-48"
      />
    </footer>
  );
}
