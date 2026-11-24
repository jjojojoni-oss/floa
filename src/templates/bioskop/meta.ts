import type { TemplateMeta } from '../types';

const PHOTOS = ['/contoh/bioskop.webp', '/contoh/bakso-berdua.webp', '/contoh/jalan-hujan-malam.webp', '/contoh/jakarta-malam.webp', '/contoh/gandengan.webp'];

export const meta: TemplateMeta = {
  id: 'bioskop',
  name: 'Film Kita',
  tagline: 'Bioskop kecil khusus berdua: sobek tiketnya, buka tirainya, lalu tonton cerita kalian adegan demi adegan.',
  steps: ['Sobek tiketnya', 'Tonton tiap adegan', 'Pesan setelah kredit'],
  occasions: ['anniv', 'sahabat', 'ultah', 'kangen'],
  palette: { bg: '#2a0d12', ink: '#fbeed6', accent: '#f2b84b' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    { key: 'title', label: 'Judul film', hint: 'Terpampang di papan nama bioskop dan di tiketnya.', max: 40 },
    {
      key: 'photos',
      label: 'Adegan',
      hint: 'Satu foto per adegan, sampai 6. Foto terakhir jadi adegan penutup, jadi taruh yang paling berkesan di akhir.',
      count: 6,
      // tiap foto sudah berpasangan dengan teks adegannya
      captions: false,
    },
    {
      key: 'notes',
      label: 'Teks di tiap adegan',
      hint: 'Muncul seperti subtitle, urut sesuai fotonya. Adegan tanpa foto tampil sebagai kartu teks ala film bisu.',
      min: 0,
      count: 6,
      max: 60,
      placeholder: 'Satu kalimat untuk adegan ini',
    },
    { key: 'message', label: 'Pesan setelah kredit', hint: 'Surat yang muncul setelah tulisan Tamat. Jangan pulang dulu.', max: 900, multiline: true },
  ],
  sample: {
    to: 'Salsa',
    from: 'Bagas',
    title: 'Dua Kursi, Satu Cerita',
    notes: [
      'Kencan pertama. Filmnya lupa, tanganmu enggak.',
      'Habis nonton, bakso. Selalu. Itu aturan kita.',
      'Pulang kehujanan. Kamu ketawa, aku ikut basah.',
      'Macet dua jam, tapi kita malah nggak pengin sampai.',
      'Adegan favoritku: yang ini. Yang ada kamunya.',
    ],
    message:
      'Kalau hidup ini film, aku nggak butuh alur yang rumit. Cukup kamu di kursi sebelah, popcorn yang selalu kamu habiskan duluan, dan tangan yang kucari tiap ada adegan seram.\n\nMakasih sudah mau jadi lawan main di semua adegan: yang lucu, yang canggung, yang bikin kita diam-diaman lalu baikan lagi di parkiran.\n\nFilm kita belum tamat. Aku masih mau nonton lanjutannya, di sebelahmu.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Filem Kita',
      tagline: 'Pawagam kecil khas untuk berdua: koyak tiketnya, buka tirainya, lalu tonton cerita kamu babak demi babak.',
      steps: ['Koyak tiketnya', 'Tonton setiap babak', 'Pesanan selepas kredit'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        title: { label: 'Tajuk filem', hint: 'Terpampang pada papan tanda pawagam dan pada tiketnya.' },
        photos: { label: 'Babak', hint: 'Satu foto untuk setiap babak, sehingga 6. Foto terakhir jadi babak penutup, jadi letak yang paling bermakna di hujung.' },
        notes: {
          label: 'Teks pada setiap babak',
          hint: 'Muncul seperti sari kata, ikut susunan fotonya. Babak tanpa foto tampil sebagai kad teks ala filem bisu.',
          placeholder: 'Satu ayat untuk babak ini',
        },
        message: { label: 'Pesanan selepas kredit', hint: 'Surat yang muncul selepas tulisan Tamat. Jangan balik dulu.' },
      },
      sample: {
        to: 'Alya',
        from: 'Danish',
        title: 'Dua Kerusi, Satu Cerita',
        notes: [
          'Janji temu pertama. Filemnya lupa, tangan awak tak.',
          'Lepas tengok wayang, bakso. Selalu. Itu peraturan kita.',
          'Balik kena hujan. Awak ketawa, saya pun basah sekali.',
          'Jem dua jam, tapi kita pula tak nak sampai.',
          'Babak kegemaran saya: yang ini. Yang ada awak.',
        ],
        message:
          'Kalau hidup ini filem, saya tak perlukan jalan cerita yang rumit. Cukup awak di kerusi sebelah, popcorn yang awak selalu habiskan dulu, dan tangan yang saya cari setiap kali ada babak seram.\n\nTerima kasih sebab sudi jadi pelakon gandingan dalam semua babak: yang lucu, yang kekok, yang buat kita bermasam muka lalu berbaik semula di tempat letak kereta.\n\nFilem kita belum tamat. Saya masih nak tonton sambungannya, di sebelah awak.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'Our Movie',
      tagline: 'A tiny cinema just for two: tear the ticket, open the curtain, and watch your story scene by scene.',
      steps: ['Tear the ticket', 'Watch each scene', 'Stay for the post-credits'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        title: { label: 'Movie title', hint: 'Shown on the cinema marquee and on the ticket.' },
        photos: { label: 'Scenes', hint: 'One photo per scene, up to 6. The last photo is the closing scene, so save the best one for the end.' },
        notes: {
          label: 'Text for each scene',
          hint: 'Appears like subtitles, in the same order as the photos. A scene without a photo becomes a silent-film title card.',
          placeholder: 'One line for this scene',
        },
        message: { label: 'Post-credits message', hint: "The letter that appears after The End. Don't leave yet." },
      },
      sample: {
        to: 'Olivia',
        from: 'Ethan',
        title: 'Two Seats, One Story',
        notes: [
          'Our first date. I forgot the movie. Not your hand.',
          'Noodles after every movie. Always. That is our rule.',
          'Caught in the rain. You laughed. I got soaked too.',
          'Two hours of traffic, and we did not want to arrive.',
          'My favorite scene: this one. The one with you in it.',
        ],
        message:
          "If life were a movie, I would not need a complicated plot. Just you in the next seat, the popcorn you always finish first, and the hand I reach for in every scary scene.\n\nThank you for being my co-star in all of them: the funny scenes, the awkward ones, the ones where we stopped talking and made up again in the parking lot.\n\nOur movie is not over. I still want to watch what happens next, right beside you.",
        photos: PHOTOS,
      },
    },
  },
};
