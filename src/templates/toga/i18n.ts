import { useLocale } from '@/i18n/client';
import type { Locale } from '@/i18n/config';

type TogaText = {
  eyebrowAfter: string;
  eyebrowBefore: string;
  /** nama pengganti kalau nama wisudawan kosong */
  nameFallback: string;
  fromName: string;
  openAria: string;
  paperEyebrow: string;
  /** judul pengganti kalau ucapan utama kosong */
  titleFallback: string;
  forName: string;
  forYou: string;
  throwAria: string;
  read: string;
  hintSwipe: string;
  hintTap: string;
  finaleEyebrow: string;
};

export const TEXT: Record<Locale, TogaText> = {
  id: {
    eyebrowAfter: 'resmi lulus!',
    eyebrowBefore: 'hari yang ditunggu-tunggu',
    nameFallback: 'Wisudawan',
    fromName: 'dari {name}',
    openAria: 'Buka gulungan ucapan',
    paperEyebrow: 'dengan bangga',
    titleFallback: 'Selamat wisuda!',
    forName: 'untuk {name}',
    forYou: 'untuk kamu',
    throwAria: 'Lempar toga ke atas',
    read: 'Baca isi gulungannya →',
    hintSwipe: 'Geser toganya ke atas',
    hintTap: 'Ketuk gulungannya',
    finaleEyebrow: 'Isi gulungannya',
  },
  ms: {
    eyebrowAfter: 'sah bergraduasi!',
    eyebrowBefore: 'hari yang dinanti-nantikan',
    nameFallback: 'Graduan',
    fromName: 'daripada {name}',
    openAria: 'Buka gulungan ucapan',
    paperEyebrow: 'dengan bangganya',
    titleFallback: 'Tahniah, graduan!',
    forName: 'untuk {name}',
    forYou: 'untuk awak',
    throwAria: 'Lambung topi ke atas',
    read: 'Baca isi gulungan →',
    hintSwipe: 'Leret topi ke atas',
    hintTap: 'Ketuk gulungan itu',
    finaleEyebrow: 'Isi gulungan',
  },
  en: {
    eyebrowAfter: 'officially a grad!',
    eyebrowBefore: 'the big day is here',
    nameFallback: 'Graduate',
    fromName: 'from {name}',
    openAria: 'Open the scroll',
    paperEyebrow: 'with pride',
    titleFallback: 'Congratulations!',
    forName: 'for {name}',
    forYou: 'for you',
    throwAria: 'Toss the cap up',
    read: 'Read the scroll →',
    hintSwipe: 'Swipe the cap up',
    hintTap: 'Tap the scroll',
    finaleEyebrow: 'Inside the scroll',
  },
};

export function useText() {
  return TEXT[useLocale()];
}
