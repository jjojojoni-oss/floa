import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'amplop',
  name: 'Amplop Rahasia',
  tagline: 'Surat bersegel lilin. Segelnya ditekan sampai patah, baru isinya terbaca.',
  steps: ['Balik amplop', 'Tahan segelnya', 'Baca surat'],
  occasions: ['ortu', 'maaf', 'kangen', 'sahabat', 'anniv'],
  palette: { bg: '#d5dbc0', ink: '#2c3122', accent: '#b3261e' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    { key: 'title', label: 'Judul surat', hint: 'Tertulis di kepala surat.', max: 40 },
    { key: 'message', label: 'Isi surat', hint: 'Tulis sepanjang yang kamu mau.', max: 1200, multiline: true },
    { key: 'photos', label: 'Foto', hint: 'Opsional, terselip di dalam amplop. Sampai 3 foto.', count: 3 },
  ],
  sample: {
    to: 'Mama',
    from: 'Kakak',
    title: 'Yang belum sempat aku bilang',
    notes: [],
    message:
      'Ma, aku jarang ngomong langsung, jadi aku tulis aja.\n\nMakasih buat bekal yang selalu ada padahal Mama juga buru-buru. Makasih sudah pura-pura nggak capek. Makasih buat doa yang aku tahu dikirim tiap malam, walau aku jarang nelpon.\n\nAku baik-baik di sini. Makan teratur (hampir). Nanti kalau pulang, aku yang masak. Mama duduk aja.',
    photos: ['/art/foto-kopi.webp', '/art/foto-gunung.webp'],
  },
};
