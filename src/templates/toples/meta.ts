import type { TemplateMeta } from '../types';

/** foto ke-i ikut bintang ke-i: bakso, jemputan pas hujan, kopi, motor di jalan, rasi bintang; bintang emas tanpa foto */
const PHOTOS = ['/contoh/bakso-berdua.webp', '/contoh/jalan-hujan-malam.webp', '/contoh/dua-cangkir.webp', '/contoh/kota-tua.webp', '/contoh/bintang-tenda.webp'];

export const meta: TemplateMeta = {
  id: 'toples',
  name: 'Toples Bintang',
  tagline: 'Setoples bintang kertas lipat. Tiap bintang dibuka jadi satu alasan, harapan, atau terima kasih, sampai surat di dasarnya.',
  steps: ['Cabut gabusnya', 'Kocok, buka tiap bintang', 'Surat di dasar toples'],
  occasions: ['ultah', 'ortu', 'sahabat', 'maaf', 'kangen'],
  palette: { bg: '#d9cdf0', ink: '#2f2452', accent: '#e8548a' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Isi tiap bintang: satu alasan atau harapan',
      hint: '3 sampai 7 bintang. Yang terakhir jadi bintang emas, jadi taruh yang paling berarti di paling bawah. Tulis yang spesifik: kebiasaan kecil, atau kalimat yang pernah dia ucapkan.',
      min: 3,
      count: 7,
      max: 80,
      placeholder: 'Mis. Lampu teras yang selalu masih nyala tiap aku pulang telat.',
    },
    // tiap foto sudah ikut bintangnya sendiri (foto ke-i bersama bintang ke-i), jadi tak perlu kolom cerita foto
    { key: 'photos', label: 'Foto', hint: 'Opsional, sampai 5. Foto ke-1 ikut bintang ke-1, dan seterusnya.', count: 5, captions: false },
    { key: 'title', label: 'Ucapan utama', hint: 'Muncul setelah semua bintang terbuka.', max: 40 },
    { key: 'message', label: 'Surat di dasar toples', hint: 'Dibaca paling akhir, setelah bintang terakhir.', max: 900, multiline: true },
  ],
  sample: {
    to: 'Dafa',
    from: 'Tasya',
    title: 'Selamat ulang tahun, Sayang.',
    notes: [
      'Kamu selalu nyisain bakso terakhir buatku, padahal itu yang paling kamu tunggu.',
      'Jemput aku pas hujan, jas hujannya cuma satu, dan yang basah kuyup malah kamu.',
      'Kamu hafal kopiku: gula sedikit, es banyak, nggak pakai sedotan.',
      'Kamu nyanyi fals di motor, kenceng-kenceng, biar aku ketawa pas lagi sedih.',
      'Kamu nunjukin rasi bintang, salah semua, tapi aku tetap ngangguk.',
      'Karena sama kamu, aku nggak perlu pura-pura jadi siapa-siapa.',
    ],
    message:
      'Daf, aku bukan orang yang jago ngomong manis langsung. Kamu tahu sendiri, tiap mau bilang sayang, ujung-ujungnya aku malah nanya kamu udah makan belum.\n\nJadi aku tulis satu-satu, aku lipat jadi bintang, lalu aku masukin ke toples ini. Belajar lipatnya nonton tutorial tiga kali, dan bintang pertamaku gepeng. Yang itu nggak aku masukin.\n\nYang kamu baca tadi baru enam. Sisanya aku simpan buat tahun depan, dan tahun depannya lagi.\n\nSelamat ulang tahun, Sayang. Toplesnya jangan dibuang, ya. Alasanku masih banyak yang belum muat.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Balang Bintang',
      tagline: 'Sebalang bintang kertas lipat. Setiap bintang dibuka jadi satu sebab, harapan atau ucapan terima kasih, sampai surat di dasarnya.',
      steps: ['Cabut gabusnya', 'Goncang, buka setiap bintang', 'Surat di dasar balang'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Isi setiap bintang: satu sebab atau harapan',
          hint: '3 hingga 7 bintang. Yang terakhir jadi bintang emas, jadi letak yang paling bermakna paling bawah. Tulis yang spesifik: tabiat kecil, atau ayat yang pernah dia ucapkan.',
          placeholder: 'Cth. Lampu beranda yang mesti masih menyala setiap kali saya balik lewat.',
        },
        photos: { label: 'Foto', hint: 'Pilihan, sehingga 5. Foto pertama ikut bintang pertama, dan seterusnya.' },
        title: { label: 'Ucapan utama', hint: 'Muncul selepas semua bintang dibuka.' },
        message: { label: 'Surat di dasar balang', hint: 'Dibaca paling akhir, selepas bintang terakhir.' },
      },
      sample: {
        to: 'Zharif',
        from: 'Aleeya',
        title: 'Selamat hari jadi, sayang.',
        notes: [
          'Awak selalu tinggalkan bakso terakhir untuk saya, padahal itu yang awak tunggu.',
          'Jemput saya masa hujan, baju hujan cuma satu, awak pula yang basah kuyup.',
          'Awak hafal kopi saya: kurang manis, ais banyak, tak nak straw.',
          'Awak menyanyi sumbang atas motor, kuat-kuat, supaya saya ketawa masa sedih.',
          'Awak tunjuk buruj bintang, semuanya salah, tapi saya angguk saja.',
          'Sebab dengan awak, saya tak perlu berpura-pura jadi sesiapa.',
        ],
        message:
          'Zharif, saya bukan orang yang pandai cakap manis depan-depan. Awak sendiri tahu, setiap kali nak cakap sayang, akhirnya saya tanya awak dah makan ke belum.\n\nJadi saya tulis satu-satu, lipat jadi bintang, lalu masukkan ke dalam balang ni. Belajar lipat pun tengok tutorial tiga kali, dan bintang pertama saya penyek. Yang tu saya tak masukkan.\n\nYang awak baca tadi baru enam. Yang lain saya simpan untuk tahun depan, dan tahun depannya lagi.\n\nSelamat hari jadi, sayang. Balang ni jangan buang, ya. Banyak lagi sebab yang belum muat.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'Jar of Stars',
      tagline: 'A jar of folded paper stars. Each one opens into a reason, a wish or a thank-you, down to the letter at the bottom.',
      steps: ['Pull out the cork', 'Shake, open each star', 'The letter at the bottom'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'Inside each star: one reason or wish',
          hint: '3 to 7 stars. The last one becomes the golden star, so put the one that means the most at the bottom. Be specific: a little habit, or something they once said.',
          placeholder: 'E.g. The porch light that was always still on when I came home late.',
        },
        photos: { label: 'Photos', hint: 'Optional, up to 5. Photo 1 goes with star 1, and so on.' },
        title: { label: 'Main message', hint: 'Shows up once every star is open.' },
        message: { label: 'Letter at the bottom of the jar', hint: 'Read last, after the final star.' },
      },
      sample: {
        to: 'Elliot',
        from: 'Amelia',
        title: 'Happy birthday, love.',
        notes: [
          "You always leave me the last meatball, even though it's your favorite part.",
          'One raincoat, pouring rain, and somehow you were the one who got soaked.',
          'You know my coffee by heart: less sugar, extra ice, no straw.',
          'You sing off-key in traffic, loudly, just to make me laugh on bad days.',
          'You point out constellations, get every one wrong, and I nod anyway.',
          'Because with you, I never have to pretend to be anyone else.',
        ],
        message:
          'Elliot, I\'ve never been good at saying sweet things out loud. You know this. Every time I try to say I love you, it comes out as "have you eaten?"\n\nSo I wrote them down one by one, folded each into a star, and put them in this jar. It took three tutorials to learn the fold, and my first star came out flat. That one didn\'t make it in.\n\nYou only read six just now. I\'m saving the rest for next year, and the year after that.\n\nHappy birthday, love. Don\'t throw the jar away. There are still so many reasons that didn\'t fit.',
        photos: PHOTOS,
      },
    },
  },
};
