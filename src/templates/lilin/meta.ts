import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'lilin',
  name: 'Tiup Lilin',
  tagline: 'Nyalakan lilinnya, buat permohonan, lalu tiup. Lampu menyala, pestanya mulai.',
  steps: ['Nyalakan lilin', 'Tahan untuk meniup', 'Baca ucapan'],
  occasions: ['ultah'],
  palette: { bg: '#2c1840', ink: '#fff1dc', accent: '#ffb347' },
  fields: [
    { key: 'to', label: 'Yang ulang tahun', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Satu doa per lilin',
      hint: 'Muncul saat tiap lilin dinyalakan. 3 sampai 5 lilin.',
      min: 3,
      count: 5,
      max: 60,
      placeholder: 'Doa atau harapan buat dia',
    },
    { key: 'title', label: 'Ucapan utama', hint: 'Muncul besar setelah lilin ditiup.', max: 40 },
    { key: 'message', label: 'Kartu ucapan', max: 900, multiline: true },
    { key: 'photos', label: 'Foto', hint: 'Opsional, sampai 4 foto.', count: 4 },
  ],
  sample: {
    to: 'Nadia',
    from: 'Rama',
    title: 'Selamat ulang tahun, Nad!',
    notes: [
      'Sehat terus, biar bisa jajan terus.',
      'Rezeki lancar, cicilan cepat lunas.',
      'Makin berani ambil yang kamu mau.',
      'Tetap jadi kamu yang aku kenal.',
    ],
    message:
      'Satu tahun lagi lewat, dan kamu masih orang yang sama: yang ketawanya paling kenceng, yang paling duluan nanya "udah makan belum?".\n\nSemoga tahun ini lebih ringan dari yang kemarin. Kalau ternyata berat, kabarin aku. Kita cari makan enak dulu, baru mikir.\n\nSelamat bertambah umur. Kuenya virtual, traktirannya beneran ya.',
    photos: ['/art/foto-taman.webp', '/art/foto-pantai.webp', '/art/foto-kota.webp'],
  },
  i18n: {
    ms: {
      name: 'Tiup Lilin',
      tagline: 'Nyalakan lilin, buat hajat, lepas tu tiup. Lampu menyala, parti pun bermula.',
      steps: ['Nyalakan lilin', 'Tahan untuk tiup', 'Baca ucapan'],
      fields: {
        to: { label: 'Siapa yang berhari jadi', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Satu doa untuk setiap lilin',
          hint: 'Muncul bila setiap lilin dinyalakan. 3 hingga 5 lilin.',
          placeholder: 'Doa atau harapan untuk dia',
        },
        title: { label: 'Ucapan utama', hint: 'Muncul besar lepas lilin ditiup.' },
        message: { label: 'Kad ucapan' },
        photos: { label: 'Foto', hint: 'Pilihan, sehingga 4 foto.' },
      },
      sample: {
        to: 'Farah',
        from: 'Amir',
        title: 'Selamat hari jadi, Farah!',
        notes: [
          'Sihat selalu, boleh makan sedap selalu.',
          'Rezeki murah, hutang cepat langsai.',
          'Makin berani kejar apa yang kau nak.',
          'Kekal jadi kau yang aku kenal.',
        ],
        message:
          'Setahun lagi dah berlalu, dan kau masih orang yang sama: yang gelaknya paling kuat, yang paling awal tanya "dah makan ke belum?".\n\nHarap tahun ni lebih ringan daripada tahun lepas. Kalau berat juga, bagitahu aku. Kita cari makan sedap dulu, baru fikir.\n\nSelamat bertambah umur. Keknya maya, tapi belanja makan tu betul-betul tau.',
        photos: ['/art/foto-taman.webp', '/art/foto-pantai.webp', '/art/foto-kota.webp'],
      },
    },
    en: {
      name: 'Make a Wish',
      tagline: 'Light the candles, make a wish, then blow. Lights on, party on.',
      steps: ['Light the candles', 'Hold to blow', 'Read the card'],
      fields: {
        to: { label: 'Birthday person', placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'One wish per candle',
          hint: 'Shows up as each candle is lit. 3 to 5 candles.',
          placeholder: 'A wish or hope for them',
        },
        title: { label: 'Main message', hint: 'Shows up big once the candles are out.' },
        message: { label: 'Birthday card' },
        photos: { label: 'Photos', hint: 'Optional, up to 4 photos.' },
      },
      sample: {
        to: 'Sophie',
        from: 'Ryan',
        title: 'Happy birthday, Soph!',
        notes: [
          'Stay healthy, so the snacking never stops.',
          'More money in, fewer bills out.',
          'Braver about going after what you want.',
          'Stay the you I know and love.',
        ],
        message:
          'Another year gone, and you\'re still the same: the loudest laugh in the room, the first to ask "have you eaten yet?".\n\nI hope this year is lighter than the last. And if it gets heavy, call me. We\'ll grab good food first and figure it out after.\n\nHappy birthday. The cake is virtual, but dinner\'s on me. For real.',
        photos: ['/art/foto-taman.webp', '/art/foto-pantai.webp', '/art/foto-kota.webp'],
      },
    },
  },
};
