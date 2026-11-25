import type { TemplateMeta } from '../types';

/** foto ke-i tergantung di dinding ruangan ke-i: ruang tamu, dapur, kamar tidur, loteng, teras */
const PHOTOS = ['/contoh/gandengan.webp', '/contoh/masak-tungku.webp', '/contoh/hujan-jendela.webp', '/contoh/karcis.webp', '/contoh/kopi-dan-kue.webp'];

export const meta: TemplateMeta = {
  id: 'rumah',
  name: 'Rumah Kecil Kita',
  tagline: 'Rumah boneka mungil di meja teras: pencet belnya, buka depannya seperti pintu lemari, lalu nyalakan lampu tiap ruangan. Di tiap ruangan ada satu kenangan.',
  steps: ['Pencet bel & buka rumahnya', 'Nyalakan lampu tiap ruangan', 'Surat di bawah keset'],
  occasions: ['ortu', 'anniv', 'kangen', 'ultah'],
  palette: { bg: '#efe2cf', ink: '#3b2a22', accent: '#d9694a' },
  fields: [
    { key: 'to', label: 'Untuk siapa', placeholder: 'Nama dia', max: 20 },
    { key: 'from', label: 'Dari', placeholder: 'Namamu', max: 20 },
    {
      key: 'notes',
      label: 'Isi tiap ruangan: satu kenangan',
      hint: 'Urutannya: ruang tamu, dapur, kamar tidur, loteng, teras. Kenangannya muncul saat lampu ruangan itu dinyalakan.',
      min: 3,
      count: 5,
      max: 70,
      placeholder: 'Kenangan kecil di ruangan ini',
    },
    {
      key: 'photos',
      label: 'Foto kecil di dinding',
      hint: 'Opsional. Foto ke-1 tergantung di dinding ruang tamu bersama kenangan ke-1, dan seterusnya.',
      count: 5,
      // tiap foto sudah berpasangan dengan kenangan di ruangannya
      captions: false,
    },
    { key: 'title', label: 'Tulisan di papan atas pintu', hint: 'Muncul di papan kayu di atas pintu begitu semua lampu menyala.', max: 40 },
    { key: 'message', label: 'Surat di bawah keset', hint: 'Terselip di bawah keset depan pintu, dibaca paling akhir.', max: 900, multiline: true },
  ],
  sample: {
    to: 'Salma',
    from: 'Ilham',
    title: 'Rumahnya nanti. Pulangnya ke kamu.',
    notes: [
      'Sofa abu-abu yang kamu screenshot tiga kali. Aku lihat. Aku catat.',
      'Aku yang masak, kamu yang nyicip sambil bilang "kurang garam".',
      'Jendela besar, buat dengerin hujan sambil debat mau nonton apa.',
      'Kardus buat semua tiket bioskop yang kamu simpan sejak kencan pertama.',
      'Dua kursi rotan, teh sore, dan kucing oren yang udah kamu kasih nama.',
    ],
    message:
      'Sal, rumahnya belum ada. Tanahnya juga belum. Yang ada baru tabungan bareng bernama "Rumah Kecil Kita", yang saldonya masih bikin kita ketawa tiap dicek.\n\nJadi aku bangun duluan di sini, kecil-kecil, satu ruangan satu janji. Sofanya abu-abu, sesuai screenshot-mu. Dapurnya cukup buat dua orang yang rebutan wajan. Terasnya buat si Oren, yang udah kamu kasih nama padahal kucingnya belum ada.\n\nAku nggak tahu rumahnya nanti di mana, besar atau kecil, cicilannya berapa tahun. Yang aku tahu cuma satu: tiap capek, yang aku cari bukan bangunannya. Tapi kamu yang bukain pintu.\n\nKita cicil bareng, ya. Rumahnya pelan-pelan, tapi pulangku udah ke kamu dari sekarang.',
    photos: PHOTOS,
  },
  i18n: {
    ms: {
      name: 'Rumah Kecil Kita',
      tagline: 'Rumah anak patung kecil di meja beranda: tekan locengnya, buka depannya macam pintu almari, kemudian hidupkan lampu setiap ruang. Setiap ruang ada satu kenangan.',
      steps: ['Tekan loceng & buka rumahnya', 'Hidupkan lampu setiap ruang', 'Surat di bawah alas kaki'],
      fields: {
        to: { label: 'Untuk siapa', placeholder: 'Nama dia' },
        from: { label: 'Daripada', placeholder: 'Nama awak' },
        notes: {
          label: 'Isi setiap ruang: satu kenangan',
          hint: 'Susunannya: ruang tamu, dapur, bilik tidur, loteng, beranda. Kenangannya muncul bila lampu ruang itu dihidupkan.',
          placeholder: 'Kenangan kecil di ruang ini',
        },
        photos: { label: 'Foto kecil di dinding', hint: 'Pilihan. Foto pertama tergantung di dinding ruang tamu bersama kenangan pertama, dan seterusnya.' },
        title: { label: 'Tulisan di papan atas pintu', hint: 'Muncul di papan kayu atas pintu sebaik semua lampu menyala.' },
        message: { label: 'Surat di bawah alas kaki', hint: 'Terselit di bawah alas kaki depan pintu, dibaca paling akhir.' },
      },
      sample: {
        to: 'Nisa',
        from: 'Fahmi',
        title: 'Rumahnya nanti. Awak dah jadi rumah.',
        notes: [
          'Sofa kelabu yang awak screenshot tiga kali. Saya nampak. Saya ingat.',
          'Saya yang masak, awak yang rasa sambil cakap "kurang garam".',
          'Tingkap besar, dengar hujan sambil bertekak nak tengok cerita apa.',
          'Kotak tiket wayang yang awak simpan sejak janji temu pertama kita.',
          'Dua kerusi rotan, teh petang, dan kucing oren yang awak dah namakan.',
        ],
        message:
          'Nisa, rumahnya belum ada. Tanahnya pun belum. Yang ada baru akaun simpanan bersama bernama "Rumah Kecil Kita", yang bakinya masih buat kita ketawa setiap kali tengok.\n\nJadi saya bina dulu di sini, kecil-kecil, satu ruang satu janji. Sofanya kelabu, ikut screenshot awak. Dapurnya cukup untuk dua orang yang berebut kuali. Berandanya untuk si Oren, yang awak dah namakan walaupun kucingnya belum ada.\n\nSaya tak tahu rumah tu nanti di mana, besar atau kecil, berapa tahun nak habis bayar. Yang saya tahu cuma satu: setiap kali penat, yang saya cari bukan bangunannya. Tapi awak yang bukakan pintu.\n\nKita kumpul sama-sama, ya. Rumahnya perlahan-lahan, tapi tempat saya pulang dah lama awak.',
        photos: PHOTOS,
      },
    },
    en: {
      name: 'Our Little House',
      tagline: 'A tiny dollhouse on the terrace table: ring the bell, swing the front open like a cabinet door, then turn on the light in every room. Each room keeps one memory.',
      steps: ['Ring the bell & open the house', 'Light up every room', 'The letter under the doormat'],
      fields: {
        to: { label: "Who it's for", placeholder: 'Their name' },
        from: { label: 'From', placeholder: 'Your name' },
        notes: {
          label: 'One memory for each room',
          hint: 'In this order: living room, kitchen, bedroom, attic, terrace. Each memory appears when that room lights up.',
          placeholder: 'A small memory from this room',
        },
        photos: { label: 'Tiny photos on the walls', hint: 'Optional. Photo 1 hangs on the living room wall with memory 1, and so on.' },
        title: { label: 'Words on the sign above the door', hint: 'Appears on the wooden sign above the door once every light is on.' },
        message: { label: 'The letter under the doormat', hint: 'Tucked under the doormat by the front door, read last of all.' },
      },
      sample: {
        to: 'Lucy',
        from: 'Matt',
        title: "The house can wait. You're already home.",
        notes: [
          'The gray sofa you screenshotted three times. Yes, I saw. Noted.',
          'I cook, you taste, and you always say it needs more salt.',
          'A big window to hear the rain while we argue over what to watch.',
          'A box for every movie ticket you have kept since our first date.',
          'Two rattan chairs, sunset tea, and the ginger cat you already named.',
        ],
        message:
          'Lucy, the house doesn\'t exist yet. Neither does the land. All we have is a joint savings account called "Our Little House", and the balance still makes us laugh every time we check it.\n\nSo I built it first, right here, tiny, one room for each promise. The sofa is gray, as per your screenshots. The kitchen fits two people fighting over one pan. The terrace is for Ginger, who already has a name even though we don\'t have a cat yet.\n\nI don\'t know where the house will be, how big it\'ll be, or how many years the mortgage will take. I only know this: whenever I\'m tired, it isn\'t a building I look for. It\'s you, opening the door.\n\nLet\'s save up together. The house can take its time. You\'ve been home for a while now.',
        photos: PHOTOS,
      },
    },
  },
};
