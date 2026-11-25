import type { TemplateMeta } from '../types';

/** Urutan foto contoh mengikuti ceritanya; foto terakhir jadi "yang paling spesial". */
const PHOTOS = ['/contoh/sate-pinggir-jalan.webp', '/contoh/dua-cangkir.webp', '/contoh/kota-tua.webp', '/contoh/pantai-pasir.webp', '/contoh/bromo-senja.webp', '/contoh/gandengan.webp'];

export const meta: TemplateMeta = {
  id: 'polaroid',
  name: 'Setumpuk Kenangan',
  tagline: 'Setumpuk foto diikat karet gelang. Dibalik satu-satu untuk membaca ceritanya, sampai surat di paling bawah.',
  steps: ['Lepas karetnya', 'Balik tiap foto', 'Surat di paling bawah'],
  occasions: ['sahabat', 'anniv', 'ortu', 'ultah'],
  palette: { bg: '#e6c79c', ink: '#3a2416', accent: '#d9573a' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    { key: 'photos', label: 'Foto', hint: 'Paling pas 4 sampai 6 foto. Foto terakhir datang tertelungkup, jadi taruh yang paling berkesan di akhir.', count: 6 },
    {
      key: 'notes',
      label: 'Tulisan di balik tiap foto',
      hint: 'Urut sesuai fotonya. Tulis tempat & waktunya, lalu tanda –, lalu ceritanya. Kalimat pertama jadi judulnya. Contoh: Halaman kos, Agustus 2019 – Hari pertama pindahan. Semua masih jaim.',
      min: 0,
      count: 6,
      max: 120,
      placeholder: 'Tempat, waktu – cerita di balik foto ini',
    },
    { key: 'title', label: 'Ucapan utama', max: 40 },
    { key: 'message', label: 'Surat di paling bawah', max: 900, multiline: true },
  ],
  sample: {
    to: 'Arga',
    from: 'Tari',
    title: 'Semua foto terbaikku ada kamunya.',
    notes: [
      'Bakso bakar depan kampus, Maret 2019 – Kencan pertama yang katamu "cuma makan". Kamu gugup sampai tusuknya patah.',
      'Kafe dekat kosku, Mei 2019 – Kamu nembak di sini. Aku kelamaan jawab, kopimu kamu aduk terus sampai dingin.',
      'Malioboro, Desember 2020 – Motormu mogok, kita dorong berdua sampai bengkel. Katamu itu olahraga pasangan.',
      'Pantai Indrayanti, 2021 – Sandalku hanyut, kamu nekat ngejar. Pulangnya kita nyeker berdua.',
      'Bromo, Juni 2023 – Jam tiga pagi, dingin banget. Kamu kasih jaketmu, terus menggigil sambil bilang nggak apa-apa.',
      'Kondangan sepupumu, 2025 – Pertama kali kenalan sama keluarga besarmu. Tanganmu keringetan, tapi nggak kamu lepas.',
    ],
    message:
      'Foto-foto ini sengaja aku cetak. Di galeri HP mereka ketimbun tangkapan layar dan foto struk, padahal isinya bagian terbaik hidupku sejak 2019.\n\nAku suka lihat urutannya. Dari kita yang masih jaim di depan bakso bakar, sampai kamu yang sekarang hafal aku nggak suka daun bawang dan pasti kedinginan di mana pun.\n\nMakasih sudah sabar nungguin jawabanku waktu itu. Dan makasih sudah tetap di sini, bahkan di hari-hari aku lagi nyebelin.\n\nMasih banyak foto yang belum kita ambil. Aku mau semuanya sama kamu.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Setimbun Kenangan',
      tagline: 'Setimbun foto diikat getah. Diterbalikkan satu per satu untuk membaca ceritanya, sampai ke surat di paling bawah.',
      steps: ['Tanggalkan getah', 'Terbalikkan setiap foto', 'Surat di paling bawah'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        photos: { label: 'Foto', hint: 'Paling sesuai 4 hingga 6 foto. Foto terakhir datang tertiarap, jadi letak yang paling bermakna di akhir.' },
        notes: {
          label: 'Tulisan di belakang setiap foto',
          hint: 'Ikut susunan foto. Tulis tempat & masa, kemudian tanda –, kemudian ceritanya. Ayat pertama jadi tajuknya. Contoh: Rumah sewa Seksyen 7, Ogos 2019 – Hari pertama pindah. Semua masih malu-malu.',
          placeholder: 'Tempat, masa – cerita di sebalik foto ni',
        },
        title: { label: 'Ucapan utama' },
        message: { label: 'Surat di paling bawah' },
      },
      sample: {
        to: 'Luqman',
        from: 'Syaza',
        title: 'Semua gambar terbaik saya ada awak.',
        notes: [
          'Gerai satay Kajang, Mac 2019 – Janji temu pertama yang awak kata "makan je". Awak gugup sampai lidi satay patah.',
          'Kafe dekat kolej, Mei 2019 – Awak luah perasaan di sini. Saya lambat jawab, awak kacau kopi sampai sejuk.',
          'Dataran Merdeka, Disember 2020 – Motor awak rosak, kita tolak berdua sampai bengkel. Awak kata ni senaman pasangan.',
          'Pantai Cenang, 2021 – Selipar saya hanyut, awak nekad kejar. Baliknya kita berkaki ayam berdua.',
          'Bromo, Jun 2023 – Pukul tiga pagi, sejuk gila. Awak bagi jaket awak, lepas tu menggigil sambil kata okey je.',
          'Kenduri sepupu awak, 2025 – Kali pertama jumpa keluarga besar awak. Tangan awak berpeluh, tapi tak dilepaskan.',
        ],
        message:
          'Gambar-gambar ni sengaja saya cetak. Dalam galeri telefon semuanya tenggelam bawah screenshot dan gambar resit, padahal inilah bahagian terbaik hidup saya sejak 2019.\n\nSaya suka tengok susunannya. Daripada kita yang masih malu-malu depan gerai satay, sampai awak yang sekarang hafal saya tak makan daun bawang dan mesti kesejukan di mana-mana.\n\nTerima kasih sebab sabar tunggu jawapan saya dulu. Dan terima kasih sebab tetap ada, walaupun pada hari-hari saya menjengkelkan.\n\nMasih banyak gambar yang belum kita ambil. Saya nak semuanya dengan awak.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'Stack of Memories',
      tagline: 'A stack of photos held with a rubber band. Turn each one over to read its story, down to a letter at the bottom.',
      steps: ['Slip off the band', 'Turn each photo over', 'The letter at the bottom'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        photos: { label: 'Photos', hint: 'Best with 4 to 6 photos. The last one arrives face down, so save the best for last.' },
        notes: {
          label: 'Written on the back of each photo',
          hint: 'Same order as the photos. Write the place & time, then a dash –, then the story. The first sentence becomes its title. Example: Our first flat, August 2019 – Moving-in day. Everyone on their best behaviour.',
          placeholder: 'Place, time – the story behind this photo',
        },
        title: { label: 'Main message' },
        message: { label: 'Letter at the bottom' },
      },
      sample: {
        to: 'Callum',
        from: 'Tessa',
        title: 'Every good photo has you in it.',
        notes: [
          'Street food by campus, March 2019 – Our first date. "Just dinner," you said. You were so nervous you snapped the skewer.',
          'The café near my dorm, May 2019 – You asked me out here. I took so long to answer, you stirred your coffee cold.',
          'The old town, December 2020 – Your scooter died, so we pushed it to a garage together. You called it couples cardio.',
          'The beach, summer 2021 – My sandal floated off and you went in after it. We walked home barefoot, both of us.',
          'Bromo, June 2023 – Three in the morning, freezing. You gave me your jacket, then shivered and swore you were fine.',
          'Your cousin’s wedding, 2025 – Meeting your whole family. Your hand was sweaty. You never let go of mine.',
        ],
        message:
          "I printed these on purpose. On my phone they're buried under screenshots and photos of receipts, and they're the best parts of my life since 2019.\n\nI love seeing them in order. From the two of us being awkward over street food, to you knowing I hate spring onions and that I'll be cold wherever we go.\n\nThank you for waiting for my answer back then. And thank you for staying, even on the days I'm impossible.\n\nThere are so many photos we haven't taken yet. I want all of them with you.",
        photos: PHOTOS,
      },
    },
  },
};
