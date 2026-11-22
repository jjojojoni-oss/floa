import Link from 'next/link';
import { SITE } from '@/lib/site';
import { Logo } from './Logo';

export function SiteHeader() {
  return (
    <header className="flex h-14 items-center justify-between sm:h-16">
      <Link href="/" aria-label="floa, ke halaman awal">
        <Logo />
      </Link>
      <Link href="/kado-saya" className="btn btn-ghost h-9 px-3.5 text-[13px]">
        Kado saya
      </Link>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line py-8 text-sm text-muted">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo size={22} />
          <p className="mt-1.5">Kado digital yang dibuka dari HP.</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 font-semibold text-ink-2">
          <Link href="/#template">Template</Link>
          <Link href="/kado-saya">Kado saya</Link>
          <Link href="/syarat">Syarat</Link>
          <Link href="/privasi">Privasi</Link>
          <a href={`mailto:${SITE.contact.email}`}>{SITE.contact.email}</a>
        </nav>
      </div>
    </footer>
  );
}
