import s from './style.module.css';

/* Hanya ikon antarmuka kecil di sini; seluruh benda adegan adalah sprite lukisan (art/sprites/47-mau.js). */

const HEART =
  'M0,38C-34,12 -50,-8 -50,-26C-50,-42 -38,-52 -24,-52C-13,-52 -4,-46 0,-37C4,-46 13,-52 24,-52C38,-52 50,-42 50,-26C50,-8 34,12 0,38Z';

/** Ikon hati kecil di pil detak jantung. */
export function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="-52 -54 104 94" className={className} aria-hidden>
      <path d={HEART} />
    </svg>
  );
}

/** Garis detak jantung yang berjalan. Kecepatannya mengikuti --beat (detik per detak). */
export function Pulse({ className }: { className?: string }) {
  const beat = 'h26l5,-5l5,5h8l5,-24l8,44l6,-20h9l7,-7l7,7h24';
  return (
    <svg viewBox="0 0 480 60" preserveAspectRatio="none" className={className} aria-hidden>
      <g className={s.pulseRun}>
        <path d={`M0,34${beat}${beat}${beat}${beat}${beat}${beat}`} />
      </g>
    </svg>
  );
}
