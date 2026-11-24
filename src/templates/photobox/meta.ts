import type { TemplateMeta } from '../types';

const PHOTOS = ['/contoh/meja-belajar.webp', '/contoh/bakso.webp', '/contoh/piknik.webp', '/contoh/topi-wisuda.webp'];

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
    to: 'Wulan',
    from: 'Jihan',
    title: 'Sahabat sampai tua, titik.',
    notes: [
      'Belajar bareng: 10% belajar, 90% gosip.',
      'Bakso tiap habis ujian. Tradisi suci.',
      'Piknik darurat pas skripsi mentok.',
      'Lulus juga! Togamu miring, btw.',
    ],
    message:
      'Empat tahun, Lan. Dari kenalan gara-gara salah masuk kelas, sampai sekarang kamu hafal pesanan baksoku: tanpa seledri, sambal dua sendok, kuah dipisah.\n\nMakasih sudah jadi orang pertama yang kukabari tiap ada kabar baik, kabar buruk, dan kabar nggak penting sama sekali. Terutama yang nggak penting.\n\nHabis ini kita beda kota, tapi janji ya: tiap ketemu, wajib foto di photobox. Muka jelek tetap dihitung. Selamat wisuda, sahabatku.',
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
        to: 'Qistina',
        from: 'Iman',
        title: 'Kawan sampai tua, noktah.',
        notes: [
          'Study group: 10% belajar, 90% gosip.',
          'Bakso lepas setiap exam. Tradisi suci.',
          'Berkelah kecemasan masa tesis sangkut.',
          'Grad juga! Topi awak senget, btw.',
        ],
        message:
          'Empat tahun, Qis. Daripada kenal sebab tersalah masuk kelas, sampai sekarang awak hafal pesanan bakso saya: tak nak daun sup, sambal dua sudu, kuah asing.\n\nTerima kasih sebab jadi orang pertama yang saya beritahu setiap kali ada berita baik, berita buruk, dan berita yang langsung tak penting. Terutamanya yang tak penting.\n\nLepas ni kita lain bandar, tapi janji ya: setiap kali jumpa, wajib bergambar di photobox. Muka buruk pun dikira. Selamat berkonvo, sahabatku.',
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
        to: 'Zoe',
        from: 'Mia',
        title: 'Best friends, full stop.',
        notes: [
          'Study group: 10% study, 90% gossip.',
          'Noodles after every exam. Sacred.',
          'Emergency picnic, thesis on fire.',
          'We made it! Your cap is crooked.',
        ],
        message:
          "Four years, Zoe. We met because I walked into the wrong classroom, and now you know my noodle order by heart: no celery, two spoons of chili, soup on the side.\n\nThank you for being the first person I text with good news, bad news, and news that does not matter at all. Especially that last kind.\n\nWe will be in different cities soon, so promise me this: every time we meet, we find a photo booth. Ugly faces still count. Happy graduation, my best friend.",
        photos: PHOTOS,
      },
    },
  },
};
