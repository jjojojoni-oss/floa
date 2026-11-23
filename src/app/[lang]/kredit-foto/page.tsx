import type { Metadata } from 'next';
import { Legal } from '@/components/Legal';
import { localeOf } from '@/i18n/server';
import { CONTOH_PHOTOS } from '@/lib/photos';

type Props = { params: Promise<{ lang: string }> };

/** Teks halaman ini sengaja ditulis di sini (bukan di kamus), karena hanya dipakai di satu tempat. */
const TEXT = {
  id: {
    title: 'Kredit foto',
    updated: 'Foto asli di demo template',
    intro:
      'Foto-foto di demo dan isi contoh template floa adalah karya fotografer di Wikimedia Commons yang dibagikan dengan lisensi bebas. Terima kasih banyak untuk mereka. Foto yang kamu unggah sendiri tidak ikut tampil di sini.',
    by: 'oleh',
    source: 'Sumber',
    changed: 'Diperkecil dan dipotong agar pas di layar HP.',
  },
  ms: {
    title: 'Kredit foto',
    updated: 'Foto sebenar dalam demo templat',
    intro:
      'Foto-foto dalam demo dan isi contoh templat floa ialah hasil karya jurugambar di Wikimedia Commons yang dikongsi dengan lesen bebas. Terima kasih banyak kepada mereka. Foto yang kamu muat naik sendiri tidak dipaparkan di sini.',
    by: 'oleh',
    source: 'Sumber',
    changed: 'Dikecilkan dan dipotong supaya muat di skrin telefon.',
  },
  en: {
    title: 'Photo credits',
    updated: 'Real photos used in template demos',
    intro:
      'The photos in floa’s template demos and sample content are the work of photographers on Wikimedia Commons, shared under free licenses. Many thanks to them. Photos you upload yourself never appear here.',
    by: 'by',
    source: 'Source',
    changed: 'Resized and cropped to fit phone screens.',
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = TEXT[await localeOf(params)];
  return { title: t.title };
}

export default async function KreditFotoPage({ params }: Props) {
  const t = TEXT[await localeOf(params)];
  return (
    <Legal title={t.title} updated={t.updated}>
      <p>{t.intro}</p>
      <ul className="!mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 [&>li]:!ml-0 [&>li]:!list-none">
        {CONTOH_PHOTOS.map((p) => (
          <li key={p.file} className="flex min-w-0 gap-3 rounded-2xl bg-white/60 p-2.5 shadow-[inset_0_0_0_1px_var(--color-line)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.file} alt="" loading="lazy" className="h-16 w-16 flex-none rounded-xl object-cover" />
            <div className="min-w-0 text-[13px] leading-snug">
              <a href={p.source} target="_blank" rel="noopener" className="block truncate font-bold text-ink underline-offset-2 hover:underline">
                {p.title}
              </a>
              <div className="truncate">
                {t.by} {p.author}
              </div>
              <div>
                <a href={p.licenseUrl || p.source} target="_blank" rel="noopener license" className="underline underline-offset-2">
                  {p.license}
                </a>
                {' · '}
                <a href={p.source} target="_blank" rel="noopener" className="underline underline-offset-2">
                  {t.source}
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-[13px] text-muted">{t.changed}</p>
    </Legal>
  );
}
