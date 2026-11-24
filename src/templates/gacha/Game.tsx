'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import type { GachaText } from './i18n';
import g from './game.module.css';

type GameText = GachaText['game'];

/** tempat si kapsul mengintip dari balik pot: [kiri %, atas %, miring] terhadap kotak lukisan pot */
const SPOTS: Array<[number, number, number]> = [
  [15, 80, -26],
  [92, 30, 24],
  [50, 1, -4],
];
const HIDE: [number, number] = [50, 62];
const GOAL = SPOTS.length;

/** Wajah kapsul di belahan atasnya (viewBox sama dengan lukisannya, 200×200): malu-malu, kaget, atau lega. */
function Face({ mood }: { mood: 'shy' | 'caught' | 'happy' }) {
  const ink = '#3a2440';
  return (
    <svg className={g.face} viewBox="0 0 200 200" aria-hidden>
      {mood === 'caught' ? (
        <>
          <path d="M66,58l14,8l-14,8M134,58l-14,8l14,8" fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx={100} cy={82} rx={7} ry={8} fill={ink} />
        </>
      ) : mood === 'happy' ? (
        <>
          <path d="M66,68q9,-12 18,0M116,68q9,-12 18,0" fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" />
          <path d="M88,78q12,13 24,0" fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" />
        </>
      ) : (
        <>
          {[76, 124].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy={64} rx={8} ry={9.5} fill={ink} />
              <circle cx={x + 3} cy={60} r={3} fill="#fff" />
            </g>
          ))}
          <path d="M92,84q8,-5 16,0" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />
        </>
      )}
      <ellipse cx={56} cy={80} rx={10} ry={6} fill="#ff6b80" opacity={mood === 'shy' ? 0.75 : 0.6} />
      <ellipse cx={144} cy={80} rx={10} ry={6} fill="#ff6b80" opacity={mood === 'shy' ? 0.75 : 0.6} />
    </svg>
  );
}

/**
 * Bujuk kapsul pemalu: satu kapsul berwajah menggelinding kabur ke balik pot daun, lalu mengintip dari
 * tiga tempat bergantian. Tiap ketukan (di mana saja) "menangkap basah" dia; yang ketiga dia menyerah
 * dan keluar sendiri. Tidak ada kalah.
 */
export function ShyCapsule({ t, onDone }: { t: GameText; onDone: () => void }) {
  const later = useTimers();
  const [found, setFound] = useState(0);
  /** roll = menggelinding masuk, hide = di balik pot, peek = mengintip, caught = ketahuan, out = keluar */
  const [st, setSt] = useState<'roll' | 'hide' | 'peek' | 'caught' | 'out'>('roll');
  const [line, setLine] = useState<string | null>(null);
  const capRef = useRef<HTMLButtonElement>(null);
  const quick = useRef(false);

  useEffect(() => {
    quick.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    later(() => sfx.squeak(), 250);
    later(() => setSt('hide'), quick.current ? 80 : 1000);
    later(() => {
      setSt('peek');
      sfx.pop();
    }, quick.current ? 200 : 1650);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grab = () => {
    if (st !== 'peek') return;
    const k = found + 1;
    setSt('caught');
    setLine(t.lines[k - 1]);
    haptic(k === GOAL ? 26 : 14);
    sfx.squeak();
    sfx.score(k);
    later(() => {
      if (k >= GOAL) {
        setSt('out');
        setFound(k);
        sfx.boing();
        return;
      }
      setSt('hide');
      later(() => {
        setFound(k);
        setSt('peek');
        sfx.pop();
      }, quick.current ? 90 : 620);
    }, quick.current ? 160 : 900);
  };

  const i = Math.min(found, GOAL - 1);
  const [sx, sy, rot] = SPOTS[i];
  const at = st === 'out' ? [14, 40, -8] : st === 'peek' || st === 'caught' ? [sx, sy, rot] : [HIDE[0], HIDE[1], 0];
  const mood = st === 'caught' ? 'caught' : st === 'out' ? 'happy' : 'shy';

  return (
    <MiniGame title={t.title} how={t.how} goal={GOAL} score={st === 'out' ? GOAL : found} won={st === 'out'} winTitle={t.winTitle} winLine={t.winLine} onDone={onDone}>
      {/* ketukan di mana saja ikut menangkap basah kapsul yang sedang mengintip */}
      <div className={g.field} onClick={grab}>
        <span className={g.shade} aria-hidden />
        <div className={g.pot}>
          <button
            ref={capRef}
            type="button"
            className={cx(g.cap, g[st])}
            style={{ '--x': `${at[0]}%`, '--y': `${at[1]}%`, '--rot': `${at[2]}deg` } as CSSProperties}
            onClick={(e) => {
              e.stopPropagation();
              grab();
            }}
            disabled={st !== 'peek'}
            aria-label={t.capLabel}
          >
            <span className={g.bob}>
              <Sprite name="gacha-bawah" className={g.half} />
              <Sprite name="gacha-atas-lila" className={g.half} />
              <Face mood={mood} />
            </span>
            {st === 'peek' && i === GOAL - 1 ? <span className={g.excuse}>{t.shy}</span> : null}
          </button>
          <Sprite name="game-gacha-pot" className={g.potArt} />
        </div>

        {line ? (
          <div key={line} className={g.bubble} role="status">
            {line}
          </div>
        ) : null}

        <TapCue target={capRef} show={found === 0 && st === 'peek'} delay={1300} />
      </div>
    </MiniGame>
  );
}
