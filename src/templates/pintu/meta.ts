import type { TemplateMeta } from '../types';

/** foto ke-i ditempel di sebelah garis ke-i (urut dari kecil sampai sekarang) */
const PHOTOS = ['/contoh/sepeda.webp', '/contoh/kue-lilin.webp', '/contoh/nasi-kotak.webp', '/contoh/meja-belajar.webp', '/contoh/bioskop.webp', '/contoh/gandengan.webp'];

export const meta: TemplateMeta = {
  id: 'pintu',
  name: 'Setinggi Ini',
  tagline: 'Garis-garis pensil di kusen pintu rumah: gores satu per satu dari kecil sampai sekarang, lalu temukan surat yang terselip di kusennya.',
  steps: ['Ambil pensilnya', 'Gores tiap garis', 'Tarik surat dari kusen'],
  occasions: ['anniv', 'ortu', 'ultah', 'wisuda'],
  palette: { bg: '#cfdcc0', ink: '#2f3327', accent: '#d9643a' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Kenangan di tiap garis, dari kecil sampai sekarang',
      hint: 'Satu garis satu kenangan, urut dari yang paling kecil. Garis terakhir adalah "sekarang".',
      min: 3,
      count: 6,
      max: 70,
      placeholder: 'Segini waktu…',
    },
    {
      key: 'photos',
      label: 'Foto di tiap garis',
      hint: 'Opsional. Foto ke-1 ditempel di sebelah garis ke-1, dan seterusnya. Garis tanpa foto dapat gambar kapur.',
      count: 6,
      // tiap foto sudah berpasangan dengan kenangan di garisnya
      captions: false,
    },
    { key: 'title', label: 'Ucapan utama', hint: 'Muncul saat seluruh kusen terlihat, setelah garis terakhir.', max: 40 },
    { key: 'message', label: 'Surat', hint: 'Surat yang terselip di kusen pintu, dibaca paling akhir.', max: 900, multiline: true },
  ],
  sample: {
    to: 'Satria',
    from: 'Ajeng',
    title: 'Dari segini sampai segini, tetap kamu.',
    notes: [
      'Umur lima, tetangga baru. Sepedamu kupinjam, kamu nangis.',
      'Ulang tahunmu ketujuh. Lilinnya kutiup duluan. Kamu ngambek.',
      'Kelas empat. Telur dadarku kamu tukar tempe, tiap hari.',
      'SMP. Katanya belajar bareng. Aku belajar, kamu nyontek.',
      'SMA. Kamu mendadak lebih tinggi, lalu ngajak nonton berdua.',
      'Kamu masih sejengkal lebih tinggi. Bedanya, sekarang kamu pacarku.',
    ],
    message:
      'Sat, kemarin aku mampir ke rumahmu, dan garis-garis di kusen itu masih ada. Ibumu dulu ngukur kita berdua tiap Lebaran, gantian, sambil bilang, "Ajeng, jangan jinjit."\n\nDulu yang kita ributin cuma siapa yang lebih tinggi. Kamu kalah terus sampai kelas enam, lalu tiba-tiba menang dan nggak pernah kalah lagi. Aku sebel. Diam-diam aku juga senang.\n\nTernyata kusen itu nyatet lebih dari tinggi badan. Dia nyatet orang yang selalu ada di sebelahku, dari yang nangis rebutan sepeda sampai yang sekarang nganterin aku pulang, padahal rumah kita cuma beda tiga pintu.\n\nTinggi kita udah lama berhenti nambah. Tapi kalau sayang bisa diukur di kusen, garisku buat kamu udah dari dulu tembus plafon.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Setinggi Ini',
      tagline: 'Garis-garis pensel pada bingkai pintu rumah: lukis satu demi satu dari kecil sampai sekarang, kemudian jumpa surat yang terselit di bingkainya.',
      steps: ['Ambil penselnya', 'Lukis setiap garis', 'Tarik surat dari bingkai'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Kenangan pada setiap garis, dari kecil sampai sekarang',
          hint: 'Satu garis satu kenangan, ikut turutan dari yang paling kecil. Garis terakhir ialah "sekarang".',
          placeholder: 'Setinggi ini masa…',
        },
        photos: {
          label: 'Foto pada setiap garis',
          hint: 'Pilihan. Foto pertama ditampal di sebelah garis pertama, dan seterusnya. Garis tanpa foto dapat lukisan kapur.',
        },
        title: { label: 'Ucapan utama', hint: 'Muncul apabila seluruh bingkai pintu kelihatan, selepas garis terakhir.' },
        message: { label: 'Surat', hint: 'Surat yang terselit di bingkai pintu, dibaca paling akhir.' },
      },
      sample: {
        to: 'Aqil',
        from: 'Nadhirah',
        title: 'Dari kecil sampai sekarang, tetap awak.',
        notes: [
          'Umur lima, jiran baru. Saya pinjam basikal, awak menangis.',
          'Hari jadi awak ketujuh. Saya tiup lilin dulu. Awak merajuk.',
          'Darjah empat. Telur dadar saya awak tukar dengan sardin.',
          'Tingkatan dua. Konon belajar sama-sama. Saya buat, awak tiru.',
          'Tingkatan empat. Awak tiba-tiba tinggi, lalu ajak tengok wayang.',
          'Awak masih sejengkal lebih tinggi. Bezanya, kini awak kekasih saya.',
        ],
        message:
          'Aqil, semalam saya singgah rumah awak, dan garis-garis pada bingkai pintu tu masih ada. Mak awak dulu ukur kita berdua setiap Raya, bergilir-gilir, sambil cakap, "Nadhirah, jangan jengket."\n\nDulu yang kita gaduhkan cuma siapa lebih tinggi. Awak kalah setiap tahun sampai darjah enam, kemudian tiba-tiba menang dan tak pernah kalah lagi. Saya geram. Diam-diam saya suka juga.\n\nRupa-rupanya bingkai pintu tu mencatat lebih daripada tinggi. Ia mencatat orang yang sentiasa ada di sebelah saya, daripada budak yang menangis berebut basikal sampailah orang yang sekarang hantar saya balik, padahal rumah kita cuma selang tiga pintu.\n\nTinggi kita dah lama berhenti. Tapi kalau sayang boleh diukur pada bingkai pintu, garis saya untuk awak dah lama tembus siling.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'This Tall',
      tagline: 'Pencil height marks on the door frame back home: draw them one by one, from little to now, then find the letter tucked into the frame.',
      steps: ['Take the pencil', 'Draw each mark', 'Pull the letter from the frame'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'A memory for each mark, from little to now',
          hint: 'One mark, one memory, starting with the smallest you. The last mark is "now".',
          placeholder: 'This tall when…',
        },
        photos: {
          label: 'A photo for each mark',
          hint: 'Optional. Photo 1 is taped next to mark 1, and so on. A mark without a photo gets a chalk doodle.',
        },
        title: { label: 'Main message', hint: 'Appears when the whole door frame comes into view, after the last mark.' },
        message: { label: 'Letter', hint: 'The letter tucked into the door frame, read at the very end.' },
      },
      sample: {
        to: 'Charlie',
        from: 'Rosie',
        title: 'From this tall to this tall, still you.',
        notes: [
          'Age five, new neighbors. I borrowed your bike. You cried.',
          'Your seventh birthday. I blew out your candles. You sulked.',
          'Fourth grade. You "borrowed" half my lunch every single day.',
          'Middle school. "Studying together": I studied, you copied.',
          'Junior year. You shot up overnight, then asked me to a movie.',
          'Still a hand taller than me. The difference is, now you are mine.',
        ],
        message:
          'Charlie, I stopped by your house yesterday, and the pencil marks on the door frame are still there. Your mom used to measure us both every summer, one after the other, saying, "Rosie, heels down."\n\nBack then, all we fought about was who was taller. You lost every year until sixth grade, then shot past me and never lost again. I was furious. Secretly, I was also glad.\n\nTurns out that frame measured more than height. It kept a record of the person who was always next to me, from the boy crying over his bike to the one who still walks me home, even though we live three doors apart.\n\nWe stopped growing a long time ago. But if love could be marked on a door frame, my line for you would have gone through the ceiling years ago.',
        photos: PHOTOS,
      },
    },
  },
};
