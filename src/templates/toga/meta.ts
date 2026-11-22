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
  i18n: {
    ms: {
      name: 'Lambung Topi',
      tagline: 'Lambung topi graduasi tinggi-tinggi, kemudian buka gulungan ucapannya.',
      steps: ['Leret topi ke atas', 'Konfeti', 'Buka gulungan'],
      fields: {
        to: { label: 'Graduan', hint: 'Boleh letak gelarannya.', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        title: { label: 'Ucapan utama' },
        notes: {
          label: 'Perkara yang buat bangga',
          hint: 'Muncul selepas topi dilambung. Sehingga 3 ayat, boleh dibiarkan kosong.',
          placeholder: 'Apa yang paling awak ingat tentang usahanya',
        },
        message: { label: 'Isi gulungan' },
        photos: { label: 'Gambar', hint: 'Pilihan, sehingga 4 gambar.' },
      },
      sample: {
        to: 'Haziq Danial',
        from: 'Abah & Mak',
        title: 'Tahniah, Along!',
        notes: ['Berjaga malammu berbaloi.', 'Tiga kali betulkan tesis, lulus juga.', 'Kami bangga, selalu.'],
        message:
          'Along, hari ini kami tengok Along pakai jubah konvo, dan rasanya macam baru semalam kami hantar Along ke sekolah hari pertama.\n\nKami tahu perjalanannya tak selalu mudah. Ada malam-malam Along lalui seorang diri depan laptop. Semuanya berbaloi hari ini.\n\nKe mana pun Along melangkah lepas ni, pintu rumah sentiasa terbuka.',
        photos: ['/art/foto-gunung.webp', '/art/foto-taman.webp'],
      },
    },
    en: {
      name: 'Cap Toss',
      tagline: 'Toss the cap sky-high, then unroll a scroll full of love.',
      steps: ['Swipe the cap up', 'Confetti', 'Open the scroll'],
      fields: {
        to: { label: 'The graduate', hint: 'Feel free to add their degree.', placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        title: { label: 'Main greeting' },
        notes: {
          label: 'What makes you proud',
          hint: 'Shown after the cap toss. Up to 3 lines, or leave empty.',
          placeholder: 'What you remember most about their journey',
        },
        message: { label: 'Scroll message' },
        photos: { label: 'Photos', hint: 'Optional, up to 4 photos.' },
      },
      sample: {
        to: 'Daniel, B.Sc.',
        from: 'Mom & Dad',
        title: 'Congrats, graduate!',
        notes: ['All those late nights paid off.', 'Three thesis rewrites, and you made it.', 'We’re proud of you, always.'],
        message:
          'Today we watched you in your cap and gown, and it felt like only yesterday we walked you to your first day of school.\n\nWe know the road wasn’t always smooth. There were late nights you spent alone in front of your laptop. Today, every one of them paid off.\n\nWherever you go from here, the door at home is always open.',
        photos: ['/art/foto-gunung.webp', '/art/foto-taman.webp'],
      },
    },
  },
};
