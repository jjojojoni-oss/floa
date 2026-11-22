import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'plester',
  name: 'Plester Hati',
  tagline: 'Hati yang retak, ditambal plester satu per satu sampai utuh lagi.',
  steps: ['Tempel plester', 'Hatinya pulih', 'Baca permintaan maaf'],
  occasions: ['maaf'],
  palette: { bg: '#d6e6ec', ink: '#2f3b46', accent: '#e4506a' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Satu maaf per plester',
      hint: 'Muncul saat tiap plester ditempel. 3 sampai 4 plester.',
      min: 3,
      count: 4,
      max: 60,
      placeholder: 'Maaf, aku…',
    },
    { key: 'title', label: 'Ucapan utama', hint: 'Muncul saat hatinya utuh lagi.', max: 40 },
    { key: 'message', label: 'Surat permintaan maaf', max: 900, multiline: true },
    { key: 'photos', label: 'Foto', hint: 'Opsional, sampai 2 foto.', count: 2 },
  ],
  sample: {
    to: 'Dinda',
    from: 'Yoga',
    title: 'Aku minta maaf.',
    notes: [
      'Maaf, aku telat dan nggak ngabarin.',
      'Maaf, aku malah sibuk membela diri.',
      'Maaf, bikin kamu merasa sendirian.',
    ],
    message:
      'Aku salah, dan aku nggak mau ngeles lagi.\n\nKemarin kamu cuma butuh didengar, dan aku malah sibuk cari pembenaran. Aku ngerti kalau kamu masih butuh waktu.\n\nAku nggak minta langsung dimaafin. Aku cuma mau kamu tahu aku serius mau memperbaiki ini, pelan-pelan, mulai dari hal kecil.',
    photos: ['/art/foto-taman.webp'],
  },
};
