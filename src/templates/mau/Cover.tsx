import { HEART } from './art';
import s from './style.module.css';

/* hati kecil penghias: [x, y, skala, putaran, opasitas] */
const HEARTS: [number, number, number, number, number][] = [
  [28, 34, 0.2, -14, 0.55],
  [172, 46, 0.26, 12, 0.5],
  [22, 150, 0.15, 10, 0.45],
  [180, 138, 0.13, -8, 0.5],
  [44, 222, 0.22, -10, 0.5],
];

/** Gambar kartu katalog: pertanyaannya, tombol "Mau", dan tombol "Nggak" yang kabur. */
export default function Cover() {
  return (
    <div className={s.cover}>
      <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" aria-hidden>
        {HEARTS.map(([x, y, k, r, o], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${k})`}>
            <path d={HEART} fill="#ff8fab" opacity={o} />
          </g>
        ))}

        <text x="100" y="82" textAnchor="middle" fontSize="37" fill="#4a1830" className={s.cvText}>
          Mau
        </text>
        <text x="100" y="118" textAnchor="middle" fontSize="37" fill="#4a1830" className={s.cvText}>
          nggak?
        </text>

        <g className={s.cvBeat}>
          <rect x="50" y="141" width="100" height="42" rx="21" fill="#d81f51" />
          <rect x="50" y="137" width="100" height="42" rx="21" fill="#ff3d6e" />
          <text x="100" y="164" textAnchor="middle" fontSize="18" fill="#fff" className={s.cvBtn}>
            Mau
          </text>
        </g>

        <g stroke="#4a1830" strokeOpacity=".28" strokeWidth="2.4" strokeLinecap="round">
          <path d="M86,214l-14,3" />
          <path d="M90,223l-18,6" />
          <path d="M96,231l-12,6" />
        </g>
        <g transform="translate(142 214) rotate(-11)">
          <g className={s.cvNo}>
            <rect x="-37" y="-15" width="74" height="30" rx="15" fill="#fff" stroke="#4a1830" strokeOpacity=".16" strokeWidth="1.4" />
            <text y="4.6" textAnchor="middle" fontSize="13" fill="#4a1830" className={s.cvBtn}>
              Nggak
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
