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
    photos: ['/art/foto-senja.webp', '/art/foto-kopi.webp'],
  },
  i18n: {
    ms: {
      name: 'Nak Tak?',
      tagline: 'Satu soalan penting, dengan butang "tak nak" yang susah gila nak ditangkap.',
      steps: ['Baca perlahan-lahan', 'Jawab soalannya', 'Raikan'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Ayat pembuka',
          hint: 'Dibaca satu per satu sebelum soalannya. 2 hingga 3 ayat.',
          placeholder: 'Apa yang awak nak cakap dulu',
        },
        title: { label: 'Soalannya' },
        message: { label: 'Selepas dia jawab "nak"', hint: 'Muncul selepas sambutan.' },
        photos: { label: 'Gambar', hint: 'Pilihan, sehingga 3 gambar.' },
      },
      sample: {
        to: 'Aisyah',
        from: 'Hafiz',
        title: 'Nak tak jadi kekasih aku?',
        notes: [
          'Ada benda aku nak cakap dari dulu lagi.',
          'Setiap kali dengan awak, masa rasa laju sangat.',
          'Dan aku dah penat buat-buat biasa.',
        ],
        message:
          'AKHIRNYA.\n\nJujur, aku dah sedia mental untuk dua jawapan, tapi aku cuma buat rancangan untuk yang ini.\n\nSabtu ni aku ambil awak pukul 4. Kita makan kat tempat yang awak selalu cakap "nanti-nanti" tu. Nantinya sekarang.',
        photos: ['/art/foto-senja.webp', '/art/foto-kopi.webp'],
      },
    },
    en: {
      name: 'Will You?',
      tagline: 'One big question, with a "no" button that’s really hard to catch.',
      steps: ['Read slowly', 'Answer the question', 'Celebrate'],
      fields: {
        to: { label: 'For', placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'Opening lines',
          hint: 'Shown one by one before the question. 2 to 3 lines.',
          placeholder: 'What you want to say first',
        },
        title: { label: 'The question' },
        message: { label: 'After they say "yes"', hint: 'Appears after the celebration.' },
        photos: { label: 'Photos', hint: 'Optional, up to 3 photos.' },
      },
      sample: {
        to: 'Emma',
        from: 'Jake',
        title: 'Will you be my girlfriend?',
        notes: [
          'There’s something I’ve wanted to say for ages.',
          'Whenever I’m with you, time goes way too fast.',
          'And I’m tired of pretending it’s nothing.',
        ],
        message:
          'FINALLY.\n\nHonestly, I was ready for either answer, but I only made plans for this one.\n\nI’m picking you up Saturday at 4. We’re going to that place you keep saying we’ll try "someday". Someday is now.',
        photos: ['/art/foto-senja.webp', '/art/foto-kopi.webp'],
      },
    },
  },
};
