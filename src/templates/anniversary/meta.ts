import type { TemplateMeta } from '../types';

const PHOTOS = ['/art/foto-kopi.webp', '/art/foto-gunung.webp', '/art/foto-kota.webp', '/art/foto-taman.webp'];

export const meta: TemplateMeta = {
  id: 'anniversary',
  name: 'Anniversary',
  tagline: 'Kalender sobek dari hari jadian sampai hari ini, lengkap dengan hitungan yang terus berdetak.',
  steps: ['Sobek kalendernya', 'Lewati tiap momen', 'Sampai hari ini'],
  occasions: ['anniv'],
  palette: { bg: '#e9d9b8', ink: '#3a2018', accent: '#c8372d' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    { key: 'date', label: 'Tanggal jadian', hint: 'Kalendernya mulai dari tanggal ini, lalu menghitung sampai hari kadonya dibuka.' },
    {
      key: 'notes',
      label: 'Momen yang paling diingat',
      hint: 'Satu momen per lembar kalender. Sampai 5 momen, boleh dikosongkan.',
      min: 0,
      count: 5,
      max: 60,
      placeholder: 'Momen kecil yang masih kamu ingat',
    },
    { key: 'photos', label: 'Foto', hint: 'Opsional. Urut sesuai momennya, dijepit di lembar kalendernya.', count: 5 },
    { key: 'title', label: 'Ucapan utama', max: 40 },
    { key: 'message', label: 'Surat', hint: 'Dibuka setelah kalendernya sampai di hari ini.', max: 900, multiline: true },
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
      'Aku masih ingat tanggal di lembar pertama tadi. Waktu itu aku cuma berani pesan kopi yang sama denganmu.\n\nSejak hari itu, kalenderku isinya kamu: hari-hari biasa, hari-hari capek, hari-hari yang ternyata paling aku ingat.\n\nTerima kasih sudah bertahan di semua lembarnya. Lembar besok, lusa, dan seterusnya, aku masih mau menyobeknya bareng kamu.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Anniversary',
      tagline: 'Kalendar koyak dari hari pertama bersama sampai hari ini, lengkap dengan kiraan yang terus berdetik.',
      steps: ['Koyak kalendar', 'Lalui setiap detik manis', 'Sampai hari ini'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        date: { label: 'Tarikh mula bersama', hint: 'Kalendar bermula dari tarikh ini, lalu mengira sampai hari hadiah dibuka.' },
        notes: {
          label: 'Detik yang paling diingati',
          hint: 'Satu detik untuk setiap helaian kalendar. Sampai 5, boleh dibiarkan kosong.',
          placeholder: 'Detik kecil yang awak masih ingat',
        },
        photos: { label: 'Foto', hint: 'Pilihan. Ikut susunan detiknya, diklip pada helaian kalendar.' },
        title: { label: 'Ucapan utama' },
        message: { label: 'Surat', hint: 'Dibuka selepas kalendar sampai ke hari ini.' },
      },
      sample: {
        to: 'Aina',
        from: 'Hakim',
        date: '2023-02-14',
        title: 'Selamat ulang tahun kita, sayang.',
        notes: [
          'Kopi pertama. Awak lewat 40 minit, saya tetap tunggu.',
          'Kinabalu pukul 4 pagi. Sejuk, tapi awak asyik ketawa.',
          'Sesat di bandar orang. Berbaik semula sebab cendol.',
          'Berkelah mengejut. Tikar tertinggal, jadi juga.',
        ],
        message:
          'Saya masih ingat tarikh pada helaian pertama tadi. Masa tu saya cuma berani pesan kopi yang sama dengan awak.\n\nSejak hari itu, kalendar saya penuh dengan awak: hari biasa, hari penat, hari yang rupa-rupanya paling saya ingat.\n\nTerima kasih sebab bertahan pada setiap helaiannya. Helaian esok, lusa dan seterusnya, saya masih mahu koyakkannya bersama awak.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'Anniversary',
      tagline: 'A tear-off calendar from your first day together to today, with a counter that never stops ticking.',
      steps: ['Tear off the pages', 'Relive each moment', 'Arrive at today'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        date: { label: 'The day it all started', hint: 'The calendar starts on this date and counts up to the day the gift is opened.' },
        notes: {
          label: 'Moments you remember most',
          hint: 'One moment per calendar page. Up to 5, and you can leave them blank.',
          placeholder: 'A little moment you still remember',
        },
        photos: { label: 'Photos', hint: 'Optional. Same order as the moments, clipped onto each page.' },
        title: { label: 'Main message' },
        message: { label: 'Letter', hint: 'Opens once the calendar reaches today.' },
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
          "I still remember the date on that first page. Back then, all I had the nerve to do was order the same coffee as you.\n\nSince that day, my calendar has been full of you: the ordinary days, the tired days, the days that turned out to be the ones I remember most.\n\nThank you for staying through every page. Tomorrow's page, and all the ones after it, I still want to tear them off with you.",
        photos: PHOTOS,
      },
    },
  },
};
