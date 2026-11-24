'use client';

import { type CSSProperties, type MouseEvent as ReactMouseEvent, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import type { GameText } from './i18n';
import s from './BalloonGame.module.css';

type Kind = 'sock' | 'sandal' | 'voucher';
/** dua balon pesta yang mengapung diam menunggu diketuk: [kiri %, atas %, sprite, isi] */
const SPOTS: Array<[number, number, string, Kind]> = [
  [27, 34, 'lilin-balon-1', 'sock'],
  [73, 30, 'lilin-balon-3', 'sandal'],
];

/** Wajah imut di balon (viewBox sama dengan sprite balon 150×330; gelembungnya di y 10..166). */
function Face({ gold }: { gold?: boolean }) {
  return (
    <svg className={s.face} viewBox="0 0 150 330" aria-hidden>
      {[56, 94].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="84" rx="7.5" ry="9" fill="#3a1d12" />
          <circle cx={x - 2.6} cy="80" r="3" fill="#fff" />
          <circle cx={x + 2.4} cy="88" r="1.3" fill="#fff" opacity="0.8" />
        </g>
      ))}
      <ellipse cx="44" cy="100" rx="9" ry="5" fill="#ff8f86" opacity="0.6" />
      <ellipse cx="106" cy="100" rx="9" ry="5" fill="#ff8f86" opacity="0.6" />
      {gold ? <path d="M65,100q10,12 20,0Z" fill="#3a1d12" /> : <path d="M66,101q9,8 18,0" fill="none" stroke="#3a1d12" strokeWidth="3.2" strokeLinecap="round" />}
    </svg>
  );
}

function Item({ kind, t }: { kind: Kind; t: GameText }) {
  if (kind === 'sock') return <Sprite name="game-kaoskaki" className={s.itemArt} />;
  if (kind === 'sandal') return <Sprite name="game-sandal" className={cx(s.itemArt, s.wide)} />;
  return (
    <span className={s.voucher}>
      <b>{t.voucher[0]}</b>
      <span>{t.voucher[1]}</span>
      <i>{t.voucher[2]}</i>
    </span>
  );
}

/**
 * Pecahkan Balon: dua balon pesta mengapung diam; tiap diketuk meletus dan menjatuhkan "hadiah" konyol
 * (kaus kaki bau, sandal jepit sebelah). Lalu naik balon emas berisi voucher peluk. Tiga ketukan, selesai.
 * Ketukan di mana saja di arena meletuskan balon terdekat yang belum meletus.
 */
export function BalloonGame({ t, onDone }: { t: GameText; onDone: () => void }) {
  const later = useTimers();
  const [popped, setPopped] = useState<boolean[]>([false, false]);
  const [goldPopped, setGoldPopped] = useState(false);
  /** isi yang baru keluar dari balon (dipamerkan sebentar) */
  const [show, setShow] = useState<{ kind: Kind; x: number; y: number } | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const firstRef = useRef<HTMLButtonElement>(null);
  const goldRef = useRef<HTMLButtonElement>(null);
  const count = popped.filter(Boolean).length;
  const score = count + (goldPopped ? 1 : 0);
  const goldUp = count === SPOTS.length;

  const pop = (i: number) => {
    if (popped[i]) return;
    const next = [...popped];
    next[i] = true;
    setPopped(next);
    sfx.pop();
    sfx.bonk();
    haptic(18);
    const [x, y, , kind] = SPOTS[i];
    setShow({ kind, x, y });
    setLine(t.lines[count]);
    later(() => setShow((v) => (v && v.kind === kind ? null : v)), 2200);
  };

  const popGold = () => {
    if (!goldUp || goldPopped) return;
    setGoldPopped(true);
    sfx.pop();
    sfx.chime();
    haptic(30);
    setShow({ kind: 'voucher', x: 50, y: 36 });
    setLine(t.lines[2]);
  };

  /** ketukan di arena: balon emas kalau sudah naik, selain itu balon terdekat yang belum meletus */
  const tapField = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (goldUp) return popGold();
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 100;
    const open = SPOTS.map((sp, i) => ({ i, d: Math.abs(sp[0] - px) })).filter(({ i }) => !popped[i]);
    if (open.length) pop(open.sort((a, b) => a.d - b.d)[0].i);
  };

  return (
    <div className={s.host}>
      <MiniGame title={t.title} how={t.how} goal={3} score={score} won={goldPopped} winTitle={t.winTitle} winLine={t.winLine} onDone={onDone}>
        <div className={s.field} onClick={tapField}>
          {SPOTS.map(([x, y, name], i) => (
            <button
              key={i}
              ref={i === 0 ? firstRef : undefined}
              type="button"
              className={cx(s.balloon, popped[i] && s.popped)}
              style={{ left: `${x}%`, top: `${y}%`, '--d': `${i * 0.2}s` } as CSSProperties}
              onClick={(e) => {
                e.stopPropagation();
                pop(i);
              }}
              disabled={popped[i]}
              aria-label={t.balloonLabel}
            >
              <span className={s.bob}>
                <Sprite name={name} className={s.balloonArt} />
                <Face />
              </span>
              {popped[i] ? <span className={s.burst} aria-hidden /> : null}
            </button>
          ))}

          {/* balon emas: naik setelah dua balon pertama meletus */}
          {goldUp ? (
            <button
              ref={goldRef}
              type="button"
              className={cx(s.balloon, s.gold, goldPopped && s.popped)}
              style={{ left: '50%', top: '30%', '--d': '0.1s' } as CSSProperties}
              onClick={(e) => {
                e.stopPropagation();
                popGold();
              }}
              disabled={goldPopped}
              aria-label={t.goldLabel}
            >
              <span className={s.bob}>
                <span className={s.halo} aria-hidden />
                <Sprite name="lilin-balon-2" className={s.balloonArt} />
                <Face gold />
                <span className={s.sparkle} aria-hidden>
                  ✦
                </span>
                <span className={cx(s.sparkle, s.sparkle2)} aria-hidden>
                  ✦
                </span>
              </span>
              {goldPopped ? <span className={s.burst} aria-hidden /> : null}
            </button>
          ) : null}

          {/* isi yang baru keluar dari balon */}
          {show ? (
            <span key={show.kind} className={cx(s.reveal, show.kind === 'voucher' && s.big)} style={{ left: `${show.x}%`, top: `${show.y}%` } as CSSProperties} aria-hidden>
              <Item kind={show.kind} t={t} />
              {show.kind === 'sock' ? (
                <span className={s.stink}>
                  <i />
                  <i />
                  <i />
                </span>
              ) : null}
            </span>
          ) : null}

          {/* rak kecil: barang konyol yang sudah keluar */}
          <div className={s.shelf} aria-hidden>
            {SPOTS.map(([, , , kind], i) =>
              popped[i] && !(show && show.kind === kind) ? (
                <span key={kind} className={s.shelfItem}>
                  <Item kind={kind} t={t} />
                </span>
              ) : null,
            )}
          </div>

          {line ? (
            <div key={line} className={s.bubble} role="status">
              {line}
            </div>
          ) : null}
          {goldUp && !goldPopped && !show ? <div className={s.goldNote}>{t.goldNote}</div> : null}

          <TapCue target={firstRef} show={count === 0} delay={1600} />
          <TapCue target={goldRef} show={goldUp && !goldPopped && !show} delay={1800} />
        </div>
      </MiniGame>
    </div>
  );
}
