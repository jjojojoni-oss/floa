import type { TemplateMeta } from '../types';

const PHOTOS = ['/contoh/kopi-dan-kue.webp', '/contoh/bromo-senja.webp', '/contoh/bakso-berdua.webp', '/contoh/piknik.webp'];

export const meta: TemplateMeta = {
  id: 'anniversary',
  name: 'Anniversary',
  tagline: 'Jam saku kuningan yang memutar balik waktu ke hari jadian, lalu berdetak lagi sampai detik ini.',
  steps: ['Putar balik waktunya', 'Buka tiap kenangan', 'Sampai detik ini'],
  occasions: ['anniv'],
  palette: { bg: '#17362e', ink: '#fbf0d9', accent: '#e3b24f' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    { key: 'date', label: 'Tanggal jadian', hint: 'Jamnya berputar balik ke tanggal ini, lalu menghitung sampai detik kadonya dibuka.' },
    {
      key: 'notes',
      label: 'Momen yang paling diingat',
      hint: 'Satu momen per kenangan di dalam tutup jam. Sampai 5 momen, boleh dikosongkan.',
      min: 0,
      count: 5,
      max: 60,
      placeholder: 'Momen kecil yang masih kamu ingat',
    },
    { key: 'photos', label: 'Foto', hint: 'Opsional. Urut sesuai momennya, tampil bundar di dalam tutup jam.', count: 5 },
    { key: 'title', label: 'Ucapan utama', hint: 'Terukir di punggung jam.', max: 40 },
    { key: 'message', label: 'Surat', hint: 'Terselip di balik jam, dibuka paling akhir.', max: 900, multiline: true },
  ],
  sample: {
    to: 'Nadia',
    from: 'Raka',
    date: '2023-02-14',
    title: 'Selamat hari jadi, sayang.',
    notes: [
      'Kopi pertama. Kamu telat 40 menit, aku tetap nunggu.',
      'Bromo jam 4 pagi. Dingin, tapi kamu ketawa terus.',
      'Nyasar di kota orang. Baikannya gara-gara bakso.',
      'Piknik dadakan. Tikarnya ketinggalan, tetap jadi.',
    ],
    message:
      'Kalau waktunya bisa kuputar balik, aku tetap berhenti di tanggal yang sama. Waktu itu aku cuma berani pesan kopi yang sama denganmu.\n\nSejak hari itu, jam-jamku isinya kamu: hari-hari biasa, hari-hari capek, hari-hari yang ternyata paling aku ingat.\n\nTerima kasih sudah bertahan di semua detiknya. Detik berikutnya, dan semua yang setelah itu, aku masih mau habiskan bareng kamu.',
    photos: PHOTOS,
    captions: ['Kamu pesan, aku ikut pesan yang sama.', 'Matahari terbit pertama kita.', 'Dua mangkuk, satu baikan.', 'Tanpa tikar, tetap piknik.'],
  },
  i18n: {
    ms: {
      name: 'Anniversary',
      tagline: 'Jam poket loyang yang mengundurkan masa ke hari pertama bersama, lalu berdetik semula sampai saat ini.',
      steps: ['Undurkan masa', 'Buka setiap kenangan', 'Sampai saat ini'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        date: { label: 'Tarikh mula bersama', hint: 'Jamnya berundur ke tarikh ini, lalu mengira sampai saat hadiah dibuka.' },
        notes: {
          label: 'Detik yang paling diingati',
          hint: 'Satu detik untuk setiap kenangan dalam penutup jam. Sampai 5, boleh dibiarkan kosong.',
          placeholder: 'Detik kecil yang awak masih ingat',
        },
        photos: { label: 'Foto', hint: 'Pilihan. Ikut susunan detiknya, tampil bulat dalam penutup jam.' },
        title: { label: 'Ucapan utama', hint: 'Terukir di belakang jam.' },
        message: { label: 'Surat', hint: 'Terselit di belakang jam, dibuka paling akhir.' },
      },
      sample: {
        to: 'Aina',
        from: 'Hakim',
        date: '2023-02-14',
        title: 'Selamat ulang tahun kita, sayang.',
        notes: [
          'Kopi pertama. Awak lewat 40 minit, saya tetap tunggu.',
          'Bromo pukul 4 pagi. Sejuk, tapi awak asyik ketawa.',
          'Sesat di bandar orang. Berbaik semula sebab bakso.',
          'Berkelah mengejut. Tikar tertinggal, jadi juga.',
        ],
        message:
          'Kalau masa boleh saya undurkan, saya tetap akan berhenti pada tarikh yang sama. Masa tu saya cuma berani pesan kopi yang sama dengan awak.\n\nSejak hari itu, jam-jam saya penuh dengan awak: hari biasa, hari penat, hari yang rupa-rupanya paling saya ingat.\n\nTerima kasih sebab bertahan pada setiap saatnya. Saat seterusnya, dan semua yang selepas itu, saya masih mahu habiskan bersama awak.',
        photos: PHOTOS,
        captions: ['Awak order, saya ikut order yang sama.', 'Matahari terbit pertama kita.', 'Dua mangkuk, terus berbaik.', 'Tanpa tikar, tetap berkelah.'],
      },
    },
    en: {
      name: 'Anniversary',
      tagline: 'A brass pocket watch that winds time back to your first day together, then ticks its way to this very second.',
      steps: ['Turn back time', 'Open each memory', 'Arrive at right now'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        date: { label: 'The day it all started', hint: 'The watch winds back to this date, then counts up to the second the gift is opened.' },
        notes: {
          label: 'Moments you remember most',
          hint: 'One moment per memory inside the watch lid. Up to 5, and you can leave them blank.',
          placeholder: 'A little moment you still remember',
        },
        photos: { label: 'Photos', hint: 'Optional. Same order as the moments, shown round inside the watch lid.' },
        title: { label: 'Main message', hint: 'Engraved on the back of the watch.' },
        message: { label: 'Letter', hint: 'Tucked behind the watch, opened last.' },
      },
      sample: {
        to: 'Emily',
        from: 'Noah',
        date: '2023-02-14',
        title: 'Happy anniversary, my love.',
        notes: [
          'Our first coffee. You were 40 minutes late. I waited.',
          'That 4 a.m. hike. Freezing, and you kept laughing.',
          'Lost in a strange city. We made up over noodles.',
          'A last-minute picnic. We forgot the blanket. Still went.',
        ],
        message:
          "If I could turn back time, I would still stop on that same date. Back then, all I had the nerve to do was order the same coffee as you.\n\nSince that day, my hours have been full of you: the ordinary days, the tired days, the days that turned out to be the ones I remember most.\n\nThank you for staying through every second. The next one, and all the ones after it, I still want to spend with you.",
        photos: PHOTOS,
        captions: ['You ordered, I copied.', 'Our first sunrise together.', 'Two bowls, one making up.', 'No blanket, still a picnic.'],
      },
    },
  },
};
