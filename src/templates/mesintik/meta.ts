import type { TemplateMeta } from '../types';

const PHOTOS = ['/contoh/meja-belajar.webp', '/contoh/kopi-hitam.webp', '/contoh/hujan-jendela.webp', '/contoh/surat-tangan.webp'];

export const meta: TemplateMeta = {
  id: 'mesintik',
  name: 'Mesin Tik',
  tagline: 'Untuk yang susah diucapkan langsung: nyalakan lampunya, buka draf-draf yang gagal, lalu baca kalimat yang akhirnya berani diketik.',
  steps: ['Nyalakan lampu, ketik namanya', 'Buka draf yang diremas', 'Tarik suratnya dari rol'],
  occasions: ['maaf', 'kangen', 'nembak', 'sahabat'],
  palette: { bg: '#22303a', ink: '#f6ecd9', accent: '#e2a93b' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Draf yang diremas',
      hint: 'Kalimat yang nggak jadi dikirim. Tiap bola kertas di keranjang berisi satu draf; makin ke bawah makin jujur, makin seru.',
      min: 3,
      count: 5,
      max: 70,
      placeholder: 'Satu kalimat yang hampir kamu kirim',
    },
    {
      key: 'photos',
      label: 'Foto yang dijepit di draf',
      hint: 'Opsional, sampai 4. Foto ke-1 terjepit di draf ke-1, dan seterusnya.',
      count: 4,
      // tiap foto sudah berpasangan dengan drafnya
      captions: false,
    },
    { key: 'title', label: 'Kalimat yang akhirnya diketik', hint: 'Diketik sendiri oleh mesinnya dengan pita merah, setelah semua draf gagal.', max: 44 },
    { key: 'message', label: 'Surat lengkapnya', hint: 'Kertas yang ditarik dari rol di akhir.', max: 900, multiline: true },
  ],
  sample: {
    to: 'Nara',
    from: 'Dewa',
    title: 'Maaf ya. Aku yang salah, dan aku kangen.',
    notes: [
      'Hai. Apa kabar? Aku baik. Eh, nggak juga, sih.',
      'Sebenernya kemarin itu kamu juga sal— hapus, hapus.',
      'Maaf kalau kamu tersinggung. (Ini maaf macam apa, coba.)',
      'Udah ngetik 14 kali, tetap kedengeran kayak pengumuman RT.',
      'Aku takut kamu udah nggak nungguin aku.',
    ],
    message:
      'Aku butuh empat belas lembar kertas untuk sampai ke satu kalimat itu. Tiga belas sisanya ada di keranjang, dan kamu baru saja membaca beberapa. Malu, sih. Tapi biar kamu tahu aku nggak asal ngomong.\n\nMalam itu aku lebih sibuk ingin menang daripada mendengarkan. Kamu cuma minta ditemani, aku malah kasih ceramah. Maaf. Yang itu bukan salah nada, itu salahku.\n\nAku nggak minta langsung dimaafkan. Aku cuma mau kamu tahu: mejaku berantakan, kopiku dingin, dan aku kangen ketawamu.\n\nKalau kamu mau, besok aku traktir bakso. Aku yang dengerin, kamu yang cerita.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Mesin Taip',
      tagline: 'Untuk perkara yang susah nak cakap depan-depan: hidupkan lampu, buka draf yang gagal, lalu baca ayat yang akhirnya berani ditaip.',
      steps: ['Hidupkan lampu, taip namanya', 'Buka draf yang direnyuk', 'Tarik suratnya dari penggelek'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Draf yang direnyuk',
          hint: 'Ayat yang tak jadi dihantar. Setiap bola kertas dalam bakul ada satu draf; makin ke bawah makin jujur, makin seronok.',
          placeholder: 'Satu ayat yang hampir awak hantar',
        },
        photos: { label: 'Foto yang diklip pada draf', hint: 'Pilihan, sehingga 4. Foto pertama diklip pada draf pertama, dan seterusnya.' },
        title: { label: 'Ayat yang akhirnya ditaip', hint: 'Ditaip sendiri oleh mesinnya dengan reben merah, selepas semua draf gagal.' },
        message: { label: 'Surat penuhnya', hint: 'Kertas yang ditarik dari penggelek pada akhirnya.' },
      },
      sample: {
        to: 'Mira',
        from: 'Zafran',
        title: 'Maaf ya. Saya yang salah, dan saya rindu.',
        notes: [
          'Hai. Apa khabar? Saya okey. Eh, tak juga sebenarnya.',
          'Sebenarnya hari tu awak pun sal— padam, padam.',
          'Maaf kalau awak terasa. (Maaf jenis apa ni, aduh.)',
          'Dah taip 14 kali, bunyinya masih macam notis surau.',
          'Saya takut awak dah tak tunggu saya.',
        ],
        message:
          'Saya perlukan empat belas helai kertas untuk sampai ke satu ayat itu. Tiga belas lagi ada dalam bakul, dan awak baru saja baca beberapa. Malu juga. Tapi biar awak tahu saya bukan cakap kosong.\n\nMalam itu saya lebih sibuk nak menang daripada mendengar. Awak cuma minta ditemani, saya pula bagi ceramah. Maaf. Itu bukan salah nada, itu salah saya.\n\nSaya tak minta terus dimaafkan. Saya cuma nak awak tahu: meja saya bersepah, kopi saya dah sejuk, dan saya rindu ketawa awak.\n\nKalau awak sudi, esok saya belanja bakso. Saya dengar, awak cerita.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'Typewriter',
      tagline: 'For the things that are hard to say out loud: switch on the lamp, open the failed drafts, then read the one line that finally got typed.',
      steps: ['Lamp on, type their name', 'Open the crumpled drafts', 'Pull the letter off the roller'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'Crumpled drafts',
          hint: 'Lines you never sent. Each paper ball in the bin holds one draft; the further down, the more honest (and the more fun).',
          placeholder: 'A line you almost sent',
        },
        photos: { label: 'Photos clipped to the drafts', hint: 'Optional, up to 4. Photo 1 is clipped to draft 1, and so on.' },
        title: { label: 'The line that finally got typed', hint: 'The machine types it by itself in red ribbon, after every draft has failed.' },
        message: { label: 'The full letter', hint: 'The sheet you pull off the roller at the end.' },
      },
      sample: {
        to: 'Nora',
        from: 'Finn',
        title: "I'm sorry. I was wrong, and I miss you.",
        notes: [
          "Hi. How are you? I'm fine. Okay, not really.",
          'Technically you were also a little wr— delete, delete.',
          "I'm sorry if you felt hurt. (What kind of apology is that?)",
          'Typed this 14 times. Still sounds like a parking notice.',
          "I'm scared you've stopped waiting for me.",
        ],
        message:
          "It took me fourteen sheets of paper to get to that one line. The other thirteen are in the bin, and you just read a few of them. Embarrassing, yes. But now you know I did not say it lightly.\n\nThat night I was busier trying to win than trying to listen. You only asked me to stay with you, and I gave you a lecture. I'm sorry. That was not my tone. That was me.\n\nI'm not asking to be forgiven right away. I just want you to know: my desk is a mess, my coffee is cold, and I miss your laugh.\n\nIf you'll let me, noodles are on me tomorrow. I'll listen. You talk.",
        photos: PHOTOS,
      },
    },
  },
};
