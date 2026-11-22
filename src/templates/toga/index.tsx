'use client';

import { type CSSProperties, type PointerEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Stage, cx, haptic, sfx, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { CapArt, RollArt, Seal } from './art';
import { meta } from './meta';
import s from './style.module.css';

type Phase = 'ready' | 'thrown' | 'scroll' | 'open';

const GOLD = ['#f2c14e', '#ffe08a', '#fff7dd', '#d99f2b', '#7fa4f0', '#ffffff'];

const STARS: [string, string, string][] = [
  ['8%', '9%', '0.7em'], ['24%', '4%', '0.45em'], ['78%', '7%', '0.55em'], ['91%', '21%', '0.8em'], ['5%', '31%', '0.5em'],
  ['86%', '43%', '0.45em'], ['12%', '55%', '0.75em'], ['93%', '62%', '0.6em'], ['6%', '76%', '0.45em'], ['82%', '81%', '0.7em'],
  ['30%', '88%', '0.4em'], ['64%', '92%', '0.5em'],
];

/** Topi-topi lain yang ikut dilempar: [x, lebar, tunda, durasi, puncak, putaran, geser]. */
const FLYERS: [string, string, string, string, string, string, string][] = [
  ['4%', '4.6em', '0.05s', '2.3s', '-36em', '420deg', '2em'],
  ['72%', '5.2em', '0.12s', '2.5s', '-41em', '-500deg', '-2.5em'],
  ['30%', '3.4em', '0.22s', '2.1s', '-30em', '-380deg', '-1.5em'],
  ['52%', '3.8em', '0.3s', '2.4s', '-44em', '560deg', '1.5em'],
  ['84%', '3.2em', '0.4s', '2.2s', '-28em', '360deg', '-1em'],
  ['14%', '3.6em', '0.5s', '2.6s', '-46em', '-620deg', '3em'],
  ['60%', '4.2em', '0.62s', '2.3s', '-33em', '440deg', '-2em'],
];

export default function Toga(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const notes = data.notes.map((n) => n.trim()).filter(Boolean).slice(0, 3);
  const [phase, setPhase] = useState<Phase>('ready');
  const [shown, setShown] = useState(0);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);
  const cap = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ y: number; dy: number } | null>(null);
  const thrown = useRef(false);
  const skipClick = useRef(false);
  const later = useTimers();

  const throwCap = (fromPx = 0) => {
    if (thrown.current) return;
    thrown.current = true;
    const el = cap.current;
    if (el) {
      el.style.transform = '';
      el.style.setProperty('--from', `${fromPx}px`);
    }
    setPhase('thrown');
    setBurst((b) => b + 1);
    sfx.whoosh();
    haptic(25);
    later(() => sfx.success(), 600);
    notes.forEach((_, k) =>
      later(() => {
        setShown(k + 1);
        sfx.note(k + 2);
      }, 950 + k * 1000),
    );
    later(
      () => {
        setPhase('scroll');
        sfx.pop();
      },
      notes.length ? 950 + notes.length * 1000 + 300 : 1500,
    );
  };

  const onDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (thrown.current) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { y: e.clientY, dy: 0 };
    e.currentTarget.style.transition = 'none';
  };
  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || thrown.current) return;
    d.dy = Math.min(28, e.clientY - d.y);
    e.currentTarget.style.transform = `translateY(${d.dy}px) rotate(${d.dy * 0.05}deg)`;
  };
  const onUp = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || thrown.current) return;
    const el = e.currentTarget;
    // geser cukup jauh ke atas, atau sekadar diketuk → lempar
    if (d.dy < -el.offsetHeight * 0.3 || Math.abs(d.dy) < 8) {
      throwCap(d.dy);
    } else {
      // dilepas sebelum cukup jauh: kembali ke tempat, dan jangan dianggap ketukan
      skipClick.current = true;
      el.style.transition = 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
      el.style.transform = '';
    }
  };
  const onCancel = (e: PointerEvent<HTMLButtonElement>) => {
    drag.current = null;
    if (thrown.current) return;
    e.currentTarget.style.transition = 'transform 0.3s ease';
    e.currentTarget.style.transform = '';
  };

  const openScroll = () => {
    if (phase !== 'scroll') return;
    setPhase('open');
    sfx.whoosh();
    haptic(15);
    later(() => {
      sfx.chime();
      setBurst((b) => b + 1);
    }, 900);
  };

  const after = phase !== 'ready';
  const title = data.title || 'Selamat wisuda!';

  return (
    <div className={cx(s.wrap, after && s.thrown)}>
      {STARS.map(([left, top, size], i) => (
        <span key={i} className={s.star} style={{ left, top, '--s': size, '--i': i } as CSSProperties} />
      ))}

      {after ? (
        <div className={s.sky} aria-hidden>
          {FLYERS.map(([x, w, d, t, peak, rot, dx], i) => (
            <span key={i} className={s.flyer} style={{ '--x': x, '--w': w, '--d': d, '--t': t, '--peak': peak, '--rot': rot, '--dx': dx } as CSSProperties}>
              <CapArt swing={false} />
            </span>
          ))}
        </div>
      ) : null}

      <div className={s.head}>
        <div className={s.eyebrow}>{after ? 'resmi lulus!' : 'hari yang ditunggu-tunggu'}</div>
        <div className={cx(s.name, data.to.length > 11 && s.small)}>{data.to || 'Wisudawan'}</div>
        {data.from ? <div className={s.from}>dari {data.from}</div> : null}
      </div>

      <div className={cx(s.mid, (phase === 'open' || (!notes.length && phase === 'scroll')) && s.center)}>
        {notes.length ? (
          <div className={cx(s.ribWrap, phase === 'open' && s.hide)} aria-live="polite">
            <div className={s.ribbons}>
              {notes.slice(0, shown).map((t, i) => (
                <div key={i} className={s.ribbon}>
                  <span className={s.face}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {phase === 'scroll' || phase === 'open' ? (
          <div className={s.scrollBox}>
            <button
              type="button"
              className={cx(s.rolled, phase === 'open' && s.gone)}
              onClick={openScroll}
              aria-label="Buka gulungan ucapan"
              tabIndex={phase === 'open' ? -1 : 0}
            >
              <RollArt />
            </button>
            {phase === 'open' ? (
              <div className={s.sheet}>
                <div className={s.rod} />
                <Unroll>
                  <div className={s.paperIn}>
                    <div className={s.pEyebrow}>dengan bangga</div>
                    <div className={cx(s.pTitle, title.length > 22 && s.small)}>{title}</div>
                    <div className={s.rule}>
                      <i />
                    </div>
                    <div className={s.pFor}>
                      {data.to ? (
                        <>
                          untuk <b>{data.to}</b>
                        </>
                      ) : (
                        'untuk kamu'
                      )}
                      {data.from ? (
                        <>
                          <br />
                          dari {data.from}
                        </>
                      ) : null}
                    </div>
                    <Seal className={s.seal} />
                  </div>
                </Unroll>
                <div className={s.rod} />
              </div>
            ) : null}
          </div>
        ) : null}

        {phase === 'ready' || phase === 'thrown' ? (
          <div className={s.capZone}>
            <span className={s.spot} />
            <span className={s.trail} aria-hidden />
            <div className={s.arrows} aria-hidden>
              <i />
              <i />
              <i />
            </div>
            <button
              type="button"
              ref={cap}
              className={cx(s.cap, after && s.fly)}
              aria-label="Lempar toga ke atas"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onCancel}
              onClick={() => {
                if (skipClick.current) {
                  skipClick.current = false;
                  return;
                }
                throwCap(0);
              }}
              tabIndex={after ? -1 : 0}
            >
              <CapArt />
            </button>
          </div>
        ) : null}
      </div>

      <div className={s.foot}>
        {phase === 'open' ? (
          <button
            type="button"
            className={s.cta}
            onClick={() => {
              sfx.chime();
              setFinale(true);
            }}
          >
            Baca isi gulungannya →
          </button>
        ) : null}
      </div>

      {phase === 'ready' ? <Hint>Geser toganya ke atas</Hint> : null}
      {phase === 'scroll' ? <Hint>Ketuk gulungannya</Hint> : null}

      <Confetti burst={burst} colors={GOLD} origin={{ x: 0.5, y: 0.7 }} count={140} />

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow="Isi gulungannya"
          theme={{ bg: 'linear-gradient(#1b3464, #0d1a36)', ink: '#fdf6e3', paper: '#fff9ea', paperInk: '#24304f' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}

/** Kertas yang membuka dari atas ke bawah setelah terpasang. */
function Unroll({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    // buka di frame berikutnya supaya transisinya berjalan
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div className={cx(s.unroll, open && s.open)}>
      <div className={s.paper}>{children}</div>
    </div>
  );
}
