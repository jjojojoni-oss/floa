import Link from 'next/link';
import { COVERS } from '@/templates/covers';
import { TEMPLATES } from '@/templates/registry';

/* halaman bantu saat membangun: semua ilustrasi kartu dalam ukuran katalog */
export default function CoversPage() {
  return (
    <main className="mx-auto grid max-w-3xl grid-cols-2 gap-3 p-3 sm:grid-cols-4">
      {TEMPLATES.map((t) => {
        const Cover = COVERS[t.id];
        return (
          <Link key={t.id} href={`/demo/${t.id}`} className="block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl" data-cover={t.id}>
              <Cover />
            </div>
            <div className="mt-1 text-sm font-bold">{t.name}</div>
          </Link>
        );
      })}
    </main>
  );
}
