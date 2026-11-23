import type { TemplateMeta } from '../types';

const PHOTOS = ['/contoh/dua-cangkir.webp', '/contoh/kota-tua.webp', '/contoh/senja-pantai.webp', '/contoh/piknik.webp', '/contoh/pantai-gili.webp', '/contoh/bintang-tenda.webp'];

export const meta: TemplateMeta = {
  id: 'memories',
  name: 'Our Memories',
  tagline: 'Nyalakan lampu tumblr-nya, lalu lihat foto-foto yang tergantung di dinding satu per satu.',
  steps: ['Nyalakan lampunya', 'Ketuk fotonya', 'Surat di ujung tali'],
  occasions: ['sahabat', 'anniv', 'kangen', 'ortu', 'wisuda'],
  palette: { bg: '#232745', ink: '#fff3dc', accent: '#ffb84d' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    { key: 'photos', label: 'Foto di dinding', hint: 'Sampai 6 foto. Paling cantik kalau 4 sampai 6.', count: 6 },
    {
      key: 'notes',
      label: 'Catatan di bawah tiap foto',
      hint: 'Urut sesuai fotonya. Tanpa foto, catatan ini jadi kartu tulisan tangan.',
      min: 0,
      count: 6,
      max: 44,
      placeholder: 'Cerita singkat foto ini',
    },
    { key: 'title', label: 'Ucapan utama', max: 40 },
    { key: 'message', label: 'Surat di ujung tali', max: 900, multiline: true },
  ],
  sample: {
    to: 'Dinda',
    from: 'Aldi',
    title: 'Dinding ini penuh gara-gara kamu.',
    notes: [
      'Kopi pertama. Kamu telat 40 menit.',
      'Nyasar bareng, malah ketemu kota ini.',
      'Senja yang bikin kita diam lama.',
      'Piknik dadakan, bekalnya cuma gorengan.',
      'Katanya nggak mau basah. Katanya.',
      'Capek, tapi kamu masih bisa ketawa.',
    ],
    message:
      'Aku nggak jago nyimpan barang, tapi foto-foto ini selalu aku jaga.\n\nTiap lampunya nyala, yang kelihatan bukan cuma dinding. Ada kopi yang keburu dingin, jalan yang salah belok, dan kamu yang selalu ketawa duluan.\n\nMakasih sudah jadi isi dinding ini. Masih banyak tempat kosong, kita isi pelan-pelan ya.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Our Memories',
      tagline: 'Hidupkan lampu kelip-kelipnya, kemudian lihat foto yang tergantung di dinding satu per satu.',
      steps: ['Hidupkan lampu', 'Ketuk fotonya', 'Surat di hujung tali'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        photos: { label: 'Foto di dinding', hint: 'Sehingga 6 foto. Paling cantik kalau 4 hingga 6.' },
        notes: {
          label: 'Catatan di bawah setiap foto',
          hint: 'Ikut susunan foto. Tanpa foto, catatan ini jadi kad tulisan tangan.',
          placeholder: 'Cerita ringkas foto ni',
        },
        title: { label: 'Ucapan utama' },
        message: { label: 'Surat di hujung tali' },
      },
      sample: {
        to: 'Aina',
        from: 'Hakim',
        title: 'Dinding ni penuh sebab awak.',
        notes: [
          'Kopi pertama. Awak lambat 40 minit.',
          'Sesat sama-sama, jumpa pula bandar ni.',
          'Senja yang buat kita diam lama.',
          'Piknik mengejut, bekalnya pisang goreng.',
          'Katanya tak nak basah. Katanya.',
          'Penat, tapi awak masih boleh gelak.',
        ],
        message:
          'Saya bukan jenis pandai simpan barang, tapi foto-foto ni saya jaga elok-elok.\n\nSetiap kali lampunya menyala, yang nampak bukan dinding saja. Ada kopi yang dah sejuk, jalan yang tersalah belok, dan awak yang selalu gelak dulu.\n\nTerima kasih sebab jadi isi dinding ni. Masih banyak ruang kosong, kita isi perlahan-lahan ya.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'Our Memories',
      tagline: 'Switch on the fairy lights, then look through the photos hanging on the wall, one by one.',
      steps: ['Turn on the lights', 'Tap the photos', 'The letter on the string'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        photos: { label: 'Photos on the wall', hint: 'Up to 6 photos. Looks best with 4 to 6.' },
        notes: {
          label: 'Caption under each photo',
          hint: 'Same order as the photos. With no photos, these become handwritten cards.',
          placeholder: 'The little story behind this photo',
        },
        title: { label: 'Main message' },
        message: { label: 'Letter at the end of the string' },
      },
      sample: {
        to: 'Maya',
        from: 'Sam',
        title: 'This wall is full because of you.',
        notes: [
          'First coffee. You were 40 minutes late.',
          'Got lost together, found this city.',
          'The sunset that kept us quiet.',
          'Surprise picnic. Snacks only.',
          'You swore you would stay dry.',
          'Worn out, and you were still laughing.',
        ],
        message:
          "I'm bad at keeping things, but I've always kept these photos safe.\n\nEvery time the lights come on, it's more than a wall. It's the coffee that went cold, the wrong turn we took, and you, always the first to laugh.\n\nThank you for filling this wall. There's still plenty of empty space, so let's take our time with it.",
        photos: PHOTOS,
      },
    },
  },
};
