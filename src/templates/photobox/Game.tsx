'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import type { PhotoboxText } from './i18n';
import g from './game.module.css';

type GameText = PhotoboxText['game'];

/** tempat tangan iseng muncul di balik tepi atas bingkai: [kiri %, miring] */
const SPOTS: Array<[number, number]> = [
  [27, -15],
  [73, 13],
  [34, -7],
];
const GOAL = SPOTS.length;

/** Wajah di telapak sarung tangan (viewBox sama dengan lukisannya, 240×340): usil, kaget saat dicolek, atau cengar-cengir minta maaf. */
function Face({ mood }: { mood: 'sly' | 'caught' | 'sorry' }) {
  const ink = '#3a231b';
  const eye = (x: number) => (
    <g key={x}>
      <ellipse cx={x} cy={212} rx={6.5} ry={8} fill={ink} />
      <circle cx={x - 2} cy={208.5} r={2.4} fill="#fff" />
    </g>
  );
  return (
    <svg className={g.face} viewBox="0 0 240 340" aria-hidden>
      {mood === 'caught' ? (
        <>
          <path d="M94,205l13,7l-13,7M150,205l-13,7l13,7" fill="none" stroke={ink} strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx={122} cy={240} rx={8} ry={9.5} fill={ink} />
        </>
      ) : mood === 'sorry' ? (
        <>
          {eye(104)}
          {eye(140)}
          <path d="M94,198l18,-5M150,198l-18,-5" stroke={ink} strokeWidth={3.8} strokeLinecap="round" />
          <path d="M108,238q7,-6 14,0t14,0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          {eye(104)}
          {eye(140)}
          <path d="M93,195l19,5M151,195l-19,5" stroke={ink} strokeWidth={3.8} strokeLinecap="round" />
          <path d="M106,234q16,15 32,-2" fill="none" stroke={ink} strokeWidth={4.2} strokeLinecap="round" />
        </>
      )}
      <ellipse cx={88} cy={230} rx={8.5} ry={5} fill="#ff8f86" opacity={0.6} />
      <ellipse cx={156} cy={230} rx={8.5} ry={5} fill="#ff8f86" opacity={0.6} />
    </svg>
  );
}

/**
 * Tangan Iseng: sarung tangan kartun muncul di balik bingkai foto sambil mengacungkan "tanduk kelinci".
 * Colek tiga kali (ketukan di mana saja juga dihitung) dan ia kabur. Tidak bisa kalah.
 */
export function PhotobombGame({ t, onDone }: { t: GameText; onDone: () => void }) {
  const later = useTimers();
  const [booped, setBooped] = useState(0);
  /** tangan yang sedang muncul: 'in' naik, 'wait' bergoyang, 'got' dicolek lalu turun */
  const [hand, setHand] = useState<'in' | 'wait' | 'got' | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const handRef = useRef<HTMLButtonElement>(null);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    later(() => {
      setHand('in');
      sfx.boing();
    }, 650);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // naik → bergoyang menunggu dicolek
  useEffect(() => {
    if (hand !== 'in') return;
    const id = setTimeout(() => setHand('wait'), reduce.current ? 60 : 620);
    return () => clearTimeout(id);
  }, [hand, booped]);

  const boop = () => {
    if (hand !== 'in' && hand !== 'wait') return;
    const k = booped + 1;
    setHand('got');
    setLine(t.lines[k - 1]);
    haptic(k === GOAL ? 26 : 14);
    sfx.squeak();
    sfx.score(k);
    later(() => {
      setBooped(k);
      setHand(null);
      if (k < GOAL) {
        later(() => {
          setHand('in');
          sfx.boing();
        }, reduce.current ? 80 : 480);
      }
    }, reduce.current ? 150 : 760);
  };

  const i = Math.min(booped, GOAL - 1);
  const [x, rot] = SPOTS[i];
  const last = i === GOAL - 1;

  return (
    <MiniGame title={t.title} how={t.how} goal={GOAL} score={booped} won={booped >= GOAL} winTitle={t.winTitle} winLine={t.winLine} onDone={onDone}>
      {(playing) => (
        // ketukan di mana saja mencolek tangan yang sedang muncul
        <div className={g.field} onClick={boop}>
          <div className={g.set}>
            {hand ? (
              <button
                key={booped}
                ref={handRef}
                type="button"
                className={cx(g.hand, g[hand])}
                style={{ '--x': `${x}%`, '--r': `${rot}deg` } as CSSProperties}
                onClick={(e) => {
                  e.stopPropagation();
                  boop();
                }}
                disabled={hand === 'got'}
                aria-label={t.handLabel}
              >
                <span className={g.wave}>
                  <Sprite name="game-photobox-tangan" className={g.handArt} />
                  <Face mood={hand === 'got' ? 'caught' : last ? 'sorry' : 'sly'} />
                </span>
              </button>
            ) : null}
            <Sprite name="game-photobox-bingkai" className={g.frame} />
            {last && hand === 'wait' ? <span className={g.excuse}>{t.excuse}</span> : null}
          </div>

          {line && playing ? (
            <div key={line} className={g.bubble} role="status">
              {line}
            </div>
          ) : null}

          <TapCue target={handRef} show={booped === 0 && hand === 'wait'} delay={1300} at={{ x: 0.5, y: 0.3 }} />
        </div>
      )}
    </MiniGame>
  );
}
