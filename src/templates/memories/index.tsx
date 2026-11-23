'use client';

import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Finale, Hint, Sprite, Stage, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BG = '/art/bg-memories.webp';
const BG_LIT = '/art/bg-memories-terang.webp';
const ART = [
  'bg-memories',
  'bg-memories-terang',
  'memories-bohlam',
  'memories-bohlam-mati',
  'memories-jepit',
  'memories-amplop',
  'memories-saklar',
  'memories-saklar-nyala',
];

export default function Memories(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BG} className={s.stage}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

/* ───────────── tata letak dinding (satuan em, kotak 24.4 × 27.8) ───────────── */

/** Satu untai tali melengkung dari (x0,y0) ke (x1,y1). Arah x0→x1 = arah lampu menyala. */
type Swag = { x0: number; y0: number; x1: number; y1: number; sag: number };
const SWAGS: Swag[] = [
  { x0: -2, y0: 0.6, x1: 26.4, y1: 1.2, sag: 1.3 },
  { x0: 26.4, y0: 10.9, x1: -2, y1: 11.3, sag: 1.3 },
  { x0: -2, y0: 21.5, x1: 26.4, y1: 21.9, sag: 1.1 },
];
const wireT = (w: Swag, x: number) => (x - w.x0) / (w.x1 - w.x0);
const wireY = (w: Swag, x: number) => {
  const t = wireT(w, x);
  const cy = (w.y0 + w.y1) / 2 + w.sag * 2;
  return (1 - t) * (1 - t) * w.y0 + 2 * (1 - t) * t * cy + t * t * w.y1;
};
const wirePath = (w: Swag) =>
  `M${w.x0 * 10},${w.y0 * 10}Q${(w.x0 + w.x1) * 5},${((w.y0 + w.y1) / 2 + w.sag * 2) * 10} ${w.x1 * 10},${w.y1 * 10}`;

type Spot = [row: number, x: number];
/** posisi gantungan foto untuk tiap jumlah foto, dan posisi amplop */
const SLOTS: Record<number, { cards: Spot[]; env: Spot }> = {
  1: { cards: [[0, 12.2]], env: [1, 12.2] },
  2: { cards: [[0, 7.3], [0, 17.1]], env: [1, 12.2] },
  3: { cards: [[0, 4.35], [0, 12.2], [0, 20.05]], env: [1, 12.2] },
  4: { cards: [[0, 7.3], [0, 17.1], [1, 7.7], [1, 17.5]], env: [2, 12.2] },
  5: { cards: [[0, 4.35], [0, 12.2], [0, 20.05], [1, 8], [1, 16.6]], env: [2, 12.2] },
  6: { cards: [[0, 4.35], [0, 12.2], [0, 20.05], [1, 4.5], [1, 12.35], [1, 20.2]], env: [2, 12.2] },
};
const TILT = [-3.2, 1.6, 3.4, 2.6, -2.2, -3];
const SWAY = [5.2, 6.1, 4.6, 5.7, 6.4, 4.9];
/* kartu tanpa foto: kertas berwarna lembut */
const TINT = ['#f9d8c8', '#f8e6b4', '#d3e5d6', '#f6d5dc', '#dbe3f3', '#f7dcba'];
const BULBS_PER_SWAG = 9;
/** jeda antar bohlam saat menyala berurutan */
const STEP = 72;

type Bulb = { x: number; y: number; i: number };

function buildWall(count: number) {
  const slot = SLOTS[Math.max(1, Math.min(6, count))];
  const hangs: Spot[] = [...slot.cards, slot.env];
  const bulbs: Bulb[] = [];
  /** jumlah bohlam sebelum titik (row, x) dalam urutan menyala */
  const before: number[] = [];
  let i = 0;
  const rowStart: number[] = [];
  SWAGS.forEach((w, row) => {
    rowStart[row] = i;
    for (let k = 0; k < BULBS_PER_SWAG; k++) {
      const x = w.x0 + ((k + 0.5) / BULBS_PER_SWAG) * (w.x1 - w.x0);
      // jangan menaruh bohlam tepat di jepitan
      if (hangs.some(([r, hx]) => r === row && Math.abs(hx - x) < 0.95)) continue;
      bulbs.push({ x, y: wireY(w, x) + 0.75, i: i++ });
    }
  });
  hangs.forEach(([row, x], h) => {
    const w = SWAGS[row];
    const end = rowStart[row + 1] ?? bulbs.length;
    before[h] = rowStart[row] + bulbs.filter((b) => b.i >= rowStart[row] && b.i < end && wireT(w, b.x) < wireT(w, x)).length;
  });
  return { slot, bulbs, before };
}

