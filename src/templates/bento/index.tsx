'use client';

import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Confetti, Finale, Hint, Sprite, Stage, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BACKDROP = '/art/bg-bento.webp';
const ART = ['bg-bento', 'bento-kotak', 'bento-tutup', 'bento-pita', 'bento-sumpit', 'bento-selada', 'bento-cup-1', 'bento-onigiri-1'];

export default function Bento(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BACKDROP}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

/* ───────────────────────── isi kotak ───────────────────────── */

type FoodId = 'onigiri' | 'sosis' | 'tamago' | 'sayur' | 'buah' | 'ebi';
/** urutan lauk: catatan pertama selalu onigiri, dst. */
const FOODS: FoodId[] = ['onigiri', 'sosis', 'tamago', 'sayur', 'buah', 'ebi'];
const BED: Record<FoodId, string> = {
  onigiri: 'bento-selada',
  sosis: 'bento-cup-3',
  tamago: 'bento-cup-1',
  sayur: 'bento-cup-2',
  buah: 'bento-cup-3',
  ebi: 'bento-selada',
};

/** ukuran bagian dalam kotak (em) dan sekat per jumlah lauk, dalam persen */
const IW = 17.8;
const IH = 22.3;
type Cell = [x: number, y: number, w: number, h: number];
const LAYOUTS: Record<number, Cell[]> = {
  1: [[0, 0, 100, 100]],
  2: [
    [0, 0, 100, 44],
    [0, 44, 100, 56],
  ],
  3: [
    [0, 0, 100, 37],
    [0, 37, 56, 63],
    [56, 37, 44, 63],
  ],
  4: [
    [0, 0, 58, 37],
    [58, 0, 42, 37],
    [0, 37, 43, 63],
    [43, 37, 57, 63],
  ],
  5: [
    [0, 0, 57, 35],
    [57, 0, 43, 35],
    [0, 35, 41, 65],
    [41, 35, 59, 32],
    [41, 67, 59, 33],
  ],
  6: [
    [0, 0, 56, 34],
    [56, 0, 44, 34],
    [0, 34, 40, 33],
    [40, 34, 60, 33],
    [0, 67, 50, 33],
    [50, 67, 50, 33],
  ],
};

/** satu potong lauk di dalam sekat: [sprite, x%, y%, ukuran × sisi pendek sekat, putaran] */
type Piece = [sprite: string, x: number, y: number, size: number, rot: number];
type Shape = 'wide' | 'mid' | 'tall';
const O1 = 'bento-onigiri-1';
const O2 = 'bento-onigiri-2';
const ARR: Record<FoodId, Record<Shape, Piece[]>> = {
  onigiri: {
    wide: [
      [O1, 29, 52, 1.16, -8],
      [O2, 71, 50, 1.16, 7],
    ],
    mid: [
      [O1, 31, 50, 0.98, -9],
      [O2, 69, 53, 0.98, 8],
    ],
    tall: [
      [O1, 50, 29, 1.12, -6],
      [O2, 50, 71, 1.12, 6],
    ],
  },
  sosis: {
    wide: [
      ['bento-sosis', 21, 52, 1.0, -12],
      ['bento-sosis', 50, 48, 1.0, 4],
      ['bento-sosis', 79, 52, 1.0, 13],
    ],
    mid: [
      ['bento-sosis', 30, 40, 0.84, -13],
      ['bento-sosis', 70, 40, 0.84, 12],
      ['bento-sosis', 50, 66, 0.84, 2],
    ],
    tall: [
      ['bento-sosis', 34, 22, 0.9, -11],
      ['bento-sosis', 66, 48, 0.9, 10],
      ['bento-sosis', 36, 76, 0.9, -5],
    ],
  },
  tamago: {
    wide: [
      ['bento-tamago', 22, 51, 1.12, -7],
      ['bento-tamago', 50, 50, 1.12, 3],
      ['bento-tamago', 78, 51, 1.12, 8],
    ],
    mid: [
      ['bento-tamago', 42, 33, 1.08, -7],
      ['bento-tamago', 58, 67, 1.08, 6],
    ],
    tall: [
      ['bento-tamago', 49, 20, 1.16, -5],
      ['bento-tamago', 52, 50, 1.16, 4],
      ['bento-tamago', 49, 80, 1.16, -3],
    ],
  },
  sayur: {
    wide: [
      ['bento-brokoli', 19, 50, 1.02, -8],
      ['bento-wortel', 43, 34, 0.84, 0],
      ['bento-tomat', 55, 66, 0.92, 0],
      ['bento-brokoli', 81, 50, 1.0, 9],
    ],
    mid: [
      ['bento-brokoli', 30, 36, 0.92, -8],
      ['bento-tomat', 71, 30, 0.84, 0],
      ['bento-wortel', 30, 74, 0.78, 0],
      ['bento-brokoli', 70, 68, 0.88, 9],
    ],
    tall: [
      ['bento-brokoli', 34, 19, 1.0, -9],
      ['bento-tomat', 70, 36, 0.92, 0],
      ['bento-wortel', 32, 53, 0.88, 0],
      ['bento-brokoli', 66, 68, 1.0, 9],
      ['bento-tomat', 32, 84, 0.86, 0],
    ],
  },
  buah: {
    wide: [
      ['bento-apel', 24, 50, 1.06, -6],
      ['bento-stroberi', 56, 47, 0.96, 9],
      ['bento-stroberi', 81, 55, 0.9, -11],
    ],
    mid: [
      ['bento-apel', 40, 33, 1.02, -8],
      ['bento-stroberi', 28, 70, 0.84, -10],
      ['bento-stroberi', 69, 67, 0.9, 10],
    ],
    tall: [
      ['bento-apel', 50, 20, 1.1, -8],
      ['bento-stroberi', 36, 50, 0.96, -9],
      ['bento-stroberi', 66, 60, 0.96, 10],
      ['bento-apel', 50, 84, 1.06, 6],
    ],
  },
  ebi: {
    wide: [
      ['bento-ebi', 30, 50, 1.2, -4],
      ['bento-ebi', 68, 52, 1.2, 8],
    ],
    mid: [
      ['bento-ebi', 36, 44, 1.1, -6],
      ['bento-ebi', 64, 58, 1.1, 10],
    ],
    tall: [
      ['bento-ebi', 50, 30, 1.16, 16],
      ['bento-ebi', 50, 70, 1.16, -8],
    ],
  },
};

