import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'mau',
  name: 'Mau Nggak?',
  tagline: 'Satu pertanyaan penting, dengan tombol "nggak" yang susah banget ditangkap.',
  steps: ['Baca pelan-pelan', 'Jawab pertanyaannya', 'Rayakan'],
  occasions: ['nembak'],
  palette: { bg: '#ffdbe4', ink: '#4a1830', accent: '#ff3d6e' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Kalimat pembuka',
      hint: 'Dibaca satu-satu sebelum pertanyaannya. 2 sampai 3 kalimat.',
      min: 2,
      count: 3,
      max: 70,
      placeholder: 'Yang mau kamu bilang dulu',
    },
    { key: 'title', label: 'Pertanyaannya', max: 44 },
    { key: 'message', label: 'Setelah dia jawab "mau"', hint: 'Muncul setelah perayaan.', max: 900, multiline: true },
    { key: 'photos', label: 'Foto', hint: 'Opsional, sampai 3 foto.', count: 3 },
  ],
  sample: {
    to: 'Kirana',
    from: 'Adit',
    title: 'Mau nggak jadi pacarku?',
    notes: [
      'Ada yang mau aku omongin dari lama.',
      'Tiap sama kamu, waktu rasanya kecepetan.',
      'Dan aku capek pura-pura biasa aja.',
    ],
    message:
      'AKHIRNYA.\n\nJujur aku sudah nyiapin mental buat dua jawaban, tapi cuma nyiapin rencana buat yang ini.\n\nSabtu ini aku jemput jam 4. Kita makan di tempat yang kamu bilang "kapan-kapan" itu. Kapan-kapannya sekarang.',
    photos: ['/sample/senja.svg', '/sample/kopi.svg'],
  },
};
