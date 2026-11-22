import s from './style.module.css';

/* Bunga digambar dari kelopak yang diputar melingkar, jadi tiap jenis cukup dideskripsikan lapisannya. */

type Layer = { n: number; len: number; w: number; round?: number; fill: string; offset?: number };
type Spec = { layers: Layer[]; core: { r: number; fill: string; dots?: string }; bud: string };

export const KINDS = {
  dahlia: {
    layers: [
      { n: 11, len: 49, w: 22, fill: '#ee6f8c' },
      { n: 9, len: 37, w: 19, fill: '#f58ea6', offset: 18 },
      { n: 7, len: 24, w: 15, fill: '#fbb9c8', offset: 6 },
    ],
    core: { r: 6, fill: '#d9456a' },
    bud: '#ee6f8c',
  },
  daisy: {
    layers: [
      { n: 15, len: 48, w: 13, round: 0.5, fill: '#fffdf7' },
      { n: 15, len: 40, w: 11, round: 0.5, fill: '#f6eee2', offset: 12 },
    ],
    core: { r: 14, fill: '#ffc233', dots: '#e79a12' },
    bud: '#fff6e6',
  },
  cosmos: {
    layers: [
      { n: 8, len: 48, w: 30, round: 1, fill: '#ff8d5c' },
      { n: 8, len: 30, w: 16, round: 0.6, fill: '#ffab7f', offset: 22.5 },
    ],
    core: { r: 9, fill: '#ffd76a', dots: '#f2a51f' },
    bud: '#ff8d5c',
  },
  anemone: {
    layers: [
      { n: 7, len: 46, w: 34, round: 1, fill: '#b7a2ee' },
      { n: 6, len: 31, w: 24, round: 1, fill: '#cdbdf6', offset: 30 },
    ],
    core: { r: 11, fill: '#3c2b5e', dots: '#8f79c9' },
    bud: '#b7a2ee',
  },
  sunny: {
    layers: [
      { n: 16, len: 49, w: 14, fill: '#ffb627' },
      { n: 16, len: 41, w: 13, fill: '#ffcc4d', offset: 11.25 },
    ],
    core: { r: 16, fill: '#7a4a2b', dots: '#a8703f' },
    bud: '#ffbe35',
  },
} satisfies Record<string, Spec>;

export type Kind = keyof typeof KINDS;

function petal(len: number, w: number, round = 0) {
  const a = w * 0.55;
  const b = w * (0.5 + round * 0.22);
  const y1 = -len * 0.2;
  const y2 = -len * (0.86 + round * 0.18);
  return `M0,0C${a},${y1} ${b},${y2} 0,${-len}C${-b},${y2} ${-a},${y1} 0,0Z`;
}

export type FlowerPos = { kind: Kind; x: number; y: number; r: number };

/** Susunan kepala bunga untuk 3, 4, atau 5 tangkai (koordinat viewBox 300×360). */
export const LAYOUTS: Record<number, FlowerPos[]> = {
  3: [
    { kind: 'daisy', x: 92, y: 146, r: 40 },
    { kind: 'cosmos', x: 208, y: 146, r: 40 },
    { kind: 'dahlia', x: 150, y: 104, r: 50 },
  ],
  4: [
    { kind: 'daisy', x: 86, y: 132, r: 39 },
    { kind: 'cosmos', x: 214, y: 132, r: 39 },
    { kind: 'dahlia', x: 150, y: 92, r: 47 },
    { kind: 'anemone', x: 150, y: 180, r: 36 },
  ],
  5: [
    { kind: 'daisy', x: 84, y: 130, r: 39 },
    { kind: 'cosmos', x: 216, y: 130, r: 39 },
    { kind: 'dahlia', x: 150, y: 90, r: 47 },
    { kind: 'anemone', x: 112, y: 190, r: 34 },
    { kind: 'sunny', x: 190, y: 190, r: 34 },
  ],
};

function Flower({
  f,
  i,
  open,
  onTap,
}: {
  f: FlowerPos;
  i: number;
  open: boolean;
  onTap?: (i: number) => void;
}) {
  const spec: Spec = KINDS[f.kind];
  return (
    <g
      transform={`translate(${f.x} ${f.y})`}
      className={`${s.flower} ${open ? s.open : ''}`}
      style={{ ['--i' as string]: i }}
      onClick={onTap && !open ? () => onTap(i) : undefined}
      role={onTap ? 'button' : undefined}
      aria-label={onTap ? (open ? `Bunga ${i + 1} sudah mekar` : `Mekarkan bunga ${i + 1}`) : undefined}
      tabIndex={onTap && !open ? 0 : undefined}
      onKeyDown={
        onTap && !open
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTap(i);
              }
            }
          : undefined
      }
    >
      <circle className={s.ring} r={f.r * 0.9} />
      <g className={s.bloom}>
        <g transform={`scale(${f.r / 50})`}>
          {spec.layers.map((L, li) =>
            Array.from({ length: L.n }, (_, k) => (
              <g key={`${li}-${k}`} transform={`rotate(${(360 / L.n) * k + (L.offset ?? 0)})`}>
                <path
                  d={petal(L.len, L.w, L.round)}
                  fill={L.fill}
                  className={s.petal}
                  style={{ transitionDelay: `${li * 110 + k * 16}ms` }}
                />
              </g>
            )),
          )}
          <g className={s.core}>
            <circle r={spec.core.r} fill={spec.core.fill} />
            {spec.core.dots
              ? Array.from({ length: 8 }, (_, k) => {
                  const a = (Math.PI * 2 * k) / 8;
                  const rr = spec.core.r * 0.58;
                  return <circle key={k} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr} r={spec.core.r * 0.13} fill={spec.core.dots} />;
                })
              : null}
          </g>
          <g className={s.bud}>
            <path d="M0,20C22,12 24,-22 0,-44C-24,-22 -22,12 0,20Z" fill={spec.bud} />
            <path d="M0,20C10,6 9,-20 0,-44C-3,-18 -6,4 0,20Z" fill="#fff" opacity=".28" />
            <path d="M0,24C-20,22 -26,0 -17,-14C-12,2 -6,12 0,24Z" fill="#3f7d5c" />
            <path d="M0,24C20,22 26,0 17,-14C12,2 6,12 0,24Z" fill="#4e9a70" />
          </g>
        </g>
      </g>
      {onTap ? <circle r={f.r * 1.12} fill="transparent" className={s.hit} /> : null}
    </g>
  );
}

