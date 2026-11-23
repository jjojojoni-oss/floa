import type { TemplateMeta } from '../types';

/* KERANGKA: akan diganti seluruhnya. */
export const meta: TemplateMeta = {
  id: 'memories',
  name: 'Our Memories',
  tagline: 'Segera hadir.',
  steps: ['Buka', 'Baca'],
  occasions: ['sahabat', 'anniv', 'kangen', 'ortu', 'wisuda'],
  palette: { bg: '#232745', ink: '#fff3dc', accent: '#ffb84d' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    { key: 'title', label: 'Ucapan utama', max: 40 },
    { key: 'message', label: 'Surat', max: 900, multiline: true },
  ],
  sample: { to: 'Laras', from: 'Bima', title: 'Untuk kamu.', notes: [], message: 'Segera hadir.', photos: [] },
  i18n: {
    ms: { name: 'Our Memories', tagline: 'Akan datang.', steps: ['Buka', 'Baca'], fields: {}, sample: { to: 'Laras', from: 'Bima', title: 'Untuk kamu.', notes: [], message: 'Segera hadir.', photos: [] } },
    en: { name: 'Our Memories', tagline: 'Coming soon.', steps: ['Open', 'Read'], fields: {}, sample: { to: 'Laras', from: 'Bima', title: 'Untuk kamu.', notes: [], message: 'Segera hadir.', photos: [] } },
  },
};
