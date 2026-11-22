import s from './style.module.css';

const BODY = 'M12,36C12,13 31,4 50,4C69,4 88,13 88,36C88,64 77,92 71,110L29,110C23,92 12,64 12,36Z';

/* [x, y, skala] dalam viewBox 200×250 */
const LANTERNS: [number, number, number][] = [
  [100, 128, 0.66],
  [44, 82, 0.34],
  [158, 64, 0.28],
  [150, 150, 0.2],
  [62, 160, 0.17],
  [112, 44, 0.15],
  [24, 136, 0.12],
  [178, 112, 0.11],
];

const STARS: [number, number, number][] = [
  [18, 22, 1.1], [52, 14, 0.8], [86, 30, 0.7], [128, 16, 1], [176, 28, 0.8], [190, 70, 0.7], [12, 64, 0.8],
  [74, 60, 0.6], [136, 96, 0.6], [30, 104, 0.6], [96, 84, 0.5], [168, 180, 0.6], [22, 178, 0.6],
];

/** Gambar kartu katalog: lampion-lampion yang sudah terbang di langit malam. */
export default function Cover() {
  return (
    <div className={s.cover}>
      <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <radialGradient id="lpc-body" cx="50%" cy="90%" r="98%">
            <stop offset="0" stopColor="#fff8d6" />
            <stop offset=".32" stopColor="#ffd77f" />
            <stop offset=".72" stopColor="#ff9f47" />
            <stop offset="1" stopColor="#e36a27" />
          </radialGradient>
          <radialGradient id="lpc-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffbe64" stopOpacity=".55" />
            <stop offset=".55" stopColor="#ff9646" stopOpacity=".15" />
            <stop offset="1" stopColor="#ff9646" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lpc-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2b2b66" />
            <stop offset="1" stopColor="#0c1130" />
          </linearGradient>
          <mask id="lpc-moon">
            <rect width="200" height="250" fill="#000" />
            <circle cx="30" cy="34" r="13" fill="#fff" />
            <circle cx="36" cy="30" r="11" fill="#000" />
          </mask>
        </defs>

        {STARS.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#fff8e6" opacity={0.5 + (i % 3) * 0.2} />
        ))}
        <circle cx="30" cy="34" r="13" fill="#fdf1d8" mask="url(#lpc-moon)" />

        <path d="M0,206C18,190 34,186 52,194C68,180 88,178 104,192C122,182 142,184 158,196C176,186 190,190 200,198L200,216L0,216Z" fill="#232a63" />
        <path d="M0,212C16,200 32,198 48,206C64,196 82,198 96,208C114,200 136,202 150,210C168,202 188,204 200,212L200,222L0,222Z" fill="#161c48" />
        <rect y="218" width="200" height="32" fill="url(#lpc-water)" />
        <g fill="#ffc878" opacity=".5">
          <rect x="82" y="226" width="36" height="1.6" rx=".8" />
          <rect x="90" y="233" width="20" height="1.6" rx=".8" />
          <rect x="86" y="240" width="28" height="1.6" rx=".8" />
        </g>

        {LANTERNS.map(([x, y, k], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
            <g className={s.cvLan}>
              <circle r="120" cy="10" fill="url(#lpc-glow)" />
              <g transform="translate(-50 -65)">
                <path d={BODY} fill="url(#lpc-body)" />
                <g fill="none" stroke="#c6541a" strokeOpacity=".3" strokeWidth="1.2">
                  <path d="M50,4C44,32 42,80 44,110" />
                  <path d="M50,4C56,32 58,80 56,110" />
                  <path d="M31,9C21,40 26,84 35,110" />
                  <path d="M69,9C79,40 74,84 65,110" />
                </g>
                <path d="M20,30C23,16 36,9 50,8C39,13 30,20 26,33Z" fill="#fff" opacity=".4" />
                <ellipse cx="50" cy="98" rx="26" ry="18" fill="#fffdf0" opacity=".7" />
                <rect x="27" y="107.5" width="46" height="6.5" rx="3.2" fill="#9c4614" />
              </g>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
