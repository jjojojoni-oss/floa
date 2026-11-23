import type { TemplateMeta } from '../types';

/* KERANGKA: akan diganti seluruhnya. */
export const meta: TemplateMeta = {
  id: 'bento',
  name: 'Your Bento',
  tagline: 'Segera hadir.',
  steps: ['Buka', 'Baca'],
  occasions: ['kangen', 'sahabat', 'ortu', 'ultah', 'maaf'],
  palette: { bg: '#f1dfc4', ink: '#3c2415', accent: '#e4572e' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    { key: 'title', label: 'Ucapan utama', max: 40 },
    { key: 'message', label: 'Surat', max: 900, multiline: true },
  ],
  sample: { to: 'Laras', from: 'Bima', title: 'Untuk kamu.', notes: [], message: 'Segera hadir.', photos: [] },
  i18n: {
    ms: { name: 'Your Bento', tagline: 'Akan datang.', steps: ['Buka', 'Baca'], fields: {}, sample: { to: 'Laras', from: 'Bima', title: 'Untuk kamu.', notes: [], message: 'Segera hadir.', photos: [] } },
    en: { name: 'Your Bento', tagline: 'Coming soon.', steps: ['Open', 'Read'], fields: {}, sample: { to: 'Laras', from: 'Bima', title: 'Untuk kamu.', notes: [], message: 'Segera hadir.', photos: [] } },
  },
};
