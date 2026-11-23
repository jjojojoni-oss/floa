import type { TemplateMeta } from '../types';

const PHOTOS = ['/contoh/peron-stasiun.webp', '/contoh/meja-belajar.webp', '/contoh/perpustakaan.webp', '/contoh/kopi-hitam.webp', '/contoh/topi-wisuda.webp'];

export const meta: TemplateMeta = {
  id: 'toga',
  name: 'Lempar Toga',
  tagline: 'Jalan lagi dari hari pertama kuliah sampai toganya dilempar, lalu buka gulungan ucapannya.',
  steps: ['Telusuri perjalanannya', 'Lempar toga', 'Buka gulungan'],
  occasions: ['wisuda'],
  palette: { bg: '#18265a', ink: '#fdf6e3', accent: '#f2c14e' },
  fields: [
    { key: 'to', label: 'Yang wisuda', hint: 'Boleh pakai gelarnya.', placeholder: 'Nama dia', max: 24 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 24 },
    {
      key: 'notes',
      label: 'Perjalananmu',
      hint: 'Satu momen per langkah, urut dari awal kuliah sampai sidang. Makin spesifik makin menyentuh: tempat, kebiasaan, atau kalimat yang pernah dia ucapkan.',
      min: 3,
      count: 5,
      max: 90,
      placeholder: 'Mis. Malam sebelum sidang, kamu latihan presentasi di depan cermin.',
    },
    { key: 'photos', label: 'Foto', hint: 'Opsional, sampai 5 foto. Urut sesuai langkahnya.', count: 5 },
    { key: 'title', label: 'Ucapan utama', max: 40 },
    { key: 'message', label: 'Isi gulungan', max: 900, multiline: true },
  ],
  sample: {
    to: 'Fajar, S.Kom.',
    from: 'Ayah & Ibu',
    title: 'Selamat wisuda, Nak!',
    notes: [
      'Hari pertama ospek, kamu pamit subuh-subuh pakai kemeja yang kebesaran.',
      'Semester tiga, lampu kamarmu masih nyala waktu azan subuh.',
      "Waktu nilaimu jatuh, kamu cuma bilang, 'Nggak apa-apa, Bu. Aku ulang.'",
      'Revisi skripsi ke-7. Kamu diam seharian, lalu mulai lagi dari bab satu.',
      'Sidang selesai. Telepon pertamamu ke rumah, suaramu gemetar.',
    ],
    message:
      'Nak, tadi kita jalan pelan-pelan dari hari pertamamu sampai hari ini. Dulu kemejamu kebesaran, sekarang toganya pas sekali.\n\nKami nggak selalu ada di setiap malam begadangmu, tapi kami tahu lampu kamarmu masih nyala. Doa kami juga.\n\nTerima kasih sudah bertahan, bahkan di hari-hari kamu ingin berhenti. Ke mana pun kamu melangkah setelah ini, pintu rumah selalu terbuka, dan kami akan selalu jadi orang pertama yang bangga.',
    photos: PHOTOS,
    captions: ['Subuh di stasiun. Kemejanya masih kebesaran.', 'Meja yang lampunya jarang padam.', 'Perpustakaan, tempat kamu mulai lagi dari awal.', 'Kopi ketiga malam itu. Bab satu lagi.', 'Akhirnya, toganya pas.'],
  },
  i18n: {
    ms: {
      name: 'Lambung Topi',
      tagline: 'Telusuri semula perjalanannya dari hari pertama kuliah sampai topi dilambung, kemudian buka gulungan ucapannya.',
      steps: ['Telusuri perjalanan', 'Lambung topi', 'Buka gulungan'],
      fields: {
        to: { label: 'Graduan', hint: 'Boleh letak gelarannya.', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Perjalanannya',
          hint: 'Satu detik untuk setiap langkah, ikut urutan dari awal kuliah sampai viva. Lebih spesifik lebih menyentuh: tempat, kebiasaan, atau ayat yang pernah dia ucapkan.',
          placeholder: 'Cth. Malam sebelum viva, kamu berlatih depan cermin.',
        },
        photos: { label: 'Gambar', hint: 'Pilihan, sehingga 5 gambar. Ikut urutan langkah.' },
        title: { label: 'Ucapan utama' },
        message: { label: 'Isi gulungan' },
      },
      sample: {
        to: 'Haziq Danial',
        from: 'Abah & Mak',
        title: 'Tahniah, Along!',
        notes: [
          'Hari pertama minggu suai kenal, Along keluar awal pagi pakai kemeja yang kebesaran.',
          'Semester tiga, lampu bilik Along masih menyala waktu azan Subuh.',
          "Masa keputusan jatuh, Along cuma cakap, 'Tak apa, Mak. Along ulang.'",
          'Pembetulan tesis kali ketujuh. Along diam sehari, kemudian mula semula dari bab satu.',
          'Habis viva, panggilan pertama Along ke rumah, suara Along bergetar.',
        ],
        message:
          'Along, tadi kita berjalan perlahan dari hari pertama Along sampai hari ini. Dulu kemeja Along kebesaran, sekarang jubah konvo itu muat sangat.\n\nKami tak selalu ada setiap malam Along berjaga, tapi kami tahu lampu bilik Along masih menyala. Doa kami pun begitu.\n\nTerima kasih sebab bertahan, walaupun pada hari-hari Along rasa nak berhenti. Ke mana pun Along melangkah lepas ni, pintu rumah sentiasa terbuka, dan kami akan sentiasa jadi orang pertama yang bangga.',
        photos: PHOTOS,
        captions: ['Subuh di stesen. Kemejanya masih longgar.', 'Meja yang lampunya jarang padam.', 'Perpustakaan, tempat Along mula semula.', 'Kopi ketiga malam tu. Bab satu lagi.', 'Akhirnya, topi tu sampai juga.'],
      },
    },
    en: {
      name: 'Cap Toss',
      tagline: 'Walk back through their journey, from day one to the cap toss, then unroll a scroll full of love.',
      steps: ['Walk the journey', 'Toss the cap', 'Open the scroll'],
      fields: {
        to: { label: 'The graduate', hint: 'Feel free to add their degree.', placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'Their journey',
          hint: 'One moment per step, in order from the first day to the final defense. The more specific, the more it lands: a place, a habit, something they once said.',
          placeholder: 'E.g. The night before your defense, you rehearsed in front of the mirror.',
        },
        photos: { label: 'Photos', hint: 'Optional, up to 5 photos. Same order as the steps.' },
        title: { label: 'Main greeting' },
        message: { label: 'Scroll message' },
      },
      sample: {
        to: 'Daniel, B.Sc.',
        from: 'Mom & Dad',
        title: 'Congrats, graduate!',
        notes: [
          'Orientation day, you left at dawn in a shirt two sizes too big.',
          'Junior year, your bedroom light was still on at sunrise.',
          "When your grades slipped, you just said, 'It's okay, Mom. I'll retake it.'",
          'Thesis draft number seven. You went quiet for a day, then started again from chapter one.',
          'Defense done. Your first call was home, and your voice was shaking.',
        ],
        message:
          "Sweetheart, we just walked the whole road again, from your first day to this one. Back then your shirt was too big. Today the gown fits perfectly.\n\nWe weren't there for every late night, but we always knew your light was still on. So were our prayers.\n\nThank you for holding on, even on the days you wanted to stop. Wherever you go from here, the door at home is always open, and we'll always be the first ones to be proud of you.",
        photos: PHOTOS,
        captions: ['Dawn at the station. The shirt still too big.', 'The desk whose lamp rarely went off.', 'The library, where you started over.', 'Third coffee that night. Chapter one, again.', 'Finally, the cap fits.'],
      },
    },
  },
};
