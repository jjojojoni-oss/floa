'use client';

import { type CSSProperties, type RefObject, useLayoutEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import type { GameText } from './i18n';
import g from './game.module.css';

type Box = { left: number; top: number; w: number; h: number };
type State = 'sit' | 'sneeze' | 'gone';

/** tempat gumpalan debu nangkring di piringan (pecahan kotak piringan) + arah kaburnya */
const SPOTS: Array<{ x: number; y: number; dx: number; dy: number; flip?: boolean }> = [
  { x: 0.3, y: 0.3, dx: -1, dy: -0.7 },
  { x: 0.7, y: 0.44, dx: 1, dy: -0.4, flip: true },
  { x: 0.42, y: 0.74, dx: -0.7, dy: 1 },
];
const GOAL = SPOTS.length;

/** Wajah gumpalan debu (digambar di atas lukisannya; viewBox sprite 210×200, digeser 10 ke bawah ke tengah badannya). */
function Face({ sneeze }: { sneeze: boolean }) {
  const ink = '#2d2019';
  return (
    <svg className={g.face} viewBox="0 -10 210 200" aria-hidden>
      {sneeze ? (
        <>
          {/* bersin: mata terpejam > <, mulut menganga */}
          <path d="M72,88l16,9l-16,9M138,88l-16,9l16,9" fill="none" stroke={ink} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx="105" cy="124" rx="11" ry="13" fill={ink} />
          <ellipse cx="105" cy="130" rx="6" ry="5" fill="#e8745f" />
        </>
      ) : (
        <>
          <g className={g.blink}>
            {[84, 126].map((x) => (
              <g key={x}>
                <ellipse cx={x} cy="96" rx="10.5" ry="12.5" fill={ink} />
                <circle cx={x - 3.6} cy="91" r="4.2" fill="#fff" />
                <circle cx={x + 3.6} cy="101" r="1.8" fill="#fff" opacity="0.85" />
              </g>
            ))}
          </g>
          <path d="M97,118q8,7 16,0" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      <ellipse cx="66" cy="116" rx="11" ry="6.5" fill="#f29a8e" opacity="0.7" />
      <ellipse cx="144" cy="116" rx="11" ry="6.5" fill="#f29a8e" opacity="0.7" />
    </svg>
  );
}

/**
 * "Usir debu bandel!": tiga gumpalan debu imut nangkring di atas piringan. Tiap diketuk (di mana saja
 * di arena juga dihitung) ia bersin, lalu kabur sambil melompat-lompat. Tiga ketukan, piringannya kinclong.
 */
export function DustGame({ disc, t, onDone }: { disc: RefObject<HTMLElement | null>; t: GameText; onDone: () => void }) {
  const later = useTimers();
  /** arena; lewat callback ref supaya posisi dihitung begitu arenanya muncul */
  const [field, setField] = useState<HTMLDivElement | null>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [state, setState] = useState<State[]>(() => SPOTS.map(() => 'sit'));
  const [line, setLine] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const firstRef = useRef<HTMLButtonElement>(null);
  const count = useRef(0);
  const score = state.filter((v) => v !== 'sit').length;

  useLayoutEffect(() => {
    const measure = () => {
      const a = disc.current?.getBoundingClientRect();
      const b = field?.getBoundingClientRect();
      if (a && b && a.width) setBox({ left: a.left - b.left, top: a.top - b.top, w: a.width, h: a.height });
    };
    measure();
    const id = setTimeout(measure, 350);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(id);
      window.removeEventListener('resize', measure);
    };
  }, [disc, field]);

  const shoo = (i: number) => {
    if (state[i] !== 'sit') return;
    const k = ++count.current;
    setState((prev) => prev.map((v, j) => (j === i ? 'sneeze' : v)));
    setLine(t.lines[(k - 1) % t.lines.length]);
    sfx.squeak();
    sfx.score(k);
    haptic(k === GOAL ? 26 : 14);
    later(() => {
      setState((prev) => prev.map((v, j) => (j === i ? 'gone' : v)));
      sfx.boing();
    }, 720);
    if (k >= GOAL) later(() => setWon(true), 1500);
  };
  /** ketukan di mana saja: debu pertama yang masih nangkring */
  const shooNext = () => {
    const i = state.indexOf('sit');
    if (i >= 0) shoo(i);
  };

  const size = box ? Math.max(64, Math.min(96, box.w * 0.34)) : 76;

  return (
    <MiniGame title={t.title} how={t.how} goal={GOAL} score={score} won={won} winTitle={t.winTitle} winLine={t.winLine} onDone={onDone}>
      <div ref={setField} className={g.field} onClick={shooNext}>
        {box
          ? SPOTS.map((sp, i) => (
              <button
                key={i}
                ref={i === 0 ? firstRef : undefined}
                type="button"
                className={cx(g.dust, g[state[i]], sp.flip && g.flip)}
                style={{ left: box.left + box.w * sp.x, top: box.top + box.h * sp.y, width: size, '--dx': sp.dx, '--dy': sp.dy, '--i': i } as CSSProperties}
                onClick={(e) => {
                  e.stopPropagation();
                  shoo(i);
                }}
                disabled={state[i] !== 'sit'}
                aria-label={t.dustLabel}
              >
                <span className={g.body}>
                  <Sprite name="game-vinyl-debu" className={g.art} />
                  <Face sneeze={state[i] !== 'sit'} />
                </span>
                {state[i] === 'sneeze' ? (
                  <span className={g.achoo} aria-hidden>
                    {t.sneeze}
                  </span>
                ) : null}
                {state[i] === 'sneeze' ? (
                  <span className={g.puff} aria-hidden>
                    <i />
                    <i />
                    <i />
                  </span>
                ) : null}
              </button>
            ))
          : null}

        {line ? (
          <div key={line} className={g.bubble} role="status">
            {line}
          </div>
        ) : null}

        <TapCue target={firstRef} show={!!box && score === 0} delay={1500} />
      </div>
    </MiniGame>
  );
}
