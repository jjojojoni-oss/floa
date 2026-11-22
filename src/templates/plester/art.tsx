import type { CSSProperties, PointerEvent as RPointerEvent } from 'react';
import s from './style.module.css';

/* Hati retak + plester. Semua dalam satu SVG (viewBox 300×400) supaya plester
   bisa terbang dari nampan ke retakan dalam satu sistem koordinat. */

const CRACK = 'L138,84L160,112L140,146L162,180L144,214';
export const LEFT = `M150,262C60,196 20,140 20,90C20,46 54,18 92,18C118,18 138,32 150,52${CRACK}Z`;
export const RIGHT = `M150,262C240,196 280,140 280,90C280,46 246,18 208,18C182,18 162,32 150,52${CRACK}Z`;
const CRACK_LINE = `M150,52${CRACK}L150,262`;

export const PLASTER_COLORS: { base: string; pad: string }[] = [
  { base: '#f3c39a', pad: '#fbe5d0' },
  { base: '#ffb0bf', pad: '#ffe2e8' },
  { base: '#a8dcc8', pad: '#def4eb' },
  { base: '#ffd97a', pad: '#fff1c6' },
];

/** Tempat plester menempel di retakan: [x, y, sudut]. */
export const SLOTS: Record<number, [number, number, number][]> = {
  3: [
    [150, 82, -22],
    [150, 134, 17],
    [149, 214, -14],
  ],
  4: [
    [150, 80, -22],
    [150, 132, 18],
    [150, 204, -16],
    [149, 234, 13],
  ],
};

/** Posisi plester saat masih di nampan. */
export function trayX(i: number, n: number) {
  const span = n === 3 ? 62 : 52;
  return 150 + (i - (n - 1) / 2) * span;
}
export const TRAY_Y = 346;

export function Plaster({ color }: { color: { base: string; pad: string } }) {
  return (
    <>
      <rect x="-42" y="-13" width="84" height="28" rx="14" fill="#000" opacity=".12" />
      <rect x="-42" y="-14" width="84" height="28" rx="14" fill={color.base} />
      <rect x="-38" y="-11.5" width="76" height="7" rx="3.5" fill="#fff" opacity=".25" />
      <rect x="-15" y="-10.5" width="30" height="21" rx="5" fill={color.pad} />
      <g fill="#000" opacity=".13">
        {[-33, -25].map((x) =>
          [-4.5, 4.5].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.7" />),
        )}
        {[33, 25].map((x) =>
          [-4.5, 4.5].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.7" />),
        )}
      </g>
    </>
  );
}

export type PlasterState =
  | { at: 'tray' }
  | { at: 'drag'; x: number; y: number }
  | { at: 'heart'; slot: number };

