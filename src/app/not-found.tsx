import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <Logo />
      <h1 className="font-display mt-8 text-3xl font-semibold">Halamannya tidak ketemu</h1>
      <p className="mt-3 text-ink-2">Kalau ini link kado, coba cek lagi ejaannya. Bisa juga kadonya belum selesai diterbitkan.</p>
      <Link href="/" className="btn btn-primary mt-7 h-12 px-6">
        Lihat semua template
      </Link>
    </main>
  );
}
