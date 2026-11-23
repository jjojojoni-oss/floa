import { useLocale } from '@/i18n/client';
import type { Locale } from '@/i18n/config';

type LampionText = {
  eyebrow: string;
  you: string;
  fromName: string;
  /** narasi pembuka di dermaga, satu kalimat per ketukan; {to} = nama penerima */
  intro: string[];
  tapNext: string;
  /** harapan ke-n dari total */
  wishNo: string;
  /** label lampion terakhir */
  lastWish: string;
  /** kartu harapan sebelum lampionnya menyala */
  unlitCard: string;
  hintLight: string;
  hintRelease: string;
  lightAria: string;
  releaseAria: string;
  /** korek lembap di lampion pertama */
  damp: string;
  /** lampion yang malas terbang */
  lazy: string;
  lazyGo: string;
  /** jeda sebelum lampion terakhir */
  beforeLast: string;
  doneEyebrow: string;
  /** judul pengganti kalau ucapan utama kosong */
  titleFallback: string;
  /** narasi penutup setelah langit penuh */
  outro: string[];
  reread: string;
  rereadAria: string;
  letterHint: string;
  letterTo: string;
  letterAria: string;
  photoAlt: string;
  photoOpen: string;
  photoClose: string;
  finaleEyebrow: string;
};

export const TEXT: Record<Locale, LampionText> = {
  id: {
    eyebrow: 'harapan-harapan untuk',
    you: 'kamu',
    fromName: 'dari {name}',
    intro: [
      'Malam ini aku ke dermaga, bawa beberapa lampion.',
      'Tiap lampion aku tulisi satu harapan buat kamu. Tulisannya baru kelihatan kalau lampionnya menyala.',
      'Koreknya cuma satu. Kita nyalain pelan-pelan, satu-satu, ya.',
    ],
    tapNext: 'ketuk untuk lanjut',
    wishNo: 'harapan {n} dari {total}',
    lastWish: 'yang paling sering aku semogakan',
    unlitCard: 'tulisannya belum kelihatan',
    hintLight: 'Ketuk lampionnya untuk menyalakan',
    hintRelease: 'Geser ke atas atau ketuk lampionnya',
    lightAria: 'Nyalakan lampion {n}',
    releaseAria: 'Terbangkan lampion {n}',
    damp: 'Yah, koreknya lembap. Coba sekali lagi.',
    lazy: 'Yang ini kayaknya malas terbang…',
    lazyGo: '…eh, ternyata cuma nunggu angin.',
    beforeLast: 'Satu lagi. Yang ini paling sering aku semogakan, diam-diam.',
    doneEyebrow: 'langitnya penuh harapan',
    titleFallback: 'Untuk {to}',
    outro: [
      'Ternyata malam ini bukan cuma kita yang nitip harapan ke langit.',
      'Kalau suatu malam kamu lagi capek, lihat ke atas sebentar. Ada yang pernah nitip harapan buat kamu di sana.',
    ],
    reread: 'Ketuk lampionmu untuk membaca lagi',
    rereadAria: 'Baca lagi harapan {n}',
    letterHint: 'Ada satu lampion yang turun lagi. Ketuk suratnya.',
    letterTo: 'untuk {to}',
    letterAria: 'Ambil surat dari lampion',
    photoAlt: 'Foto untuk harapan {n}',
    photoOpen: 'Perbesar foto harapan {n}',
    photoClose: 'Tutup foto',
    finaleEyebrow: 'Dititipkan lewat lampion',
  },
  ms: {
    eyebrow: 'harapan-harapan untuk',
    you: 'awak',
    fromName: 'daripada {name}',
    intro: [
      'Malam ni aku ke jeti, bawa beberapa tanglung.',
      'Setiap tanglung aku tulis satu harapan untuk awak. Tulisannya cuma nampak bila tanglung tu menyala.',
      'Mancisnya ada satu je. Kita nyalakan perlahan-lahan, satu-satu, ya.',
    ],
    tapNext: 'ketik untuk teruskan',
    wishNo: 'harapan {n} daripada {total}',
    lastWish: 'yang paling kerap aku doakan',
    unlitCard: 'tulisannya belum nampak',
    hintLight: 'Ketik tanglung untuk menyalakan',
    hintRelease: 'Leret ke atas atau ketik tanglungnya',
    lightAria: 'Nyalakan tanglung {n}',
    releaseAria: 'Terbangkan tanglung {n}',
    damp: 'Alamak, mancisnya lembap. Cuba sekali lagi.',
    lazy: 'Yang ni macam malas nak terbang…',
    lazyGo: '…eh, rupanya tunggu angin je.',
    beforeLast: 'Satu lagi. Yang ni paling kerap aku doakan, diam-diam.',
    doneEyebrow: 'langit penuh harapan',
    titleFallback: 'Untuk {to}',
    outro: [
      'Rupanya malam ni bukan kita saja yang titip harapan ke langit.',
      'Kalau satu malam awak penat, pandang ke atas sekejap. Ada orang yang pernah titip harapan untuk awak di sana.',
    ],
    reread: 'Ketik tanglung awak untuk baca semula',
    rereadAria: 'Baca semula harapan {n}',
    letterHint: 'Ada satu tanglung yang turun semula. Ketik suratnya.',
    letterTo: 'untuk {to}',
    letterAria: 'Ambil surat daripada tanglung',
    photoAlt: 'Gambar untuk harapan {n}',
    photoOpen: 'Besarkan gambar harapan {n}',
    photoClose: 'Tutup gambar',
    finaleEyebrow: 'Dikirim bersama tanglung',
  },
  en: {
    eyebrow: 'wishes for',
    you: 'you',
    fromName: 'from {name}',
    intro: [
      'Tonight I took a few lanterns down to the pier.',
      'I wrote one wish for you on each of them. You can only read it once the lantern is lit.',
      'There’s just one match. Let’s light them slowly, one at a time.',
    ],
    tapNext: 'tap to continue',
    wishNo: 'wish {n} of {total}',
    lastWish: 'the one I wish for most',
    unlitCard: 'you can’t read it yet',
    hintLight: 'Tap the lantern to light it',
    hintRelease: 'Swipe up or tap to let it go',
    lightAria: 'Light lantern {n}',
    releaseAria: 'Release lantern {n}',
    damp: 'Oops, the match is damp. Try once more.',
    lazy: 'This one doesn’t feel like flying…',
    lazyGo: '…oh, it was just waiting for the wind.',
    beforeLast: 'One more. This is the one I wish for most, quietly.',
    doneEyebrow: 'a sky full of wishes',
    titleFallback: 'For {to}',
    outro: [
      'Turns out we weren’t the only ones sending wishes up tonight.',
      'If you’re ever tired some night, look up for a moment. Someone once sent a wish up there for you.',
    ],
    reread: 'Tap your lanterns to read them again',
    rereadAria: 'Read wish {n} again',
    letterHint: 'One lantern is coming back down. Tap the letter.',
    letterTo: 'for {to}',
    letterAria: 'Take the letter from the lantern',
    photoAlt: 'Photo for wish {n}',
    photoOpen: 'Enlarge the photo for wish {n}',
    photoClose: 'Close photo',
    finaleEyebrow: 'Sent up with the lanterns',
  },
};

export function useText() {
  return TEXT[useLocale()];
}
