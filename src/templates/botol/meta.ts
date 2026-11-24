import type { TemplateMeta } from '../types';

const PHOTOS = ['/contoh/peron-stasiun.webp', '/contoh/senja-pantai.webp', '/contoh/sate-pinggir-jalan.webp', '/contoh/kopi-hitam.webp', '/contoh/jendela-pesawat.webp'];

export const meta: TemplateMeta = {
  id: 'botol',
  name: 'Surat dalam Botol',
  tagline: 'Sebuah botol terdampar di pantai senja: usap pasirnya, cabut gabusnya, lalu baca gulungan demi gulungan dari seberang laut.',
  steps: ['Tarik botolnya ke pasir', 'Buka tiap gulungan', 'Baca surat terakhir'],
  occasions: ['kangen', 'maaf', 'anniv', 'sahabat'],
  palette: { bg: '#f6c9a2', ink: '#3b2318', accent: '#1f8a8a' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Gulungan kecil di dalam botol',
      hint: 'Satu kalimat per gulungan, 3 sampai 5. Keluar dari botol satu per satu, dan tiap gulungan yang dibaca meninggalkan satu kerang di pasir.',
      min: 3,
      count: 5,
      max: 70,
      placeholder: 'Satu kalimat yang ingin kamu titipkan ke laut',
    },
    {
      key: 'photos',
      label: 'Kartu pos',
      hint: 'Opsional. Foto pertama jadi kartu pos kecil di gulungan pertama, dan seterusnya.',
      count: 5,
      // tiap foto sudah berpasangan dengan gulungannya
      captions: false,
    },
    { key: 'title', label: 'Tulisan di pasir', hint: 'Ditulis di pasir setelah semua gulungan dibaca. Ombaknya berhenti tepat sebelum menghapusnya.', max: 30 },
    { key: 'message', label: 'Surat utama', hint: 'Gulungan paling besar, keluar paling akhir dari botol.', max: 900, multiline: true },
  ],
  sample: {
    to: 'Rania',
    from: 'Bayu',
    title: 'Aku kangen. Banget.',
    notes: [
      'Hari ke-212 sejak peron itu. Iya, aku ngitung.',
      'Senja di sini bagus, tapi kurang satu: kamu yang motoin.',
      'Sate dekat kosmu masih juara. Di sini belum ada lawannya.',
      'Kopi di sini pahit. Bukan kopinya, sih. Yang nemenin nggak ada.',
      'Tiket pulang sudah kubeli. Dekat jendela, biar cepat sampai.',
    ],
    message:
      'Katanya surat dalam botol bisa terapung bertahun-tahun sebelum ketemu orangnya. Aku nggak sesabar itu, jadi yang ini kukirim lewat jalan pintas.\n\nDi sini semuanya baik: kerjaan lancar, makan teratur, dan aku sudah hafal jam berapa kamu biasanya ngantuk. Yang belum bisa kuatasi cuma satu: tiap lihat laut, aku selalu ngitung berapa jauh lagi sampai ke kamu.\n\nSabar sebentar lagi, ya. Jaraknya memang segini, tapi pulangku tetap ke kamu.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Surat dalam Botol',
      tagline: 'Sebiji botol terdampar di pantai senja: sapu pasirnya, cabut gabusnya, lalu baca gulungan demi gulungan dari seberang laut.',
      steps: ['Tarik botol ke pasir', 'Buka setiap gulungan', 'Baca surat terakhir'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Gulungan kecil dalam botol',
          hint: 'Satu ayat untuk setiap gulungan, 3 hingga 5. Keluar dari botol satu demi satu, dan setiap gulungan yang dibaca meninggalkan satu kerang di pasir.',
          placeholder: 'Satu ayat yang awak mahu kirim melalui laut',
        },
        photos: { label: 'Poskad', hint: 'Pilihan. Foto pertama jadi poskad kecil pada gulungan pertama, dan seterusnya.' },
        title: { label: 'Tulisan di pasir', hint: 'Ditulis di pasir selepas semua gulungan dibaca. Ombaknya berhenti betul-betul sebelum memadamnya.' },
        message: { label: 'Surat utama', hint: 'Gulungan paling besar, keluar paling akhir dari botol.' },
      },
      sample: {
        to: 'Damia',
        from: 'Faris',
        title: 'Saya rindu. Sangat.',
        notes: [
          'Hari ke-212 sejak platform itu. Ya, saya kira.',
          'Senja di sini cantik, tapi kurang satu: awak yang ambil gambar.',
          'Sate dekat rumah sewa awak masih juara. Di sini tiada lawan.',
          'Kopi di sini pahit. Bukan kopinya pun. Yang teman tak ada.',
          'Tiket balik dah saya beli. Tepi tingkap, biar cepat sampai.',
        ],
        message:
          'Kata orang, surat dalam botol boleh terapung bertahun-tahun sebelum jumpa orangnya. Saya tak sesabar itu, jadi yang ini saya hantar ikut jalan pintas.\n\nDi sini semuanya baik: kerja lancar, makan cukup, dan saya dah hafal pukul berapa awak selalu mengantuk. Yang belum saya boleh atasi cuma satu: setiap kali nampak laut, saya mesti kira berapa jauh lagi nak sampai kepada awak.\n\nSabar sikit lagi ya. Jaraknya memang jauh, tapi saya tetap pulang kepada awak.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'Message in a Bottle',
      tagline: 'A bottle washes ashore at sunset: brush off the sand, pull the cork, and read one tiny scroll after another from across the sea.',
      steps: ['Pull the bottle ashore', 'Unroll each scroll', 'Read the last letter'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'Little scrolls inside the bottle',
          hint: 'One line per scroll, 3 to 5. They slide out one at a time, and each one that gets read leaves a shell on the sand.',
          placeholder: 'One line you want the sea to carry',
        },
        photos: { label: 'Postcards', hint: 'Optional. The first photo becomes a tiny postcard on the first scroll, and so on.' },
        title: { label: 'Written in the sand', hint: 'Written in the sand after every scroll is read. The wave stops just short of washing it away.' },
        message: { label: 'Main letter', hint: 'The biggest scroll, the last one out of the bottle.' },
      },
      sample: {
        to: 'Ruby',
        from: 'Oliver',
        title: 'I miss you. A lot.',
        notes: [
          'Day 212 since that train platform. Yes, I am counting.',
          'The sunsets here are great. They are missing you taking photos.',
          'Your corner noodle place still wins. Nothing here comes close.',
          'The coffee here is bitter. Not the coffee, really. The company.',
          'I booked my ticket home. Window seat, so I get there faster.',
        ],
        message:
          "They say a message in a bottle can drift for years before it finds its person. I am not that patient, so I sent this one the shortcut way.\n\nEverything is fine here: work is steady, I am eating properly, and I know exactly what time you start getting sleepy. The one thing I still can't fix is this: every time I see the sea, I catch myself counting how far it is to you.\n\nHang in there a little longer. The distance is what it is, but home is still wherever you are.",
        photos: PHOTOS,
      },
    },
  },
};
