'use client';

import { type CSSProperties, type RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MiniGame, Sprite, TapCue, cx, haptic, sfx, useTimers } from '../kit';
import type { GameText } from './i18n';
import s from './BeeGame.module.css';

type Spot = { x: number; y: number; d: number };
type Box = { left: number; top: number; w: number; h: number };

const GOAL = 3;

/** kotak `target` relatif terhadap `field` (dihitung ulang saat ukuran layar berubah) */
function useRelBox(target: RefObject<HTMLElement | null>, field: HTMLElement | null) {
  const [box, setBox] = useState<Box | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const a = target.current?.getBoundingClientRect();
      const b = field?.getBoundingClientRect();
      if (a && b && a.width) setBox({ left: a.left - b.left, top: a.top - b.top, w: a.width, h: a.height });
    };
    measure();
    const t = setTimeout(measure, 300);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, [target, field]);
  return box;
}

/** Wajah lebah (digambar di atas lukisannya): makin diusir, makin cemberut. Koordinatnya sama dengan lukisan lebah (digeser 40 ke bawah di kanvas 240×244). */
function Face({ mood, munch }: { mood: number; munch: boolean }) {
  const ink = '#3a1d10';
  const eye = (x: number, y: number) => (
    <g key={x}>
      <ellipse cx={x} cy={y} rx="11" ry="12.5" fill={ink} />
      <circle cx={x - 4} cy={y - 5} r="4.2" fill="#fff" />
      <circle cx={x + 4} cy={y + 4} r="1.8" fill="#fff" opacity="0.85" />
    </g>
  );
  return (
    <svg className={s.face} viewBox="0 -40 240 244" aria-hidden>
      {mood === 0 ? (
        <>
          {/* nyam-nyam, mata tertutup bahagia */}
          <path d="M64,106q9,-11 18,0M94,102q9,-11 18,0" fill="none" stroke={ink} strokeWidth="4.5" strokeLinecap="round" />
          <ellipse className={cx(munch && s.chew)} cx="86" cy="130" rx="7" ry="5" fill={ink} />
        </>
      ) : mood === 1 ? (
        <>
          {eye(73, 106)}
          {eye(103, 102)}
          <ellipse cx="88" cy="132" rx="5" ry="6" fill={ink} />
          {/* tetes keringat */}
          <path className={s.sweat} d="M128,70q8,12 0,18q-8,-6 0,-18Z" fill="#bfe3f7" stroke="#6aa9cf" strokeWidth="1.5" />
        </>
      ) : mood === 2 ? (
        <>
          {eye(73, 108)}
          {eye(103, 104)}
          {/* kelopak turun: kesal */}
          <path d="M60,100h26M90,96h26" stroke="#f5bd2e" strokeWidth="9" strokeLinecap="round" />
          <path d="M60,96l26,4M90,93l26,3" stroke={ink} strokeWidth="4" strokeLinecap="round" />
          <path d="M78,132h18" stroke={ink} strokeWidth="4" strokeLinecap="round" />
        </>
      ) : mood === 3 ? (
        <>
          {eye(73, 108)}
          {eye(103, 104)}
          <path d="M62,92l22,8M94,96l22,-8" stroke={ink} strokeWidth="4.5" strokeLinecap="round" />
          {/* manyun */}
          <path d="M80,134q4,-6 8,0q4,6 8,0" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
          <circle cx="68" cy="126" r="9" fill="#f08a7a" opacity="0.6" />
        </>
      ) : (
        <>
          {/* ngambek: mata > <, pipi merah, asap kecil */}
          <path d="M64,100l14,8l-14,8M114,98l-14,8l14,8" fill="none" stroke={ink} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M78,136q10,-8 20,0" fill="none" stroke={ink} strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="66" cy="126" r="10" fill="#ee5b4a" opacity="0.6" />
          <circle className={s.puff} cx="58" cy="56" r="8" fill="#fff" opacity="0.8" />
          <circle className={cx(s.puff, s.puff2)} cx="44" cy="48" r="6" fill="#fff" opacity="0.7" />
        </>
      )}
    </svg>
  );
}

/**
 * Usir Lebah Rakus: lebah gendut hinggap di bunga buket untuk ngemil kelopak. Ia diam menunggu
 * sampai diketuk (ketukan di mana saja di arena juga dihitung); tiap diusir ia pindah ke bunga lain
 * sambil makin cemberut, dan ketukan ketiga membuatnya ngambek lalu pergi.
 */
