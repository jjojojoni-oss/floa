import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'plester',
  name: 'Plester Hati',
  tagline: 'Hati yang retak, ditambal plester satu per satu sampai utuh lagi.',
  steps: ['Tempel plester', 'Hatinya pulih', 'Baca permintaan maaf'],
  occasions: ['maaf'],
  palette: { bg: '#d6e6ec', ink: '#2f3b46', accent: '#e4506a' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Satu maaf per plester',
      hint: 'Muncul saat tiap plester ditempel. 3 sampai 4 plester.',
      min: 3,
      count: 4,
      max: 60,
      placeholder: 'Maaf, aku…',
    },
    { key: 'title', label: 'Ucapan utama', hint: 'Muncul saat hatinya utuh lagi.', max: 40 },
    { key: 'message', label: 'Surat permintaan maaf', max: 900, multiline: true },
    { key: 'photos', label: 'Foto', hint: 'Opsional, sampai 2 foto.', count: 2 },
  ],
  sample: {
    to: 'Dinda',
    from: 'Yoga',
    title: 'Aku minta maaf.',
    notes: [
      'Maaf, aku telat dan nggak ngabarin.',
      'Maaf, aku malah sibuk membela diri.',
      'Maaf, bikin kamu merasa sendirian.',
    ],
    message:
      'Aku salah, dan aku nggak mau ngeles lagi.\n\nKemarin kamu cuma butuh didengar, dan aku malah sibuk cari pembenaran. Aku ngerti kalau kamu masih butuh waktu.\n\nAku nggak minta langsung dimaafin. Aku cuma mau kamu tahu aku serius mau memperbaiki ini, pelan-pelan, mulai dari hal kecil.',
    photos: ['/art/foto-taman.webp'],
  },
  i18n: {
    ms: {
      name: 'Plaster Hati',
      tagline: 'Hati yang retak, ditampal plaster satu per satu sampai pulih semula.',
      steps: ['Tampal plaster', 'Hatinya pulih', 'Baca permohonan maaf'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Satu maaf setiap plaster',
          hint: 'Muncul setiap kali plaster ditampal. 3 hingga 4 plaster.',
          placeholder: 'Maaf, aku…',
        },
        title: { label: 'Ucapan utama', hint: 'Muncul bila hatinya pulih semula.' },
        message: { label: 'Surat permohonan maaf' },
        photos: { label: 'Gambar', hint: 'Pilihan, sehingga 2 gambar.' },
      },
      sample: {
        to: 'Farah',
        from: 'Amir',
        title: 'Aku minta maaf.',
        notes: [
          'Maaf, aku lambat dan tak bagi tahu.',
          'Maaf, aku sibuk sangat nak bela diri.',
          'Maaf, buat awak rasa keseorangan.',
        ],
        message:
          'Aku salah, dan aku tak nak bagi alasan lagi.\n\nSemalam awak cuma nak didengar, tapi aku sibuk cari alasan. Aku faham kalau awak masih perlukan masa.\n\nAku tak minta dimaafkan terus. Aku cuma nak awak tahu aku betul-betul nak baiki semua ni, perlahan-lahan, bermula dari benda kecil.',
        photos: ['/art/foto-taman.webp'],
      },
    },
    en: {
      name: 'Patch My Heart',
      tagline: 'A cracked heart, patched up one bandage at a time until it’s whole again.',
      steps: ['Stick on the bandages', 'Watch the heart heal', 'Read the apology'],
      fields: {
        to: { label: 'For', placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'One sorry per bandage',
          hint: 'Shown as each bandage goes on. 3 to 4 bandages.',
          placeholder: 'Sorry I…',
        },
        title: { label: 'Main line', hint: 'Appears when the heart is whole again.' },
        message: { label: 'Apology letter' },
        photos: { label: 'Photos', hint: 'Optional, up to 2 photos.' },
      },
      sample: {
        to: 'Chloe',
        from: 'Ryan',
        title: 'I’m sorry.',
        notes: [
          'Sorry I was late and didn’t text you.',
          'Sorry I got defensive instead of listening.',
          'Sorry I made you feel alone.',
        ],
        message:
          'I was wrong, and I’m done making excuses.\n\nYesterday you just needed to be heard, and I was too busy justifying myself. I understand if you still need some time.\n\nI’m not asking to be forgiven right away. I just want you to know I’m serious about making this right, slowly, starting with the small things.',
        photos: ['/art/foto-taman.webp'],
      },
    },
  },
};
