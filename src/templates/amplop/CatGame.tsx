'use client';

import { type CSSProperties, type RefObject, useLayoutEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import type { GameText } from './i18n';
import s from './CatGame.module.css';

type Box = { left: number; top: number; w: number; h: number };
/** tempat si kucing tidur di atas amplop (pecahan kotak amplop): tengah → kiri → kanan */
const SPOTS: Array<[number, number]> = [
  [0.5, 0.5],
  [0.3, 0.46],
  [0.7, 0.52],
];
const GOAL = 3;

/** cap kaki kucing yang tertinggal di amplop (dipasang di sisi segel amplop setelah game) */
export function PawPrint() {
  return (
    <svg className={s.paw} viewBox="0 0 60 60" aria-hidden>
      <ellipse cx="30" cy="38" rx="13" ry="11" />
      <ellipse cx="14" cy="22" rx="5.5" ry="7" transform="rotate(-18 14 22)" />
      <ellipse cx="25" cy="15" rx="5.5" ry="7" transform="rotate(-6 25 15)" />
      <ellipse cx="37" cy="15" rx="5.5" ry="7" transform="rotate(6 37 15)" />
      <ellipse cx="47" cy="22" rx="5.5" ry="7" transform="rotate(18 47 22)" />
    </svg>
  );
}

/**
 * Kucing Tidur: kucing oranye tidur pas di atas amplop. Tiap dielus (ketuk di mana saja) ia bangun
 * setengah, menggerutu imut, lalu pindah tidur ke sudut lain; elusan ketiga membuatnya melompat pergi.
 */
export function CatGame({ env, t, onDone }: { env: RefObject<HTMLDivElement | null>; t: GameText; onDone: () => void }) {
  const later = useTimers();
  /** arena; disimpan lewat callback ref supaya ukuran dihitung begitu arenanya muncul */
  const [field, setField] = useState<HTMLDivElement | null>(null);
  const catRef = useRef<HTMLButtonElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [pets, setPets] = useState(0);
  const [spot, setSpot] = useState(0);
  const [state, setState] = useState<'sleep' | 'wake' | 'gone'>('sleep');
  const [line, setLine] = useState<string | null>(null);
  const [hearts, setHearts] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      const a = env.current?.getBoundingClientRect();
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
  }, [env, field]);

  const pet = () => {
    if (state !== 'sleep' || pets >= GOAL) return;
    const k = pets + 1;
    setPets(k);
    setState('wake');
    setLine(t.lines[k - 1]);
    setHearts((h) => h + 1);
    haptic(k === GOAL ? 26 : 12);
    sfx.squeak();
    sfx.score(k);
    if (k === GOAL) {
      // bangun, meregang, lalu melompat pergi
      later(() => {
        sfx.boing();
        setState('gone');
      }, 1100);
      return;
    }
    // pindah ke sudut lain, lalu tidur lagi
    later(() => setSpot(k), 900);
    later(() => setState('sleep'), 1900);
  };

  const [fx, fy] = SPOTS[spot];
  const w = box ? Math.max(160, Math.min(250, box.w * 0.7)) : 190;
  const pos = box ? ({ left: box.left + box.w * fx, top: box.top + box.h * fy, width: w } as CSSProperties) : undefined;

  return (
    <div className={s.host}>
      <MiniGame title={t.title} how={t.how} goal={GOAL} score={pets} won={state === 'gone'} winTitle={t.winTitle} winLine={t.winLine} onDone={onDone}>
        {/* elus di mana saja: tidak perlu tepat di kucingnya */}
        <div ref={setField} className={s.field} onClick={pet}>
          {box ? (
            <button
              ref={catRef}
              type="button"
              className={cx(s.cat, s[state])}
              style={pos}
              onClick={(e) => {
                e.stopPropagation();
                pet();
              }}
              disabled={state !== 'sleep'}
              aria-label={t.catLabel}
            >
              <span className={s.body}>
                <Sprite name="game-kucing" className={cx(s.art, state !== 'sleep' && s.hide)} />
                <Sprite name="game-kucing-bangun" className={cx(s.art, state === 'sleep' && s.hide)} />
              </span>
              {state === 'sleep' ? (
                <span className={s.zzz} aria-hidden>
                  <i>z</i>
                  <i>z</i>
                  <i>Z</i>
                </span>
              ) : null}
              {hearts > 0 && state === 'wake' ? (
                <span key={hearts} className={s.hearts} aria-hidden>
                  <i>♥</i>
                  <i>♥</i>
                  <i>♥</i>
                </span>
              ) : null}
            </button>
          ) : null}

          {line ? (
            <div key={line} className={s.bubble} role="status">
              {line}
            </div>
          ) : null}

          <TapCue target={catRef} show={pets === 0 && state === 'sleep'} delay={1500} at={{ x: 0.3, y: 0.45 }} />
        </div>
      </MiniGame>
    </div>
  );
}
