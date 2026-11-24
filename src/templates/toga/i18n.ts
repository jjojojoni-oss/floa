import { useLocale } from '@/i18n/client';
import type { Locale } from '@/i18n/config';
import type { IjazahText } from './Game';

type TogaText = {
  eyebrowAfter: string;
  eyebrowBefore: string;
  /** saat menelusuri perjalanan */
  eyebrowJourney: string;
  /** toga siap dilempar setelah perjalanan selesai */
  eyebrowArrive: string;
  /** nama pengganti kalau nama wisudawan kosong */
  nameFallback: string;
  fromName: string;
  /** pembuka sebelum langkah pertama */
  introLine: string;
  introCount: string;
  start: string;
  /** label kartu langkah: {i} dari {n} */
  step: string;
  next: string;
  prev: string;
  arrive: string;
  stepAria: string;
  /** pita setelah toga dilempar */
  ribbonAfter: string;
  pathAria: string;
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
  /** mini-game setelah toga dilempar */
  game: IjazahText;
};

export const TEXT: Record<Locale, TogaText> = {
  id: {
    eyebrowAfter: 'resmi lulus!',
    eyebrowBefore: 'hari yang ditunggu-tunggu',
    eyebrowJourney: 'jalan menuju toga',
    eyebrowArrive: 'satu langkah lagi',
    nameFallback: 'Wisudawan',
    fromName: 'dari {name}',
    introLine: 'Sebelum toganya dilempar, kita jalan pelan-pelan dulu ya.',
    introCount: '{n} langkah menuju hari ini',
    start: 'Mulai jalan',
    step: 'Langkah {i} dari {n}',
    next: 'Langkah berikutnya',
    prev: 'Langkah sebelumnya',
    arrive: 'Sampai juga',
    stepAria: 'Langkah {i} dari {n}: {text}',
    ribbonAfter: 'Semua langkah itu, terbayar hari ini.',
    pathAria: 'Langkah {i} dari {n}',
    openAria: 'Buka gulungan ucapan',
    paperEyebrow: 'dengan bangga',
    titleFallback: 'Selamat wisuda!',
    forName: 'untuk {name}',
    forYou: 'untuk kamu',
    throwAria: 'Lempar toga ke atas',
    read: 'Baca isi gulungannya →',
    hintSwipe: 'Ketuk atau geser toganya ke atas',
    hintTap: 'Ketuk gulungannya',
    finaleEyebrow: 'Isi gulungannya',
    game: {
      title: 'Kejar ijazahnya!',
      how: 'Anginnya iseng, ijazahnya terbang. Ketuk ijazahnya buat nangkep.',
      blow: 'Wusss! Ijazahnya terbang!',
      spots: [
        ['Eh, dibawa merpati!', 'Merpatinya cuma mau ikut foto wisuda.'],
        ['Nyangkut di pohon. Klasik.', 'Untung nggak nyangkut di got.'],
        ['Mendarat di kepala Ayah.', 'Ayah bangga. Pecinya juga.'],
      ],
      winTitle: 'Ijazah aman!',
      winLine: 'Diikat pita, biar nggak kabur lagi.',
      catchAria: 'Tangkap ijazahnya',
    },
  },
  ms: {
    eyebrowAfter: 'sah bergraduasi!',
    eyebrowBefore: 'hari yang dinanti-nantikan',
    eyebrowJourney: 'jalan menuju topi graduasi',
    eyebrowArrive: 'satu langkah lagi',
    nameFallback: 'Graduan',
    fromName: 'daripada {name}',
    introLine: 'Sebelum topi dilambung, kita berjalan perlahan-lahan dulu ya.',
    introCount: '{n} langkah menuju hari ini',
    start: 'Mula berjalan',
    step: 'Langkah {i} daripada {n}',
    next: 'Langkah seterusnya',
    prev: 'Langkah sebelumnya',
    arrive: 'Akhirnya sampai',
    stepAria: 'Langkah {i} daripada {n}: {text}',
    ribbonAfter: 'Setiap langkah itu, berbaloi hari ini.',
    pathAria: 'Langkah {i} daripada {n}',
    openAria: 'Buka gulungan ucapan',
    paperEyebrow: 'dengan bangganya',
    titleFallback: 'Tahniah, graduan!',
    forName: 'untuk {name}',
    forYou: 'untuk awak',
    throwAria: 'Lambung topi ke atas',
    read: 'Baca isi gulungan →',
    hintSwipe: 'Ketuk atau leret topi ke atas',
    hintTap: 'Ketuk gulungan itu',
    finaleEyebrow: 'Isi gulungan',
    game: {
      title: 'Kejar skrolnya!',
      how: 'Angin nakal, skrol terbang. Ketik skrolnya untuk tangkap.',
      blow: 'Wusss! Skrolnya terbang!',
      spots: [
        ['Eh, dibawa merpati!', 'Merpati tu cuma nak bergambar konvo.'],
        ['Tersangkut di pokok. Klasik.', 'Nasib baik tak masuk longkang.'],
        ['Mendarat atas kepala Ayah.', 'Ayah bangga. Songkoknya pun.'],
      ],
      winTitle: 'Skrol selamat!',
      winLine: 'Diikat reben, supaya tak lari lagi.',
      catchAria: 'Tangkap skrol',
    },
  },
  en: {
    eyebrowAfter: 'officially a grad!',
    eyebrowBefore: 'the big day is here',
    eyebrowJourney: 'the road to the cap',
    eyebrowArrive: 'one more step',
    nameFallback: 'Graduate',
    fromName: 'from {name}',
    introLine: "Before the cap goes up, let's walk the road again, slowly.",
    introCount: '{n} steps to today',
    start: 'Start walking',
    step: 'Step {i} of {n}',
    next: 'Next step',
    prev: 'Previous step',
    arrive: 'Made it',
    stepAria: 'Step {i} of {n}: {text}',
    ribbonAfter: 'Every step led here.',
    pathAria: 'Step {i} of {n}',
    openAria: 'Open the scroll',
    paperEyebrow: 'with pride',
    titleFallback: 'Congratulations!',
    forName: 'for {name}',
    forYou: 'for you',
    throwAria: 'Toss the cap up',
    read: 'Read the scroll →',
    hintSwipe: 'Tap or swipe the cap up',
    hintTap: 'Tap the scroll',
    finaleEyebrow: 'Inside the scroll',
    game: {
      title: 'Catch the diploma!',
      how: 'A cheeky gust stole the diploma. Tap it to catch it.',
      blow: 'Whoosh! There it goes!',
      spots: [
        ['A pigeon took it!', 'The pigeon just wanted a graduation photo.'],
        ['Stuck in a tree. Classic.', 'Lucky it missed the gutter.'],
        ['It landed on Dad’s head.', 'Dad’s proud. So is his hat.'],
      ],
      winTitle: 'Diploma secured!',
      winLine: 'Tied with a ribbon, so it can’t run off again.',
      catchAria: 'Catch the diploma',
    },
  },
};

export function useText() {
  return TEXT[useLocale()];
}
