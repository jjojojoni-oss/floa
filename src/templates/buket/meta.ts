import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'buket',
  name: 'Buket Mekar',
  tagline: 'Kuncup yang malu-malu mekar satu per satu, tiap bunga menyimpan satu cerita kecil darimu.',
  steps: ['Ikuti kupu-kupunya', 'Tarik gulungan di kelopak', 'Ikat pita, ambil kartunya'],
  occasions: ['anniv', 'ultah', 'ortu', 'maaf'],
  palette: { bg: '#fbe6d3', ink: '#43261f', accent: '#e0496a' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Cerita di tiap bunga',
      hint: 'Satu cerita kecil per bunga, 3 sampai 5. Yang paling berkesan taruh paling bawah: itu bunga terakhir yang paling malu mekar. Tulis yang spesifik: tempat, kebiasaan, kalimat yang pernah dia ucapkan.',
      min: 3,
      count: 5,
      max: 120,
      placeholder: 'Mis. Waktu hujan di halte itu, kamu kasih jaketmu padahal kamu sendiri kedinginan.',
    },
    { key: 'title', label: 'Ucapan utama', hint: 'Muncul saat pita buketnya diikat.', max: 40 },
    { key: 'message', label: 'Surat', hint: 'Kartu yang terselip di antara bunganya.', max: 900, multiline: true },
    { key: 'photos', label: 'Foto', hint: 'Opsional, sampai 5. Foto ke-1 ikut di cerita bunga ke-1, dan seterusnya.', count: 5 },
  ],
  sample: {
    to: 'Laras',
    from: 'Dimas',
    title: 'Selamat dua tahun, sayang.',
    notes: [
      'Senja pertama kita di pantai. Kamu lupa bawa jaket, tapi tetap nggak mau pulang sampai mataharinya habis.',
      'Tiap pesan kopi, kamu selalu ingat punyaku: gula sedikit, susunya banyak. Aku sendiri sering lupa.',
      'Waktu aku telat satu jam, kamu cuma bilang, "yang penting sampai." Aku masih malu sampai sekarang.',
      'Kamu selalu bisa bikin hari Senin terasa kayak hari Sabtu. Itu bakat, dan cuma kamu yang punya.',
      'Dari semua tempat yang pernah kita datangi, yang paling aku suka tetap sama: di sebelahmu.',
    ],
    message:
      'Aku nggak jago merangkai kata, apalagi merangkai bunga. Jadi aku titip semuanya di sini, satu cerita di tiap kelopaknya.\n\nMakasih sudah bertahan, sudah mau diajak makan di tempat yang itu-itu aja, dan sudah jadi orang pertama yang aku cari tiap ada kabar baik.\n\nSemoga buket ini nggak pernah layu. Sama kayak kita.',
    photos: ['/contoh/senja-pantai.webp', '/contoh/dua-cangkir.webp', '/contoh/jakarta-malam.webp', '/contoh/piknik.webp', '/contoh/gandengan.webp'],
    captions: ['Sore pertama kita. Jaketku jadi punyamu.', 'Dua cangkir, kamu yang pesan dua-duanya.', 'Macet, hujan, dan aku telat sejam. Maaf, ya.', 'Piknik dadakan, padahal besoknya Senin.', 'Tempat favoritku.'],
  },
  i18n: {
    ms: {
      name: 'Jambangan Mekar',
      tagline: 'Kudup yang malu-malu mekar satu per satu, setiap bunga simpan satu cerita kecil daripada awak.',
      steps: ['Ikut rama-ramanya', 'Tarik gulungan dalam kelopak', 'Ikat reben, ambil kadnya'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Cerita dalam setiap bunga',
          hint: 'Satu cerita kecil untuk setiap bunga, 3 hingga 5. Yang paling bermakna letak paling bawah: itulah bunga terakhir yang paling pemalu. Tulis yang spesifik: tempat, kebiasaan, ayat yang pernah dia ucapkan.',
          placeholder: 'Cth. Masa hujan kat perhentian bas tu, awak bagi jaket awak padahal awak sendiri kesejukan.',
        },
        title: { label: 'Ucapan utama', hint: 'Muncul bila reben jambangan diikat.' },
        message: { label: 'Surat', hint: 'Kad yang terselit di celah bunga.' },
        photos: { label: 'Foto', hint: 'Pilihan, sehingga 5. Foto pertama ikut cerita bunga pertama, dan seterusnya.' },
      },
      sample: {
        to: 'Aisyah',
        from: 'Hafiz',
        title: 'Dah dua tahun kita, sayang.',
        notes: [
          'Senja pertama kita kat Port Dickson. Awak lupa bawa jaket, tapi tetap tak nak balik selagi matahari belum hilang.',
          'Setiap kali order kopi, awak selalu ingat saya punya: kurang manis, susu lebih. Saya sendiri pun selalu lupa.',
          'Masa saya lambat sejam, awak cuma cakap, "yang penting sampai." Sampai sekarang saya masih malu.',
          'Awak selalu boleh buat hari Isnin rasa macam hari Sabtu. Itu bakat, dan hanya awak yang ada.',
          'Daripada semua tempat yang pernah kita pergi, yang paling saya suka tetap sama: di sebelah awak.',
        ],
        message:
          'Saya tak pandai menyusun kata, apatah lagi menggubah bunga. Jadi saya titipkan semuanya di sini, satu cerita dalam setiap kelopak.\n\nTerima kasih sebab sudi bertahan, sudi diajak makan kat kedai yang sama setiap kali, dan jadi orang pertama yang saya cari setiap kali ada berita gembira.\n\nHarap jambangan ni tak pernah layu. Macam kita.',
        photos: ['/contoh/senja-pantai.webp', '/contoh/dua-cangkir.webp', '/contoh/jakarta-malam.webp', '/contoh/piknik.webp', '/contoh/gandengan.webp'],
        captions: ['Senja pertama kita. Jaket saya jadi awak punya.', 'Dua cawan, awak yang order dua-dua.', 'Jalan sesak, dan saya lambat sejam. Maaf, ya.', 'Berkelah mengejut, padahal esoknya Isnin.', 'Tempat kegemaran saya.'],
      },
    },
    en: {
      name: 'Blooming Bouquet',
      tagline: 'Shy little buds that bloom one by one, each one keeping a small story from you.',
      steps: ['Follow the butterfly', 'Pull the scroll from the petals', 'Tie the ribbon, take the card'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'A story in each flower',
          hint: 'One small story per flower, 3 to 5. Put the one that means the most last: that is the shyest bud, the final one to bloom. Be specific: a place, a habit, something they once said.',
          placeholder: 'E.g. That rainy night at the bus stop, you gave me your jacket even though you were freezing too.',
        },
        title: { label: 'Main message', hint: 'Shows up when the ribbon is tied.' },
        message: { label: 'Letter', hint: 'The card tucked among the flowers.' },
        photos: { label: 'Photos', hint: 'Optional, up to 5. Photo 1 goes with flower 1, and so on.' },
      },
      sample: {
        to: 'Emma',
        from: 'Jack',
        title: 'Happy two years, love.',
        notes: [
          'Our first sunset at the beach. You forgot your jacket but refused to leave until the sun was completely gone.',
          'Every coffee run, you remember mine: less sugar, extra milk. I forget it myself half the time.',
          'When I showed up an hour late, you just said, "you made it, that’s what counts." I’m still embarrassed.',
          'You can make a Monday feel like a Saturday. That’s a talent, and only you have it.',
          'Of all the places we’ve been, my favorite is still the same one: right next to you.',
        ],
        message:
          "I'm not great with words, and even worse with flowers. So I'm leaving it all here, one story in every petal.\n\nThank you for sticking around, for never minding when we end up at the same old place, and for being the first person I look for whenever there's good news.\n\nI hope this bouquet never wilts. Just like us.",
        photos: ['/contoh/senja-pantai.webp', '/contoh/dua-cangkir.webp', '/contoh/jakarta-malam.webp', '/contoh/piknik.webp', '/contoh/gandengan.webp'],
        captions: ['Our first sunset. My jacket became yours.', 'Two cups. You ordered both.', 'Traffic, rain, and me an hour late. Sorry.', 'A last-minute picnic. Monday could wait.', 'My favorite place.'],
      },
    },
  },
};
