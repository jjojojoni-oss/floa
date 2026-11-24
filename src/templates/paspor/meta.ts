import type { TemplateMeta } from '../types';

/** foto ke-i dijepit di halaman cap ke-i; foto ke-1 juga jadi pas foto di halaman identitas */
const PHOTOS = ['/contoh/gandengan.webp', '/contoh/peron-stasiun.webp', '/contoh/jendela-pesawat.webp', '/contoh/jalan-hujan-malam.webp'];

export const meta: TemplateMeta = {
  id: 'paspor',
  name: 'Paspor Berdua',
  tagline: 'Paspor rekaan milik berdua: halaman identitas, cap di tiap tempat kalian bertemu, dan boarding pass menuju dia.',
  steps: ['Buka paspornya', 'Cap tiap halaman', 'Sobek boarding pass'],
  occasions: ['kangen', 'anniv', 'sahabat'],
  palette: { bg: '#e9dcc3', ink: '#2c2118', accent: '#8c2a2f' },
  fields: [
    { key: 'to', label: 'Untuk siapa', hint: 'Jadi nama pemegang paspornya.', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    { key: 'date', label: 'Tanggal mulai perjalanan', hint: 'Opsional. Tercetak sebagai tanggal terbit paspor, mis. tanggal jadian atau hari pertama LDR.' },
    {
      key: 'notes',
      label: 'Cap di tiap halaman',
      hint: 'Satu tempat atau momen per cap, 3 sampai 5. Yang terakhir jadi cap emas paling spesial.',
      min: 3,
      count: 5,
      max: 60,
      placeholder: 'Mis. Stasiun Tugu. Hujan-hujanan nunggu kereta kamu.',
    },
    {
      key: 'photos',
      label: 'Foto',
      hint: 'Opsional, sampai 5. Foto ke-1 dijepit di halaman cap ke-1, dan seterusnya. Foto ke-1 juga jadi pas foto di halaman identitas.',
      count: 5,
      // tiap foto sudah berpasangan dengan capnya sendiri
      captions: false,
    },
    { key: 'title', label: 'Tujuan / ucapan utama', hint: 'Tertulis sebagai tujuan di boarding pass, dan jadi judul suratnya.', max: 40 },
    { key: 'message', label: 'Surat di balik boarding pass', hint: 'Dibaca paling akhir, setelah tiketnya disobek.', max: 900, multiline: true },
  ],
  sample: {
    to: 'Wulan',
    from: 'Yudha',
    date: '2025-01-11',
    title: 'Tujuan berikutnya: kamu.',
    notes: [
      'Taman kota, sehari sebelum LDR. Tangan nggak mau lepas.',
      'Peron 3. Kamu nganter, aku pura-pura nggak nangis.',
      'Kursi 23A. Lihat awan, kepikirannya tetap kamu.',
      'Kotamu, jam 11 malam. Hujan, bakso, dan akhirnya kita.',
    ],
    message:
      'Paspor ini nggak laku di imigrasi mana pun. Tapi tiap capnya asli: semua tempat yang pernah kita datangi cuma buat ketemu.\n\nJarak kita masih ratusan kilometer, dan sinyal masih suka putus pas lagi seru-serunya. Tapi tiap aku buka halaman-halaman ini, rasanya kamu dekat lagi.\n\nMasih banyak halaman kosong di belakang. Simpan paspornya, ya. Cap berikutnya kita isi bareng.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Pasport Berdua',
      tagline: 'Pasport rekaan milik berdua: halaman pengenalan, cop di setiap tempat kamu berdua bertemu, dan pas masuk menuju dia.',
      steps: ['Buka pasportnya', 'Cop setiap halaman', 'Koyak pas masuk'],
      fields: {
        to: { label: 'Untuk siapa', hint: 'Jadi nama pemegang pasport.', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        date: { label: 'Tarikh mula perjalanan', hint: 'Pilihan. Dicetak sebagai tarikh pasport dikeluarkan, cth. tarikh mula bersama atau hari pertama PJJ.' },
        notes: {
          label: 'Cop di setiap halaman',
          hint: 'Satu tempat atau detik untuk setiap cop, 3 hingga 5. Yang terakhir jadi cop emas paling istimewa.',
          placeholder: 'Cth. KL Sentral. Tunggu tren awak dalam hujan.',
        },
        photos: { label: 'Foto', hint: 'Pilihan, sehingga 5. Foto pertama diklip pada halaman cop pertama, dan seterusnya. Foto pertama juga jadi gambar pasport di halaman pengenalan.' },
        title: { label: 'Destinasi / ucapan utama', hint: 'Tertulis sebagai destinasi pada pas masuk, dan jadi tajuk suratnya.' },
        message: { label: 'Surat di belakang pas masuk', hint: 'Dibaca paling akhir, selepas tiketnya dikoyak.' },
      },
      sample: {
        to: 'Zara',
        from: 'Faris',
        date: '2025-01-11',
        title: 'Destinasi seterusnya: awak.',
        notes: [
          'Taman bandar, sehari sebelum PJJ. Tangan tak nak lepas.',
          'Platform 3. Awak hantar, saya pura-pura tak menangis.',
          'Tempat duduk 23A. Tengok awan, tetap teringat awak.',
          'Bandar awak, 11 malam. Hujan, bakso, dan akhirnya kita.',
        ],
        message:
          'Pasport ni tak laku di mana-mana imigresen. Tapi setiap copnya asli: semua tempat yang kita pernah pergi semata-mata untuk berjumpa.\n\nJarak kita masih beratus kilometer, dan talian masih suka putus masa tengah seronok. Tapi setiap kali saya buka halaman-halaman ni, rasa awak dekat semula.\n\nMasih banyak halaman kosong di belakang. Simpan pasport ni, ya. Cop seterusnya kita isi sama-sama.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'Passport for Two',
      tagline: 'A make-believe passport for the two of you: an identity page, a stamp for every place you met, and a boarding pass back to them.',
      steps: ['Open the passport', 'Stamp every page', 'Tear the boarding pass'],
      fields: {
        to: { label: "Who it's for", hint: 'They become the passport holder.', placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        date: { label: 'The day the journey began', hint: 'Optional. Printed as the date of issue, e.g. your anniversary or the first day of long distance.' },
        notes: {
          label: 'A stamp for every page',
          hint: 'One place or moment per stamp, 3 to 5. The last one becomes the special gold stamp.',
          placeholder: 'E.g. Platform 9. Waiting for your train in the rain.',
        },
        photos: { label: 'Photos', hint: 'Optional, up to 5. Photo 1 is clipped to stamp page 1, and so on. Photo 1 is also the passport photo on the identity page.' },
        title: { label: 'Destination / main message', hint: 'Printed as the destination on the boarding pass, and used as the title of the letter.' },
        message: { label: 'The letter behind the boarding pass', hint: 'Read last, once the ticket is torn.' },
      },
      sample: {
        to: 'Hazel',
        from: 'Miles',
        date: '2025-01-11',
        title: 'Next destination: you.',
        notes: [
          'The park, the day before I left. Neither of us let go.',
          'Platform 3. You waved. I pretended not to cry.',
          'Seat 23A. Staring at clouds, still thinking of you.',
          'Your city, 11 p.m. Rain, noodles, and finally us.',
        ],
        message:
          "No border officer will ever accept this passport. But every stamp in it is real: every place we have ever gone just to see each other.\n\nThere are still hundreds of miles between us, and the signal still drops right at the good part. But every time I open these pages, you feel close again.\n\nThere are plenty of blank pages left at the back. Keep this passport safe. We will fill in the next stamp together.",
        photos: PHOTOS,
      },
    },
  },
};
