'use client';

import { type CSSProperties, type PointerEvent as RPointerEvent, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Sprite, Stage, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { useText } from './i18n';
import { meta } from './meta';
import { fmt } from '@/i18n/client';
import s from './style.module.css';

/* Semua posisi memakai papan 600×800: hati (kanvas 600×560) di atas, nampan di bawah. */
const BW = 600;
const BH = 800;

/** Tempat plester menempel di retakan: [x, y, sudut]. */
const SLOTS: Record<number, [number, number, number][]> = {
  3: [
    [300, 164, -22],
    [300, 268, 17],
    [298, 428, -14],
  ],
  4: [
    [300, 160, -22],
    [300, 264, 18],
    [300, 408, -16],
    [298, 468, 13],
  ],
};
const TRAY_Y = 692;
const trayX = (i: number, n: number) => 300 + (i - (n - 1) / 2) * (n === 3 ? 124 : 104);
/** warna titik di kartu, mengikuti warna plester kain */
const DOTS = ['#e0aa74', '#f08fa5', '#7fc3a6', '#eebd3f'];

type PlasterState = { at: 'tray' } | { at: 'drag'; x: number; y: number } | { at: 'heart'; slot: number };

const BG = '/art/bg-plester.webp';
const ART = [BG, 'plester-hati-kiri', 'plester-hati-kanan', 'plester-nampan', 'plester-kain-1', 'plester-kain-2', 'plester-kain-3'];

export default function Plester(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BG}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const notes = data.notes.map((t) => t.trim()).filter(Boolean).slice(0, 4);
  const n = Math.min(4, Math.max(3, notes.length));
  const slots = SLOTS[n];
  const ready = useArtReady(ART);
  const [states, setStates] = useState<PlasterState[]>(() => Array.from({ length: n }, () => ({ at: 'tray' })));
  const [last, setLast] = useState<{ slot: number; plaster: number } | null>(null);
  const [healed, setHealed] = useState(false);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);
  const board = useRef<HTMLDivElement>(null);
  const drag = useRef<{ i: number; x0: number; y0: number; moved: boolean } | null>(null);
  const dragEnd = useRef(0);
  const stuckSet = useRef(new Set<number>());
  const later = useTimers();
  const t = useText();
  const stuck = states.filter((p) => p.at === 'heart').length;
  const gap = healed ? 0 : 1 - stuck / n;

  const stick = (i: number) => {
    if (stuckSet.current.has(i)) return;
    const slot = stuckSet.current.size;
    if (slot >= n) return;
    stuckSet.current.add(i);
    setStates((prev) => {
      const next = prev.slice();
      next[i] = { at: 'heart', slot };
      return next;
    });
    setLast({ slot, plaster: i });
    haptic(14);
    sfx.pop();
    sfx.note(slot);
    if (slot + 1 >= n) {
      later(() => {
        setHealed(true);
        setBurst((b) => b + 1);
        sfx.success();
        haptic(40);
      }, 1000);
    }
  };

  /** koordinat layar → koordinat papan (0..600, 0..800) */
  const toBoard = (e: RPointerEvent) => {
    const r = board.current?.getBoundingClientRect();
    if (!r || !r.width || !r.height) return null;
    return { x: ((e.clientX - r.left) / r.width) * BW, y: ((e.clientY - r.top) / r.height) * BH };
  };

  const onDragStart = (i: number, e: RPointerEvent<HTMLButtonElement>) => {
    if (states[i].at === 'heart') return;
    drag.current = { i, x0: e.clientX, y0: e.clientY, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onDragMove = (i: number, e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.i !== i) return;
    if (!d.moved && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 7) return;
    d.moved = true;
    const p = toBoard(e);
    if (!p) return;
    setStates((prev) => {
      if (prev[i].at === 'heart') return prev;
      const next = prev.slice();
      next[i] = { at: 'drag', x: p.x, y: p.y - 28 };
      return next;
    });
  };
  const onDragEnd = (i: number, e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.i !== i || !d.moved) return;
    dragEnd.current = performance.now();
    const p = toBoard(e);
    if (p && p.y < 584) {
      stick(i);
    } else {
      setStates((prev) => {
        if (prev[i].at !== 'drag') return prev;
        const next = prev.slice();
        next[i] = { at: 'tray' };
        return next;
      });
    }
  };

  const note = last ? notes[last.slot] : null;
  const long = (data.to || '').length > 12;

  return (
    <div className={cx(s.wrap, ready && s.ready)}>
      <div className={s.head}>
        {healed ? (
          <div key="t">
            <div className={s.eyebrow}>{t.healedEyebrow}</div>
            <div className={cx(s.name, s.small)}>{data.title || fmt(t.titleFallback, { to: data.to })}</div>
          </div>
        ) : (
          <div key="n">
            <div className={s.eyebrow}>{t.eyebrow}</div>
            <div className={cx(s.name, long && s.small)}>{data.to || t.you}</div>
            {data.from ? <div className={s.from}>{fmt(t.fromName, { name: data.from })}</div> : null}
          </div>
        )}
      </div>

      <div className={s.art}>
        <div
          ref={board}
          className={cx(s.board, healed && s.healed)}
          style={{ '--gap': gap } as CSSProperties}
          role="group"
          aria-label={healed ? t.healedAria : t.brokenAria}
        >
          <span className={s.shadow} />
          <Sprite name="plester-nampan" className={s.tray} />

          <div className={s.beat}>
            <div className={s.heart}>
              <div className={s.halfL}>
                <Sprite name="plester-hati-kiri" className={s.layer} />
                <Sprite name="plester-tetes" className={s.tear} />
              </div>
              <div className={s.halfR}>
                <Sprite name="plester-hati-kanan" className={s.layer} />
              </div>
              <Sprite name="plester-hati-pulih" className={cx(s.layer, s.whole)} />
            </div>

            {states.map((p, i) => {
              let x = trayX(i, n);
              let y = TRAY_Y;
              let rot = 90 + (i % 2 ? 5 : -5);
              let scale = 0.72;
              if (p.at === 'heart') [x, y, rot, scale] = [slots[p.slot][0], slots[p.slot][1], slots[p.slot][2], 0.8];
              else if (p.at === 'drag') [x, y, rot, scale] = [p.x, p.y, 24, 0.9];
              return (
                // lapis seukuran papan: translate dalam % = posisi di papan
                <div
                  key={i}
                  className={cx(s.pl, p.at === 'drag' && s.dragging, p.at === 'heart' && s.stuck)}
                  style={{ transform: `translate(${(x / BW) * 100}%, ${(y / BH) * 100}%)` }}
                >
                  <Sprite
                    name={`plester-kain-${(i % 4) + 1}`}
                    className={s.plImg}
                    style={{ transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})` }}
                  />
                </div>
              );
            })}
          </div>

          {states.map((p, i) =>
            p.at === 'heart' ? null : (
              <button
                key={i}
                type="button"
                className={s.hit}
                style={{ left: `${(trayX(i, n) / BW) * 100}%`, width: n === 3 ? '20%' : '17%' }}
                aria-label={fmt(t.stickAria, { n: i + 1 })}
                onClick={() => {
                  if (performance.now() - dragEnd.current < 120) return;
                  stick(i);
                }}
                onPointerDown={(e) => onDragStart(i, e)}
                onPointerMove={(e) => onDragMove(i, e)}
                onPointerUp={(e) => onDragEnd(i, e)}
                onPointerCancel={(e) => onDragEnd(i, e)}
              />
            ),
          )}
        </div>
      </div>

      <div className={s.foot}>
        {note ? (
          <div key={last?.slot} className={s.tag} style={{ '--dot': DOTS[(last?.plaster ?? 0) % DOTS.length] } as CSSProperties}>
            {note}
          </div>
        ) : null}
        {healed ? (
          <button
            type="button"
            className={s.cta}
            onClick={() => {
              sfx.chime();
              setFinale(true);
            }}
          >
            {t.read}
          </button>
        ) : (
          <div className={s.count} aria-label={fmt(t.countAria, { stuck, n })}>
            {states.map((_, i) => (
              <i key={i} className={i < stuck ? s.on : undefined} />
            ))}
          </div>
        )}
      </div>

      {stuck === 0 ? <Hint>{t.hint}</Hint> : null}

      <Confetti burst={burst} shapes="hearts" count={70} colors={['#ef6a6a', '#ff9aa8', '#ffc9cf', '#ffffff', '#f7b3a0']} origin={{ x: 0.5, y: 0.5 }} />

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finaleEyebrow}
          flower="bunga-kamboja"
          theme={{ backdrop: BG, ink: '#2f3b46', paper: '#fffdf8', paperInk: '#33303a' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
