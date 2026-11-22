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
  i18n: {
    ms: {
      name: 'Jambangan Mekar',
      tagline: 'Kudup yang mekar satu per satu. Setiap bunga bawa satu ayat daripada awak.',
      steps: ['Ketuk kudup', 'Baca pesanan', 'Buka surat'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Satu ayat untuk setiap bunga',
          hint: 'Muncul bila setiap kudup diketuk. 3 hingga 5 bunga.',
          placeholder: 'Perkara kecil yang awak suka tentang dia',
        },
        title: { label: 'Ucapan utama', hint: 'Muncul bila jambangan dah siap.' },
        message: { label: 'Surat', hint: 'Terselit di celah bunga.' },
        photos: { label: 'Foto', hint: 'Pilihan, sehingga 4 foto.' },
      },
      sample: {
        to: 'Aisyah',
        from: 'Hafiz',
        title: 'Dah dua tahun kita, sayang.',
        notes: [
          'Cara awak gelak sampai mata hilang.',
          'Selalu ingat order saya tanpa perlu tanya.',
          'Sabar sangat dengan saya yang selalu lambat.',
          'Buat hari biasa jadi luar biasa.',
          'Awaklah rumah, ke mana pun kita pergi.',
        ],
        message:
          'Saya tak pandai menyusun kata, apatah lagi menggubah bunga. Jadi saya titipkan semuanya di sini.\n\nTerima kasih sebab sudi bertahan, sudi diajak makan kat kedai yang sama setiap kali, dan jadi orang pertama yang saya cari setiap kali ada berita gembira.\n\nHarap jambangan ni tak pernah layu. Macam kita.',
        photos: ['/art/foto-senja.webp', '/art/foto-kopi.webp', '/art/foto-taman.webp'],
      },
    },
    en: {
      name: 'Blooming Bouquet',
      tagline: 'Buds that bloom one by one, each carrying a line from you.',
      steps: ['Tap the buds', 'Read each note', 'Open the letter'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'One line per flower',
          hint: 'Shows up as each bud is tapped. 3 to 5 flowers.',
          placeholder: 'A little thing you love about them',
        },
        title: { label: 'Main message', hint: 'Shows up when the bouquet is done.' },
        message: { label: 'Letter', hint: 'Tucked among the flowers.' },
        photos: { label: 'Photos', hint: 'Optional, up to 4 photos.' },
      },
      sample: {
        to: 'Emma',
        from: 'Jack',
        title: 'Happy two years, love.',
        notes: [
          'The way you laugh until your eyes disappear.',
          'You always remember my order without asking.',
          'So patient with me always running late.',
          'You make ordinary days feel special.',
          "You're home, wherever we go.",
        ],
        message:
          "I'm not great with words, and even worse with flowers. So I'm leaving it all here.\n\nThank you for sticking around, for never minding when we end up at the same old place, and for being the first person I look for whenever there's good news.\n\nI hope this bouquet never wilts. Just like us.",
        photos: ['/art/foto-senja.webp', '/art/foto-kopi.webp', '/art/foto-taman.webp'],
      },
    },
  },
};
