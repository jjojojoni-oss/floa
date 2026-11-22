import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'toga',
  name: 'Lempar Toga',
  tagline: 'Lempar toganya tinggi-tinggi, lalu buka gulungan ucapannya.',
  steps: ['Geser toga ke atas', 'Konfeti', 'Buka gulungan'],
  occasions: ['wisuda'],
  palette: { bg: '#18265a', ink: '#fdf6e3', accent: '#f2c14e' },
  fields: [
    { key: 'to', label: 'Yang wisuda', hint: 'Boleh pakai gelarnya.', placeholder: 'Nama dia', max: 24 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 24 },
    { key: 'title', label: 'Ucapan utama', max: 40 },
    {
      key: 'notes',
      label: 'Hal yang bikin bangga',
      hint: 'Muncul setelah toga dilempar. Sampai 3 kalimat, boleh dikosongkan.',
      min: 0,
      count: 3,
      max: 50,
      placeholder: 'Yang paling kamu ingat dari perjuangannya',
    },
    { key: 'message', label: 'Isi gulungan', max: 900, multiline: true },
    { key: 'photos', label: 'Foto', hint: 'Opsional, sampai 4 foto.', count: 4 },
  ],
  sample: {
    to: 'Fajar, S.Kom.',
    from: 'Ayah & Ibu',
    title: 'Selamat wisuda, Nak!',
    notes: ['Begadangmu terbayar.', 'Tiga kali revisi, lulus juga.', 'Kami bangga, selalu.'],
    message:
      'Nak, hari ini kami melihatmu memakai toga, dan rasanya seperti baru kemarin mengantarmu di hari pertama sekolah.\n\nKami tahu jalannya nggak selalu mulus. Ada malam-malam yang kamu lewati sendirian di depan laptop. Semuanya terbayar hari ini.\n\nKe mana pun kamu melangkah setelah ini, pintu rumah selalu terbuka.',
    photos: ['/art/foto-gunung.webp', '/art/foto-taman.webp'],
  },
};
