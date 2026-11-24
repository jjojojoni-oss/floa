'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import { fmt } from '@/i18n/client';
import type { PasporText } from './i18n';
import g from './game.module.css';

type GameText = PasporText['game'];

/** barang yang nongol dari koper, satu per satu: [lukisan, letak % dari lebar koper, lebar em, miring] */
const ITEMS: { sprite: string; x: number; w: number; rot: number }[] = [
  { sprite: 'game-paspor-bantal', x: 30, w: 6.4, rot: -12 },
  { sprite: 'game-paspor-sandal', x: 68, w: 7.6, rot: 16 },
  { sprite: 'game-paspor-penanak', x: 48, w: 7, rot: -5 },
];
const GOAL = ITEMS.length;

/** Wajah koper (viewBox sama dengan lukisannya, 320×250): ngeden selagi kepenuhan, lega begitu tertutup. */
function Face({ mood }: { mood: 'strain' | 'oof' | 'happy' }) {
  const ink = '#0f3432';
  return (
    <svg className={g.face} viewBox="0 0 320 250" aria-hidden>
      {mood === 'happy' ? (
        <>
          <path d="M126,146q10,-12 20,0M174,146q10,-12 20,0" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />
          <path d="M142,166q18,16 36,0" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />
        </>
      ) : mood === 'oof' ? (
        <>
          <path d="M124,138l18,8l-18,8M196,138l-18,8l18,8" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx="160" cy="170" rx="9" ry="10" fill={ink} />
        </>
      ) : (
        <>
          {[136, 184].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy="146" rx="10" ry="11.5" fill={ink} />
              <circle cx={x - 3.4} cy="141.5" r="3.8" fill="#fff" />
              <circle cx={x + 3.6} cy="150.5" r="1.6" fill="#fff" opacity="0.85" />
            </g>
          ))}
          <path d="M146,172q7,-7 14,0t14,0" fill="none" stroke={ink} strokeWidth="4.4" strokeLinecap="round" />
          {/* tetes keringat */}
          <path className={g.sweat} d="M214,112q8,12 0,18q-8,-6 0,-18Z" fill="#d7f1ff" stroke="#6aa9cf" strokeWidth="1.5" />
        </>
      )}
      <ellipse cx="116" cy="166" rx="11" ry="6.5" fill="#ff9c8f" opacity="0.6" />
      <ellipse cx="204" cy="166" rx="11" ry="6.5" fill="#ff9c8f" opacity="0.6" />
    </svg>
  );
}

/**
 * "Kopernya nggak mau nutup!": koper kekenyangan, tiga barang konyol nongol bergantian (bantal leher,
 * sandal jepit sebelah, penanak nasi). Ketuk barangnya (atau di mana saja) supaya masuk lagi.
 * Tiga ketukan, selesai; tidak ada waktu, tidak ada salah.
 */
export function KoperGame({ t, onDone }: { t: GameText; onDone: () => void }) {
  const later = useTimers();
  /** berapa barang yang sudah masuk */
  const [score, setScore] = useState(0);
  /** barang yang sedang nongol; null = sedang berganti */
  const [up, setUp] = useState<number | null>(null);
  const [bounce, setBounce] = useState(0);
  const [line, setLine] = useState<{ k: number; text: string } | null>(null);
  const [won, setWon] = useState(false);
  const upRef = useRef<HTMLButtonElement>(null);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    later(() => {
      setUp(0);
      sfx.boing();
    }, 550);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tuck = () => {
    if (up === null || score >= GOAL) return;
    const k = up;
    setUp(null);
    setScore(k + 1);
    setBounce((b) => b + 1);
    setLine({ k, text: t.lines[k] });
    sfx.bonk();
    later(() => sfx.score(k + 1), 140);
    haptic(k + 1 === GOAL ? 26 : 14);
    if (k + 1 < GOAL) {
      later(() => {
        setUp(k + 1);
        sfx.boing();
      }, reduce.current ? 300 : 1050);
    } else {
      later(() => sfx.chime(), 500);
      later(() => setWon(true), reduce.current ? 500 : 1300);
    }
  };

  const mood = score >= GOAL ? 'happy' : up === null && score > 0 ? 'oof' : 'strain';

  return (
    <MiniGame title={t.title} how={t.how} goal={GOAL} score={score} won={won} winTitle={t.winTitle} winLine={t.winLine} onDone={onDone}>
      {/* ketukan di mana saja juga memasukkan barang yang sedang nongol: tidak perlu tepat */}
      <div className={g.arena} onClick={tuck}>
        <div className={cx(g.case, score >= GOAL && g.closed)}>
          {ITEMS.map((it, i) => (
            <button
              key={it.sprite}
              ref={i === up ? upRef : undefined}
              type="button"
              className={cx(g.item, i === up && g.up, i < score && g.in)}
              style={{ left: `${it.x}%`, width: `${it.w}em`, '--rot': `${it.rot}deg` } as CSSProperties}
              onClick={(e) => {
                e.stopPropagation();
                tuck();
              }}
              disabled={i !== up}
              tabIndex={i === up ? 0 : -1}
              aria-label={fmt(t.tuck, { item: t.items[i] })}
            >
              <Sprite name={it.sprite} className={g.itemArt} />
            </button>
          ))}
          <span key={bounce} className={cx(g.body, bounce > 0 && g.bounce)}>
            <Sprite name="game-paspor-koper" className={g.bodyArt} />
            <Face mood={mood} />
          </span>
        </div>

        {line && !won ? (
          <p key={line.k} className={g.line} role="status">
            {line.text}
          </p>
        ) : null}

        <TapCue target={upRef} show={score === 0 && up === 0} delay={1500} />
      </div>
    </MiniGame>
  );
}
