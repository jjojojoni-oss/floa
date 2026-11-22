'use client';

import { type CSSProperties, type PointerEvent, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Sprite, Stage, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { useText } from './i18n';
import { meta } from './meta';
import { fmt } from '@/i18n/client';
import s from './style.module.css';

type Phase = 'ready' | 'thrown' | 'scroll' | 'open';

const GOLD = ['#f2c14e', '#ffe08a', '#fff7dd', '#d99f2b', '#7fa4f0', '#ffffff'];
const ART = ['bg-toga', 'toga-topi', 'toga-rumbai', 'toga-topi-kecil', 'toga-gulungan', 'toga-pita', 'toga-batang', 'toga-segel', 'toga-bintang'];

/** Bintang lukisan yang berkelip: [kiri, atas, ukuran]. */
const STARS: [string, string, string][] = [
  ['7%', '8%', '1.5em'], ['25%', '3.5%', '0.9em'], ['76%', '6%', '1.1em'], ['90%', '20%', '1.6em'], ['4%', '30%', '1em'],
  ['85%', '42%', '0.9em'], ['10%', '52%', '1.4em'], ['92%', '60%', '1.1em'],
];

/** Topi-topi lain yang ikut dilempar: [x, lebar, tunda, durasi, puncak, putaran, geser]. */
const FLYERS: [string, string, string, string, string, string, string][] = [
  ['2%', '5.6em', '0.05s', '2.3s', '-36em', '420deg', '2em'],
  ['68%', '6.2em', '0.12s', '2.5s', '-41em', '-500deg', '-2.5em'],
  ['28%', '4.2em', '0.22s', '2.1s', '-30em', '-380deg', '-1.5em'],
  ['50%', '4.8em', '0.3s', '2.4s', '-44em', '560deg', '1.5em'],
  ['82%', '4em', '0.4s', '2.2s', '-28em', '360deg', '-1em'],
  ['12%', '4.4em', '0.5s', '2.6s', '-46em', '-620deg', '3em'],
  ['58%', '5.2em', '0.62s', '2.3s', '-33em', '440deg', '-2em'],
];

export default function Toga(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    // tinta Stage sengaja gelap (untuk vignette & petunjuk); warna teks adegan diatur di .wrap
    <Stage bg={meta.palette.bg} ink="#0d1638" accent={meta.palette.accent} backdrop="/art/bg-toga.webp" className={s.stage}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const notes = data.notes.map((n) => n.trim()).filter(Boolean).slice(0, 3);
  const ready = useArtReady(ART);
  const [phase, setPhase] = useState<Phase>('ready');
  const [shown, setShown] = useState(0);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);
  const cap = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ y: number; dy: number } | null>(null);
  const thrown = useRef(false);
  const skipClick = useRef(false);
  const later = useTimers();
  const t = useText();

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
  const title = data.title || t.titleFallback;

  return (
    <div className={cx(s.wrap, ready && s.ready, after && s.thrown)}>
      {STARS.map(([left, top, size], i) => (
        <Sprite key={i} name="toga-bintang" className={s.star} style={{ left, top, width: size, '--i': i } as CSSProperties} />
      ))}

      {after ? (
        <div className={s.sky} aria-hidden>
          {FLYERS.map(([x, w, d, t, peak, rot, dx], i) => (
            <span key={i} className={s.flyer} style={{ '--x': x, '--w': w, '--d': d, '--t': t, '--peak': peak, '--rot': rot, '--dx': dx } as CSSProperties}>
              <Sprite name="toga-topi-kecil" />
            </span>
          ))}
        </div>
      ) : null}

      <div className={s.head}>
        <div className={s.eyebrow}>{after ? t.eyebrowAfter : t.eyebrowBefore}</div>
        <div className={cx(s.name, data.to.length > 11 && s.small)}>{data.to || t.nameFallback}</div>
        {data.from ? <div className={s.from}>{fmt(t.fromName, { name: data.from })}</div> : null}
      </div>

      <div className={cx(s.mid, !notes.length && phase === 'scroll' && s.center)}>
        {notes.length ? (
          <div className={cx(s.ribbons, phase === 'open' && s.hide)} aria-live="polite">
            {notes.slice(0, shown).map((t, i) => (
              <div key={i} className={s.ribbon}>
                {t}
              </div>
            ))}
          </div>
        ) : null}

        {phase === 'scroll' || phase === 'open' ? (
          <button
            type="button"
            className={cx(s.rolled, phase === 'open' && s.gone)}
            onClick={openScroll}
            aria-label={t.openAria}
            tabIndex={phase === 'open' ? -1 : 0}
          >
            <Sprite name="toga-gulungan" />
          </button>
        ) : null}

        {phase === 'open' ? (
          <div className={s.sheetBox}>
            <div className={s.sheet}>
              <Sprite name="toga-batang" className={s.rod} />
              <div className={s.unroll}>
                {/* jendela yang turun sementara isinya diam: kertas terbuka dari atas tanpa meregang */}
                <div className={s.reveal}>
                  <div className={s.revealIn}>
                    <div className={s.paper}>
                      <div className={s.paperIn}>
                        <div className={s.pEyebrow}>{t.paperEyebrow}</div>
                        <div className={cx(s.pTitle, title.length > 22 && s.small)}>{title}</div>
                        <div className={s.rule}>
                          <i />
                        </div>
                        <div className={s.pFor}>
                          {data.to ? fmt(t.forName, { name: data.to }) : t.forYou}
                          {data.from ? (
                            <>
                              <br />
                              {fmt(t.fromName, { name: data.from })}
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={s.rodTrack}>
                  <Sprite name="toga-batang" className={cx(s.rod, s.rodBottom)} />
                  <Sprite name="toga-segel" className={s.seal} />
                </div>
              </div>
            </div>
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
              aria-label={t.throwAria}
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
              <Sprite name="toga-topi" className={s.capImg} />
              <Sprite name="toga-rumbai" className={s.tassel} />
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
            {t.read}
          </button>
        ) : null}
      </div>

      {phase === 'ready' ? <Hint>{t.hintSwipe}</Hint> : null}
      {phase === 'scroll' ? <Hint>{t.hintTap}</Hint> : null}

      <Confetti burst={burst} colors={GOLD} origin={{ x: 0.5, y: 0.7 }} count={140} />

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finaleEyebrow}
          flower="bunga-kamboja"
          theme={{ backdrop: '/art/bg-toga.webp', ink: '#fdf6e3', paper: '#fff7e6', paperInk: '#24304f' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
