'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import type { MesintikText } from './i18n';
import g from './game.module.css';

type GameText = MesintikText['game'];
export type BallMood = 'cheeky' | 'oops' | 'sleepy';

/** mulut keranjang dalam satuan lukisan (780 × 1500; sama dengan BIN_MOUTH di index.tsx) */
export const BIN_MOUTH: [number, number] = [661, 1226];
/** tempat si bola melayang menunggu diketuk, satuan lukisan */
const SPOTS: Array<[number, number]> = [
  [520, 1036],
  [628, 930],
  [418, 980],
];
const GOAL = SPOTS.length;
const em = (v: number) => v / 32;

/** Wajah bola kertas (viewBox sama dengan lukisannya, 220×210; pusat bola di 110,98): usil, kaget, atau mengantuk. */
function Face({ mood }: { mood: BallMood }) {
  const ink = '#33241c';
  return (
    <svg className={g.face} viewBox="0 0 220 210" aria-hidden>
      {mood === 'cheeky' ? (
        <>
          <ellipse cx={88} cy={90} rx={8.5} ry={10.5} fill={ink} />
          <circle cx={85} cy={86} r={3.2} fill="#fff" />
          {/* kedipan */}
          <path d="M124,91q10,-9 20,0" fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" />
          <path d="M94,116q16,16 32,0Z" fill="#7a2a1c" stroke={ink} strokeWidth={4.4} strokeLinejoin="round" />
          <path d="M104,124q6,9 13,0" fill="#e86a5a" />
        </>
      ) : mood === 'oops' ? (
        <>
          <circle cx={88} cy={90} r={10} fill="#fffaf0" stroke={ink} strokeWidth={3.4} />
          <circle cx={88} cy={91} r={4.2} fill={ink} />
          <circle cx={134} cy={90} r={10} fill="#fffaf0" stroke={ink} strokeWidth={3.4} />
          <circle cx={134} cy={91} r={4.2} fill={ink} />
          <ellipse cx={111} cy={124} rx={8} ry={10} fill={ink} />
        </>
      ) : (
        <>
          <path d="M78,92q10,8 20,0M124,92q10,8 20,0" fill="none" stroke={ink} strokeWidth={4.6} strokeLinecap="round" />
          <path d="M104,122q7,5 14,0" fill="none" stroke={ink} strokeWidth={4.2} strokeLinecap="round" />
        </>
      )}
      <ellipse cx={70} cy={110} rx={11} ry={6.5} fill="#ff9c8a" opacity={0.6} />
      <ellipse cx={152} cy={110} rx={11} ry={6.5} fill="#ff9c8a" opacity={0.6} />
    </svg>
  );
}

/** Bola kertas lukisan dengan wajah. Dipakai di mini-game dan saat mengintip dari keranjang di adegan utama. */
export function Ball({ mood = 'cheeky', className }: { mood?: BallMood; className?: string }) {
  return (
    <span className={cx(g.ball, className)}>
      <Sprite name="game-mesintik-bola" className={g.ballArt} />
      <Face mood={mood} />
    </span>
  );
}

/**
 * Masukkan draf bandel: satu bola kertas berwajah terus meloncat keluar dari keranjang sambil membela diri.
 * Tiap ketukan (di bolanya atau di mana saja) memasukkannya lagi; di ketukan ketiga ia menyerah dan tidur.
 */
export function BallGame({ t, onDone }: { t: GameText; onDone: () => void }) {
  const later = useTimers();
  const [n, setN] = useState(0);
  /** 'in' meloncat keluar, 'wait' melayang, 'got' didorong masuk lagi */
  const [pos, setPos] = useState<'in' | 'wait' | 'got' | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const ballRef = useRef<HTMLButtonElement>(null);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    later(() => {
      setPos('in');
      sfx.boing();
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pos !== 'in') return;
    const id = setTimeout(() => setPos('wait'), reduce.current ? 60 : 820);
    return () => clearTimeout(id);
  }, [pos, n]);

  const tuck = () => {
    if (pos !== 'in' && pos !== 'wait') return;
    const k = n + 1;
    setPos('got');
    setLine(t.lines[k - 1]);
    haptic(k === GOAL ? 24 : 12);
    sfx.whoosh();
    if (k < GOAL) sfx.score(k);
    later(() => {
      setN(k);
      setPos(null);
      sfx.bonk();
      if (k < GOAL) {
        later(() => {
          setPos('in');
          sfx.boing();
        }, reduce.current ? 120 : 900);
      }
      // celetukan terakhir sempat terbaca dulu sebelum kartu menang muncul
    }, reduce.current ? 140 : k === GOAL ? 1000 : 620);
  };

  const i = Math.min(n, GOAL - 1);
  const [x, y] = SPOTS[i];
  const vars = {
    '--x': em(x),
    '--y': em(y),
    '--dx': em(BIN_MOUTH[0] - x),
    '--dy': em(BIN_MOUTH[1] - y),
  } as CSSProperties;
  const anchor = { '--x': em(BIN_MOUTH[0]), '--y': em(BIN_MOUTH[1]) } as CSSProperties;

  return (
    <MiniGame title={t.title} how={t.how} goal={GOAL} score={n} won={n >= GOAL} winTitle={t.winTitle} winLine={t.winLine} onDone={onDone}>
      {(live) => (
        // ketukan di mana saja juga memasukkan bolanya
        <div className={g.field} onClick={tuck}>
          <div className={g.world}>
            {pos ? (
              <button
                key={n}
                ref={ballRef}
                type="button"
                className={cx(g.runner, g[pos])}
                style={vars}
                onClick={(e) => {
                  e.stopPropagation();
                  tuck();
                }}
                disabled={pos === 'got'}
                aria-label={t.ballLabel}
              >
                <span className={g.arc}>
                  <span className={g.bob}>
                    <Ball mood={pos === 'got' ? 'oops' : 'cheeky'} />
                  </span>
                </span>
              </button>
            ) : null}
            {n >= GOAL ? (
              <span className={g.anchor} style={anchor} aria-hidden>
                <span className={g.zzz}>
                  <i>z</i>
                  <i>z</i>
                  <i>z</i>
                </span>
              </span>
            ) : null}
            {line && live ? (
              <span className={g.anchor} style={anchor}>
                <span key={line} className={g.bubble} role="status">
                  {line}
                </span>
              </span>
            ) : null}
          </div>
          <TapCue target={ballRef} show={n === 0 && pos === 'wait'} delay={1300} />
        </div>
      )}
    </MiniGame>
  );
}
