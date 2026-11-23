import type { TemplateMeta } from '../types';

const PHOTOS = ['/art/foto-senja.webp', '/art/foto-gunung.webp', '/art/foto-kota.webp', '/art/foto-taman.webp', '/art/foto-pantai.webp', '/art/foto-kopi.webp'];

export const meta: TemplateMeta = {
  id: 'scrapbook',
  name: 'Our Scrapbook',
  tagline: 'Buku tempel buatan tangan: foto, selotip, dan catatan kecil di tiap halaman.',
  steps: ['Buka sampulnya', 'Balik halamannya', 'Surat di kantong'],
  occasions: ['anniv', 'sahabat', 'ultah', 'kangen'],
  palette: { bg: '#d6c8ab', ink: '#3b2a1f', accent: '#c8553d' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    { key: 'photos', label: 'Foto', hint: 'Satu foto per halaman. Paling pas 4 sampai 6 foto.', count: 6 },
    {
      key: 'notes',
      label: 'Catatan tiap halaman',
      hint: 'Urut sesuai fotonya. Tanpa foto pun bisa: catatannya jadi tulisan tangan di halaman.',
      min: 0,
      count: 6,
      max: 44,
      placeholder: 'Cerita singkat halaman ini',
    },
    { key: 'title', label: 'Ucapan utama', max: 40 },
    { key: 'message', label: 'Surat di kantong terakhir', max: 900, multiline: true },
  ],
  sample: {
    to: 'Kirana',
    from: 'Dimas',
    title: 'Bukunya belum selesai.',
    notes: [
      'Sore pertama, kamu yang pilih tempatnya.',
      'Naik jam 3 pagi demi ini. Worth it.',
      'Nyasar, ketawa, lalu nemu jalan pulang.',
      'Piknik yang bekalnya kamu habisin sendiri.',
      'Pantai sepi, kita yang berisik.',
      'Kopi kedua. Kamu masih cerita.',
    ],
    message:
      'Aku nggak jago nyimpen barang, tapi ternyata jago nyimpen hari-hari sama kamu.\n\nJadi kutempel di sini satu-satu: tiket yang hampir kebuang, foto yang blur tapi lucu, dan sore-sore biasa yang entah kenapa aku ingat terus.\n\nHalaman kosongnya masih banyak. Kita isi pelan-pelan, ya.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Our Scrapbook',
      tagline: 'Buku skrap buatan tangan: foto, pita kertas, dan catatan kecil di setiap halaman.',
      steps: ['Buka kulit buku', 'Selak halaman', 'Surat dalam poket'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        photos: { label: 'Foto', hint: 'Satu foto setiap halaman. Paling sesuai 4 hingga 6 foto.' },
        notes: {
          label: 'Catatan setiap halaman',
          hint: 'Ikut susunan foto. Tanpa foto pun boleh: catatan jadi tulisan tangan di halaman.',
          placeholder: 'Cerita ringkas halaman ni',
        },
        title: { label: 'Ucapan utama' },
        message: { label: 'Surat dalam poket terakhir' },
      },
      sample: {
        to: 'Aina',
        from: 'Hakim',
        title: 'Buku ni belum habis.',
        notes: [
          'Petang pertama, awak yang pilih tempat.',
          'Daki pukul 3 pagi sebab nak tengok ni.',
          'Sesat, gelak, lepas tu jumpa jalan balik.',
          'Berkelah, tapi bekalnya awak habiskan.',
          'Pantai sunyi, kita yang bising.',
          'Kopi kedua. Awak masih bercerita.',
        ],
        message:
          'Saya tak pandai simpan barang, tapi rupa-rupanya pandai simpan hari-hari dengan awak.\n\nJadi saya tampal di sini satu per satu: tiket yang hampir terbuang, foto yang kabur tapi comel, dan petang-petang biasa yang entah kenapa saya ingat sampai sekarang.\n\nHalaman kosong masih banyak. Kita isi perlahan-lahan, ya.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'Our Scrapbook',
      tagline: 'A handmade scrapbook: photos, washi tape, and a little note on every page.',
      steps: ['Open the cover', 'Turn the pages', 'Letter in the pocket'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        photos: { label: 'Photos', hint: 'One photo per page. Best with 4 to 6 photos.' },
        notes: {
          label: 'Note on each page',
          hint: 'Same order as the photos. No photos? The notes become handwritten pages.',
          placeholder: 'The little story behind this page',
        },
        title: { label: 'Main message' },
        message: { label: 'Letter in the last pocket' },
      },
      sample: {
        to: 'Maya',
        from: 'Noah',
        title: "This book isn't finished.",
        notes: [
          'First evening. You picked the spot.',
          'Up at 3 a.m. for this. Worth it.',
          'Got lost, laughed, found our way home.',
          'The picnic where you ate all the snacks.',
          'Empty beach. We were the loud ones.',
          'Second coffee. You were still talking.',
        ],
        message:
          "I'm terrible at keeping things, but it turns out I'm good at keeping days with you.\n\nSo I taped them in here, one by one: the ticket I almost threw away, the blurry photo that still makes me laugh, and the ordinary evenings I somehow never forgot.\n\nThere are plenty of blank pages left. Let's fill them slowly.",
        photos: PHOTOS,
      },
    },
  },
};
