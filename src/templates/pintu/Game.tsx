'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import type { PintuText } from './i18n';
import g from './game.module.css';

type GameText = PintuText['game'];

/** tiap bola: posisi mendatar (%), tinggi pantulan (em), lama setengah pantulan (md). Bola ketiga sudah kecapekan. */
const BALLS: Array<{ x: number; h: number; ms: number }> = [
  { x: 30, h: 15, ms: 520 },
  { x: 68, h: 21, ms: 620 },
  { x: 48, h: 6, ms: 700 },
];
const GOAL = BALLS.length;

/** Wajah bola (viewBox sama dengan lukisannya, 190×190): riang, kaget saat tertangkap, atau kecapekan. */
function Face({ mood }: { mood: 'happy' | 'caught' | 'tired' }) {
  const ink = '#4a1a0c';
  const eye = (x: number) => (
    <g key={x}>
      <ellipse cx={x} cy={84} rx={7.5} ry={9} fill={ink} />
      <circle cx={x - 2.4} cy={80.5} r={2.8} fill="#fff" />
    </g>
  );
  return (
    <svg className={g.face} viewBox="0 0 190 190" aria-hidden>
      {mood === 'caught' ? (
        <>
          <path d="M62,78l14,7l-14,7M122,78l-14,7l14,7" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx={92} cy={108} rx={8.5} ry={9.5} fill={ink} />
        </>
      ) : mood === 'tired' ? (
        <>
          <path d="M63,86q9,6 18,0M103,86q9,6 18,0" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />
          <path d="M78,110q5,-5 9,0t9,0t9,0" fill="none" stroke={ink} strokeWidth={4.2} strokeLinecap="round" />
          <path d="M136,58q8,12 0,17q-8,-5 0,-17z" fill="#bfe6f5" stroke="#6fb3cf" strokeWidth={1.6} />
        </>
      ) : (
        <>
          {eye(72)}
          {eye(112)}
          <path d="M80,103q12,13 24,0" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />
        </>
      )}
      <ellipse cx={54} cy={101} rx={9} ry={5.5} fill="#ff6f6a" opacity={0.5} />
      <ellipse cx={130} cy={101} rx={9} ry={5.5} fill="#ff6f6a" opacity={0.5} />
    </svg>
  );
}

/**
 * Tangkap Bola Bekel: bola karet berwajah jatuh ke lantai tegel lalu memantul-mantul menunggu ditangkap
 * (ketukan di mana saja juga menangkapnya). Bola ketiga sudah kecapekan memantul. Tiga ketukan, selesai.
 */
export function BekelGame({ t, onDone }: { t: GameText; onDone: () => void }) {
  const later = useTimers();
  const [caught, setCaught] = useState(0);
  /** bola yang sedang main: 'in' jatuh, 'wait' memantul, 'got' tertangkap */
  const [ball, setBall] = useState<'in' | 'wait' | 'got' | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const ballRef = useRef<HTMLButtonElement>(null);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    later(() => {
      setBall('in');
      sfx.boing();
    }, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // jatuh → memantul
  useEffect(() => {
    if (ball !== 'in') return;
    const id = setTimeout(() => setBall('wait'), reduce.current ? 60 : 640);
    return () => clearTimeout(id);
  }, [ball, caught]);

  const grab = () => {
    if (ball !== 'in' && ball !== 'wait') return;
    const k = caught + 1;
    setBall('got');
    setLine(t.lines[k - 1]);
    haptic(k === GOAL ? 26 : 14);
    if (k === GOAL) sfx.wahwah();
    else {
      sfx.squeak();
      sfx.score(k);
    }
    later(() => {
      setCaught(k);
      setBall(null);
      if (k < GOAL) {
        later(() => {
          setBall('in');
          sfx.boing();
        }, reduce.current ? 80 : 480);
      }
    }, reduce.current ? 150 : 760);
  };

  const i = Math.min(caught, GOAL - 1);
  const spec = BALLS[i];
  const tired = i === GOAL - 1;

  return (
    <MiniGame title={t.title} how={t.how} goal={GOAL} score={caught} won={caught >= GOAL} winTitle={t.winTitle} winLine={t.winLine} onDone={onDone}>
      {/* ketukan di mana saja menangkap bola yang sedang memantul */}
      <div className={g.field} onClick={grab}>
        <span className={g.jacks} aria-hidden>
          <Sprite name="game-pintu-biji" className={g.jacksArt} />
        </span>

        {ball ? (
          <button
            key={caught}
            ref={ballRef}
            type="button"
            className={cx(g.ball, g[ball])}
            style={{ '--x': `${spec.x}%`, '--h': `${spec.h}em`, '--ms': `${spec.ms}ms` } as CSSProperties}
            onClick={(e) => {
              e.stopPropagation();
              grab();
            }}
            disabled={ball === 'got'}
            aria-label={t.ballLabel}
          >
            <span className={g.shade} aria-hidden />
            <span className={g.hop}>
              <span className={g.squash}>
                <Sprite name="game-pintu-bola" className={g.ballArt} />
                <Face mood={ball === 'got' ? 'caught' : tired ? 'tired' : 'happy'} />
              </span>
              {tired && ball === 'wait' ? <span className={g.excuse}>{t.tired}</span> : null}
            </span>
          </button>
        ) : null}

        {line ? (
          <div key={line} className={g.bubble} role="status">
            {line}
          </div>
        ) : null}

        <TapCue target={ballRef} show={caught === 0 && ball === 'wait'} delay={1500} at={{ x: 0.5, y: 0.2 }} />
      </div>
    </MiniGame>
  );
}
