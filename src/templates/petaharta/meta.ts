import type { TemplateMeta } from '../types';

const PHOTOS = ['/contoh/kopi-dan-kue.webp', '/contoh/bakso-berdua.webp', '/contoh/pantai-gili.webp', '/contoh/bromo-siang.webp', '/contoh/kue-lilin.webp'];

export const meta: TemplateMeta = {
  id: 'petaharta',
  name: 'Peta Harta',
  tagline: 'Peta harta karun gambar tangan berisi tempat-tempat kalian: patahkan segelnya, ikuti titik-titiknya, gali tanda X, lalu buka petinya.',
  steps: ['Patahkan segel & buka petanya', 'Ikuti tiap titik petunjuk', 'Gali X, buka peti hartanya'],
  occasions: ['ultah', 'sahabat', 'anniv', 'nembak'],
  palette: { bg: '#e9d6ac', ink: '#3a2a18', accent: '#c2412d' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Petunjuk di tiap titik peta',
      hint: 'Satu kalimat per titik, 3 sampai 5. Perahu kertasnya berlayar ke tiap titik, dan petunjuknya muncul sebagai sobekan kertas yang ditusuk paku.',
      min: 3,
      count: 5,
      max: 70,
      placeholder: 'Satu tempat atau kenangan kalian',
    },
    {
      key: 'photos',
      label: 'Foto di tiap titik',
      hint: 'Opsional. Foto pertama ikut tertempel di petunjuk pertama, dan seterusnya.',
      count: 5,
      // tiap foto sudah berpasangan dengan petunjuknya sendiri
      captions: false,
    },
    { key: 'title', label: 'Isi peti harta: ucapan utama', hint: 'Muncul bercahaya waktu peti hartanya terbuka.', max: 40 },
    { key: 'message', label: 'Surat di dalam peti', hint: 'Gulungan surat di dalam peti, dibaca paling akhir.', max: 900, multiline: true },
  ],
  sample: {
    to: 'Putri',
    from: 'Juna',
    title: 'Selamat ulang tahun, pacar nyasarku!',
    notes: [
      'Warung kopi kencan pertama. Kamu pesan teh, terus nyicip kopiku.',
      'Bakso tempat aku nembak. Kamu jawab "iya" sambil ngunyah.',
      'Pantai itu. Nyasar dua jam, terus nonton senja berdua.',
      'Gunung tempat kamu ngambek di tanjakan, lalu minta gandeng di puncak.',
      'Tahun ini: kue, lilin, dan aku. Koreknya sudah kubawa, sumpah.',
    ],
    message:
      'Selamat ulang tahun, Putri!\n\nKata orang, harta karun itu dikubur jauh-jauh dan dijaga ular laut. Punyaku nggak sejauh itu. Dia ada di warung kopi, di mangkuk bakso tempat kamu bilang "iya" sambil ngunyah, di jalan nyasar yang selalu kamu bilang jalan pintas.\n\nMakasih sudah mau jadi pacar paling sabar sedunia, yang tetap ketawa walau aku salah belok untuk kesekian kalinya. Tahun ini aku janji bawa peta yang benar (dan korek api).\n\nHartaku sudah ketemu dari dulu. Sekarang giliran semua yang kamu cari tahun ini, satu titik demi satu titik. Aku temenin.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Peta Harta',
      tagline: 'Peta harta karun lukisan tangan berisi tempat-tempat kalian: patahkan mohor, ikut titik-titiknya, gali tanda X, kemudian buka petinya.',
      steps: ['Patahkan mohor & buka peta', 'Ikut setiap titik petunjuk', 'Gali X, buka peti harta'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Petunjuk di setiap titik peta',
          hint: 'Satu ayat untuk setiap titik, 3 hingga 5. Perahu kertas belayar ke setiap titik, dan petunjuknya muncul sebagai cebisan kertas yang dipaku.',
          placeholder: 'Satu tempat atau kenangan kalian',
        },
        photos: { label: 'Foto di setiap titik', hint: 'Pilihan. Foto pertama ditampal pada petunjuk pertama, dan seterusnya.' },
        title: { label: 'Isi peti harta: ucapan utama', hint: 'Muncul bercahaya ketika peti harta dibuka.' },
        message: { label: 'Surat di dalam peti', hint: 'Gulungan surat di dalam peti, dibaca paling akhir.' },
      },
      sample: {
        to: 'Sufi',
        from: 'Syafiq',
        title: 'Selamat hari jadi, buah hatiku!',
        notes: [
          'Kedai kopi janji temu pertama. Awak pesan teh, tapi curi kopi saya.',
          'Bakso tempat saya luah perasaan. Awak kata "ya" sambil mengunyah.',
          'Pantai tu. Sesat dua jam, lepas tu tengok senja berdua.',
          'Gunung yang buat awak merajuk di tanjakan, tapi senyum di puncak.',
          'Tahun ini: kek, lilin, dan saya. Mancis dah ada, sumpah.',
        ],
        message:
          'Selamat hari jadi, Sufi!\n\nKata orang, harta karun ditanam jauh-jauh dan dijaga ular laut. Harta saya tak sejauh itu. Ia ada di kedai kopi, di mangkuk bakso tempat awak kata "ya" sambil mengunyah, di jalan sesat yang awak selalu kata jalan pintas.\n\nTerima kasih sebab sudi jadi buah hati paling sabar di dunia, yang tetap ketawa walaupun saya salah simpang entah kali ke berapa. Tahun ini saya janji bawa peta yang betul (dan mancis).\n\nHarta saya dah lama jumpa. Sekarang giliran semua yang awak cari tahun ini, satu titik demi satu titik. Saya temankan.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'Treasure Map',
      tagline: 'A hand-drawn treasure map of your places: break the seal, follow the dotted line, dig up the X, and open the chest.',
      steps: ['Break the seal, unroll the map', 'Follow every clue', 'Dig up the X, open the chest'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'A clue at every stop',
          hint: 'One line per stop, 3 to 5. A paper boat sails to each stop, and the clue pops up as a scrap of paper pinned to the map.',
          placeholder: 'One of your places or memories',
        },
        photos: { label: 'A photo at every stop', hint: 'Optional. The first photo is pinned to the first clue, and so on.' },
        title: { label: 'In the chest: the main wish', hint: 'Glows up when the treasure chest opens.' },
        message: { label: 'The letter in the chest', hint: 'A rolled-up letter inside the chest, read last.' },
      },
      sample: {
        to: 'Maddie',
        from: 'Felix',
        title: 'Happy birthday, my treasure!',
        notes: [
          'Our first-date coffee shop. You ordered tea, then stole my coffee.',
          'The noodle place where I asked you out. You said yes mid-slurp.',
          'That beach. Two hours lost, one sunset, your head on my shoulder.',
          'The mountain you sulked up, then held my hand at the top.',
          'This year: cake, candles, and me. I brought the lighter. I swear.',
        ],
        message:
          'Happy birthday, Maddie!\n\nThey say treasure is buried far away and guarded by sea serpents. Mine is a lot closer: it is in a coffee shop, in the bowl of noodles you said yes over, on every wrong turn you swore was a shortcut.\n\nThank you for being the most patient girlfriend in the world, the one who still laughs when I miss the exit for the hundredth time. This year I promise to bring the right map (and a lighter).\n\nI found my treasure a while ago. Now it is your turn to find everything you are looking for this year, one stop at a time. I will be right next to you.',
        photos: PHOTOS,
      },
    },
  },
};
