'use client';

import { type CSSProperties, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import s from './game.module.css';

export type AwanText = {
  title: string;
  how: string;
  /** satu kalimat per awan yang pergi */
  lines: string[];
  sun: string;
  winTitle: string;
  winLine: string;
  cloudAria: string;
};

/** 0 = cemberut · 1 = menangis habis-habisan · 2 = malu-malu pamit */
const TAPS = 2;
/** awan: [kiri %, atas %, lebar em, tunda goyang s, arah pergi] */
const CLOUDS: [number, number, number, number, 1 | -1][] = [
  [28, 26, 10.4, 0, -1],
  [72, 33, 10, 0.6, 1],
  [36, 50, 10.2, 1.1, -1],
];

/** Wajah awan: cemberut → menangis → hampir habis → malu-malu pamit. */
function CloudFace({ hits }: { hits: number }) {
  return (
    <svg className={s.cloudFace} viewBox="0 0 280 170" aria-hidden>
      {hits === 0 ? (
        <>
          <circle cx={112} cy={100} r={9} fill="#2a2f3d" />
          <circle cx={168} cy={100} r={9} fill="#2a2f3d" />
          <circle cx={109} cy={96} r={3.4} fill="#fff" />
          <circle cx={165} cy={96} r={3.4} fill="#fff" />
          <path d="M126,128q14,-10 28,0" stroke="#2a2f3d" strokeWidth={5} strokeLinecap="round" fill="none" />
        </>
      ) : hits < TAPS ? (
        <>
          <path d="M100,98l14,6l-14,6M180,98l-14,6l14,6" stroke="#2a2f3d" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <ellipse cx={140} cy={128} rx={12} ry={hits === 1 ? 10 : 7} fill="#2a2f3d" />
          <path d="M104,114q-4,14 2,20" stroke="#8ac4ea" strokeWidth={6} strokeLinecap="round" fill="none" />
          <path d="M176,114q4,14 -2,20" stroke="#8ac4ea" strokeWidth={6} strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx={118} cy={98} r={8} fill="#2a2f3d" />
          <circle cx={174} cy={98} r={8} fill="#2a2f3d" />
          <circle cx={121} cy={95} r={3} fill="#fff" />
          <circle cx={177} cy={95} r={3} fill="#fff" />
          <path d="M136,124q10,7 20,0" stroke="#2a2f3d" strokeWidth={4.5} strokeLinecap="round" fill="none" />
          <ellipse cx={100} cy={118} rx={12} ry={7} fill="#ff9fb0" opacity={0.75} />
          <ellipse cx={192} cy={118} rx={12} ry={7} fill="#ff9fb0" opacity={0.75} />
        </>
      )}
      {hits === 0 ? (
        <>
          <ellipse cx={96} cy={120} rx={10} ry={6} fill="#c6cddb" opacity={0.6} />
          <ellipse cx={184} cy={120} rx={10} ry={6} fill="#c6cddb" opacity={0.6} />
        </>
      ) : null}
    </svg>
  );
}

function SunFace() {
  return (
    <svg className={s.sunFace} viewBox="0 0 240 240" aria-hidden>
      <path d="M90,112q12,-14 24,0M126,112q12,-14 24,0" stroke="#7a3a12" strokeWidth={6} strokeLinecap="round" fill="none" />
      <path d="M100,134q20,22 40,0" stroke="#7a3a12" strokeWidth={6} strokeLinecap="round" fill="none" />
      <ellipse cx={84} cy={136} rx={12} ry={7} fill="#ff8f6b" opacity={0.6} />
      <ellipse cx={156} cy={136} rx={12} ry={7} fill="#ff8f6b" opacity={0.6} />
    </svg>
  );
}

/**
 * "Usir awan mendung!": tiap awan cemberut diketuk tiga kali sampai hujannya habis,
 * lalu ia pamit malu-malu. Setelah langit bersih, matahari mengintip dan tersenyum.
 */
export function AwanGame({ t, onDone }: { t: AwanText; onDone: () => void }) {
  const [hits, setHits] = useState<number[]>(() => CLOUDS.map(() => 0));
  const [line, setLine] = useState<{ k: number; text: string } | null>(null);
  const [sun, setSun] = useState(false);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState<number[]>(() => CLOUDS.map(() => 0));
  const gone = useRef(0);
  const firstRef = useRef<HTMLButtonElement>(null);
  const later = useTimers();
  const score = hits.filter((h) => h >= TAPS).length;

  /** satu ketukan cukup: awan menangis sampai habis, lalu pamit sendiri */
  const tap = (i: number) => {
    if (hits[i] > 0) return;
    setHits((prev) => prev.map((v, j) => (j === i ? 1 : v)));
    setShake((prev) => prev.map((v, j) => (j === i ? v + 1 : v)));
    sfx.bonk();
    haptic(14);
    later(() => {
      setHits((prev) => prev.map((v, j) => (j === i ? TAPS : v)));
      sfx.whoosh();
    }, 1100);
    later(() => sfx.score(gone.current), 1250);
    const n = ++gone.current;
    setLine({ k: n, text: t.lines[(n - 1) % t.lines.length] });
    if (n >= CLOUDS.length) {
      later(() => {
        setSun(true);
        sfx.chime();
        setLine({ k: 99, text: t.sun });
      }, 1300);
      later(() => setWon(true), 2700);
    }
  };

  return (
    <MiniGame
      title={t.title}
      how={t.how}
      art={<Sprite name="game-awan" className={s.introCloud} />}
      goal={CLOUDS.length}
      score={score}
      won={won}
      winTitle={t.winTitle}
      winLine={t.winLine}
      onDone={onDone}
    >
      {(playing) => (
        <>
          <span className={cx(s.sky, sun && s.skyClear)} aria-hidden />
          <span className={cx(s.sun, sun && s.sunUp)} aria-hidden>
            <span className={s.sunSpin}>
              <Sprite name="game-matahari" className={s.sunImg} />
            </span>
            <SunFace />
          </span>

          {CLOUDS.map(([x, y, w, d, dir], i) => {
            const h = hits[i];
            const done = h >= TAPS;
            return (
              <button
                key={i}
                ref={i === 0 ? firstRef : undefined}
                type="button"
                className={cx(s.cloud, done && s.leaving, h > 0 && !done && s.crying)}
                style={{ left: `${x}%`, top: `${y}%`, width: `${w}em`, '--d': `${d}s`, '--dir': dir, '--size': 1 - h * 0.1 } as CSSProperties}
                onClick={() => tap(i)}
                disabled={!playing || h > 0}
                aria-label={t.cloudAria}
              >
                <span key={shake[i]} className={cx(s.cloudBody, shake[i] > 0 && !done && s.jolt)}>
                  <Sprite name="game-awan" className={s.cloudImg} />
                  <CloudFace hits={h} />
                </span>
                <span className={cx(s.rain, h > 0 && !done && s.rainHard)} aria-hidden>
                  {[0, 1, 2, 3, 4, 5].map((r) => (
                    <i key={r} style={{ '--r': r } as CSSProperties} />
                  ))}
                </span>
              </button>
            );
          })}

          {line ? (
            <p key={line.k} className={s.line} role="status">
              {line.text}
            </p>
          ) : null}
          <TapCue target={firstRef} show={playing && hits[0] === 0 && gone.current === 0} delay={1800} at={{ x: 0.5, y: 0.4 }} />
        </>
      )}
    </MiniGame>
  );
}
