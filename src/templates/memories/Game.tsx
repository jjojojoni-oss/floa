'use client';

import { type CSSProperties, type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, cx, haptic, sfx, useTimers } from '../kit';
import type { TEXT } from './i18n';
import g from './game.module.css';

type GameText = (typeof TEXT)['id']['game'];
type Item = 'remote' | 'cat' | 'fuse';

/** letak barang di kamar yang redup (persen arena) + lebar gambar (em) */
const SPOTS: Record<Item, { x: number; y: number; w: number; sprite: string; rot: number }> = {
  remote: { x: 24, y: 38, w: 3.1, sprite: 'game-remot', rot: -14 },
  fuse: { x: 74, y: 34, w: 5, sprite: 'game-sekring', rot: 4 },
  cat: { x: 50, y: 70, w: 9.4, sprite: 'game-kucing-tidur', rot: -2 },
};
const ITEMS: Item[] = ['remote', 'fuse', 'cat'];

/**
 * "Eh, mati lampu!": kamar jadi redup, senter mengikuti jari. Tiga barang lucu terlihat samar-samar
 * (remot, kotak sekring, kucing yang tidur). Ketuk ketiganya dalam urutan apa saja, lampu menyala lagi.
 * Mainan kecil, bukan tantangan: tidak ada waktu, tidak ada salah.
 */
export function DarkHunt({ t, onStart, onDone }: { t: GameText; onStart: () => void; onDone: () => void }) {
  const later = useTimers();
  const [found, setFound] = useState<Record<Item, boolean>>({ remote: false, fuse: false, cat: false });
  const [line, setLine] = useState<{ k: number; text: string }>({ k: 0, text: t.start });
  const [lit, setLit] = useState(false);
  const [won, setWon] = useState(false);
  const score = ITEMS.filter((i) => found[i]).length;

  const say = (text: string) => setLine((l) => ({ k: l.k + 1, text }));

  const pick = (it: Item) => {
    if (found[it] || lit) return;
    const n = score + 1;
    setFound((f) => ({ ...f, [it]: true }));
    haptic(12);
    if (n < ITEMS.length) {
      sfx.score(n - 1);
      if (it === 'cat') later(() => sfx.squeak(), 180);
      if (it === 'fuse') sfx.crack();
      say(it === 'fuse' ? t.fuseEarly : t.lines[it]);
      return;
    }
    // barang terakhir: klik, lampu menyala
    say(it === 'fuse' ? t.lines.fuse : `${t.lines[it]} ${t.lightsOn}`);
    sfx.crack();
    later(() => {
      setLit(true);
      sfx.chime();
      haptic(18);
    }, 450);
    later(() => setWon(true), 1500);
  };

  return (
    <MiniGame
      title={t.title}
      how={t.how}
      art={<Sprite name="game-senter" style={{ width: '7.4em', height: 'auto', maxHeight: 'none' }} />}
      goal={ITEMS.length}
      score={score}
      won={won}
      winTitle={t.winTitle}
      winLine={t.winLine}
      onStart={onStart}
      onDone={onDone}
    >
      <Room found={found} lit={lit} won={won} line={line} t={t} onPick={pick} onShown={onStart} />
    </MiniGame>
  );
}

function Room({
  found,
  lit,
  won,
  line,
  t,
  onPick,
  onShown,
}: {
  found: Record<Item, boolean>;
  lit: boolean;
  won: boolean;
  line: { k: number; text: string };
  t: GameText;
  onPick: (it: Item) => void;
  onShown: () => void;
}) {
  const field = useRef<HTMLDivElement>(null);
  const down = useRef(false);
  const [light, setLight] = useState<{ x: number; y: number } | null>(null);
  const [idle, setIdle] = useState(false);
  const shown = useRef(onShown);
  shown.current = onShown;

  // arena tampil = permainan sudah mulai (dengan atau tanpa tombol "Main!")
  useEffect(() => {
    shown.current();
  }, []);

  // diam sebentar: barang yang belum ketemu berdenyut pelan
  const count = ITEMS.filter((i) => found[i]).length;
  useEffect(() => {
    setIdle(false);
    const id = setTimeout(() => setIdle(true), 2500);
    return () => clearTimeout(id);
  }, [count]);

  const aim = (e: ReactPointerEvent) => {
    const r = field.current?.getBoundingClientRect();
    if (r) setLight({ x: e.clientX - r.left, y: e.clientY - r.top });
  };
  const vars = (light ? { '--lx': `${light.x}px`, '--ly': `${light.y}px` } : {}) as CSSProperties;

  return (
    <div
      ref={field}
      className={cx(g.room, lit && g.lit, won && g.won)}
      style={vars}
      onPointerDown={(e) => {
        down.current = true;
        aim(e);
      }}
      onPointerMove={(e) => {
        if (down.current || e.pointerType === 'mouse') aim(e);
      }}
      onPointerUp={() => (down.current = false)}
      onPointerCancel={() => (down.current = false)}
    >
      {/* redup di mana-mana, sedikit lebih terang di lingkaran senter */}
      <div className={g.dark} aria-hidden />
      <div className={g.beam} aria-hidden />

      {ITEMS.map((it) => {
        const sp = SPOTS[it];
        return (
          <button
            key={it}
            type="button"
            className={cx(g.thing, found[it] && g.found, it === 'cat' && g.cat, idle && !found[it] && !lit && g.nudge)}
            style={{ left: `${sp.x}%`, top: `${sp.y}%`, '--w': `${sp.w}em`, '--r': `${sp.rot}deg` } as CSSProperties}
            onClick={() => onPick(it)}
            aria-label={t.items[it]}
            aria-pressed={found[it]}
          >
            <Sprite name={sp.sprite} className={g.thingArt} />
            {it === 'cat' ? (
              <span className={g.zzz} aria-hidden>
                <i>z</i>
                <i>z</i>
                <i>z</i>
              </span>
            ) : null}
            {found[it] ? <span className={g.check} aria-hidden /> : null}
          </button>
        );
      })}

      {won ? null : (
        <p key={line.k} className={g.line} role="status">
          {line.text}
        </p>
      )}
    </div>
  );
}
