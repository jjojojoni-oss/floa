import type { TemplateMeta } from '../types';

/** foto ke-i ditempel di sebelah garis ke-i (urut dari kecil sampai sekarang) */
const PHOTOS = ['/contoh/melati.webp', '/contoh/kue-lilin.webp', '/contoh/sepeda.webp', '/contoh/nasi-kotak.webp', '/contoh/meja-belajar.webp', '/contoh/topi-wisuda.webp'];

export const meta: TemplateMeta = {
  id: 'pintu',
  name: 'Setinggi Ini',
  tagline: 'Garis-garis pensil di kusen pintu rumah: gores satu per satu dari kecil sampai sekarang, lalu temukan surat yang terselip di kusennya.',
  steps: ['Ambil pensilnya', 'Gores tiap garis', 'Tarik surat dari kusen'],
  occasions: ['ortu', 'ultah', 'wisuda'],
  palette: { bg: '#cfdcc0', ink: '#2f3327', accent: '#d9643a' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Ibu', max: 20 },
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
    to: 'Ibu',
    from: 'Arum',
    title: 'Terima kasih sudah menungguiku tumbuh',
    notes: [
      'Baru bisa jalan. Ke mana-mana megangin daster Ibu.',
      'Ulang tahun kelima. Kuenya Ibu bikin sendiri sampai subuh.',
      'Lepas roda bantu. Ibu lari di belakang, pura-pura masih megang.',
      'Bekal tiap pagi. Sayurnya kusisihkan, Ibu pura-pura nggak tahu.',
      'Belajar sampai malam. Teh hangat selalu muncul sendiri di meja.',
      'Sudah lebih tinggi dari Ibu. Tetap nyari Ibu tiap pulang.',
    ],
    message:
      'Bu, garis-garis di kusen itu masih ada. Aku cek kemarin. Yang paling bawah sudah hampir pudar, tapi aku masih ingat Ibu menggoresnya sambil bilang, "Cepat banget sih kamu gedenya."\n\nDulu kukira yang diukur itu cuma tinggiku. Ternyata tiap garis juga mencatat Ibu: yang bangun paling pagi, yang pura-pura sudah kenyang, yang menunggu di depan pintu sampai aku pulang.\n\nSekarang aku sudah nggak nambah tinggi, Bu. Tapi tiap pulang, aku masih berdiri di kusen itu sebentar. Bukan buat ngukur. Buat ingat siapa yang bikin aku bisa setinggi ini.\n\nTerima kasih, Bu. Untuk semua garisnya.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Setinggi Ini',
      tagline: 'Garis-garis pensel pada bingkai pintu rumah: lukis satu demi satu dari kecil sampai sekarang, kemudian jumpa surat yang terselit di bingkainya.',
      steps: ['Ambil penselnya', 'Lukis setiap garis', 'Tarik surat dari bingkai'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Mak' },
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
        to: 'Mak',
        from: 'Qistina',
        title: 'Terima kasih sebab tunggu saya membesar',
        notes: [
          'Baru pandai berjalan. Ke mana-mana pegang kain batik Mak.',
          'Hari jadi kelima. Keknya Mak buat sendiri sampai subuh.',
          'Buka roda bantu. Mak lari di belakang, pura-pura masih pegang.',
          'Bekal setiap pagi. Sayurnya saya asingkan, Mak buat-buat tak nampak.',
          'Belajar sampai malam. Teh panas selalu muncul sendiri atas meja.',
          'Dah lebih tinggi daripada Mak. Balik rumah, tetap cari Mak dulu.',
        ],
        message:
          'Mak, garis-garis pada bingkai pintu tu masih ada. Saya tengok semalam. Yang paling bawah dah hampir pudar, tapi saya masih ingat Mak melukisnya sambil cakap, "Cepatnya anak Mak ni membesar."\n\nDulu saya ingat yang diukur tu cuma tinggi saya. Rupa-rupanya setiap garis turut mencatat Mak: yang bangun paling awal, yang pura-pura dah kenyang, yang tunggu di depan pintu sampai saya balik.\n\nSekarang saya dah tak bertambah tinggi, Mak. Tapi setiap kali balik, saya masih berdiri di bingkai pintu tu sekejap. Bukan nak ukur. Nak ingat siapa yang buat saya boleh jadi setinggi ini.\n\nTerima kasih, Mak. Untuk semua garisnya.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'This Tall',
      tagline: 'Pencil height marks on the door frame back home: draw them one by one, from little to now, then find the letter tucked into the frame.',
      steps: ['Take the pencil', 'Draw each mark', 'Pull the letter from the frame'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Mom' },
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
        to: 'Mom',
        from: 'Ellie',
        title: 'Thank you for watching me grow',
        notes: [
          'Just learned to walk. Never let go of the hem of your dress.',
          'Turning five. You stayed up till dawn baking that cake.',
          'Training wheels off. You ran behind me, pretending to hold on.',
          'A packed lunch every morning. I hid the veggies. You let me.',
          'Studying late. Warm tea kept appearing on my desk by itself.',
          'Taller than you now. Still look for you first when I get home.',
        ],
        message:
          'Mom, the pencil marks on the door frame are still there. I checked yesterday. The lowest one has nearly faded, but I still remember you drawing it and saying, "Slow down, will you?"\n\nI used to think those lines only measured my height. Turns out every one of them recorded you too: the one who woke up first, who pretended she was already full, who waited by the door until I came home.\n\nI have stopped getting taller, Mom. But every time I visit, I still stand against that frame for a second. Not to measure. Just to remember who got me to be this tall.\n\nThank you, Mom. For every single line.',
        photos: PHOTOS,
      },
    },
  },
};