type Card = { src: string | null; cap: string };

/** caption untuk label pembaca layar, tanpa tanda baca penutup (labelnya sendiri sudah diakhiri titik) */
const capLabel = (cap: string) => (cap ? `: ${cap.replace(/[.!?…\s]+$/u, '')}` : '');

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const t = TEXT[useLocale()];
  const photos = data.photos.filter(Boolean).slice(0, 6);
  const notes = data.notes.map((n) => n.trim());
  const cards: Card[] = photos.length
    ? photos.map((src, i) => ({ src, cap: notes[i] ?? '' }))
    : notes
        .filter(Boolean)
        .slice(0, 6)
        .map((cap) => ({ src: null, cap }));
  const total = cards.length;
  const { slot, bulbs, before } = useMemo(() => buildWall(total), [total]);

  const [on, setOn] = useState(false);
  const [view, setView] = useState<number | null>(null);
  /** arah geser isi saat pindah foto di tampilan besar */
  const [dir, setDir] = useState(0);
  const [shown, setShown] = useState(false);
  const [seen, setSeen] = useState<boolean[]>(() => Array(total).fill(false));
  const [finale, setFinale] = useState(false);
  const later = useTimers();
  const ready = useArtReady(ART);
  const cascade = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cardEls = useRef<(HTMLButtonElement | null)[]>([]);
  const bigEl = useRef<HTMLDivElement>(null);
  const closeEl = useRef<HTMLButtonElement>(null);
  const opening = useRef(false);
  const swipe = useRef<{ id: number; x: number } | null>(null);

  const to = data.to.trim() || t.you;
  const from = data.from.trim();
  const seenCount = seen.filter(Boolean).length;
  const allSeen = total > 0 ? seenCount >= total : true;

  /* ── saklar ── */
  const toggle = () => {
    cascade.current.forEach(clearTimeout);
    cascade.current = [];
    sfx.tap();
    haptic(14);
    if (on) {
      setOn(false);
      setView(null);
      setShown(false);
      return;
    }
    setOn(true);
    // tangga nada kecil mengikuti lampu yang menyala, ditutup denting
    bulbs.forEach((b) => {
      if (b.i % 3 === 0) cascade.current.push(later(() => sfx.note(b.i / 3), b.i * STEP));
    });
    cascade.current.push(
      later(() => {
        sfx.chime();
        haptic(10);
      }, bulbs.length * STEP + 120),
    );
  };

  /* ── foto membesar: terbang dari jepitannya ke tengah (FLIP) ── */
  const flip = (i: number) => {
    const big = bigEl.current;
    const th = cardEls.current[i];
    if (!big || !th) return '';
    const a = th.getBoundingClientRect();
    const b = big.getBoundingClientRect();
    const sc = th.offsetWidth / (big.offsetWidth || 1);
    const dx = a.left + a.width / 2 - (b.left + b.width / 2);
    const dy = a.top - b.top;
    return `translate(${dx}px, ${dy}px) scale(${sc}) rotate(${TILT[i % 6]}deg)`;
  };

  const markSeen = (i: number) => setSeen((v) => (v[i] ? v : v.map((x, k) => (k === i ? true : x))));

  const openView = (i: number) => {
    if (!on || view !== null) return;
    opening.current = true;
    setDir(0);
    setView(i);
    markSeen(i);
    sfx.pop();
    haptic(10);
  };

  useLayoutEffect(() => {
    if (view === null || !opening.current) return;
    opening.current = false;
    const el = bigEl.current;
    if (!el) return;
    el.style.transition = 'none';
    el.style.transform = flip(view);
    void el.offsetWidth; // paksa browser mencatat posisi awal sebelum transisi
    el.style.transition = '';
    el.style.transform = '';
    setShown(true);
    closeEl.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const closeView = () => {
    if (view === null || !shown) return;
    const i = view;
    setShown(false);
    const el = bigEl.current;
    if (el) el.style.transform = flip(i);
    sfx.whoosh();
    later(() => {
      setView(null);
      cardEls.current[i]?.focus({ preventScroll: true });
    }, 420);
  };

  const go = (step: number) => {
    if (view === null || !shown) return;
    const next = view + step;
    if (next < 0 || next >= total) return;
    setDir(step);
    setView(next);
    markSeen(next);
    sfx.tap();
    haptic(8);
  };

  const openLetter = () => {
    if (!on || finale) return;
    sfx.chime();
    haptic(15);
    setShown(false);
    setView(null);
    setFinale(true);
  };

  // panah kiri/kanan dan Escape saat foto membesar
  useEffect(() => {
    if (view === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeView();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, shown]);

  // semua foto sudah dilihat: amplopnya memanggil
  const called = useRef(false);
  useEffect(() => {
    if (total > 0 && allSeen && view === null && !called.current && !finale) {
      called.current = true;
      sfx.chime();
    }
  }, [allSeen, view, total, finale]);

  const onSwipeDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    swipe.current = { id: e.pointerId, x: e.clientX };
  };
  const onSwipeUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const sw = swipe.current;
    swipe.current = null;
    if (!sw || sw.id !== e.pointerId) return;
    const dx = e.clientX - sw.x;
    if (Math.abs(dx) > 36) go(dx < 0 ? 1 : -1);
  };

  const cur = view !== null ? cards[view] : null;
  const envSpot = slot.env;
  const envWire = SWAGS[envSpot[0]];

  return (
    <div className={cx(s.wrap, ready && s.ready, on && s.on)} onClick={on ? undefined : toggle}>
      <div className={s.bright} style={{ backgroundImage: `url(${BG_LIT})` }} />

      <div className={s.head}>
        {on ? (
          <div key="lit">
            <div className={s.eyebrow}>{t.litEyebrow}</div>
            <div className={cx(s.name, to.length > 12 && s.small)}>{to}</div>
            {from ? <div className={s.from}>{fmt(t.from, { from })}</div> : null}
          </div>
        ) : (
          <div key="dark">
            <div className={s.eyebrow}>{fmt(t.darkEyebrow, { to })}</div>
            <div className={cx(s.name, s.small)}>{t.darkTitle}</div>
          </div>
        )}
      </div>

      <div className={s.wallBox}>
        <div className={s.wall}>
          <svg className={s.wires} viewBox="-20 0 284 278" aria-hidden>
            {SWAGS.map((w, i) => (
              <g key={i}>
                <path d={wirePath(w)} className={s.wire} />
                <path d={wirePath(w)} className={s.wireShine} />
              </g>
            ))}
          </svg>

          {bulbs.map((b) => (
            <span
              key={b.i}
              className={s.bulb}
              style={
                {
                  left: `${b.x}em`,
                  top: `${b.y}em`,
                  '--d': `${b.i * STEP}ms`,
                  '--tw': `${2.6 + ((b.i * 7) % 5) * 0.45}s`,
                  '--td': `${-((b.i * 13) % 10) * 0.31}s`,
                } as CSSProperties
              }
              aria-hidden
            >
              <Sprite name="memories-bohlam-mati" className={s.bulbOff} />
              <span className={s.glowWrap}>
                <Sprite name="memories-bohlam" className={s.glow} />
              </span>
            </span>
          ))}

          {cards.map((c, i) => {
            const [row, x] = slot.cards[i];
            const style = {
              left: `${x}em`,
              top: `${wireY(SWAGS[row], x)}em`,
              '--r': `${TILT[i % 6]}deg`,
              '--d': `${before[i] * STEP + 80}ms`,
              '--sw': `${SWAY[i % 6]}s`,
              '--sd': `${-i * 1.3}s`,
            } as CSSProperties;
            return (
              <div key={i} className={s.hang} style={style}>
                <button
                  type="button"
                  ref={(el) => {
                    cardEls.current[i] = el;
                  }}
                  className={cx(s.card, view === i && s.away)}
                  onClick={() => openView(i)}
                  tabIndex={on && view === null ? 0 : -1}
                  aria-hidden={!on}
                  aria-label={fmt(c.src ? t.photo : t.note, { i: i + 1, total, cap: capLabel(c.cap) })}
                >
                  {c.src ? (
                    <span className={s.photo}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.src} alt="" draggable={false} />
                    </span>
                  ) : (
                    <span className={cx(s.photo, s.blank)} style={{ '--paper': TINT[i % 6] } as CSSProperties}>
                      <span className={s.quote}>{c.cap}</span>
                    </span>
                  )}
                  <span className={s.cap}>
                    <span className={s.capText}>{c.src ? c.cap : from ? `— ${from}` : ''}</span>
                  </span>
                  <Sprite name="memories-hati" className={cx(s.seen, seen[i] && view !== i && s.isSeen)} />
                </button>
                <Sprite name="memories-jepit" className={s.pin} />
              </div>
            );
          })}

          <div
            className={cx(s.hang, s.envHang)}
            style={
              {
                left: `${envSpot[1]}em`,
                top: `${wireY(envWire, envSpot[1])}em`,
                '--r': '-4deg',
                '--d': `${before[slot.cards.length] * STEP + 80}ms`,
                '--sw': '5.5s',
                '--sd': '-2.2s',
              } as CSSProperties
            }
          >
            <button
              type="button"
              className={cx(s.env, on && allSeen && view === null && s.pulse)}
              onClick={(e: ReactMouseEvent) => {
                e.stopPropagation();
                openLetter();
              }}
              tabIndex={on && view === null ? 0 : -1}
              aria-hidden={!on}
              aria-label={t.letter}
            >
              <span className={s.envRing} aria-hidden />
              <Sprite name="memories-amplop" className={s.envArt} />
              <span className={s.envTag}>{t.letterTag}</span>
            </button>
            <Sprite name="memories-jepit" className={s.pin} />
          </div>
        </div>
      </div>

      <div className={s.foot} />

      {total > 0 ? (
        <div className={s.count} aria-label={fmt(t.seenCount, { n: seenCount, total })}>
          <Sprite name="memories-hati" className={s.countHeart} />
          <span aria-hidden>
            <b>{seenCount}</b> / {total}
          </span>
        </div>
      ) : null}

      <button
        type="button"
        className={s.switch}
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        aria-pressed={on}
        aria-label={on ? t.switchOff : t.switchOn}
      >
        <span className={s.switchRing} aria-hidden />
        <Sprite name="memories-saklar" className={s.swOff} />
        <Sprite name="memories-saklar-nyala" className={s.swOn} />
      </button>

      {!on ? <Hint key="h0">{t.hintSwitch}</Hint> : null}
      {on && view === null && !finale && seenCount === 0 && total > 0 ? <Hint key="h1">{photos.length ? t.hintPhoto : t.hintNote}</Hint> : null}
      {on && view === null && !finale && allSeen ? <Hint key="h2">{t.hintLetter}</Hint> : null}

      {view !== null && cur ? (
        <div className={cx(s.viewer, shown && s.vOpen)} role="dialog" aria-label={t.viewer}>
          <div className={s.veil} onClick={closeView} />
          <div ref={bigEl} className={s.big} onPointerDown={onSwipeDown} onPointerUp={onSwipeUp} onPointerCancel={() => (swipe.current = null)}>
            <Sprite name="memories-jepit" className={s.bigPin} />
            <div key={view} className={cx(s.content, dir > 0 && s.fromRight, dir < 0 && s.fromLeft)}>
              {cur.src ? (
                <span className={s.bigPhoto}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cur.src} alt="" draggable={false} />
                </span>
              ) : (
                <span className={cx(s.bigPhoto, s.bigBlank)} style={{ '--paper': TINT[view % 6] } as CSSProperties}>
                  <span className={s.bigQuote}>{cur.cap}</span>
                </span>
              )}
              <div className={s.bigCap}>{cur.src ? cur.cap : from ? `— ${from}` : ''}</div>
            </div>
            <button ref={closeEl} type="button" className={s.close} onClick={closeView} aria-label={t.close}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <div className={s.bar}>
              <button type="button" className={s.nav} onClick={() => go(-1)} disabled={view === 0} aria-label={t.prev}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M14.5 5.5L8 12l6.5 6.5" />
                </svg>
              </button>
              <span className={s.pos} aria-live="polite">
                <b>{view + 1}</b> / {total}
              </span>
              {view < total - 1 ? (
                <button type="button" className={s.nav} onClick={() => go(1)} aria-label={t.next}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M9.5 5.5L16 12l-6.5 6.5" />
                  </svg>
                </button>
              ) : (
                <button type="button" className={s.toLetter} onClick={openLetter}>
                  {t.toLetter}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja"
          theme={{ backdrop: BG_LIT, ink: '#fff3dc', paper: '#fffaf0', paperInk: '#3b2a22' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