export function HeartArt({
  n,
  states,
  healed,
  className,
  svgRef,
  onTap,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  n: number;
  states: PlasterState[];
  healed: boolean;
  className?: string;
  svgRef?: React.Ref<SVGSVGElement>;
  onTap?: (i: number) => void;
  onDragStart?: (i: number, e: RPointerEvent<SVGRectElement>) => void;
  onDragMove?: (i: number, e: RPointerEvent<SVGRectElement>) => void;
  onDragEnd?: (i: number, e: RPointerEvent<SVGRectElement>) => void;
}) {
  const slots = SLOTS[n];
  const stuck = states.filter((p) => p.at === 'heart').length;
  const gap = healed ? 0 : 1 - stuck / n;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 300 400"
      className={`${className ?? ''} ${healed ? s.healed : ''}`}
      style={{ ['--gap' as string]: gap }}
      role="img"
      aria-label={healed ? 'Hati yang sudah utuh lagi' : 'Hati yang retak'}
    >
      <ellipse cx="150" cy="276" rx="70" ry="7" fill="#24323b" opacity=".08" />

      <g className={s.heart}>
        <g className={s.halfL}>
          <path d={LEFT} className={s.fillL} />
          <path d="M44,72C50,46 72,32 96,34C74,40 58,54 52,78Z" fill="#fff" opacity=".3" />
          <g className={s.cracks}>
            <path d="M138,84L120,92L110,108M140,146L122,158M144,214L132,222" />
          </g>
          <g className={s.sad}>
            <circle cx="94" cy="122" r="6.5" />
            <path d="M80,106L106,98" className={s.brow} />
            <path d="M88,134C83,143 81,148 88,152C95,148 93,143 88,134Z" className={s.tear} />
          </g>
          <path d="M84,124Q94,112 104,124" className={s.happy} />
          <ellipse cx="78" cy="148" rx="13" ry="8.5" className={s.cheek} />
        </g>
        <g className={s.halfR}>
          <path d={RIGHT} className={s.fillR} />
          <g className={s.cracks}>
            <path d="M160,112L180,104L190,116M162,180L178,190" />
          </g>
          <g className={s.sad}>
            <circle cx="206" cy="122" r="6.5" />
            <path d="M194,98L220,106" className={s.brow} />
          </g>
          <path d="M196,124Q206,112 216,124" className={s.happy} />
          <ellipse cx="222" cy="148" rx="13" ry="8.5" className={s.cheek} />
        </g>
        <path d={CRACK_LINE} className={s.seam} />
        <path d="M136,178Q150,167 164,178" className={`${s.mouth} ${s.mouthSad}`} />
        <path d="M133,166Q150,185 167,166" className={`${s.mouth} ${s.mouthHappy}`} />
      </g>

      {/* nampan */}
      <g className={s.tray}>
      <rect x="30" y="303" width="240" height="88" rx="20" fill="#24323b" opacity=".07" />
      <rect x="30" y="299" width="240" height="88" rx="20" fill="#fff" />
      <rect x="38" y="307" width="224" height="72" rx="14" fill="#edf4f7" />
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={i}
          x={trayX(i, n) - 14}
          y={TRAY_Y - 36}
          width="28"
          height="72"
          rx="14"
          fill="none"
          stroke="#24323b"
          strokeOpacity=".16"
          strokeWidth="1.4"
          strokeDasharray="4 4"
        />
      ))}
      </g>

      {/* plester */}
      {states.map((p, i) => {
        let style: CSSProperties;
        if (p.at === 'heart') {
          const [x, y, r] = slots[p.slot];
          style = { transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(0.84)` };
        } else if (p.at === 'drag') {
          style = { transform: `translate(${p.x}px, ${p.y}px) rotate(24deg) scale(0.95)`, transition: 'none' };
        } else {
          style = { transform: `translate(${trayX(i, n)}px, ${TRAY_Y}px) rotate(${90 + (i % 2 ? 5 : -5)}deg) scale(0.8)` };
        }
        return (
          <g key={i} className={`${s.plaster} ${p.at === 'heart' ? s.stuck : ''}`} style={style}>
            <Plaster color={PLASTER_COLORS[i % PLASTER_COLORS.length]} />
          </g>
        );
      })}

      {/* area sentuh di nampan */}
      {onTap
        ? states.map((p, i) =>
            p.at === 'heart' ? null : (
              <rect
                key={i}
                x={trayX(i, n) - (n === 3 ? 30 : 25)}
                y={300}
                width={n === 3 ? 60 : 50}
                height={86}
                fill="transparent"
                className={s.hit}
                role="button"
                tabIndex={0}
                aria-label={`Tempel plester ${i + 1}`}
                onClick={() => onTap(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTap(i);
                  }
                }}
                onPointerDown={(e) => onDragStart?.(i, e)}
                onPointerMove={(e) => onDragMove?.(i, e)}
                onPointerUp={(e) => onDragEnd?.(i, e)}
                onPointerCancel={(e) => onDragEnd?.(i, e)}
              />
            ),
          )
        : null}
    </svg>
  );
}