export function BeeGame({
  bq,
  heads,
  t,
  onDone,
}: {
  /** elemen buket (kanvas 600×720) untuk menghitung posisi bunga */
  bq: RefObject<HTMLDivElement | null>;
  heads: Spot[];
  t: GameText;
  onDone: () => void;
}) {
  const later = useTimers();
  /** arena; lewat callback ref supaya posisi dihitung begitu arenanya muncul */
  const [field, setField] = useState<HTMLDivElement | null>(null);
  const beeRef = useRef<HTMLButtonElement>(null);
  const box = useRelBox(bq, field);
  const [score, setScore] = useState(0);
  const [spot, setSpot] = useState(0);
  const [flying, setFlying] = useState(false);
  const [gone, setGone] = useState(false);
  const [line, setLine] = useState<string | null>(null);
  const [crumbs, setCrumbs] = useState(0);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // mulai dari bunga paling atas (dahlia di tengah, kalau ada)
    setSpot(heads.reduce((best, h, i) => (h.y < heads[best].y ? i : best), 0));
  }, [heads]);

  // remah kelopak berjatuhan selama ia ngemil
  useEffect(() => {
    if (flying || gone) return;
    const i = setInterval(() => setCrumbs((c) => c + 1), 1400);
    return () => clearInterval(i);
  }, [flying, gone]);

  const shoo = useCallback(() => {
    if (flying || gone || score >= GOAL) return;
    const k = score + 1;
    setScore(k);
    setLine(t.lines[k - 1]);
    haptic(k === GOAL ? 30 : 14);
    if (k === GOAL) {
      sfx.wahwah();
      setFlying(true);
      setGone(true);
      return;
    }
    sfx.boing();
    sfx.score(k);
    setFlying(true);
    // hinggap di bunga lain (tidak pernah di bunga yang sama)
    setSpot((cur) => {
      const others = heads.map((_, i) => i).filter((i) => i !== cur);
      return others[(k * 7) % others.length];
    });
    later(() => setFlying(false), reduce.current ? 200 : 950);
    later(() => setLine((l) => (l === t.lines[k - 1] ? null : l)), 2600);
  }, [flying, gone, score, heads, t.lines, later]);

  const h = heads[spot] ?? heads[0];
  const size = box ? Math.max(96, Math.min(132, box.w * 0.32)) : 104;
  const pos: CSSProperties | undefined = box
    ? {
        left: box.left + (h.x / 600) * box.w,
        top: box.top + (h.y / 720) * box.h - (h.d / 600) * box.w * 0.22,
        width: size,
      }
    : undefined;
  // 0 ngemil → 1 kaget (keringat) → 2 manyun → 3 ngambek
  const mood = [0, 1, 3, 4][Math.min(3, score)];

  return (
    <div className={s.host}>
      <MiniGame
        title={t.title}
        how={t.how}
        art={<Sprite name="game-lebah" className={s.art} />}
        goal={GOAL}
        score={score}
        won={gone}
        winTitle={t.winTitle}
        winLine={t.winLine}
        onDone={onDone}
      >
        {/* ketukan di mana saja di arena juga mengusir si lebah: tidak perlu tepat */}
        <div ref={setField} className={s.field} onClick={shoo}>
          {box ? (
            <>
              <button
                ref={beeRef}
                type="button"
                className={cx(s.bee, flying && s.flying, gone && s.gone, !flying && !gone && s.munching, score % 2 === 1 && s.flip)}
                style={pos}
                onClick={(e) => {
                  e.stopPropagation();
                  shoo();
                }}
                aria-label={t.beeLabel}
                disabled={gone}
              >
                <span className={s.body}>
                  <Sprite name="game-lebah" className={s.sprite} />
                  <Face mood={mood} munch={!flying && !gone} />
                </span>
              </button>
              {/* remah kelopak yang jatuh dari mulutnya */}
              {!flying && !gone && crumbs > 0 ? (
                <span key={crumbs} className={s.crumb} style={{ left: (pos?.left as number) - size * 0.18, top: (pos?.top as number) + size * 0.25 } as CSSProperties} aria-hidden>
                  <Sprite name={`kelopak-${['pink', 'jingga', 'putih'][crumbs % 3]}`} />
                </span>
              ) : null}
              {!flying && !gone && score === 0 ? (
                <span className={s.munchText} style={{ left: (pos?.left as number) + size * 0.1, top: (pos?.top as number) - size * 0.62 } as CSSProperties} aria-hidden>
                  {t.munch}
                </span>
              ) : null}
              {line ? (
                <div key={line} className={s.bubble} role="status">
                  {line}
                </div>
              ) : null}
              <TapCue target={beeRef} show={score === 0} delay={1600} />
            </>
          ) : null}
        </div>
      </MiniGame>
    </div>
  );
}
