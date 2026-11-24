'use client';

import { type CSSProperties, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import type { GameText } from './i18n';
import g from './game.module.css';

type Mood = 'sleep' | 'yawn' | 'awake';

/** tiga bintang di atas bantal: [kiri %, miring, bertopi tidur] */
const STARS: [number, number, boolean][] = [
  [20, -9, false],
  [50, 4, true],
  [80, 10, false],
];
const GOAL = STARS.length;

/** Wajah bintang (viewBox sama dengan lukisan game-toples-bintang 260×260): tidur → menguap → melek. */
function Face({ mood }: { mood: Mood }) {
  const ink = '#4a2f1a';
  const eye = (x: number) => (
    <g key={x}>
      <ellipse cx={x} cy={130} rx={9} ry={10.5} fill={ink} />
      <circle cx={x - 3} cy={126} r={3.4} fill="#fff" />
      <circle cx={x + 3.4} cy={134} r={1.5} fill="#fff" opacity={0.85} />
    </g>
  );
  return (
    <svg className={g.face} viewBox="0 0 260 260" aria-hidden>
      <ellipse cx={86} cy={150} rx={12} ry={7} fill="#ff8f9c" opacity={mood === 'awake' ? 0.75 : 0.5} />
      <ellipse cx={174} cy={150} rx={12} ry={7} fill="#ff8f9c" opacity={mood === 'awake' ? 0.75 : 0.5} />
      {mood === 'sleep' ? (
        <>
          {/* mata terpejam, mulut mungil */}
          <path d="M94,130q10,9 20,0M146,130q10,9 20,0" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />
          <path d="M124,152q6,5 12,0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
        </>
      ) : mood === 'yawn' ? (
        <>
          {/* menguap lebar: mata menyipit */}
          <path d="M96,124l15,6l-15,6M164,124l-15,6l15,6" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx={130} cy={158} rx={12} ry={15} fill={ink} />
          <ellipse cx={130} cy={165} rx={7} ry={6} fill="#ff8f9c" />
          <path className={g.tear} d="M176,132q5,8 0,12q-5,-4 0,-12Z" fill="#bfe3f7" stroke="#6aa9cf" strokeWidth={1.2} />
        </>
      ) : (
        <>
          {eye(104)}
          {eye(156)}
          <path d="M112,150q18,18 36,0" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/**
 * "Bangunkan bintangnya!": tiga bintang gembul ketiduran di atas bantal. Tiap diketuk (ketukan di mana
 * saja membangunkan yang terdekat), ia menguap lebar, meregang, lalu melek dan menyala. Tidak ada kalah.
 */
export function SleepyStars({ t, onDone }: { t: GameText; onDone: () => void }) {
  const later = useTimers();
  const [moods, setMoods] = useState<Mood[]>(() => STARS.map(() => 'sleep'));
  const [line, setLine] = useState<{ k: number; text: string } | null>(null);
  const [won, setWon] = useState(false);
  const count = useRef(0);
  const firstRef = useRef<HTMLButtonElement>(null);
  const score = moods.filter((m) => m !== 'sleep').length;
  /** kamar makin terang tiap satu bintang benar-benar melek (0..1) */
  const lit = moods.filter((m) => m === 'awake').length / GOAL;

  const wake = (i: number) => {
    if (moods[i] !== 'sleep') return;
    const nth = count.current++;
    setMoods((prev) => prev.map((m, j) => (j === i ? 'yawn' : m)));
    setLine({ k: nth, text: t.lines[nth % t.lines.length] });
    sfx.squeak();
    haptic(12);
    later(() => sfx.score(nth), 160);
    later(() => {
      setMoods((prev) => prev.map((m, j) => (j === i ? 'awake' : m)));
      sfx.boing();
    }, 1000);
    if (nth + 1 >= GOAL) later(() => setWon(true), 2100);
  };

  /** ketukan di arena: bangunkan bintang tidur yang paling dekat */
  const tapField = (x: number, width: number) => {
    const px = (x / Math.max(1, width)) * 100;
    const asleep = STARS.map((st, i) => ({ i, d: Math.abs(st[0] - px) })).filter(({ i }) => moods[i] === 'sleep');
    if (asleep.length) wake(asleep.sort((a, b) => a.d - b.d)[0].i);
  };

  return (
    <MiniGame title={t.title} how={t.how} goal={GOAL} score={score} won={won} winTitle={t.winTitle} winLine={t.winLine} onDone={onDone}>
      {(playing) => (
        <div
          className={cx(g.arena, lit >= 1 && g.bright)}
          style={{ '--lit': lit } as CSSProperties}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            tapField(e.clientX - r.left, r.width);
          }}
        >
          {/* debu cahaya: baru kelihatan setelah bintangnya mulai menyala */}
          <div className={g.motes} aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
          <div className={g.bed}>
            <Sprite name="game-toples-bantal" className={g.pillow} />
            {STARS.map(([x, rot, cap], i) => {
              const mood = moods[i];
              return (
                <button
                  key={i}
                  ref={i === 0 ? firstRef : undefined}
                  type="button"
                  className={cx(g.star, g[mood])}
                  style={{ left: `${x}%`, '--rot': `${rot}deg`, '--d': `${i * 0.5}s` } as CSSProperties}
                  onClick={(e) => {
                    e.stopPropagation();
                    wake(i);
                  }}
                  disabled={!playing || mood !== 'sleep'}
                  aria-label={mood === 'sleep' ? t.starLabel : t.awakeLabel}
                  aria-pressed={mood !== 'sleep'}
                >
                  <span className={g.halo} aria-hidden />
                  <span className={g.body}>
                    <Sprite name="game-toples-bintang" className={g.art} />
                    <Face mood={mood} />
                    {cap ? <Sprite name="game-toples-topi" className={g.cap} /> : null}
                  </span>
                  {mood === 'sleep' ? (
                    <span className={g.zzz} aria-hidden>
                      <i>z</i>
                      <i>z</i>
                      <i>Z</i>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {line && !won ? (
            <p key={line.k} className={g.line} role="status">
              {line.text}
            </p>
          ) : null}
          <TapCue target={firstRef} show={playing && score === 0} delay={1700} at={{ x: 0.5, y: 0.55 }} />
        </div>
      )}
    </MiniGame>
  );
}
