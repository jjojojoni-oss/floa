import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'buket',
  name: 'Buket Mekar',
  tagline: 'Kuncup yang mekar satu-satu. Tiap bunga membawa satu kalimat darimu.',
  steps: ['Ketuk kuncup', 'Baca pesannya', 'Buka surat'],
  occasions: ['anniv', 'ultah', 'ortu', 'maaf'],
  palette: { bg: '#fbe6d3', ink: '#43261f', accent: '#e0496a' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Satu kalimat per bunga',
      hint: 'Muncul saat tiap kuncup diketuk. 3 sampai 5 bunga.',
      min: 3,
      count: 5,
      max: 70,
      placeholder: 'Hal kecil yang kamu suka dari dia',
    },
    { key: 'title', label: 'Ucapan utama', hint: 'Muncul saat buketnya jadi.', max: 40 },
    { key: 'message', label: 'Surat', hint: 'Terselip di antara bunganya.', max: 900, multiline: true },
    { key: 'photos', label: 'Foto', hint: 'Opsional, sampai 4 foto.', count: 4 },
  ],
  sample: {
    to: 'Laras',
    from: 'Dimas',
    title: 'Selamat dua tahun, sayang.',
    notes: [
      'Caramu ketawa sampai matamu hilang.',
      'Selalu ingat pesananku tanpa ditanya.',
      'Sabar banget sama aku yang suka telat.',
      'Bikin hari biasa jadi nggak biasa.',
      'Kamu rumah, ke mana pun kita pergi.',
    ],
    message:
      'Aku nggak jago merangkai kata, apalagi merangkai bunga. Jadi aku titip semuanya di sini.\n\nMakasih sudah bertahan, sudah mau diajak makan di tempat yang itu-itu aja, dan sudah jadi orang pertama yang aku cari tiap ada kabar baik.\n\nSemoga buket ini nggak pernah layu. Sama kayak kita.',
    photos: ['/art/foto-senja.webp', '/art/foto-kopi.webp', '/art/foto-taman.webp'],
  },
};
