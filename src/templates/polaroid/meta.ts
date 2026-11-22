import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'polaroid',
  name: 'Setumpuk Kenangan',
  tagline: 'Setumpuk foto yang digeser satu-satu, sampai surat di paling bawah.',
  steps: ['Geser fotonya', 'Baca catatan', 'Surat terakhir'],
  occasions: ['sahabat', 'anniv', 'ortu', 'ultah'],
  palette: { bg: '#e6c79c', ink: '#3a2416', accent: '#d9573a' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    { key: 'photos', label: 'Foto', hint: 'Paling pas 4 sampai 6 foto.', count: 6 },
    {
      key: 'notes',
      label: 'Catatan di bawah tiap foto',
      hint: 'Urut sesuai fotonya. Boleh dikosongkan.',
      min: 0,
      count: 6,
      max: 44,
      placeholder: 'Cerita singkat foto ini',
    },
    { key: 'title', label: 'Ucapan utama', max: 40 },
    { key: 'message', label: 'Surat di paling bawah', max: 900, multiline: true },
  ],
  sample: {
    to: 'Geng Kosan',
    from: 'Tari',
    title: 'Makasih buat semuanya.',
    notes: [
      'Hari pertama, masih pada jaim.',
      'Kopi ketiga minggu itu.',
      'Nyasar, tapi dapat sunset.',
      'Katanya cuma lihat-lihat.',
      'Liburan yang direncanain 2 tahun.',
      'Pulang kemalaman, lagi.',
    ],
    message:
      'Empat tahun, satu dapur, dan rice cooker yang entah punya siapa.\n\nAku nggak tahu nanti kita bakal kerja di kota mana. Yang aku tahu, grup ini jangan sampai sepi.\n\nMakasih sudah jadi keluarga yang aku pilih sendiri.',
    photos: ['/art/foto-kopi.webp', '/art/foto-kota.webp', '/art/foto-senja.webp', '/art/foto-taman.webp', '/art/foto-pantai.webp', '/art/foto-gunung.webp'],
  },
  i18n: {
    ms: {
      name: 'Setimbun Kenangan',
      tagline: 'Setimbun foto yang dileret satu per satu, sampai ke surat di paling bawah.',
      steps: ['Leret foto', 'Baca catatan', 'Surat terakhir'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        photos: { label: 'Foto', hint: 'Paling sesuai 4 hingga 6 foto.' },
        notes: {
          label: 'Catatan di bawah setiap foto',
          hint: 'Ikut susunan foto. Boleh dibiarkan kosong.',
          placeholder: 'Cerita ringkas foto ni',
        },
        title: { label: 'Ucapan utama' },
        message: { label: 'Surat di paling bawah' },
      },
      sample: {
        to: 'Geng Rumah Sewa',
        from: 'Syaza',
        title: 'Terima kasih untuk semuanya.',
        notes: [
          'Hari pertama, semua masih malu-malu.',
          'Kopi ketiga minggu tu.',
          'Sesat, tapi dapat tengok sunset.',
          'Katanya nak tengok-tengok je.',
          'Percutian yang dirancang 2 tahun.',
          'Balik lewat malam, lagi.',
        ],
        message:
          'Empat tahun, satu dapur, dan rice cooker yang entah siapa punya.\n\nAku tak tahu nanti kita kerja kat bandar mana. Yang aku tahu, group ni jangan sampai senyap.\n\nTerima kasih sebab jadi keluarga yang aku pilih sendiri.',
        photos: ['/art/foto-kopi.webp', '/art/foto-kota.webp', '/art/foto-senja.webp', '/art/foto-taman.webp', '/art/foto-pantai.webp', '/art/foto-gunung.webp'],
      },
    },
    en: {
      name: 'Stack of Memories',
      tagline: 'A stack of photos to swipe through, one by one, down to a letter at the bottom.',
      steps: ['Swipe the photos', 'Read the notes', 'The last letter'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        photos: { label: 'Photos', hint: 'Best with 4 to 6 photos.' },
        notes: {
          label: 'Caption under each photo',
          hint: 'Same order as the photos. Can be left blank.',
          placeholder: 'The little story behind this photo',
        },
        title: { label: 'Main message' },
        message: { label: 'Letter at the bottom' },
      },
      sample: {
        to: 'The Roomies',
        from: 'Chloe',
        title: 'Thank you for everything.',
        notes: [
          'Day one, all on our best behavior.',
          'Third coffee that week.',
          'Got lost, but found a sunset.',
          '"Just looking," they said.',
          'The trip we planned for 2 years.',
          'Home way too late, again.',
        ],
        message:
          "Four years, one kitchen, and a rice cooker nobody remembers buying.\n\nI don't know which cities we'll end up working in. All I know is this group chat can never go quiet.\n\nThank you for being the family I got to choose.",
        photos: ['/art/foto-kopi.webp', '/art/foto-kota.webp', '/art/foto-senja.webp', '/art/foto-taman.webp', '/art/foto-pantai.webp', '/art/foto-gunung.webp'],
      },
    },
  },
};
