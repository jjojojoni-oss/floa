'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { useT } from '@/i18n/client';

export default function NotFound() {
  const t = useT();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <Logo />
      <h1 className="font-display mt-8 text-3xl font-semibold">{t.notFound.title}</h1>
      <p className="mt-3 text-ink-2">{t.notFound.sub}</p>
      <Link href="/" className="btn btn-primary mt-7 h-12 px-6">
        {t.notFound.cta}
      </Link>
    </main>
  );
}
