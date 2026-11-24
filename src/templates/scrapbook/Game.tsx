'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, cx, haptic, sfx, useTimers } from '../kit';
import type { TEXT } from './i18n';
import g from './game.module.css';

type GameText = (typeof TEXT)['id']['game'];
type Decoy = 'stroberi' | 'persik' | 'tutup';

/** tiga hati coretan pena (persen halaman, ukuran em, putar) — terlihat jelas, sebagian mengintip dari balik selotip */
const HEARTS: [x: number, y: number, size: number, rot: number][] = [
  [26, 24, 3.4, -14],
  [74, 50, 3.2, 12],
  [32, 78, 3.6, -6],
];
/** umpan lucu yang bentuknya agak mirip hati */
const DECOYS: { id: Decoy; sprite: string; x: number; y: number; w: number; rot: number }[] = [
  { id: 'stroberi', sprite: 'bento-stroberi', x: 72, y: 22, w: 4.2, rot: 14 },
  { id: 'persik', sprite: 'game-persik', x: 24, y: 51, w: 4.3, rot: -8 },
  { id: 'tutup', sprite: 'game-tutup-botol', x: 70, y: 74, w: 3.4, rot: 20 },
];
const HEART_D = 'M20 31C9 23 3 16 6 9.5 8.6 4 16 4.4 20 11c3.4-6.8 11.6-7 14 -1.2C36.6 16 31 23 20.6 31.4';

/**
 * "Cari hati yang ngumpet": selembar halaman scrapbook berisi tiga hati coretan pena (jelas terlihat)
 * dan beberapa benda yang bentuknya agak mirip hati. Ketuk ketiga hatinya; umpan hanya bikin celetukan.
 */
export function HeartHunt({ t, onDone }: { t: GameText; onDone: () => void }) {
  const later = useTimers();
  const [found, setFound] = useState<boolean[]>(HEARTS.map(() => false));
  const [line, setLine] = useState<{ k: number; text: string }>({ k: 0, text: t.start });
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState<{ id: Decoy; k: number } | null>(null);
  const score = found.filter(Boolean).length;

  const say = (text: string) => setLine((l) => ({ k: l.k + 1, text }));

  const pickHeart = (i: number) => {
    if (found[i]) return;
    const n = score + 1;
    setFound((f) => f.map((v, k) => (k === i ? true : v)));
    sfx.pencil();
    later(() => sfx.score(n - 1), 200);
    haptic(12);
    say(t.found[Math.min(n - 1, t.found.length - 1)]);
    if (n >= HEARTS.length) later(() => setWon(true), 1300);
  };

  const pickDecoy = (id: Decoy) => {
    sfx.boing();
    haptic(8);
    setShake((sh) => ({ id, k: (sh?.k ?? 0) + 1 }));
    say(t.decoys[id]);
  };

  return (
    <MiniGame
      title={t.title}
      how={t.how}
      art={<Sprite name="game-hati-imut" style={{ width: '5.4em', height: 'auto', maxHeight: 'none' }} />}
      goal={HEARTS.length}
      score={score}
      won={won}
      winTitle={t.winTitle}
      winLine={t.winLine}
      onDone={onDone}
    >
      <Page found={found} won={won} line={line} shake={shake} t={t} onHeart={pickHeart} onDecoy={pickDecoy} />
    </MiniGame>
  );
}

function Page({
  found,
  won,
  line,
  shake,
  t,
  onHeart,
  onDecoy,
}: {
  found: boolean[];
  won: boolean;
  line: { k: number; text: string };
  shake: { id: Decoy; k: number } | null;
  t: GameText;
  onHeart: (i: number) => void;
  onDecoy: (id: Decoy) => void;
}) {
  const [idle, setIdle] = useState(false);
  const count = found.filter(Boolean).length;
  const first = useRef(true);

  // diam sebentar: hati yang belum ketemu berdenyut pelan
  useEffect(() => {
    setIdle(false);
    const id = setTimeout(() => setIdle(true), first.current ? 3000 : 2500);
    first.current = false;
    return () => clearTimeout(id);
  }, [count]);

  return (
    <div className={cx(g.desk, won && g.won)}>
      <div className={g.page}>
        <span className={g.holes} aria-hidden />

        {/* hiasan: tidak bisa diketuk */}
        <Sprite name="scrapbook-perangko" className={g.stamp} />
        <Sprite name="scrapbook-pres-1" className={g.flower} />
        <Sprite name="scrapbook-tiket" className={g.ticket} />
        <svg viewBox="0 0 44 44" className={g.spark} aria-hidden>
          <path d="M22 4v12M22 28v12M4 22h12M28 22h12M10 10l6 6M28 28l6 6M34 10l-6 6M16 28l-6 6" />
        </svg>

        {DECOYS.map((d) => (
          <button
            key={d.id}
            type="button"
            className={cx(g.decoy, shake?.id === d.id && g.shake)}
            style={{ left: `${d.x}%`, top: `${d.y}%`, '--w': `${d.w}em`, '--r': `${d.rot}deg` } as CSSProperties}
            onClick={() => onDecoy(d.id)}
            aria-label={t.decoyLabels[d.id]}
          >
            <Sprite key={shake?.id === d.id ? shake.k : 0} name={d.sprite} className={g.decoyArt} />
          </button>
        ))}

        {HEARTS.map(([x, y, size, rot], i) => (
          <button
            key={i}
            type="button"
            className={cx(g.heart, found[i] && g.got, idle && !found[i] && g.nudge)}
            style={{ left: `${x}%`, top: `${y}%`, '--s': `${size}em`, '--r': `${rot}deg` } as CSSProperties}
            onClick={() => onHeart(i)}
            aria-label={t.heart}
            aria-pressed={found[i]}
          >
            <svg viewBox="0 0 40 36" className={g.heartArt} aria-hidden>
              <path d={HEART_D} />
            </svg>
            <svg viewBox="0 0 100 100" className={g.ring} aria-hidden>
              <path pathLength={1} d="M52,8C80,6 96,28 92,54C88,82 60,96 36,90C12,84 2,58 10,36C16,20 32,10 58,12" />
            </svg>
          </button>
        ))}

        {/* selotip yang menutupi sebagian hati pertama: biar terasa "ngumpet", tapi tetap kelihatan */}
        <Sprite name="polaroid-selotip-1" className={g.tape} />

        {/* maskot hati yang mengintip dari bawah halaman, melompat tiap ada hati yang ketemu */}
        <span key={count} className={cx(g.buddy, count > 0 && g.cheer)} aria-hidden>
          <Sprite name="game-hati-imut" className={g.buddyArt} />
        </span>
      </div>

      {won ? null : (
        <p key={line.k} className={g.line} role="status">
          {line.text}
        </p>
      )}
    </div>
  );
}
