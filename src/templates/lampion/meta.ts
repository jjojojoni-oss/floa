import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'lampion',
  name: 'Terbangkan Lampion',
  tagline: 'Tiap lampion membawa satu harapan. Diterbangkan ke langit malam, satu per satu.',
  steps: ['Geser lampion ke atas', 'Langit penuh cahaya', 'Baca pesan'],
  occasions: ['kangen', 'anniv', 'ultah', 'wisuda'],
  palette: { bg: '#141c4a', ink: '#fdf1d8', accent: '#ffb85c' },
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
    photos: ['/art/foto-kota.webp', '/art/foto-senja.webp'],
  },
  i18n: {
    ms: {
      name: 'Tanglung Harapan',
      tagline: 'Setiap tanglung membawa satu harapan, diterbangkan ke langit malam satu demi satu.',
      steps: ['Leret tanglung ke atas', 'Langit penuh cahaya', 'Baca mesej'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: { label: 'Satu harapan setiap tanglung', hint: '3 hingga 5 tanglung.', placeholder: 'Semoga…' },
        title: { label: 'Ucapan utama', hint: 'Muncul bila semua tanglung dah terbang.' },
        message: { label: 'Mesej' },
        photos: { label: 'Gambar', hint: 'Pilihan, sehingga 3 gambar.' },
      },
      sample: {
        to: 'Irfan',
        from: 'Nurul',
        title: 'Jumpa lagi, ya.',
        notes: [
          'Semoga jarak ni cepat jadi cerita lama.',
          'Semoga kerja awak kat sana lancar.',
          'Semoga line elok setiap kali video call.',
          'Semoga nanti awak balik lebih lama.',
        ],
        message:
          'Kat sini dah malam, kat sana baru petang. Kelakar kan, kita tengok langit yang sama tapi jamnya lain.\n\nAku tak minta awak cepat balik. Aku cuma nak awak tahu: setiap kali awak penat, ada orang yang tunggu khabar awak kat sini.\n\nSatu tanglung untuk setiap harapan. Selebihnya aku simpan sampai kita jumpa.',
        photos: ['/art/foto-kota.webp', '/art/foto-senja.webp'],
      },
    },
    en: {
      name: 'Lantern Wishes',
      tagline: 'Every lantern carries one wish, released into the night sky one by one.',
      steps: ['Swipe the lantern up', 'Light up the sky', 'Read the message'],
      fields: {
        to: { label: 'For', placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: { label: 'One wish per lantern', hint: '3 to 5 lanterns.', placeholder: 'I hope…' },
        title: { label: 'Main greeting', hint: 'Appears once every lantern is in the sky.' },
        message: { label: 'Message' },
        photos: { label: 'Photos', hint: 'Optional, up to 3 photos.' },
      },
      sample: {
        to: 'Ben',
        from: 'Sophie',
        title: 'See you soon, okay?',
        notes: [
          'I hope the distance is an old story soon.',
          'I hope work over there goes smoothly.',
          'I hope the signal holds on every video call.',
          'I hope your next visit home is a long one.',
        ],
        message:
          'It’s already night here, and still afternoon where you are. Funny, isn’t it? Same sky, different clocks.\n\nI’m not asking you to hurry home. I just want you to know: whenever you’re tired, someone here is waiting to hear from you.\n\nOne lantern for every wish. I’m saving the rest until we meet again.',
        photos: ['/art/foto-kota.webp', '/art/foto-senja.webp'],
      },
    },
  },
};
