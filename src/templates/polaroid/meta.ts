import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'polaroid',
  name: 'Setumpuk Kenangan',
  tagline: 'Setumpuk foto yang digeser satu-satu, sampai surat di paling bawah.',
  steps: ['Geser fotonya', 'Baca catatan', 'Surat terakhir'],
  occasions: ['sahabat', 'anniv', 'ortu', 'ultah'],
  palette: { bg: '#e6c79c', ink: '#3a2416', accent: '#d9573a' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    { key: 'photos', label: 'Foto', hint: 'Paling pas 4 sampai 6 foto.', count: 6 },
    {
      key: 'notes',
      label: 'Catatan di bawah tiap foto',
      hint: 'Urut sesuai fotonya. Boleh dikosongkan.',
      min: 0,
      count: 6,
      max: 44,
      placeholder: 'Cerita singkat foto ini',
    },
    { key: 'title', label: 'Ucapan utama', max: 40 },
    { key: 'message', label: 'Surat di paling bawah', max: 900, multiline: true },
  ],
  sample: {
    to: 'Geng Kosan',
    from: 'Tari',
    title: 'Makasih buat semuanya.',
    notes: [
      'Hari pertama, masih pada jaim.',
      'Kopi ketiga minggu itu.',
      'Nyasar, tapi dapat sunset.',
      'Katanya cuma lihat-lihat.',
      'Liburan yang direncanain 2 tahun.',
      'Pulang kemalaman, lagi.',
    ],
    message:
      'Empat tahun, satu dapur, dan rice cooker yang entah punya siapa.\n\nAku nggak tahu nanti kita bakal kerja di kota mana. Yang aku tahu, grup ini jangan sampai sepi.\n\nMakasih sudah jadi keluarga yang aku pilih sendiri.',
    photos: ['/art/foto-kopi.webp', '/art/foto-kota.webp', '/art/foto-senja.webp', '/art/foto-taman.webp', '/art/foto-pantai.webp', '/art/foto-gunung.webp'],
  },
};