/** arah percikan bintang saat lauk diketuk (em) */
const SPARKS: [number, number, number][] = [
  [-3.4, -2.6, 1],
  [3.2, -3, 0.8],
  [-2.4, 2.6, 0.7],
  [3.6, 1.8, 0.9],
  [0.2, -4, 0.75],
];

type Phase = 'closed' | 'opening' | 'open' | 'done';
type Drag = { id: number; x0: number; y0: number; dx: number; dy: number; el: HTMLElement };

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const t = TEXT[useLocale()];
  const filled = data.notes.map((n, i) => ({ note: n.trim(), photo: data.photos[i] || null })).filter((x) => x.note);
  const items = (filled.length ? filled : t.fallback.map((note) => ({ note, photo: null as string | null }))).slice(0, 6);
  const n = items.length;
  const cells = LAYOUTS[n] ?? LAYOUTS[6];

  const [phase, setPhase] = useState<Phase>('closed');
  const [dir, setDir] = useState(1);
  const [steam, setSteam] = useState(false);
  const [eaten, setEaten] = useState<boolean[]>([]);
  const [bounce, setBounce] = useState<number | null>(null);
  const [spark, setSpark] = useState<{ i: number; k: number } | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [burst, setBurst] = useState(0);
  const [finale, setFinale] = useState(false);
  const drag = useRef<Drag | null>(null);
  const moved = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const later = useTimers();
  const ready = useArtReady(ART);

  const to = data.to.trim() || t.you;
  const from = data.from.trim();
  const count = eaten.filter(Boolean).length;

  /* ── tutup ── */
  const openLid = (d: number) => {
    if (phase !== 'closed') return;
    setDir(d);
    setPhase('opening');
    setSteam(true);
    sfx.pop();
    haptic(15);
    later(() => sfx.whoosh(), 160);
    later(() => setPhase('open'), 820);
    later(() => setSteam(false), 3000);
  };
  const onDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0 || phase !== 'closed') return;
    moved.current = false;
    const el = e.currentTarget;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, el };
    el.style.transition = 'none';
  };
  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    d.dx = e.clientX - d.x0;
    d.dy = e.clientY - d.y0;
    if (Math.abs(d.dx) > 6 || Math.abs(d.dy) > 6) moved.current = true;
    if (moved.current) d.el.style.transform = `translate(${d.dx}px, ${d.dy}px) rotate(${d.dx / 26}deg)`;
  };
  const onEnd = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const far = Math.hypot(d.dx, d.dy) > (d.el.offsetWidth || 1) * 0.2;
    if (!cancelled && moved.current && far) {
      /* biarkan tutup melanjutkan gerakannya dari posisi terakhir */
      d.el.style.setProperty('--fx', `${d.dx}px`);
      d.el.style.setProperty('--fy', `${d.dy}px`);
      d.el.style.transition = '';
      d.el.style.transform = '';
      openLid(d.dx >= 0 ? 1 : -1);
    } else {
      d.el.style.transition = '';
      d.el.style.transform = '';
    }
    if (moved.current) later(() => (moved.current = false), 80);
  };
  const onLidTap = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (e.detail !== 0 && moved.current) {
      moved.current = false;
      return;
    }
    openLid(1);
  };

  /* ── lauk ── */
  const tapFood = (i: number) => {
    if (phase !== 'open' || active !== null || bounce !== null) return;
    setBounce(i);
    setSpark((p) => ({ i, k: (p?.k ?? 0) + 1 }));
    sfx.pop();
    haptic(12);
    later(() => {
      setBounce(null);
      setActive(i);
      sfx.tap();
    }, 430);
  };
  const closeCard = () => {
    const i = active;
    if (i === null) return;
    setActive(null);
    if (eaten[i]) return;
    const next = eaten.slice();
    next[i] = true;
    setEaten(next);
    const c = next.filter(Boolean).length;
    sfx.note(c - 1);
    haptic(10);
    if (c >= n) {
      later(() => {
        setPhase('done');
        setBurst((b) => b + 1);
        sfx.success();
        haptic(30);
      }, 800);
    }
  };

  useEffect(() => {
    if (active === null) return;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCard();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const openLetter = () => {
    if (phase !== 'done' || finale) return;
    sfx.chime();
    haptic(15);
    setFinale(true);
  };

  const act = active !== null ? items[active] : null;
  const actFood = active !== null ? FOODS[active % FOODS.length] : null;
  const isLast = active !== null && !eaten[active] && count === n - 1;

  return (
    <div className={cx(s.wrap, ready && s.ready)}>
      <div className={s.head}>
        {phase === 'done' ? (
          <div key="d">
            <div className={s.eyebrow}>{t.doneEyebrow}</div>
            <div className={cx(s.name, s.small)}>{t.doneLine}</div>
          </div>
        ) : phase === 'open' ? (
          <div key="o">
            <div className={s.eyebrow}>{t.openEyebrow}</div>
            <div className={cx(s.name, to.length > 11 && s.small)}>{to}</div>
            <div className={s.count} aria-live="polite">
              {fmt(t.count, { n: count, total: n })}
            </div>
          </div>
        ) : (
          <div key="c">
            <div className={s.eyebrow}>{t.closedEyebrow}</div>
            <div className={cx(s.name, to.length > 11 && s.small)}>{to}</div>
            {from ? <div className={s.from}>{fmt(t.from, { from })}</div> : null}
          </div>
        )}
      </div>

      <div className={s.boxArea}>
        <div className={s.box}>
          <Sprite name="bento-sumpit" className={s.sticks} />
          <Sprite name="bento-kotak" className={s.boxArt} />

          <div className={s.grid}>
            {cells.map(([x, y, w, h], i) => {
              const f = FOODS[i % FOODS.length];
              const wEm = (IW * w) / 100;
              const hEm = (IH * h) / 100;
              const ratio = wEm / hEm;
              const shape: Shape = ratio > 1.42 ? 'wide' : ratio < 0.8 ? 'tall' : 'mid';
              // lauk sedikit lebih kecil dari sekatnya supaya alas selada/cup kertas tetap terlihat
              const base = Math.min(wEm, hEm) * 0.86;
              const done = !!eaten[i];
              return (
                <button
                  key={i}
                  type="button"
                  className={cx(s.cell, done && s.eaten, bounce === i && s.bounce)}
                  style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
                  onClick={() => tapFood(i)}
                  tabIndex={phase === 'open' ? 0 : -1}
                  aria-hidden={phase !== 'open'}
                  aria-label={fmt(done ? t.cellEaten : t.cell, { food: t.foods[f] })}
                >
                  <Sprite name={BED[f]} className={s.bed} />
                  <Sprite name="bento-remah" className={s.crumbs} />
                  {ARR[f][shape].map(([name, px, py, size, rot], k) => {
                    const em = size * base;
                    return (
                      <span
                        key={k}
                        className={s.piece}
                        style={{ left: `${px}%`, top: `${py}%`, width: `${em}em`, height: `${em}em`, margin: `${-em / 2}em 0 0 ${-em / 2}em`, rotate: `${rot}deg`, '--i': k } as CSSProperties}
                      >
                        <Sprite name={name} className={s.pieceArt} />
                      </span>
                    );
                  })}
                  <Sprite name="bento-hati" className={s.pick} />
                  {spark?.i === i ? (
                    <span key={spark.k} className={s.sparks} aria-hidden>
                      {SPARKS.map(([dx, dy, sc], k) => (
                        <Sprite key={k} name="bento-bintang" className={s.spark} style={{ '--dx': `${dx}em`, '--dy': `${dy}em`, '--sc': sc, '--i': k } as CSSProperties} />
                      ))}
                    </span>
                  ) : null}
                </button>
              );
            })}
            {/* sekat kayu di antara lauk */}
            {cells.map(([x, y, w, h], i) => (
              <span key={`d${i}`} aria-hidden>
                {x > 0 ? (
                  <span className={s.divV} style={{ left: `calc(${x}% - 0.65em)`, top: `${y}%`, height: `${h}%` }}>
                    <Sprite name="bento-sekat-v" />
                  </span>
                ) : null}
                {y > 0 ? (
                  <span className={s.divH} style={{ top: `calc(${y}% - 0.65em)`, left: `${x}%`, width: `${w}%` }}>
                    <Sprite name="bento-sekat-h" />
                  </span>
                ) : null}
              </span>
            ))}
          </div>

          {steam ? (
            <div className={s.steam} aria-hidden>
              {[0, 1, 2].map((k) => (
                <Sprite key={k} name="bento-uap" className={s.wisp} style={{ '--i': k } as CSSProperties} />
              ))}
            </div>
          ) : null}

          {phase === 'closed' || phase === 'opening' ? (
            <button
              type="button"
              className={cx(s.lid, phase === 'opening' && s.lidOff)}
              style={{ '--dir': dir } as CSSProperties}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={(e) => onEnd(e, false)}
              onPointerCancel={(e) => onEnd(e, true)}
              onClick={onLidTap}
              tabIndex={phase === 'closed' ? 0 : -1}
              aria-label={t.openLid}
            >
              <Sprite name="bento-tutup" className={s.lidArt} />
              <span className={s.tag}>
                <span className={s.tagHole} />
                <span className={s.tagFor}>{t.tagFor}</span>
                <span className={cx(s.tagName, to.length > 9 && s.long, to.length > 15 && s.xlong)}>{to}</span>
                {from ? <span className={s.tagFrom}>{fmt(t.tagFrom, { from })}</span> : null}
              </span>
              <Sprite name="bento-pita" className={s.band} />
            </button>
          ) : null}

          {phase === 'done' ? (
            <div className={s.lidBack}>
              <Sprite name="bento-tutup-dalam" className={s.lidArt} />
              <button type="button" className={s.note} onClick={openLetter} aria-label={t.openLetter}>
                <Sprite name="bento-selotip" className={s.noteTape} />
                <span className={s.noteEyebrow}>{t.noteEyebrow}</span>
                <span className={cx(s.noteTo, to.length > 12 && s.long)}>{fmt(t.noteTo, { to })}</span>
                <span className={s.noteOpen}>{t.noteOpen}</span>
                <span className={s.sticker} aria-hidden>
                  <Sprite name="daun-2" className={s.stickerLeaf} />
                  <Sprite name="bunga-kamboja" className={s.stickerFlower} />
                </span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className={s.foot} aria-hidden />

      <Confetti burst={burst} shapes="hearts" origin={{ x: 0.5, y: 0.52 }} colors={['#e4572e', '#ffd36e', '#ffc9cf', '#8dbdae', '#ffffff', '#f6c84c']} />

      {phase === 'closed' ? <Hint>{t.hintOpen}</Hint> : null}
      {phase === 'open' && count === 0 && active === null ? <Hint key="e">{t.hintEat}</Hint> : null}
      {phase === 'done' && !finale ? <Hint key="l">{t.hintLetter}</Hint> : null}

      {act && actFood ? (
        <div className={s.scrim} onClick={closeCard}>
          <div className={s.card} role="dialog" aria-modal="true" aria-label={t.foods[actFood]} onClick={(e) => e.stopPropagation()}>
            <Sprite name="bento-selotip" className={s.cardTape} />
            <Sprite name={ARR[actFood].mid[0][0]} className={s.cardFood} />
            <div className={s.cardEyebrow}>
              {t.foods[actFood]}
              <span className={s.cardStep}>{fmt(t.cardStep, { n: (active ?? 0) + 1, total: n })}</span>
            </div>
            {act.photo ? (
              <span className={s.cardPhoto}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={act.photo} alt="" draggable={false} />
              </span>
            ) : null}
            <p className={cx(s.cardNote, act.note.length > 38 && s.long, !!act.photo && s.withPhoto)}>{act.note}</p>
            <button ref={closeRef} type="button" className={s.cardBtn} onClick={closeCard}>
              {eaten[active ?? 0] ? t.cardClose : isLast ? t.cardLast : t.cardNext}
            </button>
          </div>
        </div>
      ) : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja"
          theme={{ bg: `url(${BACKDROP}) center bottom / cover no-repeat`, ink: meta.palette.ink, paper: '#fffaf0', paperInk: '#3b2a22' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
