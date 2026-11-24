import type { TemplateMeta } from '../types';

const PHOTOS = ['/contoh/jendela-pesawat.webp', '/contoh/dua-cangkir.webp', '/contoh/hujan-jendela.webp', '/contoh/peron-stasiun.webp', '/contoh/bintang-tenda.webp'];

export const meta: TemplateMeta = {
  id: 'bolakaca',
  name: 'Bola Kaca',
  tagline: 'Bola kaca berisi dunia tropis mungil: usap debunya, kocok pelan, lalu baca tulisan yang muncul di langitnya dari pagi sampai malam.',
  steps: ['Usap & kocok bolanya', 'Baca tulisan di langitnya', 'Surat di bawah alasnya'],
  occasions: ['kangen', 'anniv', 'ortu', 'ultah', 'maaf'],
  palette: { bg: '#dbe7f3', ink: '#22324a', accent: '#d9578a' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Yang muncul tiap bolanya dikocok',
      hint: 'Satu kalimat tiap kocokan, tertulis di langit dunia mungilnya. Waktunya ikut berjalan: pagi, siang, senja, lalu malam.',
      min: 3,
      count: 5,
      max: 70,
      placeholder: 'Kalimat yang muncul setelah kelopaknya turun',
    },
    {
      key: 'photos',
      label: 'Foto kecil yang ikut melayang',
      hint: 'Opsional. Foto ke-1 melayang di samping bola bersama kalimat ke-1, dan seterusnya.',
      count: 5,
      // tiap foto sudah berpasangan dengan kalimatnya sendiri
      captions: false,
    },
    { key: 'title', label: 'Tulisan di alas bola', hint: 'Terukir huruf demi huruf di pelat kuningan alasnya.', max: 30 },
    { key: 'message', label: 'Surat di bawah alasnya', hint: 'Terlipat di bawah alas bola, dibaca paling akhir.', max: 900, multiline: true },
  ],
  sample: {
    to: 'Anya',
    from: 'Rendra',
    title: 'Dari jauh, tetap kamu.',
    notes: [
      'Di sini masih jam 7 pagi, di tempatmu sudah siang. Tetap kuucap pagi.',
      'Kopi di sini enak, tapi pahit. Nggak ada kamu yang nyolong seteguk.',
      'Tiap hujan, aku ingat payung kuning yang kita pakai berdua di halte.',
      'Peron ini ramai, tapi mataku cuma nyari satu muka. Iya, mukamu.',
      'Bintang yang kamu lihat malam ini sama dengan punyaku. Itu cukup dulu.',
    ],
    message:
      'Anya, aku bikin bola kaca ini karena tiap kangen, rasanya kayak ada yang mengocok isi dadaku. Semuanya berantakan dulu, terus pelan-pelan turun lagi, dan yang tersisa selalu kamu.\n\nJarak kita sekarang tujuh jam dan dua kali transit. Tapi aku masih hafal cara kamu bilang "hati-hati" di ujung telepon: panjang, sedikit cemberut, seolah aku bakal lupa.\n\nSampai kita pulang ke rumah kecil yang sama, taruh bola ini di jendelamu, ya. Kalau rindu, kocok saja. Aku juga sedang melakukannya dari sini.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Bola Kaca',
      tagline: 'Bola kaca berisi dunia tropika kecil: sapu habuknya, goncang perlahan, lalu baca tulisan yang muncul di langitnya dari pagi hingga malam.',
      steps: ['Sapu & goncang bolanya', 'Baca tulisan di langitnya', 'Surat di bawah tapaknya'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Yang muncul setiap kali bola digoncang',
          hint: 'Satu ayat untuk setiap goncangan, tertulis di langit dunia kecilnya. Masanya turut berjalan: pagi, tengah hari, senja, lalu malam.',
          placeholder: 'Ayat yang muncul selepas kelopaknya turun',
        },
        photos: { label: 'Foto kecil yang turut melayang', hint: 'Pilihan. Foto pertama melayang di sisi bola bersama ayat pertama, dan seterusnya.' },
        title: { label: 'Tulisan di tapak bola', hint: 'Terukir huruf demi huruf pada plat tembaga di tapaknya.' },
        message: { label: 'Surat di bawah tapaknya', hint: 'Berlipat di bawah tapak bola, dibaca paling akhir.' },
      },
      sample: {
        to: 'Mira',
        from: 'Adam',
        title: 'Jauh pun, tetap awak.',
        notes: [
          'Di sini pukul 7 pagi, tempat awak dah tengah hari. Tetap selamat pagi.',
          'Kopi di sini sedap, tapi pahit. Tiada awak yang curi seteguk.',
          'Setiap kali hujan, saya teringat payung kuning kita di hentian bas.',
          'Platform ini sesak, tapi mata saya cari satu wajah. Ya, wajah awak.',
          'Bintang yang awak tengok malam ini sama dengan saya. Itu cukup dulu.',
        ],
        message:
          'Mira, saya buat bola kaca ini sebab setiap kali rindu, rasanya macam ada yang menggoncang isi dada saya. Semuanya berselerak dulu, kemudian perlahan-lahan turun semula, dan yang tinggal selalu awak.\n\nJarak kita sekarang tujuh jam dan dua kali transit. Tapi saya masih ingat cara awak sebut "hati-hati" di hujung telefon: panjang, sedikit merajuk, seolah-olah saya akan lupa.\n\nSampai kita balik ke rumah kecil yang sama, letak bola ini di tingkap awak, ya. Kalau rindu, goncang saja. Saya pun sedang buat begitu dari sini.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'Snow Globe',
      tagline: 'A snow globe with a tiny tropical world inside: wipe off the dust, give it a gentle shake, and read what appears in its sky from morning to night.',
      steps: ['Wipe & shake the globe', 'Read the words in its sky', 'The letter under the base'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'What appears each time it is shaken',
          hint: 'One line per shake, written across the sky of the tiny world. Time moves along too: morning, noon, sunset, then night.',
          placeholder: 'A line that appears once the petals settle',
        },
        photos: { label: 'A tiny photo that floats along', hint: 'Optional. Photo 1 floats beside the globe with line 1, and so on.' },
        title: { label: 'Words on the base', hint: 'Engraved letter by letter on the brass plate of the base.' },
        message: { label: 'The letter under the base', hint: 'Folded under the base of the globe, read last of all.' },
      },
      sample: {
        to: 'Ivy',
        from: 'Owen',
        title: 'Far away, still you.',
        notes: [
          'It is 7 a.m. here and already noon where you are. Good morning anyway.',
          'The coffee here is good, but bitter. Nobody is stealing my first sip.',
          'Every time it rains, I think of that yellow umbrella we shared.',
          'This platform is packed, and I am looking for one face. Yes, yours.',
          'The stars you see tonight are the same as mine. Enough for now.',
        ],
        message:
          'Ivy, I made you this snow globe because missing you feels like someone shaking everything inside my chest. It all goes everywhere at first, then slowly settles, and what is left is always you.\n\nRight now we are seven hours and two layovers apart. But I still know exactly how you say "be careful" at the end of every call: long, a little sulky, as if I might forget.\n\nUntil we are back in the same little house, keep this globe on your windowsill. When you miss me, just give it a shake. I am doing the same from here.',
        photos: PHOTOS,
      },
    },
  },
};
