'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import type { RumahText } from './i18n';
import g from './game.module.css';

type GameText = RumahText['game'];
export type Mood = 'sleep' | 'peek' | 'grumpy' | 'yawn' | 'happy';
const GOAL = 3;

/** Wajah si Oren di atas lukisannya (viewBox sama, 300×200): tidur, mengintip, cemberut, menguap, senang. */
export function CatFace({ mood }: { mood: Mood }) {
  const ink = '#4a2410';
  const closed = (x: number, y: number) => <path d={`M${x},${y}q10,7 20,0`} fill="none" stroke={ink} strokeWidth={3.6} strokeLinecap="round" />;
  const open = (x: number, y: number, half = false) => (
    <>
      <ellipse cx={x + 10} cy={y} rx={8.5} ry={half ? 4.2 : 7} fill="#d8e872" stroke={ink} strokeWidth={2.4} />
      <ellipse cx={x + 10} cy={y + (half ? 0.6 : 0)} rx={2.2} ry={half ? 3.4 : 5.6} fill="#1a0a05" />
      <circle cx={x + 7.6} cy={y - (half ? 1 : 2.6)} r={1.6} fill="#fff" />
      {half ? <path d={`M${x - 1},${y - 3}h22`} stroke={ink} strokeWidth={3.4} strokeLinecap="round" /> : null}
    </>
  );
  return (
    <svg className={g.face} viewBox="0 0 300 200" aria-hidden>
      <ellipse cx={58} cy={137} rx={9} ry={5} fill="#ff8f7a" opacity={mood === 'happy' ? 0.7 : 0.45} />
      <ellipse cx={116} cy={135} rx={9} ry={5} fill="#ff8f7a" opacity={mood === 'happy' ? 0.7 : 0.45} />
      {mood === 'sleep' ? (
        <>
          {closed(58, 120)}
          {closed(94, 118)}
        </>
      ) : mood === 'peek' ? (
        <>
          {closed(58, 120)}
          {open(94, 117)}
        </>
      ) : mood === 'grumpy' ? (
        <>
          {open(58, 120, true)}
          {open(94, 118, true)}
          <path d="M128,86l8,-6M131,94l9,-2M126,79l3,-9" stroke="#d0453a" strokeWidth={3} strokeLinecap="round" />
        </>
      ) : mood === 'yawn' ? (
        <>
          <path d="M60,114l12,6l-12,6M112,112l-12,6l12,6" fill="none" stroke={ink} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d="M58,124q10,-10 20,0M94,122q10,-10 20,0" fill="none" stroke={ink} strokeWidth={3.6} strokeLinecap="round" />
        </>
      )}
      <path d="M81,134h10l-5,5.4z" fill="#e0707a" stroke={ink} strokeWidth={1.2} strokeLinejoin="round" />
      {mood === 'yawn' ? (
        <>
          <ellipse cx={86} cy={150} rx={8.5} ry={10} fill="#5a1a1a" stroke={ink} strokeWidth={2} />
          <ellipse cx={86} cy={155} rx={5.4} ry={4} fill="#f08a8a" />
        </>
      ) : mood === 'grumpy' ? (
        <path d="M79,148q7,-6 14,0" fill="none" stroke={ink} strokeWidth={2.6} strokeLinecap="round" />
      ) : mood === 'peek' ? (
        <path d="M80,145h12" fill="none" stroke={ink} strokeWidth={2.6} strokeLinecap="round" />
      ) : (
        <path d="M78,142q4,5 8,0q4,5 8,0" fill="none" stroke={ink} strokeWidth={2.6} strokeLinecap="round" />
      )}
      <path d="M60,141l-26,-5M60,146l-24,4M112,139l26,-6M112,144l24,3" stroke="#fff8ee" strokeWidth={1.4} strokeLinecap="round" opacity={0.85} />
    </svg>
  );
}

