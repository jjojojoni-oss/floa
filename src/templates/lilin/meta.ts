import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  id: 'lilin',
  name: 'Tiup Lilin',
  tagline: 'Nyalakan lilinnya, buat permohonan, lalu tiup. Lampu menyala, pestanya mulai.',
  steps: ['Nyalakan lilin', 'Tahan untuk meniup', 'Baca ucapan'],
  occasions: ['ultah'],
  palette: { bg: '#2c1840', ink: '#fff1dc', accent: '#ffb347' },
  fields: [
    { key: 'to', label: 'Yang ulang tahun', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Satu doa per lilin',
      hint: 'Muncul saat tiap lilin dinyalakan. 3 sampai 5 lilin.',
      min: 3,
      count: 5,
      max: 60,
      placeholder: 'Doa atau harapan buat dia',
    },
    { key: 'title', label: 'Ucapan utama', hint: 'Muncul besar setelah lilin ditiup.', max: 40 },
    { key: 'message', label: 'Kartu ucapan', max: 900, multiline: true },
    { key: 'photos', label: 'Foto', hint: 'Opsional, sampai 4 foto.', count: 4 },
  ],
  sample: {
    to: 'Nadia',
    from: 'Rama',
    title: 'Selamat ulang tahun, Nad!',
    notes: [
      'Sehat terus, biar bisa jajan terus.',
      'Rezeki lancar, cicilan cepat lunas.',
      'Makin berani ambil yang kamu mau.',
      'Tetap jadi kamu yang aku kenal.',
    ],
    message:
      'Satu tahun lagi lewat, dan kamu masih orang yang sama: yang ketawanya paling kenceng, yang paling duluan nanya "udah makan belum?".\n\nSemoga tahun ini lebih ringan dari yang kemarin. Kalau ternyata berat, kabarin aku. Kita cari makan enak dulu, baru mikir.\n\nSelamat bertambah umur. Kuenya virtual, traktirannya beneran ya.',
    photos: ['/art/foto-taman.webp', '/art/foto-pantai.webp', '/art/foto-kota.webp'],
  },
};
