'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import type { GameText } from './i18n';
import s from './StarGame.module.css';

/** tempat bintang berhenti dan berkelip menunggu diketuk: [kiri %, atas %] */
const RESTS: Array<[number, number]> = [
  [66, 24],
  [32, 32],
  [56, 18],
];
const GOAL = RESTS.length;

/**
 * Tangkap Bintang Jatuh: satu bintang meluncur pelan dari pojok langit lalu BERHENTI dan berkelip,
 * menunggu diketuk (ketukan di mana saja di langit juga menangkapnya). Bintang yang tertangkap terbang
 * ke toples kaca kecil di bawah. Sekali waktu ada pesawat lewat: diketuk boleh, cuma dapat celetukan.
 */
export function StarGame({ t, onDone }: { t: GameText; onDone: () => void }) {
  const later = useTimers();
  const [caught, setCaught] = useState(0);
  /** bintang yang sedang ada di langit: 'in' meluncur, 'wait' berkelip, 'got' sedang terbang ke toples */
  const [star, setStar] = useState<'in' | 'wait' | 'got' | null>(null);
  const [plane, setPlane] = useState<'fly' | 'tapped' | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const starRef = useRef<HTMLButtonElement>(null);
  const reduce = useRef(false);

  // bintang pertama datang begitu langitnya siap
  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    later(() => setStar('in'), 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // meluncur → berhenti
  useEffect(() => {
    if (star !== 'in') return;
    const id = setTimeout(() => setStar('wait'), reduce.current ? 50 : 2300);
    return () => clearTimeout(id);
  }, [star, caught]);

  const catchStar = () => {
    if (star !== 'in' && star !== 'wait') return;
    const k = caught + 1;
    setStar('got');
    setLine(t.wishes[k - 1]);
    sfx.chime();
    sfx.score(k);
    haptic(16);
    later(() => {
      setCaught(k);
      if (k < GOAL) {
        setStar(null);
        // pesawat lewat sekali, setelah bintang pertama
        if (k === 1) later(() => setPlane('fly'), 400);
        later(() => setStar('in'), k === 1 ? 1600 : 900);
      }
    }, reduce.current ? 150 : 900);
  };

  const tapPlane = () => {
    if (plane !== 'fly') return;
    setPlane('tapped');
    setLine(t.plane);
    sfx.boing();
    haptic(10);
  };

  const [rx, ry] = RESTS[Math.min(caught, GOAL - 1)];
  const won = caught >= GOAL;

  return (
    <div className={s.host}>
      <MiniGame title={t.title} how={t.how} goal={GOAL} score={caught} won={won} winTitle={t.winTitle} winLine={t.winLine} onDone={onDone}>
        {/* ketukan di mana saja di langit menangkap bintang yang sedang ada */}
        <div className={s.field} onClick={catchStar}>
          {star ? (
            <button
              key={caught}
              ref={starRef}
              type="button"
              className={cx(s.star, s[star])}
              style={{ '--x': rx, '--y': ry } as CSSProperties}
              onClick={(e) => {
                e.stopPropagation();
                catchStar();
              }}
              disabled={star === 'got'}
              aria-label={t.starLabel}
            >
              <span className={s.trail} aria-hidden />
              <Sprite name="game-bintang" className={s.starArt} />
            </button>
          ) : null}

          {plane ? (
            <button
              type="button"
              className={cx(s.plane, plane === 'tapped' && s.planeTapped)}
              onClick={(e) => {
                e.stopPropagation();
                tapPlane();
              }}
              onAnimationEnd={(e) => e.target === e.currentTarget && setPlane(null)}
              aria-label={t.planeLabel}
            >
              <Sprite name="game-pesawat" className={s.planeArt} />
              <span className={s.blink} aria-hidden />
            </button>
          ) : null}

          {/* toples harapan */}
          <div className={cx(s.jar, caught > 0 && s.jarLit)} style={{ '--n': caught } as CSSProperties} aria-hidden>
            <span className={s.lid} />
            <span className={s.glass}>
              {Array.from({ length: caught }, (_, i) => (
                <i key={i} className={s.mote} style={{ '--i': i } as CSSProperties} />
              ))}
            </span>
          </div>

          {line ? (
            <div key={line} className={s.bubble} role="status">
              {line}
            </div>
          ) : null}

          <TapCue target={starRef} show={caught === 0 && star === 'wait'} delay={1200} />
        </div>
      </MiniGame>
    </div>
  );
}
