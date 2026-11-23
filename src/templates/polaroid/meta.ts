import type { TemplateMeta } from '../types';

/** Urutan foto contoh mengikuti ceritanya; foto terakhir jadi "yang paling spesial". */
const PHOTOS = ['/art/foto-taman.webp', '/art/foto-kopi.webp', '/art/foto-kota.webp', '/art/foto-pantai.webp', '/art/foto-senja.webp', '/art/foto-gunung.webp'];

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
    to: 'Geng Kosan',
    from: 'Tari',
    title: 'Makasih buat semuanya.',
    notes: [
      'Halaman kos, Agustus 2019 – Hari pertama pindahan. Semua masih jaim, belum ada yang berani pinjam sandal.',
      'Warung kopi depan kampus – Kopi ketiga minggu itu. Tugasnya belum dimulai, ceritanya sudah ke mana-mana.',
      'Malioboro, Desember 2020 – Katanya cuma lihat-lihat. Pulangnya bawa tiga kantong belanja.',
      'Pantai Indrayanti, 2021 – Payung kita terbang, kita yang lari ngejar. Fotonya blur semua, tapi aku suka.',
      'Parangtritis, 2022 – Nyasar dua jam, tapi dapat sunset. Kalian bilang itu memang rencananya.',
      'Dieng, Juni 2023 – Liburan yang direncanain dua tahun. Dingin banget, tapi nggak ada yang mau tidur duluan.',
    ],
    message:
      'Empat tahun, satu dapur, dan rice cooker yang sampai sekarang nggak jelas punya siapa.\n\nFoto-foto ini sengaja aku cetak, soalnya di galeri HP semuanya ketimbun tangkapan layar tugas. Ternyata kalau dipegang begini, rasanya beda.\n\nAku nggak tahu nanti kita bakal kerja di kota mana. Yang aku tahu, grup ini jangan sampai sepi.\n\nMakasih sudah jadi keluarga yang aku pilih sendiri.',
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
        to: 'Geng Rumah Sewa',
        from: 'Syaza',
        title: 'Terima kasih untuk semuanya.',
        notes: [
          'Rumah sewa Seksyen 7, Ogos 2019 – Hari pertama pindah. Semua masih malu-malu, tak ada yang berani pinjam selipar.',
          'Kedai mamak depan kampus – Teh tarik ketiga minggu tu. Assignment belum mula, cerita dah sampai ke mana-mana.',
          'Jalan TAR, Disember 2020 – Katanya nak tengok-tengok je. Balik bawa tiga beg plastik.',
          'Pantai Cenang, 2021 – Payung kita terbang, kita yang lari kejar. Gambar semua kabur, tapi aku suka.',
          'Port Dickson, 2022 – Sesat dua jam, tapi dapat tengok matahari terbenam. Korang kata memang plan.',
          'Cameron Highlands, Jun 2023 – Percutian yang dirancang dua tahun. Sejuk gila, tapi tak ada yang nak tidur dulu.',
        ],
        message:
          'Empat tahun, satu dapur, dan rice cooker yang sampai sekarang tak tahu siapa punya.\n\nGambar-gambar ni sengaja aku cetak, sebab dalam galeri telefon semuanya tenggelam bawah screenshot assignment. Rupanya bila dipegang macam ni, rasanya lain.\n\nAku tak tahu nanti kita kerja kat bandar mana. Yang aku tahu, group ni jangan sampai senyap.\n\nTerima kasih sebab jadi keluarga yang aku pilih sendiri.',
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
        to: 'The Roomies',
        from: 'Chloe',
        title: 'Thank you for everything.',
        notes: [
          'Our first flat, August 2019 – Moving-in day. Everyone on their best behaviour, nobody dared borrow slippers yet.',
          'The café by campus – Third coffee that week. The essay hadn’t started, the gossip had.',
          'Camden Market, December 2020 – “Just looking,” you said. We came home with three bags.',
          'Brighton, summer 2021 – Our umbrella flew off and we all chased it. Every photo is blurry. I love them.',
          'The coast road, 2022 – Two hours lost, one perfect sunset. You all swore it was the plan.',
          'The Highlands, June 2023 – The trip we planned for two years. Freezing, and still nobody wanted to sleep first.',
        ],
        message:
          "Four years, one kitchen, and a rice cooker nobody remembers buying.\n\nI printed these on purpose, because on my phone they're buried under screenshots of assignments. Holding them like this feels different.\n\nI don't know which cities we'll end up working in. All I know is this group chat can never go quiet.\n\nThank you for being the family I got to choose.",
        photos: PHOTOS,
      },
    },
  },
};
