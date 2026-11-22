import s from './style.module.css';

/* Kue dua tingkat di atas tatakan. Semua koordinat memakai viewBox 300×345. */

export const VIEW = '0 0 300 345';
export const CANDLE_COLORS = ['#ff8fa3', '#7fd1c7', '#ffd36e', '#b7a2ee', '#ff9d5c'];

type Ell = { cx: number; cy: number; rx: number; ry: number; h: number };
const TOP: Ell = { cx: 150, cy: 152, rx: 62, ry: 12, h: 56 };
const BOT: Ell = { cx: 150, cy: 208, rx: 98, ry: 17, h: 70 };

export type Candle = { x: number; y: number; h: number; color: string };

/** Posisi lilin di atas kue untuk 3–5 batang. `y` = dasar lilin, nyala api di (x, y - h - 6). */
export function candles(n: number): Candle[] {
  const span = n <= 3 ? 62 : n === 4 ? 82 : 96;
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : i / (n - 1) - 0.5;
    const back = i % 2 === 0;
    return {
      x: TOP.cx + t * span,
      y: TOP.cy + (back ? -3 : 4),
      h: back ? 46 : 40,
      color: CANDLE_COLORS[i % CANDLE_COLORS.length],
    };
  });
}

const edge = (e: Ell, x: number, dy = 0) =>
  e.cy + dy + e.ry * Math.sqrt(Math.max(0, 1 - ((x - e.cx) / e.rx) ** 2));

function body(e: Ell) {
  const l = e.cx - e.rx;
  const r = e.cx + e.rx;
  return `M${l},${e.cy}L${l},${e.cy + e.h}A${e.rx},${e.ry} 0 0 0 ${r},${e.cy + e.h}L${r},${e.cy}Z`;
}

/** Lapisan krim: permukaan atas + lelehan di sisi depan. */
function frosting(e: Ell, depths: number[]) {
  const m = depths.length;
  const x0 = e.cx - e.rx;
  const w = (2 * e.rx) / m;
  let d = `M${x0},${e.cy}`;
  for (let k = 0; k < m; k++) {
    const xa = x0 + k * w;
    const xb = xa + w;
    const yb = edge(e, xa + w / 2) + depths[k];
    const y2 = k === m - 1 ? e.cy : edge(e, xb) + 3;
    d += `C${xa.toFixed(1)},${yb.toFixed(1)} ${xb.toFixed(1)},${yb.toFixed(1)} ${xb.toFixed(1)},${y2.toFixed(1)}`;
  }
  return `${d}A${e.rx},${e.ry} 0 0 0 ${x0},${e.cy}Z`;
}

function piping(e: Ell, m: number) {
  return Array.from({ length: m + 1 }, (_, k) => {
    const x = e.cx - e.rx + 5 + (k * (2 * e.rx - 10)) / m;
    return { x, y: edge(e, x, e.h) - 3 };
  });
}

const SPRINKLES: [number, number, number, string][] = [
  [78, 248, 20, '#fff4e2'], [98, 262, -30, '#ffd36e'], [120, 246, 60, '#7fd1c7'], [141, 266, 10, '#fff4e2'],
  [163, 250, -50, '#ffd36e'], [184, 264, 35, '#b7a2ee'], [204, 248, -15, '#fff4e2'], [224, 258, 70, '#7fd1c7'],
  [110, 276, 80, '#b7a2ee'], [172, 278, -70, '#fff4e2'], [214, 272, 25, '#ffd36e'], [70, 266, -40, '#7fd1c7'],
];

