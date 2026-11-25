import type { TemplateMeta } from '../types';

const PHOTOS = ['/contoh/dua-cangkir.webp', '/contoh/peron-stasiun.webp', '/contoh/hujan-jendela.webp', '/contoh/bromo-senja.webp'];

/**
 * Kunci kolom & batasnya SAMA PERSIS dengan versi Anniversary sebelumnya (jam saku), karena kado yang
 * sudah tersimpan harus tetap tampil: to/from 20, date opsional, notes 0–5 × 60, photos 5 (dengan cerita
 * foto), title 40, message 900.
 */
export const meta: TemplateMeta = {
  id: 'anniversary',
  name: 'Anniversary',
  tagline: 'Kereta malam berdua yang berangkat dari stasiun hari jadian kalian, mampir di tiap kenangan, lalu tiba tepat di hari ini.',
  steps: ['Lubangi karcisnya', 'Mampir di tiap kenangan', 'Tiba di Stasiun Hari Ini'],
  occasions: ['anniv'],
  palette: { bg: '#14213d', ink: '#f8ecd4', accent: '#f0b44c' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    { key: 'date', label: 'Tanggal jadian', hint: 'Jadi nama stasiun keberangkatan, lalu dihitung sampai detik kadonya dibuka. Kosongkan kalau mau "Stasiun Hari Pertama".' },
    {
      key: 'notes',
      label: 'Kenangan di tiap stasiun',
      hint: 'Satu kenangan per stasiun, ditulis di secarik kertas di jendela kereta. Sampai 5, boleh dikosongkan.',
      min: 0,
      count: 5,
      max: 60,
      placeholder: 'Kenangan kecil yang masih kamu ingat',
    },
    { key: 'photos', label: 'Foto', hint: 'Opsional. Urut sesuai kenangannya: foto ke-1 terselip di jendela stasiun pertama, dan seterusnya.', count: 5 },
    { key: 'title', label: 'Ucapan utama', hint: 'Terpampang di papan besar Stasiun Hari Ini.', max: 40 },
    { key: 'message', label: 'Surat', hint: 'Dititipkan di bangku peron terakhir, dibuka paling akhir.', max: 900, multiline: true },
  ],
  sample: {
    to: 'Kania',
    from: 'Arya',
    date: '2023-02-14',
    title: 'Selamat hari jadi, penumpang favoritku.',
    notes: [
      'Kencan pertama. Kamu pesan dua kopi, satunya buatku.',
      'Pertama kali naik kereta bareng. Kamu tidur di bahuku.',
      'Kehujanan di jalan pulang. Payungnya cuma satu.',
      'Subuh di Bromo. Dingin, tapi tanganmu hangat.',
    ],
    message:
      'Kalau hidup ini perjalanan kereta, aku nggak peduli lagi jurusannya ke mana. Aku cuma mau kursi di sebelahmu, karcis yang sama, dan kamu yang ketiduran di bahuku tiap perjalanan jauh.\n\nTerima kasih sudah mau naik di stasiun yang sama denganku, dan bertahan di semua perhentiannya: yang indah, yang melelahkan, yang bikin kita diam-diaman lalu baikan lagi.\n\nKeretanya belum berhenti. Masih banyak stasiun di depan, dan aku masih mau melewatinya bareng kamu.',
    photos: PHOTOS,
    captions: ['Dua cangkir, satu yang gugup.', 'Gerbong 3, kursi 12 dan 13.', 'Basah, tapi nggak buru-buru pulang.', 'Matahari terbit pertama kita.'],
  },
  i18n: {
    ms: {
      name: 'Anniversary',
      tagline: 'Kereta malam untuk berdua yang bertolak dari stesen hari pertama kamu bersama, singgah di setiap kenangan, lalu tiba tepat pada hari ini.',
      steps: ['Tebuk tiketnya', 'Singgah di setiap kenangan', 'Tiba di Stesen Hari Ini'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        date: { label: 'Tarikh mula bersama', hint: 'Jadi nama stesen pertama, lalu dikira sampai saat hadiah dibuka. Biarkan kosong untuk "Stesen Hari Pertama".' },
        notes: {
          label: 'Kenangan di setiap stesen',
          hint: 'Satu kenangan untuk setiap stesen, ditulis pada sehelai kertas di tingkap kereta. Sampai 5, boleh dibiarkan kosong.',
          placeholder: 'Kenangan kecil yang awak masih ingat',
        },
        photos: { label: 'Foto', hint: 'Pilihan. Ikut susunan kenangannya: foto pertama terselit di tingkap stesen pertama, dan seterusnya.' },
        title: { label: 'Ucapan utama', hint: 'Terpampang pada papan besar Stesen Hari Ini.' },
        message: { label: 'Surat', hint: 'Ditinggalkan di bangku platform terakhir, dibuka paling akhir.' },
      },
      sample: {
        to: 'Balqis',
        from: 'Haikal',
        date: '2023-02-14',
        title: 'Selamat ulang tahun kita, sayang.',
        notes: [
          'Janji temu pertama. Awak pesan dua kopi, satu untuk saya.',
          'Kali pertama naik kereta api. Awak tidur di bahu saya.',
          'Ditimpa hujan masa balik. Payung cuma ada satu.',
          'Subuh di Bromo. Sejuk, tapi tangan awak hangat.',
        ],
        message:
          'Kalau hidup ini perjalanan kereta api, saya tak kisah lagi ke mana destinasinya. Saya cuma mahu kerusi di sebelah awak, tiket yang sama, dan awak yang tertidur di bahu saya setiap kali perjalanan jauh.\n\nTerima kasih sebab sudi naik di stesen yang sama dengan saya, dan bertahan di setiap perhentiannya: yang indah, yang memenatkan, yang buat kita diam lalu berbaik semula.\n\nKeretanya belum berhenti. Masih banyak stesen di hadapan, dan saya masih mahu melaluinya bersama awak.',
        photos: PHOTOS,
        captions: ['Dua cawan, seorang yang gementar.', 'Gerabak 3, kerusi 12 dan 13.', 'Basah, tapi tak tergesa-gesa pulang.', 'Matahari terbit pertama kita.'],
      },
    },
    en: {
      name: 'Anniversary',
      tagline: 'A night train for two that leaves from the station of your first day together, stops at every memory, and arrives right at today.',
      steps: ['Punch the ticket', 'Stop at every memory', 'Arrive at Today Station'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        date: { label: 'The day it all started', hint: 'It names the departure station, then counts up to the second the gift is opened. Leave it empty for "First Day Station".' },
        notes: {
          label: 'A memory at each station',
          hint: 'One memory per station, written on a slip of paper at the train window. Up to 5, and you can leave them blank.',
          placeholder: 'A little moment you still remember',
        },
        photos: { label: 'Photos', hint: 'Optional. Same order as the memories: photo 1 is tucked in the window at the first station, and so on.' },
        title: { label: 'Main message', hint: 'Shown on the big board at Today Station.' },
        message: { label: 'Letter', hint: 'Left on the bench at the last platform, opened last.' },
      },
      sample: {
        to: 'Rose',
        from: 'Henry',
        date: '2023-02-14',
        title: 'Happy anniversary, favourite passenger.',
        notes: [
          'Our first date. You ordered two coffees, one for me.',
          'Our first train ride. You fell asleep on my shoulder.',
          'Caught in the rain on the way home. One umbrella.',
          'Sunrise on the mountain. Freezing, but your hand was warm.',
        ],
        message:
          "If life is a train ride, I no longer care where the line goes. I just want the seat next to yours, the same ticket, and you dozing off on my shoulder on every long trip.\n\nThank you for boarding at the same station as me, and for staying through every stop: the lovely ones, the exhausting ones, the ones where we went quiet and then made up again.\n\nThis train isn't stopping yet. There are so many stations ahead, and I still want to pass every one of them with you.",
        photos: PHOTOS,
        captions: ['Two cups, one nervous me.', 'Car 3, seats 12 and 13.', 'Soaked, and in no hurry to get home.', 'Our first sunrise together.'],
      },
    },
  },
};
