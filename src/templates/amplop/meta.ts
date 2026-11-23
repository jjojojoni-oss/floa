import type { TemplateMeta } from '../types';

const PHOTOS = ['/contoh/masak-tungku.webp', '/contoh/nyalakan-lilin.webp'];

export const meta: TemplateMeta = {
  id: 'amplop',
  name: 'Amplop Rahasia',
  tagline: 'Amplop bersegel lilin berisi selipan kecil: karcis, bunga pres, foto, nota. Ditarik satu per satu, sampai suratnya.',
  steps: ['Patahkan segelnya', 'Tarik selipannya', 'Baca surat'],
  occasions: ['ortu', 'maaf', 'kangen', 'sahabat', 'anniv'],
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
    to: 'Mama',
    from: 'Kakak',
    title: 'Yang belum sempat aku bilang',
    notes: [
      'Dapur kita jam lima pagi. Mama selalu bangun duluan, bahkan di hari libur.',
      'Kue ulang tahunku yang ketujuh. Mama nyalain lilinnya, koreknya tiga kali gagal.',
      'Karcis kereta waktu aku pertama berangkat kuliah. Mama nunggu di peron sampai keretanya hilang.',
      'Nota bakso dekat stasiun. Mama bilang sudah kenyang, padahal uangnya cuma cukup satu porsi.',
      'Melati dari pagar depan. Aku petik waktu pamit, biar wangi rumah ikut ke kos.',
    ],
    message:
      'Ma, aku jarang ngomong langsung, jadi aku tulis aja.\n\nMakasih buat bekal yang selalu ada padahal Mama juga buru-buru. Makasih sudah pura-pura nggak capek. Makasih buat doa yang aku tahu dikirim tiap malam, walau aku jarang nelpon.\n\nAku baik-baik di sini. Makan teratur (hampir). Nanti kalau pulang, aku yang masak. Mama duduk aja.',
    photos: PHOTOS,
    captions: ['Wangi asap tungku, tanda Mama sudah bangun.', 'Ulang tahun ketujuh. Kuenya bikinan Mama sendiri.'],
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
        to: 'Mak',
        from: 'Along',
        title: 'Yang belum sempat Along cakap',
        notes: [
          'Dapur kita pukul lima pagi. Mak selalu bangun dulu, hari cuti pun sama.',
          'Kek hari jadi Along yang ketujuh. Mak nyalakan lilin, mancisnya tiga kali tak menyala.',
          'Tiket bas masa Along mula-mula pergi belajar. Mak tunggu sampai bas hilang dari pandangan.',
          'Resit mi sup dekat stesen. Mak kata dah kenyang, padahal duit cukup untuk semangkuk je.',
          'Melur dari pagar depan. Along petik masa nak pergi, supaya bau rumah ikut sekali.',
        ],
        message:
          'Mak, Along jarang cakap depan-depan, jadi Along tulis je.\n\nTerima kasih untuk bekal yang sentiasa ada walaupun Mak pun kelam-kabut. Terima kasih sebab buat-buat tak penat. Terima kasih untuk doa yang Along tahu Mak kirim setiap malam, walaupun Along jarang telefon.\n\nAlong sihat kat sini. Makan ikut masa (hampir). Nanti bila balik, Along yang masak. Mak duduk je.',
        photos: PHOTOS,
        captions: ['Bau asap dapur kayu, tanda Mak dah bangun.', 'Hari jadi ketujuh. Keknya Mak buat sendiri.'],
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
        to: 'Mom',
        from: 'Lily',
        title: 'What I never got around to saying',
        notes: [
          'Our kitchen at five in the morning. You were always up first, even on days off.',
          'My seventh birthday cake. You lit the candles, and the lighter failed three times.',
          'My train ticket the day I left for college. You stayed on the platform until the train was gone.',
          'Receipt from the noodle stall by the station. You said you were full. We could only afford one bowl.',
          'Jasmine from our front fence. I picked it the day I left, so home would come with me.',
        ],
        message:
          "Mom, I don't say this out loud much, so I'm writing it down.\n\nThank you for the packed lunches that were always there, even when you were rushing too. Thank you for pretending you weren't tired. Thank you for the prayers I know you send every night, even though I don't call enough.\n\nI'm doing fine here. Eating properly (mostly). Next time I'm home, I'm cooking. You just sit down.",
        photos: PHOTOS,
        captions: ['The smell of woodsmoke meant you were up.', 'Seventh birthday. You baked the cake yourself.'],
      },
    },
  },
};
