import Link from 'next/link';
import { SITE } from '@/lib/site';
import { Logo } from './Logo';

export function SiteHeader() {
  return (
    <header className="flex h-16 items-center justify-between sm:h-20">
      <Link href="/" aria-label="floa, ke halaman awal" className="glass rounded-full py-2 pl-2.5 pr-4">
        <Logo />
      </Link>
      <Link href="/kado-saya" className="btn btn-ghost h-10 px-4 text-[13px]">
        Kado saya
      </Link>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative mt-20 pb-40 pt-8 text-sm text-ink-2 sm:pb-52">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo size={22} />
          <p className="font-hand mt-1 text-xl">Kado kecil, dilukis dengan niat.</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 font-bold">
          <Link href="/#template">Template</Link>
          <Link href="/kado-saya">Kado saya</Link>
          <Link href="/syarat">Syarat</Link>
          <Link href="/privasi">Privasi</Link>
          <a href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</a>
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
