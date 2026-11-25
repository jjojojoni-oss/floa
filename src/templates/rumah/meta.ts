import type { TemplateMeta } from '../types';

/** foto ke-i tergantung di dinding ruangan ke-i: ruang tamu, dapur, kamar tidur, loteng, teras */
const PHOTOS = ['/contoh/gandengan.webp', '/contoh/masak-tungku.webp', '/contoh/hujan-jendela.webp', '/contoh/surat-tangan.webp', '/contoh/kopi-dan-kue.webp'];

export const meta: TemplateMeta = {
  id: 'rumah',
  name: 'Rumah Kecil Kita',
  tagline: 'Rumah boneka mungil di meja teras: pencet belnya, buka depannya seperti pintu lemari, lalu nyalakan lampu tiap ruangan. Di tiap ruangan ada satu kenangan.',
  steps: ['Pencet bel & buka rumahnya', 'Nyalakan lampu tiap ruangan', 'Surat di bawah keset'],
  occasions: ['ortu', 'anniv', 'kangen', 'ultah'],
  palette: { bg: '#efe2cf', ink: '#3b2a22', accent: '#d9694a' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama mereka', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Isi tiap ruangan: satu kenangan',
      hint: 'Urutannya: ruang tamu, dapur, kamar tidur, loteng, teras. Kenangannya muncul saat lampu ruangan itu dinyalakan.',
      min: 3,
      count: 5,
      max: 70,
      placeholder: 'Kenangan kecil di ruangan ini',
    },
    {
      key: 'photos',
      label: 'Foto kecil di dinding',
      hint: 'Opsional. Foto ke-1 tergantung di dinding ruang tamu bersama kenangan ke-1, dan seterusnya.',
      count: 5,
      // tiap foto sudah berpasangan dengan kenangan di ruangannya
      captions: false,
    },
    { key: 'title', label: 'Tulisan di papan atas pintu', hint: 'Muncul di papan kayu di atas pintu begitu semua lampu menyala.', max: 40 },
    { key: 'message', label: 'Surat di bawah keset', hint: 'Terselip di bawah keset depan pintu, dibaca paling akhir.', max: 900, multiline: true },
  ],
  sample: {
    to: 'Papa & Mama',
    from: 'Laila',
    title: 'Rumah ini selalu kalian.',
    notes: [
      'Sofa ini saksi Papa ketiduran tiap nonton bola, sebelum babak kedua.',
      'Nasi goreng Mama jam 10 malam. Sampai sekarang belum ada tandingannya.',
      'Tiap ada petir, aku kabur ke kamar kalian. Kalian pura-pura tidur.',
      'Di loteng, Papa simpan semua gambarku. Bahkan yang jelek banget.',
      'Teh sore di teras, kalian berdua, aku ikut nimbrung. Aku kangen itu.',
    ],
    message:
      'Papa, Mama, sejak merantau, rumah kita cuma bisa aku kunjungi lewat telepon. Jadi aku bangun lagi di sini, kecil-kecil, satu ruangan satu kenangan.\n\nAku baru sadar, yang bikin rumah itu hangat bukan lampunya. Tapi Mama yang selalu nanya "udah makan?", dan Papa yang diam-diam ngisi bensin motorku sebelum aku berangkat.\n\nLebaran nanti aku pulang. Sisakan nasi goreng jam sepuluh malam, ya. Dan kalau aku ketiduran di sofa, jangan dibangunin.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Rumah Kecil Kita',
      tagline: 'Rumah anak patung kecil di meja beranda: tekan locengnya, buka depannya macam pintu almari, kemudian hidupkan lampu setiap ruang. Setiap ruang ada satu kenangan.',
      steps: ['Tekan loceng & buka rumahnya', 'Hidupkan lampu setiap ruang', 'Surat di bawah alas kaki'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama mereka' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Isi setiap ruang: satu kenangan',
          hint: 'Susunannya: ruang tamu, dapur, bilik tidur, loteng, beranda. Kenangannya muncul bila lampu ruang itu dihidupkan.',
          placeholder: 'Kenangan kecil di ruang ini',
        },
        photos: { label: 'Foto kecil di dinding', hint: 'Pilihan. Foto pertama tergantung di dinding ruang tamu bersama kenangan pertama, dan seterusnya.' },
        title: { label: 'Tulisan di papan atas pintu', hint: 'Muncul di papan kayu atas pintu sebaik semua lampu menyala.' },
        message: { label: 'Surat di bawah alas kaki', hint: 'Terselit di bawah alas kaki depan pintu, dibaca paling akhir.' },
      },
      sample: {
        to: 'Abah & Ummi',
        from: 'Aqila',
        title: 'Rumah ini sentiasa kalian.',
        notes: [
          'Sofa ini saksi Abah terlelap tengok bola, belum pun separuh masa.',
          'Nasi goreng Ummi pukul 10 malam. Sampai sekarang tiada tandingan.',
          'Tiap kali guruh, saya lari ke bilik kalian. Kalian buat-buat tidur.',
          'Di loteng, Abah simpan semua lukisan saya. Termasuk yang paling hodoh.',
          'Teh petang di beranda, kalian berdua, saya menyibuk. Saya rindu itu.',
        ],
        message:
          'Abah, Ummi, sejak merantau, rumah kita cuma boleh saya lawati melalui telefon. Jadi saya bina semula di sini, kecil-kecil, satu ruang satu kenangan.\n\nBaru saya sedar, yang buat rumah itu hangat bukan lampunya. Tapi Ummi yang selalu tanya "dah makan?", dan Abah yang diam-diam isi minyak motor saya sebelum saya bertolak.\n\nRaya nanti saya balik. Simpankan nasi goreng pukul sepuluh malam, ya. Dan kalau saya tertidur di sofa, jangan kejutkan.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'Our Little House',
      tagline: 'A tiny dollhouse on the terrace table: ring the bell, swing the front open like a cabinet door, then turn on the light in every room. Each room keeps one memory.',
      steps: ['Ring the bell & open the house', 'Light up every room', 'The letter under the doormat'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their names' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'One memory for each room',
          hint: 'In this order: living room, kitchen, bedroom, attic, terrace. Each memory appears when that room lights up.',
          placeholder: 'A small memory from this room',
        },
        photos: { label: 'Tiny photos on the walls', hint: 'Optional. Photo 1 hangs on the living room wall with memory 1, and so on.' },
        title: { label: 'Words on the sign above the door', hint: 'Appears on the wooden sign above the door once every light is on.' },
        message: { label: 'The letter under the doormat', hint: 'Tucked under the doormat by the front door, read last of all.' },
      },
      sample: {
        to: 'Mum & Dad',
        from: 'Hannah',
        title: 'Home is always you two.',
        notes: [
          'Dad dozed off on this sofa every match night, always before half-time.',
          "Mum's 10 p.m. fried rice. Nothing in the world comes close.",
          'Every thunderstorm I crept into your room. You pretended to sleep.',
          'Dad kept every drawing I made up in the attic. Even the awful ones.',
          'Afternoon tea on the terrace, you two and me butting in. I miss that.',
        ],
        message:
          'Mum, Dad, since I moved away, I can only visit our house over the phone. So I built it again here, tiny, one room for one memory.\n\nI finally get it: what made that house warm was never the lights. It was Mum always asking "have you eaten?", and Dad quietly filling up my tank before I drove off.\n\nI am coming home for the holidays. Save me some of that 10 p.m. fried rice. And if I fall asleep on the sofa, let me be.',
        photos: PHOTOS,
      },
    },
  },
};
