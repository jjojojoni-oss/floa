import type { TemplateMeta } from '../types';

/* KERANGKA: akan diganti seluruhnya. */
export const meta: TemplateMeta = {
  id: 'anniversary',
  name: 'Anniversary',
  tagline: 'Segera hadir.',
  steps: ['Buka', 'Baca'],
  occasions: ['anniv'],
  palette: { bg: '#e9d9b8', ink: '#3a2018', accent: '#c8372d' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    { key: 'title', label: 'Ucapan utama', max: 40 },
    { key: 'message', label: 'Surat', max: 900, multiline: true },
  ],
  sample: { to: 'Laras', from: 'Bima', title: 'Untuk kamu.', notes: [], message: 'Segera hadir.', photos: [] },
  i18n: {
    ms: { name: 'Anniversary', tagline: 'Akan datang.', steps: ['Buka', 'Baca'], fields: {}, sample: { to: 'Laras', from: 'Bima', title: 'Untuk kamu.', notes: [], message: 'Segera hadir.', photos: [] } },
    en: { name: 'Anniversary', tagline: 'Coming soon.', steps: ['Open', 'Read'], fields: {}, sample: { to: 'Laras', from: 'Bima', title: 'Untuk kamu.', notes: [], message: 'Segera hadir.', photos: [] } },
  },
};
