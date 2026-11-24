import type { TemplateMeta } from '../types';

const PHOTOS = ['/contoh/kota-tua.webp', '/contoh/jalan-hujan-malam.webp', '/contoh/kopi-hitam.webp', '/contoh/bioskop.webp', '/contoh/pantai-gili.webp'];

export const meta: TemplateMeta = {
  id: 'vinyl',
  name: 'Our Vinyl',
  tagline: 'Album kalian di piringan hitam: tarik dari sampulnya, turunkan jarumnya, lalu dengarkan lagu demi lagu sampai catatan di sisi B.',
  steps: ['Tarik piringannya', 'Putar lagu demi lagu', 'Catatan di sisi B'],
  occasions: ['anniv', 'kangen', 'sahabat', 'ultah'],
  palette: { bg: '#e0a83e', ink: '#2b1a12', accent: '#c8372d' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    { key: 'title', label: 'Judul album', hint: 'Tercetak di sampul album.', max: 40 },
    {
      key: 'notes',
      label: 'Daftar lagu',
      hint: 'Satu kalimat per lagu, ditulis seperti judul lagu tentang kalian. 3 sampai 6 lagu; yang terakhir jadi lagu penutup.',
      min: 3,
      count: 6,
      max: 60,
      placeholder: 'Mis. Hujan di Halte, feat. Payung Cuma Satu',
    },
    {
      key: 'photos',
      label: 'Foto',
      hint: 'Opsional, sampai 6. Foto pertama jadi sampul album; foto ke-2 ikut lagu ke-2, dan seterusnya.',
      count: 6,
      // tiap foto sudah berpasangan dengan lagunya
      captions: false,
    },
    { key: 'message', label: 'Catatan sampul', hint: 'Surat di sisi B, dibaca paling akhir.', max: 900, multiline: true },
  ],
  sample: {
    to: 'Kinan',
    from: 'Bagas',
    title: 'Lagu-lagu Tentang Kita',
    notes: [
      'Keliling Kota Naik Motor Pinjaman',
      'Hujan di Halte, feat. Payung Cuma Satu',
      'Kopi Hitam, Gulanya Kamu',
      'Film yang Nggak Pernah Kita Tonton Sampai Habis',
      'Bonus Track: Kabur ke Pantai Hari Senin',
    ],
    message:
      'Album ini cuma dicetak satu, dan pendengarnya juga cuma satu: kamu.\n\nSemua lagunya tentang hal-hal kecil yang mungkin kamu sudah lupa, tapi aku nggak: motor pinjaman yang mogok, payung yang cuma satu, kopi yang kebanyakan gula.\n\nKalau suatu hari kamu kangen, putar lagi dari sisi A. Aku masih di sini, di setiap lagunya.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Our Vinyl',
      tagline: 'Album kamu berdua dalam piring hitam: tarik dari sarungnya, turunkan jarumnya, lalu dengar lagu demi lagu sampai catatan di sisi B.',
      steps: ['Tarik piring hitamnya', 'Mainkan lagu demi lagu', 'Catatan di sisi B'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        title: { label: 'Tajuk album', hint: 'Tercetak pada sarung album.' },
        notes: {
          label: 'Senarai lagu',
          hint: 'Satu ayat untuk setiap lagu, ditulis seperti tajuk lagu tentang kamu berdua. 3 hingga 6 lagu; yang terakhir jadi lagu penutup.',
          placeholder: 'Cth. Hujan di Perhentian Bas, feat. Payung Sekaki',
        },
        photos: { label: 'Foto', hint: 'Pilihan, sehingga 6. Foto pertama jadi kulit album; foto ke-2 ikut lagu ke-2, dan seterusnya.' },
        message: { label: 'Catatan sarung', hint: 'Surat di sisi B, dibaca paling akhir.' },
      },
      sample: {
        to: 'Alya',
        from: 'Izzat',
        title: 'Lagu-lagu Tentang Kita',
        notes: [
          'Pusing Bandar Naik Motor Pinjam',
          'Hujan di Perhentian Bas, feat. Payung Sekaki',
          'Kopi O Kosong, Manisnya Awak',
          'Wayang yang Kita Tak Pernah Habis Tonton',
          'Lagu Bonus: Lari ke Pantai Hari Isnin',
        ],
        message:
          'Album ni cuma dicetak satu, dan pendengarnya pun cuma seorang: awak.\n\nSemua lagunya tentang benda-benda kecil yang mungkin awak dah lupa, tapi saya tidak: motor pinjam yang rosak, payung yang cuma sekaki, kopi yang terlebih gula.\n\nKalau satu hari nanti awak rindu, mainkan semula dari sisi A. Saya masih di sini, dalam setiap lagunya.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'Our Vinyl',
      tagline: 'Your story pressed on vinyl: slide the record out, drop the needle, and listen track by track until the liner notes on side B.',
      steps: ['Slide the record out', 'Play it track by track', 'Liner notes on side B'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        title: { label: 'Album title', hint: 'Printed on the album cover.' },
        notes: {
          label: 'Track list',
          hint: 'One line per track, written like a song title about the two of you. 3 to 6 tracks; the last one is the closing track.',
          placeholder: 'E.g. Rain at the Bus Stop (feat. One Umbrella)',
        },
        photos: { label: 'Photos', hint: 'Optional, up to 6. The first photo becomes the album cover; photo 2 goes with track 2, and so on.' },
        message: { label: 'Liner notes', hint: 'The letter on side B, read last.' },
      },
      sample: {
        to: 'Olivia',
        from: 'Theo',
        title: 'Songs About Us',
        notes: [
          'Around Town on a Borrowed Scooter',
          'Rain at the Bus Stop (feat. One Umbrella)',
          'Black Coffee, and You Were the Sugar',
          'The Movie We Never Finished Watching',
          'Bonus Track: Running Off to the Beach on a Monday',
        ],
        message:
          "Only one copy of this album was ever pressed, and it has exactly one listener: you.\n\nEvery song is about a small thing you've probably forgotten and I haven't: the borrowed scooter that broke down, the one umbrella, the coffee with far too much sugar.\n\nIf you ever miss me, play it again from side A. I'm still here, in every track.",
        photos: PHOTOS,
      },
    },
  },
};