export function CakeBase({ n }: { n: number }) {
  const cs = candles(n);
  return (
    <g>
      <defs>
        <linearGradient id="lilin-side" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".16" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#3a1030" stopOpacity=".22" />
        </linearGradient>
      </defs>

      {/* tatakan */}
      <ellipse cx="150" cy="336" rx="92" ry="7" fill="#2a1030" opacity=".22" />
      <ellipse cx="150" cy="329" rx="52" ry="8.5" fill="#e3d4bd" />
      <ellipse cx="150" cy="326.5" rx="52" ry="8.5" fill="#fdf6ea" />
      <path d="M133,290Q141,312 126,326.5L174,326.5Q159,312 167,290Z" fill="#f1e6d4" />
      <path d="M150,290Q156,312 150,326.5L174,326.5Q159,312 167,290Z" fill="#dccbb2" opacity=".6" />
      <ellipse cx="150" cy="291" rx="120" ry="14.5" fill="#e3d4bd" />
      <ellipse cx="150" cy="287" rx="120" ry="14.5" fill="#fdf6ea" />
      <ellipse cx="150" cy="286" rx="104" ry="11" fill="#f1e6d4" />

      {/* tingkat bawah */}
      <path d={body(BOT)} fill="#f49db2" />
      <path d={body(BOT)} fill="url(#lilin-side)" />
      {SPRINKLES.map(([x, y, r, c], i) => (
        <rect key={i} x={x - 4.5} y={y - 1.6} width="9" height="3.2" rx="1.6" fill={c} transform={`rotate(${r} ${x} ${y})`} />
      ))}
      {piping(BOT, 12).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="6" fill="#fff4e2" />
      ))}
      <path d={frosting(BOT, [16, 30, 12, 26, 14, 34, 18, 10, 28, 15])} fill="#fff4e2" />
      <ellipse cx={BOT.cx} cy={BOT.cy} rx={BOT.rx - 5} ry={BOT.ry - 3} fill="#fffaf0" />

      {/* tingkat atas */}
      <ellipse cx="150" cy={BOT.cy + 2} rx="66" ry="12" fill="#3a1030" opacity=".12" />
      <path d={body(TOP)} fill="#9fdccd" />
      <path d={body(TOP)} fill="url(#lilin-side)" />
      {piping(TOP, 8).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="5" fill="#fff4e2" />
      ))}
      <path d={frosting(TOP, [12, 24, 10, 20, 28, 12, 18])} fill="#fff4e2" />
      <ellipse cx={TOP.cx} cy={TOP.cy} rx={TOP.rx - 4} ry={TOP.ry - 2.5} fill="#fffaf0" />

      {/* lilin */}
      {cs.map((c, i) => (
        <g key={i} transform={`translate(${c.x} ${c.y})`}>
          <ellipse cx="0" cy="0.5" rx="7" ry="2.4" fill="#3a1030" opacity=".16" />
          <rect x="-4.5" y={-c.h} width="9" height={c.h} rx="2.2" fill={c.color} />
          {[0.22, 0.48, 0.74].map((t) => {
            const y = -c.h * t;
            return <path key={t} d={`M-4.5,${y}L4.5,${y - 6}L4.5,${y - 1.5}L-4.5,${y + 4.5}Z`} fill="#fff" opacity=".75" />;
          })}
          <rect x="1.4" y={-c.h} width="3.1" height={c.h} rx="1.5" fill="#3a1030" opacity=".12" />
          <path d={`M0,${-c.h}L0,${-c.h - 6}`} stroke="#4a3140" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

/** Nyala api, digambar dengan pangkal di (0,0). */
export function FlameShape() {
  return (
    <>
      <path d="M0,1C10,-3 10,-16 0,-30C-10,-16 -10,-3 0,1Z" fill="#ff9a3c" />
      <path d="M0,0C6.5,-3 6.5,-12 0,-21C-6.5,-12 -6.5,-3 0,0Z" fill="#ffd45e" />
      <path d="M0,-1C3.4,-3 3.4,-8 0,-13C-3.4,-8 -3.4,-3 0,-1Z" fill="#fffbe6" />
    </>
  );
}

export function GlowDefs() {
  return (
    <defs>
      <radialGradient id="lilin-glow">
        <stop offset="0" stopColor="#ffd98a" stopOpacity=".85" />
        <stop offset=".35" stopColor="#ffb347" stopOpacity=".38" />
        <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/** Untaian bendera pesta. */
export function Bunting({ className }: { className?: string }) {
  const colors = ['#ff8fa3', '#ffd36e', '#7fd1c7', '#b7a2ee', '#ff9d5c'];
  const flags = Array.from({ length: 9 }, (_, k) => {
    const t = 0.07 + (k * 0.86) / 8;
    const x = -4 + 252 * t;
    const y = (1 - t) ** 2 * 5 + 2 * (1 - t) * t * 44 + t ** 2 * 5;
    const slope = Math.atan2(2 * (1 - 2 * t) * 39, 252) * (180 / Math.PI);
    return { x, y, slope, c: colors[k % colors.length] };
  });
  return (
    <svg viewBox="0 0 244 56" className={className} aria-hidden>
      <path d="M-4,5Q122,44 248,5" stroke="#8a5a6b" strokeWidth="1.4" fill="none" />
      {flags.map((f, k) => (
        <g key={k} transform={`translate(${f.x} ${f.y}) rotate(${f.slope})`}>
          <g className={s.flag} style={{ ['--i' as string]: k }}>
            <path d="M-11,-1L11,-1L0,22Z" fill={f.c} />
            <path d="M0,-1L11,-1L0,22Z" fill="#3a1030" opacity=".1" />
          </g>
        </g>
      ))}
    </svg>
  );
}
