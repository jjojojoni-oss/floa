import { useLocale } from '@/i18n/client';
import type { Locale } from '@/i18n/config';

type PlesterText = {
  healedEyebrow: string;
  /** judul pengganti kalau ucapan utama kosong */
  titleFallback: string;
  eyebrow: string;
  you: string;
  fromName: string;
  healedAria: string;
  brokenAria: string;
  stickAria: string;
  read: string;
  countAria: string;
  hint: string;
  finaleEyebrow: string;
};

export const TEXT: Record<Locale, PlesterText> = {
  id: {
    healedEyebrow: 'hatinya utuh lagi',
    titleFallback: 'Maaf ya, {to}',
    eyebrow: 'sebuah permintaan maaf untuk',
    you: 'kamu',
    fromName: 'dari {name}',
    healedAria: 'Hati yang sudah utuh lagi',
    brokenAria: 'Hati yang retak',
    stickAria: 'Tempel plester {n}',
    read: 'Baca suratnya →',
    countAria: '{stuck} dari {n} plester ditempel',
    hint: 'Ketuk plesternya, tempel di hati',
    finaleEyebrow: 'Dari hati yang sudah ditambal',
  },
  ms: {
    healedEyebrow: 'hatinya pulih semula',
    titleFallback: 'Maafkan aku, {to}',
    eyebrow: 'sebuah permohonan maaf untuk',
    you: 'awak',
    fromName: 'daripada {name}',
    healedAria: 'Hati yang dah pulih semula',
    brokenAria: 'Hati yang retak',
    stickAria: 'Tampal plaster {n}',
    read: 'Baca suratnya →',
    countAria: '{stuck} daripada {n} plaster ditampal',
    hint: 'Ketuk plaster, tampal di hati',
    finaleEyebrow: 'Dari hati yang dah ditampal',
  },
  en: {
    healedEyebrow: 'whole again',
    titleFallback: 'I’m sorry, {to}',
    eyebrow: 'an apology for',
    you: 'you',
    fromName: 'from {name}',
    healedAria: 'A heart made whole again',
    brokenAria: 'A broken heart',
    stickAria: 'Apply bandage {n}',
    read: 'Read the letter →',
    countAria: '{stuck} of {n} bandages on',
    hint: 'Tap a bandage to patch the heart',
    finaleEyebrow: 'From a mended heart',
  },
};

export function useText() {
  return TEXT[useLocale()];
}
