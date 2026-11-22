import { LEFT, PLASTER_COLORS, Plaster, RIGHT } from './art';
import s from './style.module.css';

/** Gambar kartu katalog: hati yang sudah ditambal dan tersenyum. */
export default function Cover() {
  return (
    <div className={s.cover}>
      <svg viewBox="0 0 300 375" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <g stroke="#24323b" strokeOpacity=".1" strokeWidth="3" strokeLinecap="round">
          <path d="M40,50v14M33,57h14" />
          <path d="M258,40v14M251,47h14" />
          <path d="M270,300v14M263,307h14" />
          <path d="M30,318v14M23,325h14" />
        </g>
        <g fill="#ff9aa8" opacity=".7">
          <path d="M252,96c-9,-7 -13,-12 -13,-17c0,-4 3,-7 7,-7c3,0 5,1 6,3c1,-2 3,-3 6,-3c4,0 7,3 7,7c0,5 -4,10 -13,17Z" />
          <path d="M46,254c-7,-5 -10,-9 -10,-13c0,-3 2,-5 5,-5c2,0 4,1 5,3c1,-2 3,-3 5,-3c3,0 5,2 5,5c0,4 -3,8 -10,13Z" />
        </g>
        <ellipse cx="150" cy="322" rx="70" ry="7" fill="#24323b" opacity=".08" />
        <g transform="translate(0 46)">
          <g className={s.cvHeart}>
            <path d={LEFT} fill="#f46f72" />
            <path d={RIGHT} fill="#ea5f65" />
            <path d="M44,72C50,46 72,32 96,34C74,40 58,54 52,78Z" fill="#fff" opacity=".3" />
            <g fill="none" stroke="#24323b" strokeWidth="5" strokeLinecap="round">
              <path d="M84,124Q94,112 104,124" />
              <path d="M196,124Q206,112 216,124" />
              <path d="M133,166Q150,185 167,166" />
            </g>
            <ellipse cx="78" cy="148" rx="13" ry="8.5" fill="#ffb1bb" opacity=".85" />
            <ellipse cx="222" cy="148" rx="13" ry="8.5" fill="#ffb1bb" opacity=".85" />
            <g transform="translate(150 84) rotate(-22) scale(.84)">
              <Plaster color={PLASTER_COLORS[0]} />
            </g>
            <g transform="translate(150 134) rotate(17) scale(.84)">
              <Plaster color={PLASTER_COLORS[1]} />
            </g>
            <g transform="translate(149 216) rotate(-14) scale(.84)">
              <Plaster color={PLASTER_COLORS[2]} />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
