import type { Locale } from '@/i18n/config';

/** Teks antarmuka template Buket dalam tiga bahasa. {n}, {to}, {from}, {opened} diisi lewat fmt(). */
const id = {
  done: 'buketnya sudah jadi',
  titleFallback: 'Untuk {to}',
  bouquetFor: 'sebuah buket untuk',
  you: 'kamu',
  from: 'dari {from}',
  bouquet: 'Buket bunga',
  bloomed: 'Bunga {n} sudah mekar',
  bloom: 'Mekarkan bunga {n}',
  open: 'Buka suratnya →',
  count: '{opened} dari {n} bunga mekar',
  hint: 'Ketuk kuncupnya satu-satu',
  finale: 'Terselip di antara bunganya',
};

export const TEXT: Record<Locale, typeof id> = {
  id,
  ms: {
    done: 'jambangannya dah siap',
    titleFallback: 'Untuk {to}',
    bouquetFor: 'sejambak bunga untuk',
    you: 'awak',
    from: 'daripada {from}',
    bouquet: 'Jambangan bunga',
    bloomed: 'Bunga {n} dah mekar',
    bloom: 'Mekarkan bunga {n}',
    open: 'Buka suratnya →',
    count: '{opened} daripada {n} bunga mekar',
    hint: 'Ketuk kudup satu per satu',
    finale: 'Terselit di celah bunga',
  },
  en: {
    done: 'your bouquet is ready',
    titleFallback: 'For {to}',
    bouquetFor: 'a bouquet for',
    you: 'you',
    from: 'from {from}',
    bouquet: 'Flower bouquet',
    bloomed: 'Flower {n} has bloomed',
    bloom: 'Bloom flower {n}',
    open: 'Open the letter →',
    count: '{opened} of {n} flowers bloomed',
    hint: 'Tap the buds, one by one',
    finale: 'Tucked among the flowers',
  },
};
