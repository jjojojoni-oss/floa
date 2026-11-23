import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'bento',
  name: 'Your Bento',
  tagline: 'Sekotak bekal berisi perhatian. Tiap lauk menyimpan satu pesan, dan ada surat di balik tutupnya.',
  steps: ['Buka tutupnya', 'Ketuk tiap lauk', 'Surat di balik tutup'],
  occasions: ['kangen', 'sahabat', 'ortu', 'ultah', 'maaf'],
  palette: { bg: '#f1dfc4', ink: '#3c2415', accent: '#e4572e' },
  fields: [
    { key: 'to', label: 'Bento untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Isi bento: satu kalimat per lauk',
      hint: 'Muncul saat tiap lauk diketuk. 3 sampai 6 lauk.',
      min: 3,
      count: 6,
      max: 60,
      placeholder: 'Pesan kecil, perhatian kecil',
    },
    { key: 'photos', label: 'Foto', hint: 'Opsional. Muncul bersama catatan, urut sesuai lauknya.', count: 6 },
    { key: 'title', label: 'Ucapan utama', hint: 'Jadi judul surat di balik tutup.', max: 40 },
    { key: 'message', label: 'Surat di balik tutup', max: 900, multiline: true },
  ],
  sample: {
    to: 'Raka',
    from: 'Sasa',
    title: 'Jangan lupa makan, ya.',
    notes: [
      'Sarapan dulu, jangan cuma kopi.',
      'Kalau capek, istirahat. Dunia bisa nunggu.',
      'Kamu hebat hari ini. Kemarin juga.',
      'Makan siang yang bener, jangan cuma es kopi susu.',
      'Pulangnya hati-hati, kabarin aku ya.',
      'Aku bangga sama kamu. Banget.',
    ],
    message:
      'Aku nggak bisa nemenin kamu makan siang tiap hari, jadi aku titip kotak ini.\n\nAnggap aja tiap lauknya pelukan kecil dari jauh. Kalau harimu lagi berat, buka lagi kotaknya. Isinya nggak akan habis.\n\nMakan yang banyak, ya. Sampai ketemu akhir bulan.',
    photos: ['/contoh/kopi-hitam.webp', '/contoh/hujan-jendela.webp', '/contoh/meja-belajar.webp', '/contoh/nasi-kotak.webp', '/contoh/jalan-hujan-malam.webp', '/contoh/gandengan.webp'],
    captions: ['Ini bukan sarapan, ya.', 'Hujan begini, tidur siang dulu.', 'Lemburmu kemarin, aku lihat kok.', 'Nasi kotak juga makan siang. Habisin.', 'Jalanan licin, pelan-pelan aja.', 'Sampai ketemu akhir bulan.'],
  },
  i18n: {
    ms: {
      name: 'Your Bento',
      tagline: 'Sekotak bekal penuh perhatian. Setiap lauk menyimpan satu pesanan, dan ada surat di sebalik penutupnya.',
      steps: ['Buka penutup', 'Ketuk setiap lauk', 'Surat di sebalik penutup'],
      fields: {
        to: { label: 'Bento untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Isi bento: satu ayat setiap lauk',
          hint: 'Muncul apabila setiap lauk diketuk. 3 hingga 6 lauk.',
          placeholder: 'Pesanan kecil, perhatian kecil',
        },
        photos: { label: 'Foto', hint: 'Pilihan. Muncul bersama catatan, ikut susunan lauk.' },
        title: { label: 'Ucapan utama', hint: 'Jadi tajuk surat di sebalik penutup.' },
        message: { label: 'Surat di sebalik penutup' },
      },
      sample: {
        to: 'Aiman',
        from: 'Hana',
        title: 'Jangan lupa makan, tau.',
        notes: [
          'Sarapan dulu, jangan kopi je.',
          'Kalau penat, rehat. Dunia boleh tunggu.',
          'Awak hebat hari ni. Semalam pun sama.',
          'Makan tengah hari betul-betul, bukan teh ais je.',
          'Balik nanti hati-hati, mesej saya ya.',
          'Saya bangga dengan awak. Sangat.',
        ],
        message:
          'Saya tak dapat teman awak makan tengah hari setiap hari, jadi saya kirim kotak ni.\n\nAnggap je setiap lauk tu pelukan kecil dari jauh. Kalau hari awak berat, buka semula kotak ni. Isinya takkan habis.\n\nMakan banyak-banyak, ya. Jumpa hujung bulan nanti.',
        photos: ['/contoh/kopi-hitam.webp', '/contoh/hujan-jendela.webp', '/contoh/meja-belajar.webp', '/contoh/nasi-kotak.webp', '/contoh/jalan-hujan-malam.webp', '/contoh/gandengan.webp'],
        captions: ['Ini bukan sarapan, ya.', 'Hujan macam ni, tidur sekejap dulu.', 'Awak kerja lewat semalam, saya nampak.', 'Nasi kotak pun kira makan tengah hari. Habiskan.', 'Jalan licin, perlahan-lahan je.', 'Jumpa hujung bulan nanti.'],
      },
    },
    en: {
      name: 'Your Bento',
      tagline: 'A lunchbox packed with care. Every bite holds a little note, and there is a letter under the lid.',
      steps: ['Lift the lid', 'Tap each bite', 'The letter under the lid'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'In the bento: one line per bite',
          hint: 'Shows up as each bite is tapped. 3 to 6 bites.',
          placeholder: 'A small note, a little care',
        },
        photos: { label: 'Photos', hint: 'Optional. Each one appears with its note, in the same order.' },
        title: { label: 'Main message', hint: 'Becomes the title of the letter under the lid.' },
        message: { label: 'Letter under the lid' },
      },
      sample: {
        to: 'Noah',
        from: 'Lily',
        title: "Don't forget to eat, okay?",
        notes: [
          'Breakfast first. Coffee does not count.',
          'If you are tired, rest. The world can wait.',
          'You did great today. Yesterday too.',
          'Eat a real lunch, not just an iced latte.',
          'Get home safe, and text me when you do.',
          'I am proud of you. So proud.',
        ],
        message:
          "I can't sit with you at lunch every day, so I packed you this instead.\n\nThink of every bite as a small hug from far away. When a day gets heavy, open the box again. It never runs out.\n\nEat well, okay? See you at the end of the month.",
        photos: ['/contoh/kopi-hitam.webp', '/contoh/hujan-jendela.webp', '/contoh/meja-belajar.webp', '/contoh/nasi-kotak.webp', '/contoh/jalan-hujan-malam.webp', '/contoh/gandengan.webp'],
        captions: ['This is not breakfast.', 'Rain like this calls for a nap.', 'I saw you working late yesterday.', 'A boxed lunch still counts. Finish it.', 'Wet roads. Take it slow.', 'See you at the end of the month.'],
      },
    },
  },
};
