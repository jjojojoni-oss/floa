import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'plester',
  name: 'Plester Hati',
  tagline: 'Akui retaknya satu per satu, tambal dengan janji, lalu tanya pelan-pelan.',
  steps: ['Dengar pengakuannya', 'Tempel janjinya', 'Baca suratnya'],
  occasions: ['maaf'],
  palette: { bg: '#d6e6ec', ink: '#2f3b46', accent: '#e4506a' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Pengakuan & janji, berpasangan',
      hint: 'Baris ganjil: yang kamu sadari salah (dibaca di retakan). Baris genap: janjimu untuk itu (tertulis di plester). 2 sampai 3 pasang.',
      min: 4,
      count: 6,
      max: 70,
      placeholder: 'Aku sadar… / Aku janji…',
    },
    { key: 'title', label: 'Ucapan utama', hint: 'Muncul saat hatinya utuh lagi.', max: 40 },
    { key: 'message', label: 'Surat permintaan maaf', max: 900, multiline: true },
    { key: 'photos', label: 'Foto', hint: 'Opsional, sampai 2 foto. Tampil bersama surat.', count: 2 },
  ],
  sample: {
    to: 'Dinda',
    from: 'Yoga',
    title: 'Aku minta maaf, Din.',
    notes: [
      'Aku sadar aku telat dua jam dan nggak ngabarin sama sekali.',
      'Kalau rencana berubah, kamu orang pertama yang aku kabari.',
      'Aku sadar waktu kamu marah, aku malah sibuk membela diri.',
      'Aku janji dengerin kamu sampai selesai, baru aku ngomong.',
      'Aku sadar malam itu kamu pulang dengan perasaan sendirian.',
      'Aku mau benar-benar ada buat kamu, bukan cuma bilang ada.',
    ],
    message:
      'Din, aku nulis ini pelan-pelan karena aku nggak mau salah lagi.\n\nMalam itu kamu nunggu dua jam di depan bioskop, dan yang kamu dapat cuma alasan dari aku. Kamu cuma butuh didengar, tapi aku malah sibuk membela diri. Aku ngerti kenapa kamu kecewa.\n\nAku nggak minta langsung dimaafin. Aku cuma mau kamu tahu aku serius, dan aku mau buktiin pelan-pelan, mulai dari hal-hal kecil yang selama ini aku anggap sepele.\n\nKalau kamu butuh waktu, aku tunggu.',
    photos: ['/contoh/bioskop.webp', '/contoh/mawar.webp'],
    captions: ['Kursi di sebelahmu yang kosong malam itu.', 'Bukan sogokan. Cuma mawar yang dulu kamu bilang paling cantik.'],
  },
  i18n: {
    ms: {
      name: 'Plaster Hati',
      tagline: 'Akui retaknya satu per satu, tampal dengan janji, kemudian tanya perlahan-lahan.',
      steps: ['Dengar pengakuannya', 'Tampal janjinya', 'Baca suratnya'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Pengakuan & janji, berpasangan',
          hint: 'Baris ganjil: apa yang awak sedar salah (dibaca di retakan). Baris genap: janji awak untuknya (tertulis di plaster). 2 hingga 3 pasang.',
          placeholder: 'Aku sedar… / Aku janji…',
        },
        title: { label: 'Ucapan utama', hint: 'Muncul bila hatinya pulih semula.' },
        message: { label: 'Surat permohonan maaf' },
        photos: { label: 'Gambar', hint: 'Pilihan, sehingga 2 gambar. Dipaparkan bersama surat.' },
      },
      sample: {
        to: 'Farah',
        from: 'Amir',
        title: 'Aku minta maaf, Farah.',
        notes: [
          'Aku sedar aku lambat dua jam dan langsung tak bagi tahu.',
          'Kalau rancangan berubah, awaklah orang pertama aku beritahu.',
          'Aku sedar bila awak marah, aku sibuk sangat nak bela diri.',
          'Aku janji dengar awak sampai habis dulu, baru aku bercakap.',
          'Aku sedar malam tu awak balik dengan rasa keseorangan.',
          'Aku nak betul-betul ada untuk awak, bukan sekadar cakap ada.',
        ],
        message:
          'Farah, aku tulis ni perlahan-lahan sebab aku tak nak silap lagi.\n\nMalam tu awak tunggu dua jam depan panggung wayang, dan yang awak dapat cuma alasan daripada aku. Awak cuma nak didengar, tapi aku sibuk bela diri. Aku faham kenapa awak kecewa.\n\nAku tak minta dimaafkan terus. Aku cuma nak awak tahu aku serius, dan aku nak buktikan perlahan-lahan, bermula dengan benda kecil yang selama ni aku pandang remeh.\n\nKalau awak perlukan masa, aku tunggu.',
        photos: ['/contoh/bioskop.webp', '/contoh/mawar.webp'],
        captions: ['Kerusi sebelah awak yang kosong malam tu.', 'Bukan rasuah. Cuma ros yang dulu awak kata paling cantik.'],
      },
    },
    en: {
      name: 'Patch My Heart',
      tagline: 'Own up to each crack, patch it with a promise, then gently ask.',
      steps: ['Hear the confession', 'Apply the promises', 'Read the letter'],
      fields: {
        to: { label: 'For', placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'What you realize & your promise, in pairs',
          hint: 'Odd lines: what you realize you did wrong (read on the cracks). Even lines: your promise for it (written on the bandage). 2 to 3 pairs.',
          placeholder: 'I realize… / I promise…',
        },
        title: { label: 'Main line', hint: 'Appears when the heart is whole again.' },
        message: { label: 'Apology letter' },
        photos: { label: 'Photos', hint: 'Optional, up to 2 photos. Shown with the letter.' },
      },
      sample: {
        to: 'Chloe',
        from: 'Ryan',
        title: 'I’m sorry, Chlo.',
        notes: [
          'I realize I was two hours late and didn’t text you once.',
          'If plans change, you’ll be the first person I tell.',
          'I realize when you were upset, I got defensive instead.',
          'I promise to hear you out completely before I say a word.',
          'I realize you went home that night feeling alone.',
          'I want to actually be there for you, not just say I am.',
        ],
        message:
          'Chloe, I’m writing this slowly because I don’t want to get it wrong again.\n\nThat night you waited two hours outside the cinema, and all you got from me was excuses. You just needed to be heard, and I was too busy defending myself. I understand why you’re hurt.\n\nI’m not asking to be forgiven right away. I just want you to know I’m serious, and I want to prove it slowly, starting with the small things I used to brush off.\n\nIf you need time, I’ll wait.',
        photos: ['/contoh/bioskop.webp', '/contoh/mawar.webp'],
        captions: ['The empty seat next to you that night.', 'Not a bribe. Just the roses you once said were the prettiest.'],
      },
    },
  },
};
