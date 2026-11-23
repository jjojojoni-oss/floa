import type { TemplateMeta } from '../types';

/* KERANGKA: akan diganti seluruhnya. */
export const meta: TemplateMeta = {
  id: 'scrapbook',
  name: 'Our Scrapbook',
  tagline: 'Segera hadir.',
  steps: ['Buka', 'Baca'],
  occasions: ['anniv', 'sahabat', 'ultah', 'kangen'],
  palette: { bg: '#cdbfa6', ink: '#3b2a1f', accent: '#c8553d' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    { key: 'title', label: 'Ucapan utama', max: 40 },
    { key: 'message', label: 'Surat', max: 900, multiline: true },
  ],
  sample: { to: 'Laras', from: 'Bima', title: 'Untuk kamu.', notes: [], message: 'Segera hadir.', photos: [] },
  i18n: {
    ms: { name: 'Our Scrapbook', tagline: 'Akan datang.', steps: ['Buka', 'Baca'], fields: {}, sample: { to: 'Laras', from: 'Bima', title: 'Untuk kamu.', notes: [], message: 'Segera hadir.', photos: [] } },
    en: { name: 'Our Scrapbook', tagline: 'Coming soon.', steps: ['Open', 'Read'], fields: {}, sample: { to: 'Laras', from: 'Bima', title: 'Untuk kamu.', notes: [], message: 'Segera hadir.', photos: [] } },
  },
};
