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
    title: 'Mau nggak, jadi pacarku?',
    notes: [
      'Aku hafal pesanan kopimu: es kopi susu, gula setengah.',
      'Kursi sebelahmu di kelas itu bukan kebetulan. Itu strategi.',
      'Tiap kamu ketawa, aku lupa tadi mau ngomong apa.',
      'Aku pernah muter jalan pulang cuma biar bisa bareng kamu.',
      'Payung waktu itu sengaja kubawa satu. Maaf, ya.',
      'Kapsul berikutnya emas. Tarik napas dulu. Aku juga.',
    ],
    message:
      'Nay, aku orangnya nggak jago ngomong langsung. Tiap mau bilang, yang keluar malah "eh, udah makan belum?".\n\nJadi kutitip semuanya ke mesin ini. Satu koin, tujuh kapsul, dan satu pertanyaan yang sudah kusimpan sejak semester lalu.\n\nApa pun jawabanmu, aku tetap yang paling hafal pesanan kopimu. Tapi kalau boleh berharap: semoga jawabannya bikin aku nggak bisa tidur karena senang.',
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
        title: 'Sudi tak jadi teman istimewa saya?',
        notes: [
          'Saya hafal pesanan awak: kopi ais susu, kurang manis.',
          'Kerusi sebelah awak dalam kelas tu bukan kebetulan. Itu strategi.',
          'Setiap kali awak ketawa, saya lupa nak cakap apa tadi.',
          'Saya pernah pusing jauh balik rumah, semata-mata nak sejalan.',
          'Payung hari tu saya sengaja bawa satu saja. Maaf ya.',
          'Kapsul seterusnya emas. Tarik nafas dulu. Saya pun sama.',
        ],
        message:
          'Qis, saya ni tak pandai cakap depan-depan. Setiap kali nak beritahu, yang keluar cuma "eh, dah makan ke belum?".\n\nJadi saya titipkan semuanya dalam mesin ni. Satu syiling, tujuh kapsul, dan satu soalan yang saya simpan sejak semester lepas.\n\nApa pun jawapan awak, saya tetap orang yang paling hafal pesanan kopi awak. Tapi kalau boleh berharap: biarlah jawapannya buat saya tak boleh tidur sebab gembira.',
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
        title: 'Will you go out with me?',
        notes: [
          'I know your coffee order by heart: iced latte, half sweet.',
          'The seat next to yours in class was not luck. It was strategy.',
          'Every time you laugh, I forget what I was about to say.',
          'I once took the long way home just to walk with you.',
          'I brought one umbrella that day on purpose. Sorry.',
          'The next capsule is gold. Deep breath. Me too.',
        ],
        message:
          'Mia, I am terrible at saying things out loud. Every time I try, what comes out is "so, have you eaten?".\n\nSo I put it all in this machine instead. One coin, seven capsules, and one question I have been holding on to since last semester.\n\nWhatever you answer, I will still be the one who knows your coffee order best. But if I am allowed to hope: I hope your answer keeps me awake all night, for the good reason.',
        photos: PHOTOS,
      },
    },
  },
};
