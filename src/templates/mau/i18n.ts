import { useLocale } from '@/i18n/client';
import type { Locale } from '@/i18n/config';

type MauText = {
  /** label tombol "Nggak" tiap kali dicoba ditekan; yang terakhir menyerah dan ikut bilang mau (jumlahnya harus sama di semua bahasa) */
  noLabels: string[];
  /** komentar di bawah pertanyaan, sejajar dengan noLabels */
  tease: string[];
  /** nomor catatan pembuka */
  words: string[];
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
  yeay: string;
  pairYou: string;
  pairMe: string;
  so: string;
  yes: string;
  read: string;
  tapNext: string;
  finaleTitle: string;
  finaleEyebrowFrom: string;
  finaleEyebrow: string;
};

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
    words: ['satu', 'dua', 'tiga'],
    defaultQuestion: 'Mau nggak jadi pacarku?',
    introFrom: 'Ada yang mau aku bilang.',
    introAnon: 'Ada yang mau dibilang.',
    next: 'Lanjut',
    heartbeatOf: 'detak jantung {name}',
    heartbeat: 'detak jantung',
    relieved: 'lega',
    fromName: 'dari {name}',
    wait: 'sebentar ya',
    hi: 'Hai, {name}.',
    you: 'kamu',
    yeay: 'Yeay!',
    pairYou: 'Kamu',
    pairMe: 'aku',
    so: 'jadi, {name}…',
    yes: 'Mau',
    read: 'Baca pesannya →',
    tapNext: 'Ketuk untuk lanjut',
    finaleTitle: 'Kamu bilang mau.',
    finaleEyebrowFrom: 'Pesan dari {name}',
    finaleEyebrow: 'Pesan buatmu',
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
    words: ['satu', 'dua', 'tiga'],
    defaultQuestion: 'Nak tak jadi kekasih aku?',
    introFrom: 'Ada benda aku nak cakap.',
    introAnon: 'Ada benda nak diberitahu.',
    next: 'Seterusnya',
    heartbeatOf: 'degup jantung {name}',
    heartbeat: 'degup jantung',
    relieved: 'lega',
    fromName: 'daripada {name}',
    wait: 'kejap ya',
    hi: 'Hai, {name}.',
    you: 'awak',
    yeay: 'Yeay!',
    pairYou: 'Awak',
    pairMe: 'aku',
    so: 'jadi, {name}…',
    yes: 'Nak',
    read: 'Baca mesejnya →',
    tapNext: 'Ketuk untuk teruskan',
    finaleTitle: 'Awak kata nak.',
    finaleEyebrowFrom: 'Mesej daripada {name}',
    finaleEyebrow: 'Mesej untukmu',
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
    words: ['one', 'two', 'three'],
    defaultQuestion: 'Will you be mine?',
    introFrom: 'There’s something I want to say.',
    introAnon: 'There’s something to tell you.',
    next: 'Next',
    heartbeatOf: '{name}’s heartbeat',
    heartbeat: 'heartbeat',
    relieved: 'relieved',
    fromName: 'from {name}',
    wait: 'hold on',
    hi: 'Hi, {name}.',
    you: 'you',
    yeay: 'Yay!',
    pairYou: 'You',
    pairMe: 'me',
    so: 'so, {name}…',
    yes: 'Yes',
    read: 'Read the message →',
    tapNext: 'Tap to continue',
    finaleTitle: 'You said yes.',
    finaleEyebrowFrom: 'A message from {name}',
    finaleEyebrow: 'A message for you',
  },
};

export function useText() {
  return TEXT[useLocale()];
}
