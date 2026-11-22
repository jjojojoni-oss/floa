'use client';

import { type CSSProperties, useMemo, useRef, useState } from 'react';
import { Finale, Hint, Sprite, Stage, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { useText } from './i18n';
import { meta } from './meta';
import { fmt } from '@/i18n/client';
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

const BG = '/art/bg-lampion.webp';
const ART = [BG, 'lampion', 'lampion-bulan'];

/** PRNG kecil supaya posisi bintang/lampion sama di tiap render. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Lampion(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BG}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const notes = data.notes.map((t) => t.trim()).filter(Boolean).slice(0, 5);
  const n = Math.min(5, Math.max(3, notes.length));
  const slots = SLOTS[n];
  const ready = useArtReady(ART);
  const [cur, setCur] = useState(0);
  const [done, setDone] = useState(false);
  const [finale, setFinale] = useState(false);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ y0: number; moved: boolean } | null>(null);
  const dragEnd = useRef(0);
  const curRef = useRef(0);
  const later = useTimers();
  const t = useText();

  // kerlip bintang di atas lukisan (bintang lukisannya sendiri diam)
  const stars = useMemo(() => {
    const r = seeded(7);
    return Array.from({ length: 18 }, () => ({ x: r() * 100, y: r() * 56, z: 0.12 + r() * 0.14, d: r() * 4 }));
  }, []);

  const crowd = useMemo(() => {
    const r = seeded(21);
    return Array.from({ length: 28 }, () => ({
      x: 3 + r() * 94,
      w: 0.9 + r() * 1.3,
      rise: 2.5 + r() * 25,
      dx: (r() - 0.5) * 5,
      dur: 5 + r() * 5,
      delay: r() * 2.6,
      o: 0.6 + r() * 0.4,
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
    <div className={cx(s.wrap, ready && s.ready)}>
      <div className={s.sky} aria-hidden>
        {stars.map((st, i) => (
          <i key={i} className={s.star} style={{ left: `${st.x}%`, top: `${st.y}%`, fontSize: `${st.z}em`, animationDelay: `${-st.d}s` }} />
        ))}
        <Sprite name="lampion-bulan" className={s.moon} />
        <span className={cx(s.reflect, (cur < n || done) && s.reflectOn, done && s.reflectWide)} />
      </div>

      {done ? (
        <div className={s.crowd} aria-hidden>
          {crowd.map((c, i) => (
            <span
              key={i}
              style={
                {
                  left: `${c.x}%`,
                  width: `${c.w}em`,
                  '--rise': `${-c.rise}em`,
                  '--dx': `${c.dx}em`,
                  '--o': c.o,
                  animationDuration: `${c.dur}s`,
                  animationDelay: `${c.delay}s`,
                } as CSSProperties
              }
            >
              <Sprite name="lampion-kecil" />
            </span>
          ))}
        </div>
      ) : null}

      <div className={s.head}>
        {done ? (
          <div key="t">
            <div className={s.eyebrow}>{t.doneEyebrow}</div>
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

      {slots.map(([x, y, sc], i) => {
        const flown = i < cur;
        const isReady = i === cur;
        return (
          // dua lapis seukuran stage: gerak mendatar dan menaik punya lengkung waktu sendiri
          <div
            key={i}
            className={cx(s.fly, flown && s.flown, isReady && s.ready2, i > cur && s.wait)}
            style={{ transform: flown ? `translateX(${x - 50}%)` : undefined, '--sc': sc, '--i': i } as CSSProperties}
          >
            <div className={s.flyY} style={{ transform: flown ? `translateY(calc(${y - 100}% + 17.2em))` : undefined }}>
              <div
                className={cx(s.lan, isReady && dragging && s.dragging)}
                style={{ transform: isReady && dy ? `translateY(${dy}px)` : undefined }}
                role={isReady ? 'button' : undefined}
                tabIndex={isReady ? 0 : undefined}
                aria-label={isReady ? fmt(t.releaseAria, { n: i + 1 }) : undefined}
                aria-hidden={isReady ? undefined : true}
                onPointerDown={
                  isReady
                    ? (e) => {
                        drag.current = { y0: e.clientY, moved: false };
                        e.currentTarget.setPointerCapture?.(e.pointerId);
                      }
                    : undefined
                }
                onPointerMove={
                  isReady
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
                  isReady
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
                  isReady
                    ? () => {
                        drag.current = null;
                        setDragging(false);
                        setDy(0);
                      }
                    : undefined
                }
                onClick={
                  isReady
                    ? () => {
                        if (performance.now() - dragEnd.current < 120) return;
                        release(i);
                      }
                    : undefined
                }
                onKeyDown={
                  isReady
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
                    <Sprite name="lampion" className={s.lanImg} />
                  </div>
                </div>
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
            {t.read}
          </button>
        ) : (
          <>
            {note ? (
              <div key={cur} className={s.card}>
                <span className={s.cardNo}>{fmt(t.wishNo, { n: cur + 1 })}</span>
                {note}
              </div>
            ) : (
              <div className={s.cardGap} />
            )}
            <div className={s.count} style={cur === 0 ? { visibility: 'hidden' } : undefined} aria-label={fmt(t.countAria, { cur: Math.min(cur, n), n })}>
              {slots.map((_, i) => (
                <i key={i} className={i < cur ? s.on : undefined} />
              ))}
            </div>
          </>
        )}
      </div>

      {cur === 0 ? <Hint>{t.hint}</Hint> : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finaleEyebrow}
          flower="bunga-kamboja"
          theme={{ backdrop: BG, ink: '#fdf1d8', paper: '#fff6e2', paperInk: '#2b2440' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
