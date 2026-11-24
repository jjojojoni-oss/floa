'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';

/** menjalankan `run` sekali, begitu arena benar-benar dimainkan */
function OnPlay({ playing, run }: { playing: boolean; run: () => void }) {
  const done = useRef(false);
  useEffect(() => {
    if (playing && !done.current) {
      done.current = true;
      run();
    }
  }, [playing, run]);
  return null;
}
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import s from './game.module.css';

export type CicakText = {
  title: string;
  how: string;
  lines: string[];
  hide: string;
  winTitle: string;
  winLine: string;
  catchAria: string;
};

/** satu tempat mengintip: tepi sebuah foto di meja. x,y = pusat foto (px, relatif ke arena) */
export type Spot = { x: number; y: number; w: number; h: number; rot: number };
/** ukuran arena (px) dan 1em (px), untuk memastikan cicak selalu terlihat utuh */
export type Spots = { list: Spot[]; w: number; h: number; em: number };
type Peek = { k: number; spot: number; side: 0 | 1 | 2 };
type Caught = { k: number; spot: number; side: 0 | 1 | 2; line: number };

const GOAL = 3;
/** arah keluar dari foto: atas, kiri, kanan */
const SIDE_ANGLE = [0, -90, 90];

/**
 * "Cicak kosan!": cicak-cicak gembul mengintip dari balik foto-foto di meja.
 * Diketuk → ekornya putus (ditinggal, menggeliat lucu), badannya kabur sambil mencicit.
 * Cicak yang tidak diketuk cuma ngumpet lagi; tidak ada kalah.
 */
export function CicakGame({ t, spots, onDone }: { t: CicakText; spots: () => Spots; onDone: () => void }) {
  const [score, setScore] = useState(0);
  const [peek, setPeek] = useState<Peek | null>(null);
  const [caught, setCaught] = useState<Caught[]>([]);
  const [line, setLine] = useState<{ k: number; text: string } | null>(null);
  const [places, setPlaces] = useState<Spot[]>([]);
  /** pasangan (foto, sisi) yang cicaknya pasti utuh di layar */
  const okPeeks = useRef<[number, 0 | 1 | 2][]>([]);
  const later = useTimers();
  const n = useRef(0);
  const last = useRef(-1);
  const scoreRef = useRef(0);
  const peekRef = useRef<HTMLButtonElement>(null);
  const reduce = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const next = (wait: number, list = places) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (scoreRef.current >= GOAL || !list.length) return;
      const ok = okPeeks.current.length ? okPeeks.current : list.map((_, i) => [i, 0] as [number, 0]);
      let pick = ok[Math.floor(Math.random() * ok.length)];
      if (ok.length > 1 && pick[0] === last.current) pick = ok.find((o) => o[0] !== last.current) ?? pick;
      const [spot, side] = pick;
      last.current = spot;
      const k = ++n.current;
      setPeek({ k, spot, side });
      // cicak menunggu sampai diketuk; kalau lama didiamkan, ia pindah ke foto lain (tidak pernah hilang)
      timer.current = setTimeout(() => {
        setPeek((p) => (p && p.k === k ? null : p));
        setLine({ k: -k, text: t.hide });
        next(350, list);
      }, 9000);
    }, wait);
  };

  const start = () => {
    const { list, w, h, em } = spots();
    // titik tengah cicak untuk tiap foto & sisi; buang yang terpotong tepi layar atau tertutup penghitung skor
    const ok: [number, 0 | 1 | 2][] = [];
    list.forEach((p, i) => {
      ([0, 1, 2] as const).forEach((side) => {
        const a = ((p.rot + SIDE_ANGLE[side]) * Math.PI) / 180;
        const reach = (side === 0 ? p.h / 2 : p.w / 2) + 2.7 * em;
        const x = p.x + Math.sin(a) * reach;
        const y = p.y - Math.cos(a) * reach;
        const r = 3 * em;
        if (x - r > 0 && x + r < w && y - r > 3.4 * em && y + r < h - 3.2 * em) ok.push([i, side]);
      });
    });
    okPeeks.current = ok;
    setPlaces(list);
    next(700, list);
  };

  const tap = () => {
    if (!peek) return;
    if (timer.current) clearTimeout(timer.current);
    const sc = scoreRef.current + 1;
    scoreRef.current = sc;
    setScore(sc);
    setCaught((c) => [...c.slice(-3), { k: peek.k, spot: peek.spot, side: peek.side, line: sc - 1 }]);
    setLine({ k: peek.k, text: t.lines[(sc - 1) % t.lines.length] });
    setPeek(null);
    sfx.squeak();
    later(() => sfx.score(sc), 140);
    haptic(14);
    if (sc < GOAL) next(1300);
  };

  const place = (spot: number, side: number) => {
    const p = places[spot];
    if (!p) return {} as CSSProperties;
    const reach = side === 0 ? p.h / 2 : p.w / 2;
    return {
      left: p.x,
      top: p.y,
      transform: `rotate(${p.rot + SIDE_ANGLE[side]}deg) translateY(${-reach}px)`,
    } as CSSProperties;
  };

  return (
    <MiniGame
      title={t.title}
      how={t.how}
      art={<Sprite name="game-cicak" className={s.introCicak} />}
      goal={GOAL}
      score={score}
      won={score >= GOAL}
      winTitle={t.winTitle}
      winLine={t.winLine}
      onDone={onDone}
    >
      {(playing) => (
        <>
          <OnPlay playing={playing} run={start} />
          {/* yang tertangkap: ekor tertinggal menggeliat, badan kabur menjauhi foto */}
          {caught.map((c) => (
            <span key={c.k} className={s.anchor} style={place(c.spot, c.side)} aria-hidden>
              <span className={s.runner}>
                <Sprite name="game-cicak" className={s.runBody} />
              </span>
              <span className={s.tailLeft}>
                <Sprite name="game-cicak-ekor" className={s.tailImg} />
              </span>
            </span>
          ))}

          {/* yang sedang mengintip dari balik tepi foto */}
          {peek && playing ? (
            <span key={peek.k} className={s.anchor} style={place(peek.spot, peek.side)}>
              <button ref={peekRef} type="button" className={s.peek} onClick={tap} aria-label={t.catchAria}>
                <span className={s.peekIn}>
                  <Sprite name="game-cicak" className={s.peekBody} />
                </span>
              </button>
            </span>
          ) : null}

          {line ? (
            <p key={line.k} className={cx(s.line, line.k < 0 && s.lineSoft)} role="status">
              {line.text}
            </p>
          ) : null}

          <TapCue target={peekRef} show={playing && !!peek && score === 0} delay={900} at={{ x: 0.5, y: 0.55 }} />
        </>
      )}
    </MiniGame>
  );
}
