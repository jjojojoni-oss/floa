import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'lampion',
  name: 'Terbangkan Lampion',
  tagline: 'Malam di dermaga. Tiap lampion menyimpan satu harapan yang baru terbaca saat menyala, lalu diterbangkan satu per satu.',
  steps: ['Nyalakan lampionnya', 'Terbangkan satu per satu', 'Ambil surat yang turun'],
  occasions: ['kangen', 'anniv', 'ultah', 'wisuda'],
  palette: { bg: '#141c4a', ink: '#fdf1d8', accent: '#ffb85c' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Satu harapan per lampion',
      hint: '3 sampai 6 lampion. Yang terakhir jadi lampion paling spesial. Makin spesifik, makin kena.',
      min: 3,
      count: 6,
      max: 90,
      placeholder: 'Semoga…',
    },
    { key: 'title', label: 'Ucapan utama', hint: 'Muncul saat semua lampion sudah terbang.', max: 40 },
    { key: 'message', label: 'Surat', hint: 'Dibawa turun oleh satu lampion di akhir.', max: 900, multiline: true },
    // tiap foto sudah ikut lampionnya sendiri (foto ke-i bersama harapan ke-i), jadi tak perlu kolom cerita foto
    { key: 'photos', label: 'Foto', hint: 'Opsional. Foto ke-1 ikut lampion ke-1, dan seterusnya.', count: 6, captions: false },
  ],
  sample: {
    to: 'Bima',
    from: 'Sasa',
    title: 'Sampai ketemu, ya.',
    notes: [
      'Semoga pesawatmu nanti nggak delay, dan kamu dapat kursi dekat jendela.',
      'Semoga kos barumu nggak bocor lagi kalau hujan, dan ibu kosnya tetap baik.',
      'Semoga kerjaanmu di sana lancar, dan bosmu berhenti telepon jam sepuluh malam.',
      'Semoga kamu nggak lupa makan. Nasi kotak rapat boleh, mie instan nggak dihitung.',
      'Semoga pulangmu nanti lebih lama dari dua hari, dan kita sempat ke pantai lagi.',
    ],
    message:
      'Di sini sudah malam, di sana baru sore. Lucu ya, kita lihat langit yang sama tapi jamnya beda.\n\nAku nggak minta kamu cepat pulang. Aku cuma mau kamu tahu: tiap kamu capek, ada yang nungguin kabarmu di sini.\n\nLampion-lampion tadi sudah terbang semua. Harapan yang paling besar aku simpan, biar aku bilang langsung pas kita ketemu.',
    photos: ['/contoh/jendela-pesawat.webp', '/contoh/hujan-jendela.webp', '/contoh/jakarta-malam.webp', '/contoh/nasi-kotak.webp', '/contoh/pantai-pasir.webp'],
  },
  i18n: {
    ms: {
      name: 'Tanglung Harapan',
      tagline: 'Malam di jeti. Setiap tanglung menyimpan satu harapan yang cuma terbaca bila menyala, lalu diterbangkan satu demi satu.',
      steps: ['Nyalakan tanglungnya', 'Terbangkan satu demi satu', 'Ambil surat yang turun'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: { label: 'Satu harapan setiap tanglung', hint: '3 hingga 6 tanglung. Yang terakhir jadi tanglung paling istimewa. Makin spesifik, makin kena.', placeholder: 'Semoga…' },
        title: { label: 'Ucapan utama', hint: 'Muncul bila semua tanglung dah terbang.' },
        message: { label: 'Surat', hint: 'Dibawa turun oleh satu tanglung di akhir.' },
        photos: { label: 'Gambar', hint: 'Pilihan. Gambar pertama ikut tanglung pertama, dan seterusnya.' },
      },
      sample: {
        to: 'Irfan',
        from: 'Nurul',
        title: 'Jumpa lagi, ya.',
        notes: [
          'Semoga flight awak nanti tak delay, dan awak dapat tempat duduk tepi tingkap.',
          'Semoga bilik sewa baru awak tak bocor lagi bila hujan, dan tuan rumahnya kekal baik.',
          'Semoga kerja awak kat sana lancar, dan bos awak berhenti telefon pukul sepuluh malam.',
          'Semoga awak tak lupa makan. Nasi kotak mesyuarat pun boleh, Maggi tak dikira.',
          'Semoga nanti awak balik lebih lama dari dua hari, dan kita sempat ke pantai lagi.',
        ],
        message:
          'Kat sini dah malam, kat sana baru petang. Kelakar kan, kita tengok langit yang sama tapi jamnya lain.\n\nAku tak minta awak cepat balik. Aku cuma nak awak tahu: setiap kali awak penat, ada orang yang tunggu khabar awak kat sini.\n\nTanglung-tanglung tadi dah terbang semua. Harapan yang paling besar aku simpan, biar aku cakap sendiri bila kita jumpa.',
        photos: ['/contoh/jendela-pesawat.webp', '/contoh/hujan-jendela.webp', '/contoh/jakarta-malam.webp', '/contoh/nasi-kotak.webp', '/contoh/pantai-pasir.webp'],
      },
    },
    en: {
      name: 'Lantern Wishes',
      tagline: 'A night on the pier. Each lantern holds one wish you can only read once it’s lit, then lets it go into the sky, one by one.',
      steps: ['Light the lantern', 'Let them go one by one', 'Catch the letter that drifts down'],
      fields: {
        to: { label: 'For', placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: { label: 'One wish per lantern', hint: '3 to 6 lanterns. The last one becomes the special lantern. The more specific, the better.', placeholder: 'I hope…' },
        title: { label: 'Main greeting', hint: 'Appears once every lantern is in the sky.' },
        message: { label: 'Letter', hint: 'One lantern carries it back down at the end.' },
        photos: { label: 'Photos', hint: 'Optional. Photo 1 goes with lantern 1, and so on.' },
      },
      sample: {
        to: 'Ben',
        from: 'Sophie',
        title: 'See you soon, okay?',
        notes: [
          'I hope your flight leaves on time, and you get the window seat.',
          'I hope your new place stops leaking when it rains, and your landlord stays kind.',
          'I hope work goes well over there, and your boss stops calling at ten at night.',
          'I hope you remember to eat. Office lunch boxes count, instant noodles don’t.',
          'I hope your next visit lasts longer than two days, and we make it to the beach again.',
        ],
        message:
          'It’s already night here, and still afternoon where you are. Funny, isn’t it? Same sky, different clocks.\n\nI’m not asking you to hurry home. I just want you to know: whenever you’re tired, someone here is waiting to hear from you.\n\nThe lanterns are all up there now. I kept the biggest wish to myself, so I can tell you in person when we meet.',
        photos: ['/contoh/jendela-pesawat.webp', '/contoh/hujan-jendela.webp', '/contoh/jakarta-malam.webp', '/contoh/nasi-kotak.webp', '/contoh/pantai-pasir.webp'],
      },
    },
  },
};
