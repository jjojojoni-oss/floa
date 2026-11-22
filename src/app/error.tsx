'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';

/** Tampil kalau sebuah halaman gagal dimuat (mis. penyimpanan sedang bermasalah). */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <Logo />
      <h1 className="font-display mt-8 text-3xl font-semibold">Lagi ada gangguan</h1>
      <p className="mt-3 text-ink-2">Halaman ini belum bisa dimuat. Biasanya cuma sebentar, coba lagi ya.</p>
      <div className="mt-7 flex gap-2">
        <button type="button" onClick={reset} className="btn btn-primary h-12 px-6">
          Coba lagi
        </button>
        <Link href="/" className="btn btn-ghost h-12 px-6">
          Ke halaman awal
        </Link>
      </div>
    </main>
  );
}
