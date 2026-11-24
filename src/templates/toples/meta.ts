import type { TemplateMeta } from '../types';

/** foto ke-i ikut bintang ke-i: bekal, motor di jalan, masak, melati, jalan pulang malam; bintang emas tanpa foto */
const PHOTOS = ['/contoh/nasi-kotak.webp', '/contoh/kota-tua.webp', '/contoh/masak-tungku.webp', '/contoh/melati.webp', '/contoh/jalan-hujan-malam.webp'];

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
    to: 'Ibu',
    from: 'Sekar',
    title: 'Selamat ulang tahun, Bu.',
    notes: [
      'Bekal jam 5 pagi, padahal Ibu sendiri belum sarapan.',
      'Ibu hafal suara motorku dari ujung gang.',
      'Sayur asem Ibu. Resepnya "kira-kira aja", tapi nggak ada yang bisa nyamain.',
      'Melati di teras yang Ibu siram tiap sore, sambil nanya aku udah makan belum.',
      'Tiap aku pulang telat, lampu teras selalu masih nyala.',
      'Dari semua tempat pulang, yang paling aku cari tetap Ibu.',
    ],
    message:
      'Bu, aku nggak pernah pintar bilang makasih langsung. Jadi aku tulis satu-satu, aku lipat jadi bintang, lalu aku masukkan ke toples ini.\n\nYang Ibu baca tadi baru enam. Sisanya masih banyak: yang aku ingat, yang aku lupa, dan yang baru aku sadari setelah jauh dari rumah.\n\nSelamat ulang tahun, Bu. Sehat terus, ya. Toplesnya jangan dibuang, nanti aku isi lagi tiap pulang.',
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
        to: 'Mak',
        from: 'Hanis',
        title: 'Selamat hari jadi, Mak.',
        notes: [
          'Bekal pukul 5 pagi, padahal Mak sendiri belum sarapan.',
          'Mak kenal bunyi motor saya dari hujung lorong.',
          'Asam pedas Mak. Resipinya "agak-agak je", tapi tak ada siapa boleh lawan.',
          'Melur di beranda yang Mak siram tiap petang, sambil tanya saya dah makan belum.',
          'Setiap kali saya balik lewat, lampu beranda mesti masih menyala.',
          'Daripada semua tempat untuk pulang, yang paling saya cari tetap Mak.',
        ],
        message:
          'Mak, saya memang tak pandai nak ucap terima kasih depan-depan. Jadi saya tulis satu-satu, lipat jadi bintang, lalu masukkan ke dalam balang ni.\n\nYang Mak baca tadi baru enam. Yang lain masih banyak: yang saya ingat, yang saya lupa, dan yang baru saya sedar selepas jauh dari rumah.\n\nSelamat hari jadi, Mak. Sihat selalu, ya. Balang ni jangan dibuang, nanti saya isi lagi setiap kali balik.',
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
        to: 'Mom',
        from: 'Ella',
        title: 'Happy birthday, Mom.',
        notes: [
          'Packed lunch at 5 a.m., before you had even had breakfast yourself.',
          'You know the sound of my car from the end of the street.',
          'Your soup. The recipe is "just eyeball it", and nobody else gets it right.',
          'The jasmine on the porch you water every evening, asking if I have eaten.',
          'Every time I came home late, the porch light was still on.',
          'Of all the places to come home to, the one I look for is still you.',
        ],
        message:
          "Mom, I have never been good at saying thank you out loud. So I wrote them down one by one, folded each into a star, and put them in this jar.\n\nYou only read six just now. There are so many more: the ones I remember, the ones I forgot, and the ones I only noticed after I moved away.\n\nHappy birthday, Mom. Stay healthy, okay? Don't throw the jar away. I'll refill it every time I come home.",
        photos: PHOTOS,
      },
    },
  },
};
