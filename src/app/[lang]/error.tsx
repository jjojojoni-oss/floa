'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { useT } from '@/i18n/client';

/** Tampil kalau sebuah halaman gagal dimuat (mis. penyimpanan sedang bermasalah). */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <Logo />
      <h1 className="font-display mt-8 text-3xl font-semibold">{t.error.title}</h1>
      <p className="mt-3 text-ink-2">{t.error.sub}</p>
      <div className="mt-7 flex gap-2">
        <button type="button" onClick={reset} className="btn btn-primary h-12 px-6">
          {t.error.retry}
        </button>
        <Link href="/" className="btn btn-ghost h-12 px-6">
          {t.error.home}
        </Link>
      </div>
    </main>
  );
}
