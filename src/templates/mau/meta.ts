import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'mau',
  name: 'Mau Nggak?',
  tagline: 'Satu pertanyaan penting, dengan tombol "nggak" yang susah banget ditangkap.',
  steps: ['Baca pelan-pelan', 'Jawab pertanyaannya', 'Rayakan'],
  occasions: ['nembak'],
  palette: { bg: '#f8c3ce', ink: '#5a1730', accent: '#e8315f' },
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
    to: 'Maharani Kusumawati',
    from: 'Bagaskara Aditya Pr',
    title: 'Mau nggak jadi pacarku mulai hari ini juga??',
    notes: ['Tiap sama kamu, waktu rasanya kecepetan banget dan aku nggak mau pulang.', 'Tiap sama kamu, waktu rasanya kecepetan banget dan aku nggak mau pulang.', 'Tiap sama kamu, waktu rasanya kecepetan banget dan aku nggak mau pulang.'],
    message:
      'AKHIRNYA.\n\nJujur aku sudah nyiapin mental buat dua jawaban, tapi cuma nyiapin rencana buat yang ini.\n\nSabtu ini aku jemput jam 4. Kita makan di tempat yang kamu bilang "kapan-kapan" itu. Kapan-kapannya sekarang.',
    photos: ['/sample/senja.svg', '/sample/kopi.svg'],
  },
};
