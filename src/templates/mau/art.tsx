import s from './style.module.css';

export const HEART =
  'M0,38C-34,12 -50,-8 -50,-26C-50,-42 -38,-52 -24,-52C-13,-52 -4,-46 0,-37C4,-46 13,-52 24,-52C38,-52 50,-42 50,-26C50,-8 34,12 0,38Z';

const SPARK = 'M0,-10C1.2,-3 3,-1.2 10,0C3,1.2 1.2,3 0,10C-1.2,3 -3,1.2 -10,0C-3,-1.2 -1.2,-3 0,-10Z';

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

/** Ilustrasi perayaan: dua hati yang akhirnya berdampingan. */
export function TwoHearts({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 190" className={className} aria-hidden>
      <g stroke="#ff3d6e" strokeWidth="4" strokeLinecap="round" opacity=".55">
        <path d="M30,54l-14,-9" />
        <path d="M22,98l-17,2" />
        <path d="M210,48l14,-10" />
        <path d="M222,96l16,3" />
        <path d="M120,20l0,-15" />
      </g>
      <g transform="translate(148 104)">
        <g className={s.heartB}>
          <g transform="rotate(13) scale(.9)">
            <path d={HEART} fill="#ff8fab" />
            <path d="M-36,-30C-33,-41 -24,-46 -15,-45C-24,-41 -29,-35 -30,-26Z" fill="#fff" opacity=".45" />
          </g>
        </g>
      </g>
      <g transform="translate(96 94)">
        <g className={s.heartA}>
          <g transform="rotate(-10) scale(1.22)">
            <path d={HEART} fill="#ff3d6e" />
            <path d="M-36,-30C-33,-41 -24,-46 -15,-45C-24,-41 -29,-35 -30,-26Z" fill="#fff" opacity=".4" />
          </g>
        </g>
      </g>
      {[
        [38, 26, 1.1],
        [204, 150, 1.25],
        [196, 22, 0.8],
        [28, 150, 0.75],
      ].map(([x, y, k], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
          <path d={SPARK} fill="#ffb300" className={s.spark} style={{ animationDelay: `${i * -0.5}s` }} />
        </g>
      ))}
    </svg>
  );
}
