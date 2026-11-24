'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, cx, haptic, sfx, useTimers } from '../kit';
import { fmt } from '@/i18n/client';
import type { TEXT } from './i18n';
import g from './game.module.css';

type GameText = (typeof TEXT)['id']['game'];
type Ant = { spot: number; greedy: boolean };

/** tiga semut, berhenti antre di tiga titik (persen lebar arena); yang tengah si rakus pembawa sosis */
const ANTS: Ant[] = [
  { spot: 30, greedy: false },
  { spot: 57, greedy: true },
  { spot: 80, greedy: false },
];

/** butiran nasi di tumpahan: [x em, y em, putar] */
const GRAINS: [number, number, number][] = [
  [0, 0.7, -20],
  [0.9, 0.2, 30],
  [1.7, 0.8, 70],
  [0.6, 1.2, 110],
  [2.4, 0.3, -40],
];

/**
 * "Semut lapar!": tiga semut imut datang antre ke tumpahan nasi di meja. Ketuk tiap semut (di mana saja
 * di dekatnya) supaya dapat sebutir nasi, lalu ia pulang sambil joget kecil. Semut kedua mencoba membawa
 * sosis gurita utuh; ketukannya mengembalikan sosis ke kotak dan menggantinya dengan sebutir nasi.
 */
export function HungryAnts({ t, to, onDone }: { t: GameText; to: string; onDone: () => void }) {
  const later = useTimers();
  const [fed, setFed] = useState<boolean[]>(ANTS.map(() => false));
  const [line, setLine] = useState<{ k: number; text: string }>({ k: 0, text: t.start });
  const [won, setWon] = useState(false);
  const score = fed.filter(Boolean).length;

  const feed = (i: number) => {
    if (fed[i]) return;
    const n = score + 1;
    setFed((f) => f.map((v, k) => (k === i ? true : v)));
    haptic(12);
    if (ANTS[i].greedy) {
      sfx.boing();
      setLine((l) => ({ k: l.k + 1, text: fmt(t.greedy, { to }) }));
    } else {
      sfx.score(n - 1);
      later(() => sfx.squeak(), 160);
      setLine((l) => ({ k: l.k + 1, text: t.thanks[Math.min(n - 1, t.thanks.length - 1)] }));
    }
    if (n >= ANTS.length) later(() => setWon(true), 1500);
  };

  return (
    <MiniGame
      title={t.title}
      how=""
      art={
        <span className={g.introArt} aria-hidden>
          <Sprite name="game-semut" style={{ width: '5.6em', height: 'auto', maxHeight: 'none' }} />
          <Sprite name="game-nasi" className={g.introGrain} style={{ width: '1.8em', height: 'auto', maxHeight: 'none' }} />
        </span>
      }
      goal={ANTS.length}
      score={score}
      won={won}
      winTitle={t.winTitle}
      winLine={fmt(t.winLine, { to })}
      onDone={onDone}
    >
      <Table fed={fed} won={won} line={line} t={t} onFeed={feed} />
    </MiniGame>
  );
}

function Table({ fed, won, line, t, onFeed }: { fed: boolean[]; won: boolean; line: { k: number; text: string }; t: GameText; onFeed: (i: number) => void }) {
  const [arrived, setArrived] = useState(false);
  const [idle, setIdle] = useState(false);
  const count = fed.filter(Boolean).length;
  const first = useRef(true);

  // semut berjalan masuk begitu meja tampil (dengan atau tanpa tombol "Main!")
  useEffect(() => {
    const id = requestAnimationFrame(() => setArrived(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // diam sebentar: semut yang belum kebagian melompat kecil minta perhatian
  useEffect(() => {
    setIdle(false);
    const id = setTimeout(() => setIdle(true), first.current ? 3200 : 2500);
    first.current = false;
    return () => clearTimeout(id);
  }, [count]);

  return (
    <div className={cx(g.table, won && g.won)}>
      {/* tumpahan nasi kecil di meja */}
      <span className={g.pile} aria-hidden>
        {GRAINS.map(([x, y, r], k) => (
          <Sprite key={k} name="game-nasi" className={g.grain} style={{ left: `${x}em`, top: `${y}em`, rotate: `${r}deg` }} />
        ))}
      </span>

      {ANTS.map((a, i) => (
        <button
          key={i}
          type="button"
          className={cx(g.ant, arrived && g.arrived, fed[i] && g.fed, a.greedy && g.greedy, idle && !fed[i] && g.hop)}
          style={{ '--spot': `${a.spot}%`, '--i': i } as CSSProperties}
          onClick={() => onFeed(i)}
          aria-label={a.greedy ? t.antGreedy : t.ant}
          aria-pressed={fed[i]}
        >
          <span className={g.walker}>
            {a.greedy ? <Sprite name="bento-sosis" className={cx(g.loot, fed[i] && g.lootBack)} /> : null}
            <Sprite name="game-nasi" className={cx(g.gift, fed[i] && g.given)} />
            <Sprite name="game-semut" className={g.body} />
            {fed[i] ? (
              <span className={g.bubble} aria-hidden>
                {a.greedy ? t.greedyBubble : t.bubbles[i % t.bubbles.length]}
              </span>
            ) : null}
          </span>
        </button>
      ))}

      {won ? null : (
        <p key={line.k} className={g.line} role="status">
          {line.text}
        </p>
      )}
    </div>
  );
}
