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
    title: 'Selamat ulang tahun, Nad sayang!',
    notes: [
      'Semoga kamu makin sering ketawa, kayak waktu keselek kerupuk di kencan pertama kita.',
      'Semoga cutimu nambah, biar liburan berdua kita nggak diganggu chat kantor lagi.',
      'Semoga kopimu selalu hangat, dan tiap pagimu dimulai dengan chat dariku.',
      'Semoga tiap kamu pulang dari jauh, aku yang pertama nunggu di peron.',
      'Semoga tahun depan aku masih yang nyalain lilinmu. Dan tahun-tahun sesudahnya juga.',
    ],
    message:
      'Satu tahun lagi lewat, dan kamu masih orang yang sama: yang ketawanya paling kenceng, yang paling duluan nanya "udah makan belum?", yang selalu nyuri hoodie-ku terus bilang itu punyamu dari awal.\n\nSemoga tahun ini lebih ringan dari yang kemarin. Kalau ternyata berat, bagi ke aku setengahnya. Kita cari makan enak dulu, baru mikir.\n\nSelamat bertambah umur, sayang. Kuenya virtual, tapi malam ini kamu yang pilih tempat makan, aku yang bayar. Hoodie-nya juga boleh kamu simpan.',
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
        to: 'Insyirah',
        from: 'Khairul',
        title: 'Selamat hari jadi, Syira sayang!',
        notes: [
          'Semoga awak makin kerap gelak, macam masa tersedak keropok waktu janji temu pertama kita.',
          'Semoga cuti awak bertambah, supaya percutian kita berdua tak diganggu mesej ofis lagi.',
          'Semoga kopi awak sentiasa panas, dan pagi awak bermula dengan mesej daripada saya.',
          'Semoga setiap kali awak balik dari jauh, saya yang pertama menunggu di platform.',
          'Semoga tahun depan saya masih yang nyalakan lilin awak. Dan tahun-tahun lepas tu juga.',
        ],
        message:
          'Setahun lagi dah berlalu, dan awak masih orang yang sama: yang gelaknya paling kuat, yang paling awal tanya "dah makan ke belum?", yang selalu curi hoodie saya lepas tu kata memang awak punya dari awal.\n\nHarap tahun ni lebih ringan daripada tahun lepas. Kalau berat juga, bagi saya separuh. Kita cari makan sedap dulu, baru fikir.\n\nSelamat bertambah umur, sayang. Keknya maya, tapi malam ni awak pilih tempat makan, saya yang belanja. Hoodie tu pun awak boleh simpan.',
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
        to: 'Isla',
        from: 'Luke',
        title: 'Happy birthday, my love!',
        notes: [
          'May you laugh even more this year, like when you choked on a cracker on our first date.',
          'More days off, and may work finally stop following us on our holidays.',
          'May your coffee stay warm, and every morning start with a text from me.',
          'May I always be the first one waiting on the platform when you come home.',
          'May I still be the one lighting your candles next year. And every year after that.',
        ],
        message:
          'Another year gone, and you\'re still the same: the loudest laugh in the room, the first to ask "have you eaten yet?", the one who keeps stealing my hoodie and swearing it was always yours.\n\nI hope this year is lighter than the last. And if it gets heavy, hand me half. We\'ll grab good food first and figure it out after.\n\nHappy birthday, love. The cake is virtual, but tonight you pick the restaurant and I pay. You can keep the hoodie, too.',
        photos: ['/contoh/bakso.webp', '/contoh/pantai-gili.webp', '/contoh/kopi-hitam.webp', '/contoh/peron-stasiun.webp', '/contoh/kue-lilin.webp'],
      },
    },
  },
};
