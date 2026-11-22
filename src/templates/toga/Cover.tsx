import { CapShape, RollShape } from './art';
import s from './style.module.css';

const STAR = 'M0,-7L1.6,-1.6L7,0L1.6,1.6L0,7L-1.6,1.6L-7,0L-1.6,-1.6Z';

/** Gambar kartu katalog: toga melayang di langit malam, gulungan ijazah di bawahnya. */
export default function Cover() {
  return (
    <div className={s.cover}>
      <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" aria-hidden>
        {[
          [22, 30, 1], [170, 24, 0.8], [182, 96, 1.1], [16, 112, 0.8], [36, 200, 0.7], [168, 190, 1], [104, 20, 0.6],
        ].map(([x, y, k], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
            <path d={STAR} fill="#f2c14e" className={s.coverStar} style={{ ['--i' as string]: i }} />
          </g>
        ))}

        {/* jejak lemparan */}
        <path d="M70,232Q62,190 78,150" stroke="#f2c14e" strokeOpacity=".35" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="1 7" fill="none" />
        <path d="M130,236Q140,196 124,156" stroke="#f2c14e" strokeOpacity=".35" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="1 7" fill="none" />

        {/* konfeti */}
        {[
          [40, 70, 20, '#f2c14e'], [160, 60, -30, '#ffe08a'], [150, 140, 50, '#7fa4f0'], [30, 150, -20, '#fff7dd'],
          [118, 176, 70, '#f2c14e'], [72, 44, -60, '#7fa4f0'], [176, 150, 15, '#f2c14e'], [52, 178, 40, '#ffe08a'],
        ].map(([x, y, r, c], i) => (
          <rect key={i} x={(x as number) - 4} y={(y as number) - 2} width="8" height="4" rx="1" fill={c as string} transform={`rotate(${r} ${x} ${y})`} />
        ))}

        <g transform="translate(19 46) rotate(-12 81 61) scale(0.81)">
          <g className={s.coverCap}>
            <CapShape swing={false} />
          </g>
        </g>

        <g transform="translate(46 186) rotate(-7 54 20) scale(0.42)">
          <RollShape />
        </g>
      </svg>
    </div>
  );
}
