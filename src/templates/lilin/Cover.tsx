import { CakeBase, FlameShape, GlowDefs, candles } from './art';
import s from './style.module.css';

/** Gambar kartu katalog: kue dengan lilin menyala di ruangan temaram. */
export default function Cover() {
  const cs = candles(5);
  return (
    <div className={s.cover}>
      <svg viewBox="0 0 300 375" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <GlowDefs />
        {[
          [40, 60, 2.2], [258, 44, 1.8], [272, 150, 1.6], [26, 170, 1.6], [70, 300, 1.4], [246, 310, 1.8], [150, 30, 1.4],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#ffdcaa" opacity=".45" />
        ))}
        <circle cx="150" cy="106" r="150" fill="url(#lilin-glow)" opacity=".55" />
        <g transform="translate(-9 0) scale(1.06)">
          <CakeBase n={5} />
          {cs.map((c, i) => (
            <g key={i} transform={`translate(${c.x} ${c.y - c.h - 6})`}>
              <circle r="44" cy="-12" fill="url(#lilin-glow)" opacity=".8" />
              <g className={s.coverFlame} style={{ ['--i' as string]: i }}>
                <FlameShape />
              </g>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