/** Si Oren: lukisan badan + ekor yang sesekali dikibaskan + wajah. Ukurannya dari className (rasio 3:2). */
export function Cat({ mood, className, zzz = true }: { mood: Mood; className?: string; zzz?: boolean }) {
  return (
    <span className={cx(g.cat, mood !== 'sleep' && g.awake, className)} aria-hidden>
      <span className={g.tail}>
        <Sprite name="game-rumah-ekor" className={g.art} />
      </span>
      <Sprite name="game-rumah-kucing" className={g.art} />
      <CatFace mood={mood} />
      {zzz && mood === 'sleep' ? (
        <span className={g.zzz}>
          <i>z</i>
          <i>z</i>
          <i>z</i>
        </span>
      ) : null}
    </span>
  );
}

/**
 * Teras depan pintu dari dekat (lukisan 780×1300, menempel di bawah layar seperti latar): 1em di dalamnya = 32
 * satuan lukisan. Dipakai mini-game dan langkah keset.
 */
export function Doorstep({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cx(g.scene, className)}>
      <Sprite name="game-rumah-teras" className={g.fill} />
      {children}
    </div>
  );
}

/**
 * Bangunkan si Oren: kucing oren tidur meringkuk di keset dan tidak mau pindah. Tiap ketukan (di mana saja)
 * membuatnya mengintip, cemberut, lalu menguap; ketukan ketiga ia pindah ke keranjang. Tidak bisa kalah.
 */
export function CatGame({ t, onDone }: { t: GameText; onDone: () => void }) {
  const later = useTimers();
  const [pokes, setPokes] = useState(0);
  const [mood, setMood] = useState<Mood>('sleep');
  const [jolt, setJolt] = useState(0);
  const [moved, setMoved] = useState(false);
  const [line, setLine] = useState<string | null>(null);
  const catRef = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);
  /** nomor ketukan terakhir: "tidur lagi" dari ketukan lama tidak boleh menimpa yang lebih baru */
  const seq = useRef(0);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const poke = () => {
    if (busy.current || pokes >= GOAL) return;
    busy.current = true;
    const k = pokes + 1;
    seq.current = k;
    setMood(k === 1 ? 'peek' : k === 2 ? 'grumpy' : 'yawn');
    setLine(t.lines[k - 1]);
    setJolt((v) => v + 1);
    haptic(k === GOAL ? 24 : 12);
    if (k === 1) sfx.squeak();
    else if (k === 2) sfx.bonk();
    else {
      sfx.boing();
      later(() => {
        setMood('happy');
        setMoved(true);
        [4, 5, 7].forEach((n, i) => later(() => sfx.note(n), i * 140));
      }, reduce.current ? 120 : 700);
    }
    later(
      () => {
        setPokes(k);
        busy.current = false;
        // belum tiga kali: ia tidur lagi
        if (k < GOAL)
          later(() => {
            if (seq.current === k) setMood('sleep');
          }, reduce.current ? 300 : 1500);
      },
      reduce.current ? 150 : 600,
    );
  };

  return (
    <MiniGame title={t.title} how={t.how} goal={GOAL} score={pokes} won={pokes >= GOAL} winTitle={t.winTitle} winLine={t.winLine} onDone={onDone}>
      {(live) => (
        // ketukan di mana saja membangunkannya
        <div className={g.field} onClick={poke}>
          <Doorstep>
            <Sprite name="rumah-keset" className={g.mat} />
            <button
              ref={catRef}
              type="button"
              className={cx(g.catBtn, moved && g.moved)}
              onClick={(e) => {
                e.stopPropagation();
                poke();
              }}
              aria-label={t.catLabel}
            >
              <span key={jolt} className={cx(g.jolt, jolt > 0 && !moved && g.joltGo)}>
                <Cat mood={mood} className={g.bigCat} />
              </span>
            </button>
            {line && live ? (
              <div key={line} className={g.bubble} role="status">
                {line}
              </div>
            ) : null}
          </Doorstep>
          <TapCue target={catRef} show={pokes === 0 && mood === 'sleep'} delay={1500} at={{ x: 0.35, y: 0.55 }} />
        </div>
      )}
    </MiniGame>
  );
}
