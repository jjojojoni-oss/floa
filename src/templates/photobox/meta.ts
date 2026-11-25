import type { TemplateMeta } from '../types';

const PHOTOS = ['/contoh/dua-cangkir.webp', '/contoh/karcis.webp', '/contoh/sepeda.webp', '/contoh/gandengan.webp'];

export const meta: TemplateMeta = {
  id: 'photobox',
  name: 'Photobox',
  tagline: 'Bilik foto mungil: masukkan koin, geser tirainya, cekrek empat kali, lalu stripnya keluar hangat-hangat dengan surat di baliknya.',
  steps: ['Masuk ke bilik foto', 'Cekrek tiap pose', 'Balik stripnya'],
  occasions: ['sahabat', 'ultah', 'wisuda', 'anniv'],
  palette: { bg: '#cfe3ee', ink: '#1f2a44', accent: '#e8503a' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'photos',
      label: 'Foto di strip',
      hint: 'Sampai 4 foto, dicetak urut dari atas ke bawah. Boleh kurang: bingkai sisanya diisi tulisan atau bunga.',
      count: 4,
      // tiap foto sudah berpasangan dengan tulisan di bawahnya
      captions: false,
    },
    {
      key: 'notes',
      label: 'Tulisan di bawah tiap foto',
      hint: 'Urut sesuai fotonya. Bingkai tanpa foto jadi kartu bertulisan tangan.',
      min: 0,
      count: 4,
      max: 40,
      placeholder: 'Satu kalimat pendek untuk foto ini',
    },
    { key: 'title', label: 'Tulisan di ujung strip', hint: 'Seperti coretan spidol di bagian bawah strip foto.', max: 30 },
    { key: 'message', label: 'Surat di balik strip', hint: 'Muncul setelah stripnya dibalik.', max: 900, multiline: true },
  ],
  sample: {
    to: 'Raffi',
    from: 'Jihan',
    title: 'Strip ke-12. Masih kamu.',
    notes: [
      'Ngopi dulu. Kuemu aku curi.',
      'Nonton. Kamu tidur di menit ke-20.',
      'Sepedaan sore. Kamu ngos-ngosan.',
      'Pulang gandengan, sengaja pelan.',
    ],
    message:
      'Selamat setahun, Raf.\n\nIni strip ke-12. Satu tiap bulan, dari kencan pertama waktu kamu kaku kayak tiang listrik, sampai sekarang kamu sudah berani bikin tanduk kelinci di atas kepalaku. Semuanya aku selipin di dompet, sampai dompetnya nggak bisa ditutup.\n\nMakasih sudah selalu ingat bawa receh buat mesinnya, sabar nungguin aku benerin poni, dan tetap mau pose muka jelek walaupun yang paling jelek selalu kamu.\n\nTahun depan kita isi dua belas strip lagi, ya. Muka jelek tetap dihitung.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Photobox',
      tagline: 'Bilik foto comel: masukkan syiling, selak langsirnya, klik empat kali, lalu strip fotonya keluar dengan surat di belakangnya.',
      steps: ['Masuk ke bilik foto', 'Klik setiap gaya', 'Terbalikkan stripnya'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        photos: { label: 'Foto pada strip', hint: 'Sehingga 4 foto, dicetak ikut susunan dari atas ke bawah. Boleh kurang: petak selebihnya diisi tulisan atau bunga.' },
        notes: {
          label: 'Tulisan di bawah setiap foto',
          hint: 'Ikut susunan fotonya. Petak tanpa foto jadi kad bertulisan tangan.',
          placeholder: 'Satu ayat pendek untuk foto ini',
        },
        title: { label: 'Tulisan di hujung strip', hint: 'Macam contengan marker di bahagian bawah strip foto.' },
        message: { label: 'Surat di belakang strip', hint: 'Muncul selepas stripnya diterbalikkan.' },
      },
      sample: {
        to: 'Harith',
        from: 'Alisya',
        title: 'Strip ke-12. Tetap awak.',
        notes: [
          'Kopi dulu. Kek awak saya curi.',
          'Wayang. Awak tertidur minit ke-20.',
          'Berbasikal petang. Awak yang semput.',
          'Balik pegang tangan, sengaja lambat.',
        ],
        message:
          'Selamat setahun, Harith.\n\nIni strip ke-12. Satu setiap bulan, daripada janji temu pertama masa awak kaku macam tiang lampu, sampai sekarang awak dah berani buat telinga arnab atas kepala saya. Semuanya saya selit dalam dompet, sampai dompet tu tak boleh tutup.\n\nTerima kasih sebab selalu ingat bawa syiling untuk mesin tu, sabar tunggu saya betulkan tudung, dan tetap sudi buat muka buruk walaupun yang paling buruk selalunya awak.\n\nTahun depan kita isi dua belas strip lagi, ya. Muka buruk pun dikira.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'Photobox',
      tagline: 'A tiny photo booth: drop the coin, slide the curtain, snap four poses, and the strip prints with a letter on the back.',
      steps: ['Step into the booth', 'Snap every pose', 'Flip the strip'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        photos: { label: 'Photos on the strip', hint: 'Up to 4 photos, printed top to bottom. Fewer is fine: the other frames become a note card or a flower.' },
        notes: {
          label: 'Caption under each photo',
          hint: 'In the same order as the photos. A frame without a photo becomes a hand-lettered card.',
          placeholder: 'One short line for this photo',
        },
        title: { label: 'Scribble at the end of the strip', hint: 'Like a marker doodle at the bottom of a photo strip.' },
        message: { label: 'Letter on the back', hint: 'Appears once the strip is flipped over.' },
      },
      sample: {
        to: 'Lucas',
        from: 'Ava',
        title: 'Strip no. 12. Still you.',
        notes: [
          'Coffee first. I stole your cake.',
          'Movie. You were asleep by minute 20.',
          'Bike ride. You were the one panting.',
          'Walking home, holding hands, slowly.',
        ],
        message:
          "Happy one year, Lucas.\n\nThis is strip number twelve. One every month, from our first date when you stood stiff as a lamppost, to now, when you sneak bunny ears behind my head. I keep every single one in my wallet, and it does not close anymore.\n\nThank you for always remembering coins for the machine, for waiting while I fix my hair, and for pulling ugly faces even though yours is always the ugliest.\n\nNext year we fill twelve more. Ugly faces still count.",
        photos: PHOTOS,
      },
    },
  },
};
