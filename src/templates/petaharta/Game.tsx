'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import type { PetaText } from './i18n';
import g from './game.module.css';

type GameText = PetaText['game'];
export type ParrotMood = 'smug' | 'shock' | 'sorry';

/**
 * tempat beo hinggap, dalam cqw/cqh layar (sama dengan akhir sambaran di style.module.css):
 * kanan atas → kiri → kanan bawah → menyerah di kiri atas
 */
export const PARROT_SPOTS: Array<[number, number]> = [
  [74, 30],
  [27, 43],
  [72, 50],
  [30, 30],
];
const GOAL = PARROT_SPOTS.length - 1;

/** Mata beo (viewBox sama dengan lukisannya, 300×340): sombong, kaget saat dikejar, atau malu-malu. */
function Face({ mood }: { mood: ParrotMood }) {
  const ink = '#2a1a12';
  return (
    <svg className={g.face} viewBox="0 0 300 340" aria-hidden>
      {mood === 'sorry' ? (
        <path d="M188,90q10,-9 20,0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      ) : (
        <>
          <circle cx={198} cy={88} r={mood === 'shock' ? 12 : 10} fill="#fffaf0" stroke={ink} strokeWidth={2.4} />
          <circle className={g.pupil} cx={mood === 'shock' ? 199 : 201} cy={89} r={mood === 'shock' ? 3.6 : 5.4} fill={ink} />
          <circle cx={199} cy={86} r={1.8} fill="#fff" />
          {mood === 'smug' ? <path d="M186,87Q198,72 210,85L210,80Q198,68 186,80Z" fill="#d8352a" stroke={ink} strokeWidth={2} strokeLinejoin="round" /> : null}
          {mood === 'shock' ? <path d="M186,70q12,-8 24,0" fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" /> : null}
        </>
      )}
      <ellipse cx={206} cy={106} rx={8} ry={4.6} fill="#ff9a8a" opacity={0.75} />
    </svg>
  );
}

/** Burung beo lukisan dengan mata & sayap yang bisa dikepakkan; `scroll` = gulungan surat di cengkeramannya. */
export function Parrot({ mood = 'smug', flap = false, scroll = false, className }: { mood?: ParrotMood; flap?: boolean; scroll?: boolean; className?: string }) {
  return (
    <span className={cx(g.parrot, flap && g.flapping, className)}>
      {scroll ? <Sprite name="petaharta-surat" className={g.carry} /> : null}
      <Sprite name="game-petaharta-beo" className={g.body} />
      <span className={g.wingBox}>
        <Sprite name="game-petaharta-sayap" className={g.wing} />
      </span>
      <Face mood={mood} />
    </span>
  );
}

/**
 * Rebut lagi suratnya: seekor beo menyambar gulungan surat dari peti. Tiap ketukan (di beonya atau di mana saja)
 * membuatnya terbang ke tempat lain sambil berkilah; di ketukan ketiga suratnya dijatuhkan kembali ke peti.
 */
export function ParrotGame({ t, onDone }: { t: GameText; onDone: () => void }) {
  const later = useTimers();
  const [n, setN] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dropped, setDropped] = useState(false);
  const [line, setLine] = useState<string | null>(null);
  const birdRef = useRef<HTMLButtonElement>(null);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const poke = () => {
    if (busy || n >= GOAL) return;
    const k = n + 1;
    setBusy(true);
    setN(k);
    setLine(t.lines[k - 1]);
    haptic(k === GOAL ? 24 : 12);
    if (k < GOAL) {
      sfx.squeak();
      sfx.score(k);
    } else sfx.boing();
    later(() => {
      setBusy(false);
      if (k === GOAL) {
        setDropped(true);
        sfx.whoosh();
      }
    }, reduce.current ? 120 : 850);
  };

  const [x, y] = PARROT_SPOTS[n];
  const [px] = PARROT_SPOTS[Math.max(0, n - 1)];
  // menghadap arah terbangnya; diam di tempat: menghadap ke tengah layar
  const faceLeft = busy ? x < px : x > 50;

  return (
    <MiniGame title={t.title} how={t.how} goal={GOAL} score={n} won={dropped} winTitle={t.winTitle} winLine={t.winLine} onDone={onDone}>
      {(live) => (
        // ketukan di mana saja juga mengagetkan beonya
        <div className={g.field} onClick={poke}>
          <button
            ref={birdRef}
            type="button"
            className={cx(g.flier, busy && g.flying, faceLeft && g.left)}
            style={{ '--x': x, '--y': y } as CSSProperties}
            onClick={(e) => {
              e.stopPropagation();
              poke();
            }}
            disabled={n >= GOAL}
            aria-label={t.parrotLabel}
          >
            <Parrot mood={n >= GOAL ? 'sorry' : busy ? 'shock' : 'smug'} flap={busy || n === 0} scroll={!dropped && n < GOAL} />
          </button>
          {n >= GOAL ? <Sprite name="petaharta-surat" className={g.drop} style={{ '--x': PARROT_SPOTS[GOAL - 1][0], '--y': PARROT_SPOTS[GOAL - 1][1] } as CSSProperties} /> : null}
          {line && live ? (
            <div key={line} className={g.bubble} role="status">
              {line}
            </div>
          ) : null}
          <TapCue target={birdRef} show={n === 0} delay={1500} />
        </div>
      )}
    </MiniGame>
  );
}
