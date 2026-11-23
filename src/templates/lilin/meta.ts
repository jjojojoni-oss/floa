import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'lilin',
  name: 'Tiup Lilin',
  tagline: 'Satu doa di tiap lilin. Lalu permohonan, tiup lilin, nyanyi bareng, dan potongan kue pertama buat dia.',
  steps: ['Nyalakan lilin satu-satu', 'Bikin permohonan, lalu tiup', 'Nyanyi, potong kue, buka kartu'],
  occasions: ['ultah'],
  palette: { bg: '#2c1840', ink: '#fff1dc', accent: '#ffb347' },
  fields: [
    { key: 'to', label: 'Yang ulang tahun', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Doa untuk tiap lilin',
      hint: 'Muncul satu per satu saat lilinnya dinyalakan. Simpan yang paling penting di urutan terakhir. 3 sampai 5 lilin.',
      min: 3,
      count: 5,
      max: 90,
      placeholder: 'Semoga…',
    },
    { key: 'title', label: 'Ucapan utama', hint: 'Muncul besar saat lampu menyala.', max: 40 },
    { key: 'message', label: 'Kartu di bawah piring', hint: 'Dibuka paling akhir, setelah potong kue.', max: 900, multiline: true },
    {
      key: 'photos',
      label: 'Foto',
      hint: 'Opsional, sampai 5. Foto pertama muncul bersama lilin pertama, dan seterusnya.',
      count: 5,
      // tiap foto sudah berpasangan dengan doa lilinnya
      captions: false,
    },
  ],
  sample: {
    to: 'Nadia',
    from: 'Rama',
    title: 'Selamat ulang tahun, Nad!',
    notes: [
      'Semoga tahun ini kamu lebih sering ketawa, kayak malam itu kamu keselek kerupuk bakso.',
      'Semoga cutimu nambah, dan kerjaan nggak ikut kebawa ke pantai lagi.',
      'Semoga kopimu selalu hangat dan pagimu nggak buru-buru.',
      'Semoga tiap capekmu selalu ketemu tempat pulang.',
      'Semoga kamu ingat: kamu nggak pernah sendirian. Aku di sini, tiap tahun.',
    ],
    message:
      'Satu tahun lagi lewat, dan kamu masih orang yang sama: yang ketawanya paling kenceng, yang paling duluan nanya "udah makan belum?".\n\nSemoga tahun ini lebih ringan dari yang kemarin. Kalau ternyata berat, kabarin aku. Kita cari makan enak dulu, baru mikir.\n\nSelamat bertambah umur. Kuenya virtual, traktirannya beneran ya.',
    photos: ['/contoh/bakso.webp', '/contoh/pantai-gili.webp', '/contoh/kopi-hitam.webp', '/contoh/peron-stasiun.webp', '/contoh/kue-lilin.webp'],
  },
  i18n: {
    ms: {
      name: 'Tiup Lilin',
      tagline: 'Satu doa di setiap lilin. Lepas tu hajat, tiup lilin, nyanyi sama-sama, dan potongan kek pertama untuk dia.',
      steps: ['Nyalakan lilin satu-satu', 'Buat hajat, lepas tu tiup', 'Nyanyi, potong kek, buka kad'],
      fields: {
        to: { label: 'Siapa yang berhari jadi', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Doa untuk setiap lilin',
          hint: 'Muncul satu demi satu bila lilin dinyalakan. Simpan yang paling penting di hujung. 3 hingga 5 lilin.',
          placeholder: 'Semoga…',
        },
        title: { label: 'Ucapan utama', hint: 'Muncul besar bila lampu menyala.' },
        message: { label: 'Kad di bawah pinggan', hint: 'Dibuka paling akhir, lepas potong kek.' },
        photos: { label: 'Foto', hint: 'Pilihan, sehingga 5. Foto pertama muncul bersama lilin pertama, dan seterusnya.' },
      },
      sample: {
        to: 'Farah',
        from: 'Amir',
        title: 'Selamat hari jadi, Farah!',
        notes: [
          'Semoga tahun ni kau lebih banyak gelak, macam malam tu kau tersedak keropok bakso.',
          'Semoga cuti kau bertambah, dan kerja tak ikut sampai ke pantai lagi.',
          'Semoga kopi kau sentiasa panas dan pagi kau tak tergesa-gesa.',
          'Semoga setiap penat kau sentiasa jumpa tempat untuk pulang.',
          'Semoga kau ingat: kau tak pernah seorang diri. Aku ada, setiap tahun.',
        ],
        message:
          'Setahun lagi dah berlalu, dan kau masih orang yang sama: yang gelaknya paling kuat, yang paling awal tanya "dah makan ke belum?".\n\nHarap tahun ni lebih ringan daripada tahun lepas. Kalau berat juga, bagitahu aku. Kita cari makan sedap dulu, baru fikir.\n\nSelamat bertambah umur. Keknya maya, tapi belanja makan tu betul-betul tau.',
        photos: ['/contoh/bakso.webp', '/contoh/pantai-gili.webp', '/contoh/kopi-hitam.webp', '/contoh/peron-stasiun.webp', '/contoh/kue-lilin.webp'],
      },
    },
    en: {
      name: 'Make a Wish',
      tagline: 'A wish on every candle. Then a secret wish, a big blow, a sing-along, and the first slice just for them.',
      steps: ['Light the candles one by one', 'Make a wish, then blow', 'Sing, cut the cake, open the card'],
      fields: {
        to: { label: 'Birthday person', placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'A wish for each candle',
          hint: 'Shows up one by one as each candle is lit. Save the one that matters most for last. 3 to 5 candles.',
          placeholder: 'May you…',
        },
        title: { label: 'Main message', hint: 'Shows up big when the lights come on.' },
        message: { label: 'The card under the plate', hint: 'Opened last, after the cake is cut.' },
        photos: { label: 'Photos', hint: 'Optional, up to 5. The first photo shows up with the first candle, and so on.' },
      },
      sample: {
        to: 'Sophie',
        from: 'Ryan',
        title: 'Happy birthday, Soph!',
        notes: [
          'May you laugh more this year, like that night at the meatball stall.',
          'More days off, and may work finally stop following you to the beach.',
          'May your coffee stay warm and your mornings never feel rushed.',
          'May every tired day of yours always find its way home.',
          'May you remember: you are never alone. I’m here, every year.',
        ],
        message:
          'Another year gone, and you\'re still the same: the loudest laugh in the room, the first to ask "have you eaten yet?".\n\nI hope this year is lighter than the last. And if it gets heavy, call me. We\'ll grab good food first and figure it out after.\n\nHappy birthday. The cake is virtual, but dinner\'s on me. For real.',
        photos: ['/contoh/bakso.webp', '/contoh/pantai-gili.webp', '/contoh/kopi-hitam.webp', '/contoh/peron-stasiun.webp', '/contoh/kue-lilin.webp'],
      },
    },
  },
};
