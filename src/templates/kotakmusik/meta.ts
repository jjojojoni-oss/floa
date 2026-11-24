import type { TemplateMeta } from '../types';

const PHOTOS = ['/contoh/melati.webp', '/contoh/masak-tungku.webp', '/contoh/meja-belajar.webp', '/contoh/kota-tua.webp', '/contoh/kue-lilin.webp'];

export const meta: TemplateMeta = {
  id: 'kotakmusik',
  name: 'Kotak Musik',
  tagline: 'Kotak musik antik di meja rias: putar kuncinya, angkat tutupnya, lalu buka laci-laci kecilnya satu per satu.',
  steps: ['Putar kuncinya', 'Buka tiap laci kecil', 'Surat di dasar kotak'],
  occasions: ['ultah', 'ortu', 'anniv', 'kangen'],
  palette: { bg: '#f3dfd0', ink: '#3a2420', accent: '#b5475a' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Isi tiap laci kecil',
      hint: 'Satu kalimat per laci. Yang terakhir masuk laci rahasia di bawah cermin, jadi simpan yang paling manis di akhir.',
      min: 3,
      count: 5,
      max: 70,
      placeholder: 'Secarik catatan untuk laci ini',
    },
    {
      key: 'photos',
      label: 'Foto kecil di tiap laci',
      hint: 'Opsional. Foto ke-1 masuk laci ke-1, dan seterusnya, sebagai pigura mungil di samping catatannya.',
      count: 5,
      // tiap foto sudah berpasangan dengan catatan lacinya
      captions: false,
    },
    { key: 'title', label: 'Ukiran di dalam tutup', hint: 'Terukir di cermin tutupnya dan menyala begitu kotak dibuka.', max: 40 },
    { key: 'message', label: 'Surat di dasar kotak', hint: 'Tersembunyi di bawah lapisan beludru, dibaca paling akhir.', max: 900, multiline: true },
  ],
  sample: {
    to: 'Bunda',
    from: 'Dira',
    title: 'Selamat ulang tahun, Bunda',
    notes: [
      'Melati di teras masih Bunda siram tiap pagi. Wanginya sampai kosanku.',
      'Sayur asem Bunda belum ada tandingannya. Aku sudah survei, lho.',
      'Maaf, dulu PR sering kubilang "sudah". Bunda tahu kok, cuma pura-pura.',
      'Tiap aku pulang, pintu sudah terbuka sebelum aku sempat ngetuk.',
      'Rahasia: makin gede aku makin mirip Bunda. Dan aku bangga banget.',
    ],
    message:
      'Bunda, kotak musik ini aku isi pelan-pelan, kayak Bunda dulu ngisi kotak bekalku: rapi, penuh, dan selalu ada bonus yang nggak aku minta.\n\nAku baru sadar, semua hal kecil yang Bunda kerjakan diam-diam itu ternyata yang paling kuingat. Seragam yang sudah disetrika sebelum subuh. Payung yang tahu-tahu ada di tas. Telepon jam sembilan malam yang cuma nanya, "Sudah makan?"\n\nSelamat ulang tahun, Bunda. Semoga sehat terus, lututnya nggak rewel, dan tanamannya makin rimbun. Minggu depan aku pulang. Sayur asemnya jangan lupa.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Kotak Muzik',
      tagline: 'Kotak muzik antik di atas meja solek: putar kuncinya, angkat penutupnya, lalu buka laci-laci kecilnya satu demi satu.',
      steps: ['Putar kuncinya', 'Buka setiap laci kecil', 'Surat di dasar kotak'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        title: { label: 'Ukiran di dalam penutup', hint: 'Terukir pada cermin penutupnya dan bercahaya sebaik kotak dibuka.' },
        notes: {
          label: 'Isi setiap laci kecil',
          hint: 'Satu ayat untuk setiap laci. Yang terakhir masuk laci rahsia di bawah cermin, jadi simpan yang paling manis di hujung.',
          placeholder: 'Secebis catatan untuk laci ini',
        },
        photos: { label: 'Foto kecil dalam setiap laci', hint: 'Pilihan. Foto pertama masuk laci pertama, dan seterusnya, sebagai bingkai comel di sisi catatannya.' },
        message: { label: 'Surat di dasar kotak', hint: 'Tersembunyi di bawah lapisan baldu, dibaca paling akhir.' },
      },
      sample: {
        to: 'Umi',
        from: 'Sarah',
        title: 'Selamat hari jadi, Umi',
        notes: [
          'Melur di beranda masih Umi siram tiap pagi. Wanginya sampai ke sini.',
          'Asam pedas Umi belum ada tandingan. Saya dah buat tinjauan merata.',
          'Maaf, dulu kerja sekolah selalu saya kata "dah siap". Umi tahu, kan.',
          'Setiap kali balik, pintu dah terbuka sebelum sempat saya ketuk.',
          'Rahsia: makin besar, makin saya serupa Umi. Dan saya bangga sangat.',
        ],
        message:
          'Umi, kotak muzik ini saya isi perlahan-lahan, macam Umi isi bekal saya dulu: kemas, penuh, dan mesti ada lebih yang saya tak minta pun.\n\nBaru saya sedar, semua benda kecil yang Umi buat diam-diam itulah yang paling saya ingat. Baju sekolah yang dah siap digosok sebelum subuh. Payung yang tiba-tiba ada dalam beg. Panggilan pukul sembilan malam yang cuma tanya, "Dah makan?"\n\nSelamat hari jadi, Umi. Semoga sihat selalu, lutut tak meragam, dan pokok-pokok makin subur. Minggu depan saya balik. Asam pedasnya jangan lupa.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'Music Box',
      tagline: 'An antique music box on the dresser: wind the key, lift the lid, then open its tiny drawers one by one.',
      steps: ['Wind the key', 'Open each tiny drawer', 'The letter at the bottom'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        title: { label: 'Engraving inside the lid', hint: 'Etched on the mirror in the lid, glowing the moment the box opens.' },
        notes: {
          label: 'What goes in each tiny drawer',
          hint: 'One line per drawer. The last one hides in the secret drawer under the mirror, so save the sweetest for the end.',
          placeholder: 'A little note for this drawer',
        },
        photos: { label: 'A tiny photo in each drawer', hint: 'Optional. Photo 1 goes in drawer 1, and so on, as a tiny framed picture next to its note.' },
        message: { label: 'The letter at the bottom', hint: 'Hidden under the velvet lining, read last of all.' },
      },
      sample: {
        to: 'Mum',
        from: 'Clara',
        title: 'Happy birthday, Mum',
        notes: [
          'You still water the jasmine every morning. I can smell it from here.',
          'Nobody makes soup like yours. I have done extensive field research.',
          'Sorry I kept saying my homework was "done". You knew. You always knew.',
          'Every time I come home, the door opens before I can knock.',
          'Secret: I turn into you a bit more each year. I could not be prouder.',
        ],
        message:
          'Mum, I filled this music box slowly, the way you used to pack my lunch: neat, full, and always with something extra I never asked for.\n\nI only just realised that all the small things you did quietly are the ones I remember best. The uniform ironed before sunrise. The umbrella that somehow appeared in my bag. The nine o\'clock call that only ever asked, "Have you eaten?"\n\nHappy birthday, Mum. I hope your knees behave and your plants keep taking over the porch. I am coming home next week. Please make the soup.',
        photos: PHOTOS,
      },
    },
  },
};
