import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'lampion',
  name: 'Terbangkan Lampion',
  tagline: 'Tiap lampion membawa satu harapan. Diterbangkan ke langit malam, satu per satu.',
  steps: ['Geser lampion ke atas', 'Langit penuh cahaya', 'Baca pesan'],
  occasions: ['kangen', 'anniv', 'ultah', 'wisuda'],
  palette: { bg: '#121a3a', ink: '#fdf1d8', accent: '#ffb347' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Satu harapan per lampion',
      hint: '3 sampai 5 lampion.',
      min: 3,
      count: 5,
      max: 60,
      placeholder: 'Semoga…',
    },
    { key: 'title', label: 'Ucapan utama', hint: 'Muncul saat semua lampion sudah terbang.', max: 40 },
    { key: 'message', label: 'Pesan', max: 900, multiline: true },
    { key: 'photos', label: 'Foto', hint: 'Opsional, sampai 3 foto.', count: 3 },
  ],
  sample: {
    to: 'Bima',
    from: 'Sasa',
    title: 'Sampai ketemu, ya.',
    notes: [
      'Semoga jarak cepat jadi cerita lama.',
      'Semoga kerjaanmu di sana lancar.',
      'Semoga sinyal bagus tiap video call.',
      'Semoga pulangmu nanti lebih lama.',
    ],
    message:
      'Di sini sudah malam, di sana baru sore. Lucu ya, kita lihat langit yang sama tapi jamnya beda.\n\nAku nggak minta kamu cepat pulang. Aku cuma mau kamu tahu: tiap kamu capek, ada yang nungguin kabarmu di sini.\n\nSatu lampion buat tiap harapan. Sisanya aku simpan sampai kita ketemu.',
    photos: ['/sample/kota.svg', '/sample/senja.svg'],
  },
};
