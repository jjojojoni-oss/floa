'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import type { BioskopText } from './i18n';
import g from './game.module.css';

type GameText = BioskopText['game'];

/** tempat popcorn melayang menunggu ditangkap: [kiri %, atas %] (yang ketiga si gosong) */
const RESTS: Array<[number, number]> = [
  [27, 43],
  [73, 37],
  [50, 30],
];
const GOAL = RESTS.length;

/** Wajah popcorn (viewBox sama dengan lukisannya, 200×180): riang, kaget saat tertangkap, atau manyun kalau gosong. */
function Face({ mood }: { mood: 'happy' | 'caught' | 'burnt' }) {
  const ink = mood === 'burnt' ? '#fff3da' : '#3a1d12';
  const eye = (x: number) => (
    <g key={x}>
      <ellipse cx={x} cy={86} rx={8} ry={9.5} fill={ink} />
      <circle cx={x - 2.6} cy={82} r={3} fill={mood === 'burnt' ? '#3a2618' : '#fff'} />
    </g>
  );
  return (
    <svg className={g.face} viewBox="0 0 200 180" aria-hidden>
      {mood === 'caught' ? (
        <>
          <path d="M70,80l14,7l-14,7M130,80l-14,7l14,7" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx={100} cy={108} rx={9} ry={10} fill={ink} />
        </>
      ) : mood === 'burnt' ? (
        <>
          {eye(80)}
          {eye(120)}
          <path d="M66,70l22,7M134,70l-22,7" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />
          <path d="M88,114q12,-9 24,0" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />
        </>
      ) : (
        <>
          {eye(80)}
          {eye(120)}
          <path d="M88,106q12,12 24,0" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />
        </>
      )}
      <ellipse cx={62} cy={102} rx={9} ry={5.5} fill="#ff8f86" opacity={mood === 'burnt' ? 0.45 : 0.65} />
      <ellipse cx={138} cy={102} rx={9} ry={5.5} fill="#ff8f86" opacity={mood === 'burnt' ? 0.45 : 0.65} />
    </svg>
  );
}

/**
 * Tangkap Popcorn: selama jeda film, sebutir popcorn berwajah loncat dari kotaknya lalu melayang menunggu
 * ditangkap (ketukan di mana saja juga menangkapnya). Butir ketiga ternyata gosong dan manyun. Tiga ketukan, selesai.
 */
export function PopcornGame({ t, onDone }: { t: GameText; onDone: () => void }) {
  const later = useTimers();
  const [caught, setCaught] = useState(0);
  /** butir yang sedang di udara: 'in' meloncat, 'wait' melayang, 'got' masuk lagi ke kotak */
  const [kernel, setKernel] = useState<'in' | 'wait' | 'got' | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const kernelRef = useRef<HTMLButtonElement>(null);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    later(() => {
      setKernel('in');
      sfx.pop();
    }, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // meloncat → melayang
  useEffect(() => {
    if (kernel !== 'in') return;
    const id = setTimeout(() => setKernel('wait'), reduce.current ? 60 : 900);
    return () => clearTimeout(id);
  }, [kernel, caught]);

  const grab = () => {
    if (kernel !== 'in' && kernel !== 'wait') return;
    const k = caught + 1;
    setKernel('got');
    setLine(t.lines[k - 1]);
    haptic(k === GOAL ? 26 : 14);
    if (k === GOAL) sfx.wahwah();
    else {
      sfx.boing();
      sfx.score(k);
    }
    later(() => {
      setCaught(k);
      setKernel(null);
      if (k < GOAL) {
        later(() => {
          setKernel('in');
          sfx.pop();
        }, reduce.current ? 80 : 520);
      }
    }, reduce.current ? 150 : 820);
  };

  const i = Math.min(caught, GOAL - 1);
  const [rx, ry] = RESTS[i];
  const burnt = i === GOAL - 1;

  return (
    <MiniGame title={t.title} how={t.how} goal={GOAL} score={caught} won={caught >= GOAL} winTitle={t.winTitle} winLine={t.winLine} onDone={onDone}>
      {/* ketukan di mana saja menangkap popcorn yang sedang di udara */}
      <div className={g.field} onClick={grab}>
        <span className={cx(g.tub, kernel === 'in' && g.tubPop, kernel === 'got' && g.tubCatch)} aria-hidden>
          <Sprite name="game-bioskop-kotak" className={g.tubArt} />
        </span>

        {kernel ? (
          <button
            key={caught}
            ref={kernelRef}
            type="button"
            className={cx(g.kernel, g[kernel])}
            style={{ '--x': `${rx}%`, '--y': `${ry}%` } as CSSProperties}
            onClick={(e) => {
              e.stopPropagation();
              grab();
            }}
            disabled={kernel === 'got'}
            aria-label={t.kernelLabel}
          >
            <span className={g.bob}>
              <Sprite name={burnt ? 'game-bioskop-popcorn-gosong' : 'game-bioskop-popcorn'} className={g.kernelArt} />
              <Face mood={kernel === 'got' ? 'caught' : burnt ? 'burnt' : 'happy'} />
              {burnt && kernel !== 'got' ? (
                <span className={g.smoke} aria-hidden>
                  <i />
                  <i />
                </span>
              ) : null}
            </span>
            {burnt && kernel === 'wait' ? <span className={g.excuse}>{t.burnt}</span> : null}
          </button>
        ) : null}

        {line ? (
          <div key={line} className={g.bubble} role="status">
            {line}
          </div>
        ) : null}

        <TapCue target={kernelRef} show={caught === 0 && kernel === 'wait'} delay={1300} />
      </div>
    </MiniGame>
  );
}
