import type { TemplateMeta } from '../types';

const PHOTOS = ['/contoh/dua-cangkir.webp', '/contoh/meja-belajar.webp', '/contoh/piknik.webp', '/contoh/kota-tua.webp', '/contoh/hujan-jendela.webp'];

export const meta: TemplateMeta = {
  id: 'gacha',
  name: 'Gacha Hati',
  tagline: 'Mesin kapsul berisi isi hatimu: masukkan koin, putar kenopnya, buka kapsul satu per satu, sampai kapsul emas di akhir.',
  steps: ['Masukkan koinnya', 'Putar & buka tiap kapsul', 'Kapsul emas, lalu surat'],
  occasions: ['nembak', 'ultah', 'sahabat'],
  palette: { bg: '#bfe6dc', ink: '#1f3a3a', accent: '#ff5d73' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Isi tiap kapsul: satu kalimat',
      hint: 'Tiap baris jadi satu kapsul yang keluar dari mesin. Yang pendek dan jujur paling kena.',
      min: 3,
      count: 6,
      max: 70,
      placeholder: 'Satu hal kecil tentang dia',
    },
    {
      key: 'photos',
      label: 'Foto di dalam kapsul (opsional)',
      hint: 'Foto pertama masuk ke kapsul pertama, dan seterusnya. Tanpa foto pun kapsulnya tetap manis.',
      count: 5,
      // tiap foto sudah berpasangan dengan kalimat kapsulnya
      captions: false,
    },
    { key: 'title', label: 'Isi kapsul emas: pertanyaan atau ucapan utama', hint: 'Keluar paling akhir, dengan konfeti. Taruh kalimat yang paling penting di sini.', max: 44 },
    { key: 'message', label: 'Surat di laci mesin', hint: 'Dibaca terakhir, setelah semua kapsul terbuka.', max: 900, multiline: true },
  ],
  sample: {
    to: 'Nayla',
    from: 'Reza',
    title: 'Selamat ulang tahun, sayangku!',
    notes: [
      'Aku masih hafal pesanan kopimu: es kopi susu, gula setengah.',
      'Kursi sebelahmu di kelas dulu bukan kebetulan. Itu strategi.',
      'Setahun jadian, aku masih lupa mau ngomong apa tiap kamu ketawa.',
      'Jalan pulang yang dulu sengaja memutar, sekarang rute kencan kita.',
      'Payung kita tetap satu. Dulu strategi, sekarang kebiasaan.',
      'Kapsul berikutnya emas. Isinya doa paling panjangku buat kamu.',
    ],
    message:
      'Nay, kamu tahu aku nggak jago ngomong langsung. Tiap mau bilang yang manis, yang keluar malah "eh, udah makan belum?".\n\nJadi kutitip semuanya ke mesin ini. Satu koin, tujuh kapsul, dan semua hal kecil yang bikin setahun terakhir jadi tahun paling seru buatku.\n\nSelamat ulang tahun, sayang. Semoga tahun ini kamu dapat semua yang kamu mau, dan semoga aku masih boleh jadi orang yang paling hafal pesanan kopimu.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Gacha Hati',
      tagline: 'Mesin kapsul berisi isi hati awak: masukkan syiling, pusing tombolnya, buka kapsul satu demi satu, sampai kapsul emas di hujung.',
      steps: ['Masukkan syilingnya', 'Pusing & buka setiap kapsul', 'Kapsul emas, kemudian surat'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Isi setiap kapsul: satu ayat',
          hint: 'Setiap baris jadi satu kapsul yang keluar dari mesin. Yang pendek dan jujur paling mengena.',
          placeholder: 'Satu perkara kecil tentang dia',
        },
        photos: { label: 'Foto di dalam kapsul (pilihan)', hint: 'Foto pertama masuk ke kapsul pertama, dan seterusnya. Tanpa foto pun kapsulnya tetap comel.' },
        title: { label: 'Isi kapsul emas: soalan atau ucapan utama', hint: 'Keluar paling akhir, dengan konfeti. Letak ayat yang paling penting di sini.' },
        message: { label: 'Surat di dalam laci mesin', hint: 'Dibaca paling akhir, selepas semua kapsul dibuka.' },
      },
      sample: {
        to: 'Qistina',
        from: 'Faris',
        title: 'Selamat hari jadi, sayang!',
        notes: [
          'Saya masih hafal pesanan awak: kopi ais susu, kurang manis.',
          'Kerusi sebelah awak dalam kelas dulu bukan kebetulan. Itu strategi.',
          'Setahun bersama, saya masih lupa nak cakap apa bila awak ketawa.',
          'Jalan jauh balik rumah dulu, sekarang laluan dating kita.',
          'Payung kita tetap satu. Dulu strategi, sekarang dah jadi tabiat.',
          'Kapsul seterusnya emas. Isinya doa paling panjang saya untuk awak.',
        ],
        message:
          'Qis, awak tahu saya tak pandai cakap depan-depan. Setiap kali nak cakap benda manis, yang keluar cuma "eh, dah makan ke belum?".\n\nJadi saya titipkan semuanya dalam mesin ni. Satu syiling, tujuh kapsul, dan semua perkara kecil yang buat setahun ni jadi tahun paling seronok untuk saya.\n\nSelamat hari jadi, sayang. Semoga tahun ni awak dapat semua yang awak mahu, dan semoga saya masih boleh jadi orang yang paling hafal pesanan kopi awak.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'Heart Gacha',
      tagline: 'A capsule machine filled with what you feel: drop the coin, turn the knob, open each capsule, and save the golden one for last.',
      steps: ['Drop the coin', 'Turn & open each capsule', 'The golden one, then a letter'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'Inside each capsule: one line',
          hint: 'Every line becomes one capsule from the machine. Short and honest works best.',
          placeholder: 'One small thing about them',
        },
        photos: { label: 'Photos inside the capsules (optional)', hint: 'The first photo goes in the first capsule, and so on. The capsules are sweet without photos too.' },
        title: { label: 'Inside the golden capsule: your question or main wish', hint: 'It comes out last, with confetti. Put the line that matters most here.' },
        message: { label: 'The letter in the prize drawer', hint: 'Read last, after every capsule is open.' },
      },
      sample: {
        to: 'Mia',
        from: 'Oliver',
        title: 'Happy birthday, my favourite person.',
        notes: [
          'I still know your coffee order by heart: iced latte, half sweet.',
          'The seat next to yours in class was never luck. It was strategy.',
          'A year in, I still forget what I was saying when you laugh.',
          'The long way home I took to walk with you is now our date route.',
          'We still share one umbrella. It began as a plan, now it is habit.',
          'The next capsule is gold. It holds my longest wish for you.',
        ],
        message:
          'Mia, you know I am terrible at saying things out loud. Every time I try to say something sweet, what comes out is "so, have you eaten?".\n\nSo I put it all in this machine instead. One coin, seven capsules, and every small thing that made this past year my favourite one yet.\n\nHappy birthday, love. I hope this year gives you everything you want, and I hope I still get to be the one who knows your coffee order best.',
        photos: PHOTOS,
      },
    },
  },
};
