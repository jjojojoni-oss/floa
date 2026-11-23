import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'mau',
  name: 'Mau Nggak?',
  tagline: 'Detak demi detak, satu pertanyaan penting, dan tombol "nggak" yang susah banget ditangkap.',
  steps: ['Dengar detaknya', 'Jawab pertanyaannya', 'Simpan harinya'],
  occasions: ['nembak'],
  palette: { bg: '#f8c3ce', ink: '#5a1730', accent: '#e8315f' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Yang mau kamu bilang dulu',
      hint: 'Muncul satu per satu sebelum pertanyaannya, seperti detak jantung. Ceritakan hal kecil yang cuma kalian tahu. 3 sampai 6 kalimat.',
      min: 3,
      count: 6,
      max: 80,
      placeholder: 'Hal kecil tentang dia yang kamu ingat',
    },
    { key: 'photos', label: 'Foto kenangan', hint: 'Opsional, sampai 4 foto. Foto pertama muncul bersama kalimat pertama, dan seterusnya.', count: 4 },
    { key: 'title', label: 'Pertanyaannya', max: 44 },
    { key: 'message', label: 'Setelah dia jawab "mau"', hint: 'Surat terakhir, dibaca setelah kartu "Hari kita mulai".', max: 900, multiline: true },
  ],
  sample: {
    to: 'Kirana',
    from: 'Adit',
    title: 'Mau nggak jadi pacarku?',
    notes: [
      'Pertama ngopi bareng, kamu ketawa duluan sebelum jokeku selesai.',
      'Aku selalu bilang searah pulang. Padahal rumahku ke kiri.',
      'Sore itu langitnya bagus, tapi aku lebih banyak lihat kamu.',
      'Lagu yang kamu kirim jam dua pagi masih aku putar sampai sekarang.',
      'Aku nggak jago ngomong langsung, makanya aku bikin ini.',
      'Jadi kali ini aku mau jujur, tanpa bercanda.',
    ],
    message:
      'AKHIRNYA.\n\nJujur aku sudah nyiapin mental buat dua jawaban, tapi cuma nyiapin rencana buat yang ini.\n\nSabtu ini aku jemput jam 4. Kita makan di tempat yang kamu bilang "kapan-kapan" itu. Kapan-kapannya sekarang.\n\nMakasih sudah bilang mau. Aku janji jalan pulangnya nggak akan pura-pura searah lagi.',
    photos: ['/contoh/kopi-dan-kue.webp', '/contoh/jalan-hujan-malam.webp', '/contoh/balon.webp', '/contoh/hujan-jendela.webp'],
    captions: ['Kopi pertama. Kuenya kamu yang habisin.', 'Jalan pulang yang katanya searah.', 'Balonnya kamu sendiri yang pilih warnanya.', 'Jam dua pagi, lagunya diputar lagi.'],
  },
  i18n: {
    ms: {
      name: 'Nak Tak?',
      tagline: 'Degup demi degup, satu soalan penting, dan butang "tak nak" yang susah gila nak ditangkap.',
      steps: ['Dengar degupnya', 'Jawab soalannya', 'Simpan harinya'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Apa yang awak nak cakap dulu',
          hint: 'Muncul satu per satu sebelum soalannya, macam degup jantung. Ceritakan perkara kecil yang hanya korang tahu. 3 hingga 6 ayat.',
          placeholder: 'Perkara kecil tentang dia yang awak ingat',
        },
        photos: { label: 'Gambar kenangan', hint: 'Pilihan, sehingga 4 gambar. Gambar pertama muncul bersama ayat pertama, dan seterusnya.' },
        title: { label: 'Soalannya' },
        message: { label: 'Selepas dia jawab "nak"', hint: 'Surat terakhir, dibaca selepas kad "Hari kita bermula".' },
      },
      sample: {
        to: 'Aisyah',
        from: 'Hafiz',
        title: 'Nak tak jadi kekasih aku?',
        notes: [
          'Kali pertama minum kopi sama-sama, awak gelak sebelum lawak aku habis.',
          'Aku selalu kata kita sehala balik. Padahal rumah aku ke kiri.',
          'Petang tu langit cantik, tapi aku lebih banyak tengok awak.',
          'Lagu yang awak hantar pukul dua pagi tu, aku masih dengar sampai sekarang.',
          'Aku tak pandai cakap depan-depan, sebab tu aku buat ni.',
          'Jadi kali ni aku nak jujur, tanpa bergurau.',
        ],
        message:
          'AKHIRNYA.\n\nJujur, aku dah sedia mental untuk dua jawapan, tapi aku cuma buat rancangan untuk yang ini.\n\nSabtu ni aku ambil awak pukul 4. Kita makan kat tempat yang awak selalu cakap "nanti-nanti" tu. Nantinya sekarang.\n\nTerima kasih sebab kata nak. Aku janji lepas ni tak buat-buat sehala balik lagi.',
        photos: ['/contoh/kopi-dan-kue.webp', '/contoh/jalan-hujan-malam.webp', '/contoh/balon.webp', '/contoh/hujan-jendela.webp'],
        captions: ['Kopi pertama. Kuihnya awak yang habiskan.', 'Jalan balik yang kononnya sehala.', 'Belon tu, awak sendiri yang pilih warnanya.', 'Pukul dua pagi, lagu tu main lagi.'],
      },
    },
    en: {
      name: 'Will You?',
      tagline: 'Beat by beat, one big question, and a "no" button that’s really hard to catch.',
      steps: ['Feel the beats', 'Answer the question', 'Keep the day'],
      fields: {
        to: { label: 'For', placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'What you want to say first',
          hint: 'Shown one at a time before the question, like heartbeats. Tell them the little things only you two know. 3 to 6 lines.',
          placeholder: 'A little thing about them you remember',
        },
        photos: { label: 'Memory photos', hint: 'Optional, up to 4 photos. The first photo appears with the first line, and so on.' },
        title: { label: 'The question' },
        message: { label: 'After they say "yes"', hint: 'The last letter, read after the "The day we began" card.' },
      },
      sample: {
        to: 'Emma',
        from: 'Jake',
        title: 'Will you be my girlfriend?',
        notes: [
          'Our first coffee, you laughed before I even finished the joke.',
          'I always said I was heading your way. I live in the other direction.',
          'That sunset was beautiful, but I mostly watched you.',
          'The song you sent me at 2 a.m. is still on repeat.',
          'I’m bad at saying things out loud, so I made this instead.',
          'So this time I’m being honest. No jokes.',
        ],
        message:
          'FINALLY.\n\nHonestly, I was ready for either answer, but I only made plans for this one.\n\nI’m picking you up Saturday at 4. We’re going to that place you keep saying we’ll try "someday". Someday is now.\n\nThank you for saying yes. From now on, I’ll walk you home without pretending it’s on my way.',
        photos: ['/contoh/kopi-dan-kue.webp', '/contoh/jalan-hujan-malam.webp', '/contoh/balon.webp', '/contoh/hujan-jendela.webp'],
        captions: ['First coffee. You finished the cake.', 'The road home I said was on my way.', 'You picked the balloon colour yourself.', '2 a.m., that song on repeat.'],
      },
    },
  },
};
