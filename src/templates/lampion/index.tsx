'use client';

import { type CSSProperties, useMemo, useRef, useState } from 'react';
import { Finale, Hint, Stage, cx, haptic, sfx, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { Hills, Lantern, Moon, seeded } from './art';
import { meta } from './meta';
import s from './style.module.css';

/** Titik menetap tiap lampion di langit: [kiri %, atas %, skala]. */
const SLOTS: Record<number, [number, number, number][]> = {
  3: [
    [21, 33, 0.36],
    [79, 29, 0.31],
    [50, 41, 0.42],
  ],
  4: [
    [18, 32, 0.34],
    [82, 28, 0.3],
    [39, 41, 0.42],
    [66, 45, 0.37],
  ],
  5: [
    [15, 31, 0.32],
    [85, 27, 0.29],
    [50, 35, 0.34],
    [29, 45, 0.41],
    [73, 47, 0.38],
  ],
};

export default function Lampion(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const notes = data.notes.map((t) => t.trim()).filter(Boolean).slice(0, 5);
  const n = Math.min(5, Math.max(3, notes.length));
  const slots = SLOTS[n];
  const [cur, setCur] = useState(0);
  const [done, setDone] = useState(false);
  const [finale, setFinale] = useState(false);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ y0: number; moved: boolean } | null>(null);
  const dragEnd = useRef(0);
  const curRef = useRef(0);
  const later = useTimers();

  const stars = useMemo(() => {
    const r = seeded(7);
    return Array.from({ length: 54 }, (_, i) => ({
      x: r() * 100,
      y: r() * 66,
      z: 0.09 + r() * 0.15,
      d: r() * 4,
      big: i % 9 === 0,
    }));
  }, []);

  const crowd = useMemo(() => {
    const r = seeded(21);
    return Array.from({ length: 30 }, () => ({
      x: 3 + r() * 94,
      w: 0.5 + r() * 0.75,
      rise: 2.5 + r() * 25,
      dx: (r() - 0.5) * 5,
      dur: 5 + r() * 5,
      delay: r() * 2.6,
      o: 0.5 + r() * 0.45,
    }));
  }, []);

  const release = (i: number) => {
    if (i !== curRef.current || i >= n) return;
    curRef.current = i + 1;
    setCur(i + 1);
    setDy(0);
    haptic(14);
    sfx.whoosh();
    sfx.note(i);
    if (i + 1 >= n) {
      later(() => {
        setDone(true);
        sfx.success();
        haptic(40);
      }, 2200);
    }
  };

  const note = cur < n ? notes[cur] : null;
  const long = (data.to || '').length > 12;

  return (
    <div className={s.wrap}>
      <div className={s.sky} aria-hidden>
        {stars.map((st, i) => (
          <i
            key={i}
            className={cx(s.star, st.big && s.starBig)}
            style={{ left: `${st.x}%`, top: `${st.y}%`, fontSize: `${st.z}em`, animationDelay: `${-st.d}s` }}
          />
        ))}
        <Moon className={s.moon} />
        <Hills className={s.hills} />
        <span className={cx(s.reflect, (cur < n || done) && s.reflectOn, done && s.reflectWide)} />
      </div>

      {done ? (
        <div className={s.crowd} aria-hidden>
          {crowd.map((c, i) => (
            <i
              key={i}
              style={
                {
                  left: `${c.x}%`,
                  width: `${c.w}em`,
                  height: `${c.w * 1.25}em`,
                  '--rise': `${-c.rise}em`,
                  '--dx': `${c.dx}em`,
                  '--o': c.o,
                  animationDuration: `${c.dur}s`,
                  animationDelay: `${c.delay}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ) : null}

      <div className={s.head}>
        {done ? (
          <div key="t">
            <div className={s.eyebrow}>langitnya penuh harapan</div>
            <div className={cx(s.name, s.small)}>{data.title || `Untuk ${data.to}`}</div>
          </div>
        ) : (
          <div key="n">
            <div className={s.eyebrow}>harapan-harapan untuk</div>
            <div className={cx(s.name, long && s.small)}>{data.to || 'kamu'}</div>
            {data.from ? <div className={s.from}>dari {data.from}</div> : null}
          </div>
        )}
      </div>

      {slots.map(([x, y, sc], i) => {
        const flown = i < cur;
        const ready = i === cur;
        return (
          <div
            key={i}
            className={cx(s.lan, flown && s.flown, ready && s.ready, i > cur && s.wait, ready && dragging && s.dragging)}
            style={
              {
                left: flown ? `${x}%` : undefined,
                top: flown ? `${y}%` : undefined,
                transform: ready && dy ? `translateY(${dy}px)` : undefined,
                '--sc': sc,
                '--i': i,
              } as CSSProperties
            }
            role={ready ? 'button' : undefined}
            tabIndex={ready ? 0 : undefined}
            aria-label={ready ? `Terbangkan lampion ${i + 1}` : undefined}
            aria-hidden={ready ? undefined : true}
            onPointerDown={
              ready
                ? (e) => {
                    drag.current = { y0: e.clientY, moved: false };
                    e.currentTarget.setPointerCapture?.(e.pointerId);
                  }
                : undefined
            }
            onPointerMove={
              ready
                ? (e) => {
                    const d = drag.current;
                    if (!d) return;
                    const v = e.clientY - d.y0;
                    if (Math.abs(v) > 6 && !d.moved) {
                      d.moved = true;
                      setDragging(true);
                    }
                    if (d.moved) setDy(Math.min(10, v));
                  }
                : undefined
            }
            onPointerUp={
              ready
                ? (e) => {
                    const d = drag.current;
                    drag.current = null;
                    setDragging(false);
                    if (!d || !d.moved) return;
                    dragEnd.current = performance.now();
                    if (e.clientY - d.y0 < -26) release(i);
                    else setDy(0);
                  }
                : undefined
            }
            onPointerCancel={
              ready
                ? () => {
                    drag.current = null;
                    setDragging(false);
                    setDy(0);
                  }
                : undefined
            }
            onClick={
              ready
                ? () => {
                    if (performance.now() - dragEnd.current < 120) return;
                    release(i);
                  }
                : undefined
            }
            onKeyDown={
              ready
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowUp') {
                      e.preventDefault();
                      release(i);
                    }
                  }
                : undefined
            }
          >
            <div className={s.lanScale}>
              <div className={s.lanBob}>
                <span className={s.glow} />
                <Lantern className={s.lanSvg} />
              </div>
            </div>
          </div>
        );
      })}

      <div className={s.foot}>
        {done ? (
          <button
            type="button"
            className={s.cta}
            onClick={() => {
              sfx.chime();
              setFinale(true);
            }}
          >
            Baca pesannya →
          </button>
        ) : (
          <>
            {note ? (
              <div key={cur} className={s.card}>
                <span className={s.cardNo}>harapan ke-{cur + 1}</span>
                {note}
              </div>
            ) : (
              <div className={s.cardGap} />
            )}
            <div className={s.count} style={cur === 0 ? { visibility: 'hidden' } : undefined} aria-label={`${Math.min(cur, n)} dari ${n} lampion terbang`}>
              {slots.map((_, i) => (
                <i key={i} className={i < cur ? s.on : undefined} />
              ))}
            </div>
          </>
        )}
      </div>

      {cur === 0 ? <Hint>Geser lampionnya ke atas</Hint> : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow="Dititipkan lewat lampion"
          theme={{ bg: 'linear-gradient(#131b40, #2a2259)', ink: '#fdf1d8', paper: '#fff6e2', paperInk: '#2b2440' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
