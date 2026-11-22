import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'amplop',
  name: 'Amplop Rahasia',
  tagline: 'Surat bersegel lilin. Segelnya ditekan sampai patah, baru isinya terbaca.',
  steps: ['Balik amplop', 'Tahan segelnya', 'Baca surat'],
  occasions: ['ortu', 'maaf', 'kangen', 'sahabat', 'anniv'],
  palette: { bg: '#d5dbc0', ink: '#2c3122', accent: '#b3261e' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    { key: 'title', label: 'Judul surat', hint: 'Tertulis di kepala surat.', max: 40 },
    { key: 'message', label: 'Isi surat', hint: 'Tulis sepanjang yang kamu mau.', max: 1200, multiline: true },
    { key: 'photos', label: 'Foto', hint: 'Opsional, terselip di dalam amplop. Sampai 3 foto.', count: 3 },
  ],
  sample: {
    to: 'Mama',
    from: 'Kakak',
    title: 'Yang belum sempat aku bilang',
    notes: [],
    message:
      'Ma, aku jarang ngomong langsung, jadi aku tulis aja.\n\nMakasih buat bekal yang selalu ada padahal Mama juga buru-buru. Makasih sudah pura-pura nggak capek. Makasih buat doa yang aku tahu dikirim tiap malam, walau aku jarang nelpon.\n\nAku baik-baik di sini. Makan teratur (hampir). Nanti kalau pulang, aku yang masak. Mama duduk aja.',
    photos: ['/art/foto-kopi.webp', '/art/foto-gunung.webp'],
  },
  i18n: {
    ms: {
      name: 'Sampul Rahsia',
      tagline: 'Surat bermeterai lilin. Tekan meterainya sampai patah, baru isinya boleh dibaca.',
      steps: ['Terbalikkan sampul', 'Tahan meterai', 'Baca surat'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        title: { label: 'Tajuk surat', hint: 'Tertulis di kepala surat.' },
        message: { label: 'Isi surat', hint: 'Tulis sepanjang mana awak nak.' },
        photos: { label: 'Foto', hint: 'Pilihan, terselit dalam sampul. Sehingga 3 foto.' },
      },
      sample: {
        to: 'Mak',
        from: 'Along',
        title: 'Yang belum sempat Along cakap',
        notes: [],
        message:
          'Mak, Along jarang cakap depan-depan, jadi Along tulis je.\n\nTerima kasih untuk bekal yang sentiasa ada walaupun Mak pun kelam-kabut. Terima kasih sebab buat-buat tak penat. Terima kasih untuk doa yang Along tahu Mak kirim setiap malam, walaupun Along jarang telefon.\n\nAlong sihat kat sini. Makan ikut masa (hampir). Nanti bila balik, Along yang masak. Mak duduk je.',
        photos: ['/art/foto-kopi.webp', '/art/foto-gunung.webp'],
      },
    },
    en: {
      name: 'Sealed With Love',
      tagline: 'A wax-sealed letter. Press the seal until it cracks, and only then can it be read.',
      steps: ['Flip the envelope', 'Hold the seal', 'Read the letter'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        title: { label: 'Letter title', hint: 'Written at the top of the letter.' },
        message: { label: 'Your letter', hint: 'Write as much as you like.' },
        photos: { label: 'Photos', hint: 'Optional, tucked inside the envelope. Up to 3 photos.' },
      },
      sample: {
        to: 'Mom',
        from: 'Lily',
        title: 'What I never got around to saying',
        notes: [],
        message:
          "Mom, I don't say this out loud much, so I'm writing it down.\n\nThank you for the packed lunches that were always there, even when you were rushing too. Thank you for pretending you weren't tired. Thank you for the prayers I know you send every night, even though I don't call enough.\n\nI'm doing fine here. Eating properly (mostly). Next time I'm home, I'm cooking. You just sit down.",
        photos: ['/art/foto-kopi.webp', '/art/foto-gunung.webp'],
      },
    },
  },
};
