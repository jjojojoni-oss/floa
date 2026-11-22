import { useLocale } from '@/i18n/client';
import type { Locale } from '@/i18n/config';

type LampionText = {
  doneEyebrow: string;
  /** judul pengganti kalau ucapan utama kosong */
  titleFallback: string;
  eyebrow: string;
  you: string;
  fromName: string;
  releaseAria: string;
  read: string;
  wishNo: string;
  countAria: string;
  hint: string;
  finaleEyebrow: string;
};

export const TEXT: Record<Locale, LampionText> = {
  id: {
    doneEyebrow: 'langitnya penuh harapan',
    titleFallback: 'Untuk {to}',
    eyebrow: 'harapan-harapan untuk',
    you: 'kamu',
    fromName: 'dari {name}',
    releaseAria: 'Terbangkan lampion {n}',
    read: 'Baca pesannya →',
    wishNo: 'harapan ke-{n}',
    countAria: '{cur} dari {n} lampion terbang',
    hint: 'Geser lampionnya ke atas',
    finaleEyebrow: 'Dititipkan lewat lampion',
  },
  ms: {
    doneEyebrow: 'langit penuh harapan',
    titleFallback: 'Untuk {to}',
    eyebrow: 'harapan-harapan untuk',
    you: 'awak',
    fromName: 'daripada {name}',
    releaseAria: 'Terbangkan tanglung {n}',
    read: 'Baca mesejnya →',
    wishNo: 'harapan ke-{n}',
    countAria: '{cur} daripada {n} tanglung terbang',
    hint: 'Leret tanglung ke atas',
    finaleEyebrow: 'Dikirim bersama tanglung',
  },
  en: {
    doneEyebrow: 'a sky full of wishes',
    titleFallback: 'For {to}',
    eyebrow: 'wishes for',
    you: 'you',
    fromName: 'from {name}',
    releaseAria: 'Release lantern {n}',
    read: 'Read the message →',
    wishNo: 'wish #{n}',
    countAria: '{cur} of {n} lanterns released',
    hint: 'Swipe the lantern up',
    finaleEyebrow: 'Sent up with the lanterns',
  },
};

export function useText() {
  return TEXT[useLocale()];
}