const FILLERS = [
  [58, 96], [70, 72], [46, 124], [242, 96], [230, 72], [254, 124], [118, 44], [182, 44], [150, 30], [98, 66], [202, 66],
];

const LEAF = 'M0,0C26,-40 22,-112 0,-150C-22,-112 -26,-40 0,0Z';

export function BouquetArt({
  open,
  tied,
  onTap,
  className,
}: {
  /** status mekar per bunga; panjangnya menentukan jumlah tangkai (3–5) */
  open: boolean[];
  tied: boolean;
  onTap?: (i: number) => void;
  className?: string;
}) {
  const n = Math.min(5, Math.max(3, open.length));
  const flowers = LAYOUTS[n];
  return (
    <svg viewBox="0 0 300 360" className={className} role="img" aria-label="Buket bunga">
      <ellipse cx="150" cy="348" rx="74" ry="7" fill="#000" opacity=".1" />

      {/* kertas belakang + tisu */}
      <path d="M48,168L150,142L252,168L188,346L112,346Z" fill="#ecd9bd" />
      <path
        d="M62,170q11,-12 22,0q11,-12 22,0q11,-12 22,0q11,-12 22,0q11,-12 22,0q11,-12 22,0q11,-12 22,0q11,-12 22,0L196,300L104,300Z"
        fill="#fffaf2"
      />

      {/* bunga kecil pengisi */}
      {FILLERS.map(([x, y], i) => (
        <path key={i} d={`M${x},${y}Q${(x + 150) / 2 + (x < 150 ? -14 : 14)},${(y + 250) / 2} 150,250`} stroke="#7fb092" strokeWidth="1.3" fill="none" />
      ))}
      {FILLERS.map(([x, y], i) => (
        <g key={i} className={s.filler} style={{ ['--i' as string]: i }}>
          <circle cx={x} cy={y} r="5.2" fill="#fffdf7" />
          <circle cx={x} cy={y} r="1.9" fill="#ffc233" />
        </g>
      ))}

      {/* daun */}
      <g transform="translate(150 266)">
        {[
          [-64, '#3f7d5c', 1.02],
          [-38, '#5a9f79', 1.1],
          [-14, '#3f7d5c', 1.16],
          [14, '#5a9f79', 1.16],
          [38, '#3f7d5c', 1.1],
          [64, '#5a9f79', 1.02],
        ].map(([a, c, k]) => (
          <g key={a as number} transform={`rotate(${a}) scale(${k})`}>
            <path d={LEAF} fill={c as string} />
            <path d="M0,-6L0,-140" stroke="#fff" strokeOpacity=".22" strokeWidth="1.4" />
          </g>
        ))}
      </g>

      {/* tangkai */}
      {flowers.map((f, i) => (
        <path
          key={i}
          d={`M${f.x},${f.y}Q${(f.x + 150) / 2},${f.y + 70} 150,270`}
          stroke="#4e8b67"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      ))}

      {flowers.map((f, i) => (
        <Flower key={i} f={f} i={i} open={!!open[i]} onTap={onTap} />
      ))}

      {/* kertas depan */}
      <path d="M48,168L164,240L152,346L112,346Z" fill="#e2c59d" />
      <path d="M252,168L136,240L148,346L188,346Z" fill="#d6b588" />
      <path d="M48,168L164,240" stroke="#fff" strokeOpacity=".35" strokeWidth="2" />
      <path d="M252,168L136,240" stroke="#fff" strokeOpacity=".3" strokeWidth="2" />
      <path d="M150,231L150,346" stroke="#b8956a" strokeOpacity=".5" strokeWidth="1.2" />

      {/* pita */}
      <g transform="translate(150 298)">
        <g className={`${s.bow} ${tied ? s.tied : ''}`}>
          <path d="M-51,-9Q0,6 51,-9L48,6Q0,21 -48,6Z" fill="var(--accent)" />
          <path d="M-3,6C-9,26 -18,38 -26,48L-13,44L-8,53C-3,38 1,22 3,6Z" fill="var(--accent)" />
          <path d="M3,6C9,26 18,38 26,48L13,44L8,53C3,38 -1,22 -3,6Z" fill="var(--accent)" filter="brightness(.9)" />
          <path d="M0,2C-22,-22 -50,-16 -46,2C-50,20 -22,22 0,2Z" fill="var(--accent)" />
          <path d="M0,2C22,-22 50,-16 46,2C50,20 22,22 0,2Z" fill="var(--accent)" />
          <path d="M0,2C-18,-10 -36,-8 -38,2C-36,10 -18,10 0,2Z" fill="#000" opacity=".14" />
          <path d="M0,2C18,-10 36,-8 38,2C36,10 18,10 0,2Z" fill="#000" opacity=".14" />
          <rect x="-7" y="-7" width="14" height="18" rx="5" fill="var(--accent)" />
          <rect x="-7" y="-7" width="14" height="18" rx="5" fill="#fff" opacity=".18" />
        </g>
      </g>
    </svg>
  );
}
