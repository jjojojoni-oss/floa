import { useLocale } from '@/i18n/client';
import type { Locale } from '@/i18n/config';
import type { NyaliText } from './Game';

type MauText = {
  /** label tombol "Nggak" tiap kali dicoba ditekan; yang terakhir menyerah dan ikut bilang mau (jumlahnya harus sama di semua bahasa) */
  noLabels: string[];
  /** komentar di bawah pertanyaan, sejajar dengan noLabels */
  tease: string[];
  /** penanda tiap kalimat: "detak 2 dari 6" */
  beatOf: string;
  defaultQuestion: string;
  introFrom: string;
  introAnon: string;
  next: string;
  heartbeatOf: string;
  heartbeat: string;
  relieved: string;
  fromName: string;
  wait: string;
  hi: string;
  you: string;
  /** jeda sebelum pertanyaan */
  breathEyebrow: string;
  breath: string;
  breathSub: string;
  breathIn: string;
  breathOut: string;
  ready: string;
  yeay: string;
  pairYou: string;
  pairMe: string;
  so: string;
  yes: string;
  oneMore: string;
  /** kartu "hari kita mulai" */
  dayEyebrow: string;
  dayAt: string;
  dayNote: string;
  dayKeep: string;
  dayFile: string;
  read: string;
  tapNext: string;
  finaleTitle: string;
  finaleEyebrowFrom: string;
  finaleEyebrow: string;
  /** mini-game sebelum pertanyaan */
  game: NyaliText;
};

export const LOCALE_TAG: Record<Locale, string> = { id: 'id-ID', ms: 'ms-MY', en: 'en-US' };

