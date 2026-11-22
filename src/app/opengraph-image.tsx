import { OG_SIZE, ogCard } from '@/lib/og';

export const alt = 'floa, kado digital yang dibuka dari HP';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return ogCard({
    eyebrow: 'Kado digital',
    title: 'Kado yang bikin dia senyum.',
    sub: 'Pilih template, isi, bayar QRIS. Link langsung jadi.',
    bg: '#fbf6ee',
    ink: '#1e1b18',
    accent: '#f2542d',
  });
}
