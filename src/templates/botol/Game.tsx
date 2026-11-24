'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import type { BotolText } from './i18n';
import g from './game.module.css';

type GameText = BotolText['game'];
export type CrabMood = 'cheeky' | 'run' | 'sorry';

/**
 * tempat kepiting berhenti, dalam em lukisan (sama dengan dunia di style.module.css):
 * mulai di tempat gabus jatuh → kabur ke kiri → turun ke dekat botol → menyerah di tengah
 */
export const CRAB_SPOTS: Array<[number, number]> = [
  [19.5, 32.5],
  [10.4, 32.9],
  [10.2, 41.7],
  [15.4, 32.8],
];
const GOAL = CRAB_SPOTS.length - 1;

/** Mata & mulut kepiting (viewBox sama dengan lukisannya, 300×240): usil, panik saat lari, atau malu-malu. */
function Face({ mood }: { mood: CrabMood }) {
  const ink = '#3a1d12';
  const look = mood === 'run' ? [-2.5, 0] : mood === 'sorry' ? [0, 3] : [2, -1];
  const eye = (x: number) => (
    <g key={x}>
      <circle cx={x} cy={50} r={13.5} fill="#fffaf0" stroke={ink} strokeWidth={2.2} />
      <circle className={g.pupil} cx={x + look[0]} cy={50 + look[1]} r={mood === 'run' ? 4.4 : 6.6} fill={ink} />
      <circle cx={x + look[0] - 2.4} cy={47 + look[1]} r={2.2} fill="#fff" />
    </g>
  );
  return (
    <svg className={g.face} viewBox="0 0 300 240" aria-hidden>
      {eye(126)}
      {eye(174)}
      {mood === 'sorry' ? <path d="M106,34l26,5M194,34l-26,5" stroke={ink} strokeWidth={3.6} strokeLinecap="round" /> : null}
      {mood === 'run' ? (
        <ellipse cx={150} cy={134} rx={9} ry={11} fill={ink} />
      ) : mood === 'sorry' ? (
        <path d="M134,138q8,-8 16,0t16,0" fill="none" stroke={ink} strokeWidth={4.2} strokeLinecap="round" />
      ) : (
        <path d="M130,126q20,20 40,0" fill="#7a1f17" stroke={ink} strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" />
      )}
      <ellipse cx={106} cy={130} rx={11} ry={6.5} fill="#ffb4a0" opacity={0.75} />
      <ellipse cx={194} cy={130} rx={11} ry={6.5} fill="#ffb4a0" opacity={0.75} />
    </svg>
  );
}

/** Kepiting lukisan dengan wajah; `cork` = gabus masih dijepit di capit kanannya. Dipakai juga di adegan utama. */
export function Crab({ mood = 'cheeky', cork = false, className }: { mood?: CrabMood; cork?: boolean; className?: string }) {
  return (
    <span className={cx(g.crab, className)}>
      {cork ? <Sprite name="botol-gabus" className={g.crabCork} /> : null}
      <Sprite name="game-botol-kepiting" className={g.crabArt} />
      <Face mood={mood} />
    </span>
  );
}

/**
 * Kejar kepitingnya: seekor kepiting membawa kabur gabus botol. Tiap ketukan (di kepitingnya atau di mana saja)
 * membuatnya lari menyamping ke tempat lain sambil berkilah; di ketukan ketiga gabusnya dikembalikan.
 */
export function CrabGame({ t, onDone }: { t: GameText; onDone: () => void }) {
  const later = useTimers();
  const [n, setN] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dropped, setDropped] = useState(false);
  const [line, setLine] = useState<string | null>(null);
  const crabRef = useRef<HTMLButtonElement>(null);
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
        sfx.pop();
      }
    }, reduce.current ? 120 : 800);
  };

  const [x, y] = CRAB_SPOTS[n];

  return (
    <MiniGame title={t.title} how={t.how} goal={GOAL} score={n} won={dropped} winTitle={t.winTitle} winLine={t.winLine} onDone={onDone}>
      {(live) => (
        // ketukan di mana saja juga mengagetkan kepitingnya
        <div className={g.field} onClick={poke}>
          <div className={g.world}>
            <button
              ref={crabRef}
              type="button"
              className={cx(g.runner, busy && g.scuttle)}
              style={{ '--x': x, '--y': y } as CSSProperties}
              onClick={(e) => {
                e.stopPropagation();
                poke();
              }}
              disabled={n >= GOAL}
              aria-label={t.crabLabel}
            >
              <Crab mood={n >= GOAL ? 'sorry' : busy ? 'run' : 'cheeky'} cork={!dropped} />
            </button>
            {dropped ? <Sprite name="botol-gabus" className={g.dropCork} /> : null}
            {line && live ? (
              <div key={line} className={g.bubble} role="status">
                {line}
              </div>
            ) : null}
          </div>
          <TapCue target={crabRef} show={n === 0} delay={1500} />
        </div>
      )}
    </MiniGame>
  );
}