export const TEXT: Record<Locale, MauText> = {
  id: {
    noLabels: ['Nggak', 'Yakin?', 'Coba pikir lagi', 'Tombolnya licin', 'Yang satunya aja', 'Masih usaha?', 'Ya udah, mau'],
    tease: [
      '',
      'Eh, tombolnya kabur.',
      'Dia memang susah ditangkap.',
      'Jarimu kurang cepat.',
      'Yang gede itu lho tombolnya.',
      'Nyerah aja, ya?',
      'Nah, gitu dong.',
    ],
    beatOf: 'detak {i} dari {n}',
    defaultQuestion: 'Mau nggak jadi pacarku?',
    introFrom: 'Ada yang mau aku bilang. Pelan-pelan ya, satu-satu.',
    introAnon: 'Ada yang mau dibilang. Pelan-pelan ya, satu-satu.',
    next: 'Lanjut',
    heartbeatOf: 'detak jantung {name}',
    heartbeat: 'detak jantung',
    relieved: 'lega',
    fromName: 'dari {name}',
    wait: 'sebentar ya',
    hi: 'Hai, {name}.',
    you: 'kamu',
    breathEyebrow: 'sebentar',
    breath: 'Oke. Tarik napas dulu.',
    breathSub: '(ini buat aku, bukan buat kamu)',
    breathIn: 'tarik…',
    breathOut: 'hembuskan…',
    ready: 'Ketuk kalau kamu sudah siap',
    yeay: 'Yeay!',
    pairYou: 'Kamu',
    pairMe: 'aku',
    so: 'jadi, {name}…',
    yes: 'Mau',
    oneMore: 'Satu lagi →',
    dayEyebrow: 'Hari kita mulai',
    dayAt: 'Kamu bilang mau jam {time}.',
    dayNote: 'Simpan baik-baik. Tahun depan kita rayakan.',
    dayKeep: 'Simpan kartunya',
    dayFile: 'hari-kita-mulai',
    read: 'Baca pesannya →',
    tapNext: 'Ketuk untuk lanjut',
    finaleTitle: 'Kamu bilang mau.',
    finaleEyebrowFrom: 'Pesan dari {name}',
    finaleEyebrow: 'Pesan buatmu',
    game: {
      titleFrom: 'Bantu {name} berani!',
      titleAnon: 'Bantu dia berani!',
      how: 'Ketuk hatinya beberapa kali sampai nyalinya penuh.',
      meter: 'nyali',
      stages: ['lutut gemeter…', 'keringet dingin…', 'oke… oke…', 'dikit lagi…!', 'BERANI!'],
      cheer: 'Semangatin!',
      pops: ['+nyali', 'kamu bisa!', 'tarik napas', 'ayo!', 'gas!'],
      winTitle: 'Nyali terkumpul!',
      winLine: 'Oke. Ada yang mau ditanyain. Dengerin, ya.',
    },
  },
  ms: {
    noLabels: ['Tak nak', 'Pasti ke?', 'Fikir balik', 'Butang licin', 'Yang satu lagi', 'Masih cuba?', 'Okey, nak'],
    tease: [
      '',
      'Eh, butangnya lari.',
      'Dia memang liat nak tangkap.',
      'Jari awak kurang laju.',
      'Yang besar tu lah butangnya.',
      'Mengalah je lah, ya?',
      'Haa, macam tu lah.',
    ],
    beatOf: 'degup {i} daripada {n}',
    defaultQuestion: 'Nak tak jadi kekasih aku?',
    introFrom: 'Ada benda aku nak cakap. Perlahan-lahan ya, satu-satu.',
    introAnon: 'Ada benda nak diberitahu. Perlahan-lahan ya, satu-satu.',
    next: 'Seterusnya',
    heartbeatOf: 'degup jantung {name}',
    heartbeat: 'degup jantung',
    relieved: 'lega',
    fromName: 'daripada {name}',
    wait: 'kejap ya',
    hi: 'Hai, {name}.',
    you: 'awak',
    breathEyebrow: 'kejap',
    breath: 'Okey. Tarik nafas dulu.',
    breathSub: '(ni untuk aku, bukan untuk awak)',
    breathIn: 'tarik…',
    breathOut: 'hembus…',
    ready: 'Ketuk bila awak dah sedia',
    yeay: 'Yeay!',
    pairYou: 'Awak',
    pairMe: 'aku',
    so: 'jadi, {name}…',
    yes: 'Nak',
    oneMore: 'Satu lagi →',
    dayEyebrow: 'Hari kita bermula',
    dayAt: 'Awak kata nak pada {time}.',
    dayNote: 'Simpan elok-elok. Tahun depan kita raikan.',
    dayKeep: 'Simpan kad ini',
    dayFile: 'hari-kita-bermula',
    read: 'Baca mesejnya →',
    tapNext: 'Ketuk untuk teruskan',
    finaleTitle: 'Awak kata nak.',
    finaleEyebrowFrom: 'Mesej daripada {name}',
    finaleEyebrow: 'Mesej untukmu',
    game: {
      titleFrom: 'Bantu {name} jadi berani!',
      titleAnon: 'Bantu dia jadi berani!',
      how: 'Ketik hatinya beberapa kali sampai beraninya penuh.',
      meter: 'berani',
      stages: ['lutut menggeletar…', 'peluh sejuk…', 'okey… okey…', 'sikit lagi…!', 'BERANI!'],
      cheer: 'Beri semangat!',
      pops: ['+berani', 'boleh!', 'tarik nafas', 'jom!', 'teruskan!'],
      winTitle: 'Berani dah penuh!',
      winLine: 'Okey. Ada benda nak ditanya. Dengar baik-baik.',
    },
  },
  en: {
    noLabels: ['No', 'Sure?', 'Think again', 'Slippery button', 'Try the other one', 'Still trying?', 'Fine, yes'],
    tease: [
      '',
      'Oops, it ran away.',
      'It’s a hard one to catch.',
      'Your finger’s too slow.',
      'The big button, silly.',
      'Just give in?',
      'There we go.',
    ],
    beatOf: 'beat {i} of {n}',
    defaultQuestion: 'Will you be mine?',
    introFrom: 'There’s something I want to say. Slowly, one at a time.',
    introAnon: 'There’s something to tell you. Slowly, one at a time.',
    next: 'Next',
    heartbeatOf: '{name}’s heartbeat',
    heartbeat: 'heartbeat',
    relieved: 'relieved',
    fromName: 'from {name}',
    wait: 'hold on',
    hi: 'Hi, {name}.',
    you: 'you',
    breathEyebrow: 'hold on',
    breath: 'Okay. Deep breath first.',
    breathSub: '(that one’s for me, not you)',
    breathIn: 'in…',
    breathOut: 'and out…',
    ready: 'Tap when you’re ready',
    yeay: 'Yay!',
    pairYou: 'You',
    pairMe: 'me',
    so: 'so, {name}…',
    yes: 'Yes',
    oneMore: 'One more thing →',
    dayEyebrow: 'The day we began',
    dayAt: 'You said yes at {time}.',
    dayNote: 'Keep it safe. We’ll celebrate it next year.',
    dayKeep: 'Save the card',
    dayFile: 'the-day-we-began',
    read: 'Read the message →',
    tapNext: 'Tap to continue',
    finaleTitle: 'You said yes.',
    finaleEyebrowFrom: 'A message from {name}',
    finaleEyebrow: 'A message for you',
    game: {
      titleFrom: 'Help {name} be brave!',
      titleAnon: 'Help them be brave!',
      how: 'Tap the heart a few times to fill up the courage.',
      meter: 'courage',
      stages: ['knees shaking…', 'cold sweat…', 'okay… okay…', 'almost…!', 'BRAVE!'],
      cheer: 'Cheer them on!',
      pops: ['+courage', 'you got this!', 'breathe', 'go!', 'nearly!'],
      winTitle: 'Courage: full!',
      winLine: 'Okay. There’s something to ask you. Listen closely.',
    },
  },
};

export function useText() {
  return TEXT[useLocale()];
}
