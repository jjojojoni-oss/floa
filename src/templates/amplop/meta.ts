import type { TemplateMeta } from '../types';

const PHOTOS = ['/contoh/dua-cangkir.webp', '/contoh/gandengan.webp'];

export const meta: TemplateMeta = {
  id: 'amplop',
  name: 'Amplop Rahasia',
  tagline: 'Amplop bersegel lilin berisi selipan kecil: karcis, bunga pres, foto, nota. Ditarik satu per satu, sampai suratnya.',
  steps: ['Patahkan segelnya', 'Tarik selipannya', 'Baca surat'],
  occasions: ['anniv', 'kangen', 'maaf', 'sahabat', 'ortu'],
  palette: { bg: '#d5dbc0', ink: '#2c3122', accent: '#b3261e' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Selipan di dalam amplop',
      hint: 'Satu cerita kecil per selipan, ditarik satu per satu sebelum surat. Tulis yang spesifik: tempat, kebiasaan, hal kecil yang cuma kalian tahu.',
      min: 2,
      count: 5,
      max: 100,
      placeholder: 'Cerita kecil di balik selipan ini',
    },
    {
      key: 'photos',
      label: 'Foto',
      hint: 'Opsional. Foto ke-1 ikut selipan ke-1, dan seterusnya. Selipan tanpa foto jadi karcis, bunga pres, nota, atau kartu.',
      count: 5,
    },
    { key: 'title', label: 'Judul surat', hint: 'Tertulis di kepala surat.', max: 40 },
    { key: 'message', label: 'Isi surat', hint: 'Dibaca paling akhir, setelah semua selipan.', max: 1200, multiline: true },
  ],
  sample: {
    to: 'Tiara',
    from: 'Galih',
    title: 'Hal-hal kecil yang aku simpan',
    notes: [
      'Kopi pertama kita. Aku ikut pesan latte biar kelihatan nyambung. Padahal aku nggak suka kopi.',
      'Pertama kali gandengan. Katanya biar nggak ketinggalan. Padahal jalanannya sepi banget.',
      'Karcis bioskop film horor. Kamu yang ngajak, kamu juga yang tutup mata dari menit kelima.',
      'Struk martabak manis jam sebelas malam. Katanya lagi diet. Habis tiga potong.',
      'Melati yang kamu selipkan di saku kemejaku waktu kondangan. Sudah kering, tapi masih aku simpan.',
    ],
    message:
      'Ti, aku bukan orang yang jago ngomong, jadi aku kumpulin aja semuanya di sini.\n\nKamu mungkin sudah lupa sama hal-hal kecil ini. Aku nggak. Tiap buka laci dan ketemu salah satunya, aku senyum sendiri kayak orang aneh.\n\nMakasih sudah sabar sama aku yang suka telat balas chat dan suka lupa tanggal, tapi nggak pernah sekali pun lupa sama kamu.\n\nAmplop ini belum penuh. Isi lagi bareng aku, ya?',
    photos: PHOTOS,
    captions: ['Latte pertama. Bukan yang terakhir.', 'Tanganmu dingin. Aku pura-pura nggak sadar.'],
  },
  i18n: {
    ms: {
      name: 'Sampul Rahsia',
      tagline: 'Sampul bermeterai lilin berisi selitan kecil: tiket, bunga kering, foto, resit. Ditarik satu per satu, sampai ke suratnya.',
      steps: ['Patahkan meterai', 'Tarik selitan', 'Baca surat'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Selitan dalam sampul',
          hint: 'Satu cerita kecil bagi setiap selitan, ditarik satu per satu sebelum surat. Tulis yang spesifik: tempat, kebiasaan, perkara kecil yang hanya kalian tahu.',
          placeholder: 'Cerita kecil di sebalik selitan ini',
        },
        photos: {
          label: 'Foto',
          hint: 'Pilihan. Foto pertama ikut selitan pertama, dan seterusnya. Selitan tanpa foto jadi tiket, bunga kering, resit atau kad.',
        },
        title: { label: 'Tajuk surat', hint: 'Tertulis di kepala surat.' },
        message: { label: 'Isi surat', hint: 'Dibaca paling akhir, selepas semua selitan.' },
      },
      sample: {
        to: 'Nurul',
        from: 'Amir',
        title: 'Benda-benda kecil yang aku simpan',
        notes: [
          'Kopi pertama kita. Aku pesan latte sama macam awak, konon sepadan. Padahal aku tak minum kopi.',
          'Kali pertama berpimpin tangan. Kononnya takut tertinggal. Padahal jalan tu lengang.',
          'Tiket wayang cerita seram. Awak yang ajak, awak juga yang tutup mata dari minit kelima.',
          'Resit roti canai pukul sebelas malam. Katanya tengah diet. Habis tiga keping.',
          'Melur yang awak selit dalam poket kemeja aku masa kenduri. Dah kering, tapi masih aku simpan.',
        ],
        message:
          'Nurul, aku bukan orang yang pandai bercakap, jadi aku kumpul semuanya di sini.\n\nMungkin awak dah lupa perkara-perkara kecil ni. Aku tak. Setiap kali buka laci dan jumpa salah satunya, aku senyum seorang diri macam orang pelik.\n\nTerima kasih sebab sabar dengan aku yang selalu lambat balas mesej dan selalu lupa tarikh, tapi tak pernah sekali pun lupa awak.\n\nSampul ni belum penuh. Isi lagi sama-sama dengan aku, ya?',
        photos: PHOTOS,
        captions: ['Latte pertama. Bukan yang terakhir.', 'Tangan awak sejuk. Aku buat-buat tak perasan.'],
      },
    },
    en: {
      name: 'Sealed With Love',
      tagline: 'A wax-sealed envelope full of small keepsakes: a ticket, a pressed flower, a photo, a receipt. Pulled out one by one, until the letter.',
      steps: ['Break the seal', 'Pull out the keepsakes', 'Read the letter'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'Keepsakes inside the envelope',
          hint: 'One small story per keepsake, pulled out one by one before the letter. Be specific: a place, a habit, a small thing only you two know.',
          placeholder: 'The little story behind this keepsake',
        },
        photos: {
          label: 'Photos',
          hint: 'Optional. Photo 1 goes with keepsake 1, and so on. Keepsakes without a photo become a ticket, a pressed flower, a receipt, or a card.',
        },
        title: { label: 'Letter title', hint: 'Written at the top of the letter.' },
        message: { label: 'Your letter', hint: 'Read last, after all the keepsakes.' },
      },
      sample: {
        to: 'Grace',
        from: 'Leo',
        title: 'The little things I kept',
        notes: [
          'Our first coffee. I ordered a latte like you so we would match. I do not even like coffee.',
          'The first time we held hands. You said it was so we would not get lost. The street was empty.',
          'Our ticket to that horror film. You picked it, then covered your eyes from minute five.',
          'Receipt from the late-night pancake stall, 11 pm. You were on a diet. You had three slices.',
          'The jasmine you tucked in my shirt pocket at the wedding. It has dried, but I still keep it.',
        ],
        message:
          "Grace, I'm not good at saying things out loud, so I gathered everything here instead.\n\nYou've probably forgotten these little things. I haven't. Every time I open the drawer and find one of them, I smile to myself like a fool.\n\nThank you for being patient with someone who replies late and forgets dates, but has never once forgotten you.\n\nThis envelope isn't full yet. Fill it up with me?",
        photos: PHOTOS,
        captions: ['Our first latte. Not our last.', 'Your hand was cold. I pretended not to notice.'],
      },
    },
  },
};
