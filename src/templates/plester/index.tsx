'use client';

import { type PointerEvent as RPointerEvent, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Stage, cx, haptic, sfx, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { HeartArt, PLASTER_COLORS, type PlasterState } from './art';
import { meta } from './meta';
import s from './style.module.css';

export default function Plester(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const notes = data.notes.map((t) => t.trim()).filter(Boolean).slice(0, 4);
  const n = Math.min(4, Math.max(3, notes.length));
  const [states, setStates] = useState<PlasterState[]>(() => Array.from({ length: n }, () => ({ at: 'tray' })));
  const [last, setLast] = useState<{ slot: number; plaster: number } | null>(null);
  const [healed, setHealed] = useState(false);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ i: number; x0: number; y0: number; moved: boolean } | null>(null);
  const dragEnd = useRef(0);
  const stuckSet = useRef(new Set<number>());
  const later = useTimers();
  const stuck = states.filter((p) => p.at === 'heart').length;

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

  /** koordinat layar → koordinat viewBox SVG */
  const toSvg = (e: RPointerEvent) => {
    const el = svg.current;
    const m = el?.getScreenCTM();
    if (!el || !m) return null;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: pt.x, y: pt.y };
  };

  const onDragStart = (i: number, e: RPointerEvent<SVGRectElement>) => {
    if (states[i].at === 'heart') return;
    drag.current = { i, x0: e.clientX, y0: e.clientY, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onDragMove = (i: number, e: RPointerEvent<SVGRectElement>) => {
    const d = drag.current;
    if (!d || d.i !== i) return;
    if (!d.moved && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 7) return;
    d.moved = true;
    const p = toSvg(e);
    if (!p) return;
    setStates((prev) => {
      if (prev[i].at === 'heart') return prev;
      const next = prev.slice();
      next[i] = { at: 'drag', x: p.x, y: p.y - 14 };
      return next;
    });
  };
  const onDragEnd = (i: number, e: RPointerEvent<SVGRectElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.i !== i || !d.moved) return;
    dragEnd.current = performance.now();
    const p = toSvg(e);
    if (p && p.y < 292) {
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
    <div className={s.wrap}>
      <span className={cx(s.blob, s.blob1)} />
      <span className={cx(s.blob, s.blob2)} />

      <div className={s.head}>
        {healed ? (
          <div key="t">
            <div className={s.eyebrow}>hatinya utuh lagi</div>
            <div className={cx(s.name, s.small)}>{data.title || `Maaf ya, ${data.to}`}</div>
          </div>
        ) : (
          <div key="n">
            <div className={s.eyebrow}>sebuah permintaan maaf untuk</div>
            <div className={cx(s.name, long && s.small)}>{data.to || 'kamu'}</div>
            {data.from ? <div className={s.from}>dari {data.from}</div> : null}
          </div>
        )}
      </div>

      <div className={s.art}>
        <HeartArt
          n={n}
          states={states}
          healed={healed}
          className={s.svg}
          svgRef={svg}
          onTap={(i) => {
            if (performance.now() - dragEnd.current < 120) return;
            stick(i);
          }}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
        />
      </div>

      <div className={s.foot}>
        {note ? (
          <div
            key={last?.slot}
            className={s.tag}
            style={{ ['--dot' as string]: PLASTER_COLORS[(last?.plaster ?? 0) % PLASTER_COLORS.length].base }}
          >
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
            Baca suratnya →
          </button>
        ) : (
          <div className={s.count} aria-label={`${stuck} dari ${n} plester ditempel`}>
            {states.map((_, i) => (
              <i key={i} className={i < stuck ? s.on : undefined} />
            ))}
          </div>
        )}
      </div>

      {stuck === 0 ? <Hint>Ketuk plesternya, tempel di hati</Hint> : null}

      <Confetti
        burst={burst}
        shapes="hearts"
        count={70}
        colors={['#ef6a6a', '#ff9aa8', '#ffc9cf', '#ffffff', '#f7b3a0']}
        origin={{ x: 0.5, y: 0.5 }}
      />

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow="Dari hati yang sudah ditambal"
          theme={{ bg: 'linear-gradient(#eef6f9, #d6e7ef)', ink: '#24323b', paper: '#fffdf9', paperInk: '#24323b' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
