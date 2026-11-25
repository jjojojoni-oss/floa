import type { TemplateMeta } from '../types';

const PHOTOS = ['/contoh/perpustakaan.webp', '/contoh/meja-belajar.webp', '/contoh/peron-stasiun.webp', '/contoh/kopi-hitam.webp', '/contoh/topi-wisuda.webp'];

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
    to: 'Anindya, S.Psi.',
    from: 'Gibran',
    title: 'Selamat wisuda, Sayang!',
    notes: [
      'Semester satu, perpustakaan pusat. Kamu numpang colokan, aku numpang kenalan.',
      'Statistik bikin kamu nangis. Aku nggak paham statistik, jadi aku bawain martabak.',
      'KKN dua bulan tanpa sinyal. Tiap jam sembilan malam, kamu naik bukit cuma buat neleponku.',
      'Revisi bab empat yang ketujuh. Kamu diam seharian, lalu buka laptop lagi.',
      'Sidang selesai. Kamu keluar ruangan dan nyari aku dulu, baru nelepon Mama.',
    ],
    message:
      'Nin, tadi kita jalan lagi dari colokan perpustakaan itu sampai hari ini. Empat tahun, satu skripsi, dan martabak yang udah nggak kehitung.\n\nAku nggak selalu bisa bantu. Aku nggak ngerti statistik, nggak bisa ngerapiin daftar pustaka, dan pernah salah nyebut judul skripsimu di depan teman-temanmu. Tapi aku selalu bisa nunggu. Di luar perpustakaan, di luar ruang sidang, di ujung telepon jam sembilan malam.\n\nHari ini kamu keluar pakai toga, dan aku bangga sampai bingung naruh bangganya di mana.\n\nHabis ini, ke mana pun kamu melangkah, aku tetap nunggu di luar pintunya. Bawa martabak. Selamat wisuda, Sayang.',
    photos: PHOTOS,
    captions: ['Colokan dekat rak psikologi. Tempat semuanya mulai.', 'Meja penuh rumus. Martabaknya habis duluan.', 'Stasiun, hari kamu berangkat KKN. Aku pura-pura nggak sedih.', 'Kopi ketiga di kafe langganan. Bab empat lagi.', 'Akhirnya, toganya kamu pakai.'],
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
        to: 'Nur Batrisya',
        from: 'Amirul',
        title: 'Tahniah, sayang. Awak dah berjaya!',
        notes: [
          'Semester satu, perpustakaan utama. Awak tumpang plag, saya tumpang berkenalan.',
          'Statistik buat awak menangis. Saya tak faham statistik, jadi saya bawakan roti john.',
          'LI di pedalaman, tiada line. Pukul sembilan malam, awak panjat bukit untuk call saya.',
          'Pembetulan bab empat kali ketujuh. Awak diam sehari, kemudian buka laptop semula.',
          'Habis viva, awak keluar bilik dan cari saya dulu, baru telefon Mak.',
        ],
        message:
          'Batrisya, tadi kita berjalan semula dari plag di perpustakaan tu sampai hari ini. Empat tahun, satu tesis, dan roti john yang dah tak terkira.\n\nSaya tak selalu boleh tolong. Saya tak faham statistik, tak reti susun rujukan, dan pernah tersalah sebut tajuk tesis awak depan kawan-kawan awak. Tapi saya selalu boleh tunggu. Di luar perpustakaan, di luar bilik viva, di hujung talian pukul sembilan malam.\n\nHari ini awak keluar dengan jubah konvo, dan saya bangga sampai tak tahu nak letak bangga tu di mana.\n\nLepas ni, ke mana pun awak melangkah, saya tetap tunggu di luar pintunya. Bawa roti john. Tahniah, sayang.',
        photos: PHOTOS,
        captions: ['Plag dekat rak psikologi. Tempat semuanya bermula.', 'Meja penuh formula. Roti john habis dulu.', 'Stesen, hari awak bertolak untuk latihan industri. Saya buat-buat tak sedih.', 'Kopi ketiga di kafe biasa. Bab empat lagi.', 'Akhirnya, topi tu sampai juga.'],
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
        to: 'Freya, B.A.',
        from: 'Josh',
        title: 'Congrats, my favorite graduate!',
        notes: [
          'Freshman year, the main library. You needed an outlet. I needed an excuse to say hi.',
          "Statistics made you cry. I don't understand statistics either, so I brought pizza.",
          'Your field placement had zero signal. Every night at nine, you climbed a hill to call me.',
          'Chapter four, draft seven. You went quiet for a day, then opened the laptop again.',
          'Defense done. You walked out and looked for me first, then called your mom.',
        ],
        message:
          "Freya, we just walked the whole road again, from that library outlet to today. Four years, one thesis, and more pizza than either of us will admit.\n\nI couldn't always help. I don't understand statistics, I can't format a bibliography, and I once got your thesis title wrong in front of your friends. But I could always wait. Outside the library, outside the defense room, on the other end of a 9 p.m. phone call.\n\nToday you walked out in a gown, and I'm so proud I don't know where to put it all.\n\nWherever you go from here, I'll be waiting outside that door too. With pizza. Congratulations, love.",
        photos: PHOTOS,
        captions: ['The outlet by the psychology shelves. Where it all started.', 'A desk full of formulas. The pizza went first.', 'The station, the day you left for your placement. I pretended I was fine.', 'Third coffee at our usual café. Chapter four, again.', 'Finally, the cap fits.'],
      },
    },
  },
};
