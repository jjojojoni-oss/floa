'use client';

import { type CSSProperties, type PointerEvent, useEffect, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Sprite, Stage, TapCue, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { IjazahGame } from './Game';
import { useText } from './i18n';
import { meta } from './meta';
import { fmt } from '@/i18n/client';
import s from './style.module.css';

/**
 * intro   = pembuka sebelum langkah pertama (hanya kalau ada catatan perjalanan)
 * journey = menelusuri langkah demi langkah
 * ready   = toga menunggu dilempar
 */
type Phase = 'intro' | 'journey' | 'ready' | 'thrown' | 'scroll' | 'open';

const GOLD = ['#f2c14e', '#ffe08a', '#fff7dd', '#d99f2b', '#7fa4f0', '#ffffff'];
const ART = ['bg-toga', 'toga-topi', 'toga-rumbai', 'toga-topi-kecil', 'toga-gulungan', 'toga-pita', 'toga-batang', 'toga-segel', 'toga-bintang', 'polaroid-selotip-2'];
const MAX_STEPS = 5;

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

/** kemiringan kartu langkah bergantian, supaya terasa seperti lembar-lembar kenangan */
const TILT = [-1.6, 1.3, -0.9, 1.7, -1.2];

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
  const steps = data.notes.map((n) => n.trim()).filter(Boolean).slice(0, MAX_STEPS);
  const photos = data.photos.filter(Boolean);
  const n = steps.length;
  const ready = useArtReady(ART);
  const [phase, setPhase] = useState<Phase>(n ? 'intro' : 'ready');
  const [step, setStep] = useState(0);
  /** kartu yang sedang pergi (animasi keluar), dan arahnya */
  const [leaving, setLeaving] = useState<{ i: number; dir: 1 | -1 } | null>(null);
  const [ribbon, setRibbon] = useState(false);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);
  /** mini-game: setelah toga dilempar, angin iseng menerbangkan ijazahnya */
  const [game, setGame] = useState<'off' | 'on' | 'done'>('off');
  const cap = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLButtonElement>(null);
  const nextBtn = useRef<HTMLButtonElement>(null);
  const rolled = useRef<HTMLButtonElement>(null);
  const readBtn = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ y: number; dy: number } | null>(null);
  const thrown = useRef(false);
  const skipClick = useRef(false);
  const busy = useRef(false);
  const later = useTimers();
  const t = useText();

  // fokus mengikuti langkah, supaya pengguna keyboard tidak tersesat
  // (tidak di pratinjau editor: jangan merebut kursor dari kolom isian)
  const intro = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (mode === 'preview') return;
    if (phase === 'intro') intro.current?.focus({ preventScroll: true });
    if (phase === 'journey') card.current?.focus({ preventScroll: true });
    if (phase === 'ready' && n) cap.current?.focus({ preventScroll: true });
  }, [phase, step, n, mode]);

  const begin = () => {
    if (phase !== 'intro') return;
    sfx.note(1);
    haptic(10);
    setPhase('journey');
  };

  const go = (dir: 1 | -1) => {
    if (phase !== 'journey' || busy.current) return;
    if (dir === -1 && step === 0) return;
    busy.current = true;
    later(() => (busy.current = false), 420);
    setLeaving({ i: step, dir });
    later(() => setLeaving(null), 520);
    haptic(10);
    if (dir === 1 && step === n - 1) {
      // langkah terakhir: jalannya selesai, toga sudah menunggu
      sfx.chime();
      later(() => setPhase('ready'), 380);
      return;
    }
    sfx.note(step + (dir === 1 ? 2 : 0));
    setStep((v) => v + dir);
  };

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
    later(() => setRibbon(true), 1000);
    later(() => setGame('on'), 2500);
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

  const walking = phase === 'intro' || phase === 'journey';
  const after = phase === 'thrown' || phase === 'scroll' || phase === 'open';
  const title = data.title || t.titleFallback;
  const eyebrow = after ? t.eyebrowAfter : walking ? t.eyebrowJourney : n ? t.eyebrowArrive : t.eyebrowBefore;
  /** jumlah langkah yang sudah dilalui (untuk jalur bintang) */
  const passed = phase === 'intro' ? 0 : phase === 'journey' ? step : n;

  const renderCard = (i: number) => {
    const photo = photos[i];
    return (
      <>
        <span className={s.cardLabel}>{fmt(t.step, { i: i + 1, n })}</span>
        {photo ? (
          <span className={s.snap}>
            <Sprite name="polaroid-selotip-2" className={s.tape} />
            <span className={s.snapPic}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="" draggable={false} />
            </span>
          </span>
        ) : (
          <Sprite name="toga-bintang" className={s.cardStar} />
        )}
        <span className={cx(s.cardText, !photo && s.big, steps[i].length > 62 && s.long)}>{steps[i]}</span>
      </>
    );
  };

  return (
    <div className={cx(s.wrap, ready && s.ready, after && s.thrown, walking && s.walking)}>
      {STARS.map(([left, top, size], i) => (
        <Sprite key={i} name="toga-bintang" className={s.star} style={{ left, top, width: size, '--i': i } as CSSProperties} />
      ))}

      {after ? (
        <div className={s.sky} aria-hidden>
          {FLYERS.map(([x, w, d, dur, peak, rot, dx], i) => (
            <span key={i} className={s.flyer} style={{ '--x': x, '--w': w, '--d': d, '--t': dur, '--peak': peak, '--rot': rot, '--dx': dx } as CSSProperties}>
              <Sprite name="toga-topi-kecil" />
            </span>
          ))}
        </div>
      ) : null}

      <div className={s.head}>
        <div key={eyebrow} className={s.eyebrow}>
          {eyebrow}
        </div>
        <div className={cx(s.name, data.to.length > 11 && s.small)}>{data.to || t.nameFallback}</div>
        {data.from ? <div className={s.from}>{fmt(t.fromName, { name: data.from })}</div> : null}
      </div>

      <div className={cx(s.mid, phase === 'scroll' && s.center)}>
        {/* rasi bintang perjalanan: tiap langkah yang dilalui menyala, toga menunggu di ujung */}
        {n && (walking || (phase === 'ready' && leaving)) ? (
          <div className={s.path} style={{ '--n': n } as CSSProperties} aria-hidden>
            {steps.map((_, i) => (
              <span key={i} className={cx(s.seg, i < passed && s.segOn)} />
            ))}
            {steps.map((_, i) => (
              <span
                key={`d${i}`}
                className={cx(s.dot, i < passed && s.dotOn, phase === 'journey' && i === step && s.dotNow)}
                style={{ '--k': i } as CSSProperties}
              >
                <Sprite name="toga-bintang" />
              </span>
            ))}
            <span className={cx(s.goal, passed >= n && s.goalOn)}>
              <Sprite name="toga-topi-kecil" />
            </span>
          </div>
        ) : null}
        {/* ── pembuka perjalanan ── */}
        {phase === 'intro' ? (
          <div className={s.intro}>
            <p className={s.introLine}>{t.introLine}</p>
            <p className={s.introCount}>{fmt(t.introCount, { n })}</p>
            <button ref={intro} type="button" className={s.cta} onClick={begin}>
              {t.start} <span aria-hidden>→</span>
            </button>
          </div>
        ) : null}

        {/* ── langkah demi langkah ── */}
        {phase === 'journey' || (phase === 'ready' && leaving) ? (
          <div className={s.deck}>
            {leaving ? (
              <div
                key={`out-${leaving.i}-${leaving.dir}`}
                className={cx(s.card, s.out, leaving.dir === -1 && s.back)}
                style={{ '--tilt': `${TILT[leaving.i % TILT.length]}deg` } as CSSProperties}
                aria-hidden
              >
                {renderCard(leaving.i)}
              </div>
            ) : null}
            {/* di langkah terakhir kartu yang sedang pergi tidak digandakan */}
            {phase === 'journey' && leaving?.i !== step ? (
              <button
                ref={card}
                key={`in-${step}`}
                type="button"
                className={cx(s.card, s.in, leaving?.dir === -1 && s.back)}
                style={{ '--tilt': `${TILT[step % TILT.length]}deg` } as CSSProperties}
                onClick={() => go(1)}
                aria-label={fmt(t.stepAria, { i: step + 1, n, text: steps[step] })}
              >
                {renderCard(step)}
              </button>
            ) : null}
          </div>
        ) : null}

        {/* ── setelah dilempar: satu pita, lalu gulungan ── */}
        {ribbon ? (
          <div className={cx(s.ribbons, phase === 'open' && s.hide)} aria-live="polite">
            <div className={s.ribbon}>{t.ribbonAfter}</div>
          </div>
        ) : null}

        {phase === 'scroll' || phase === 'open' ? (
          <button
            ref={rolled}
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
        {phase === 'journey' ? (
          <div className={s.nav}>
            <button type="button" className={cx(s.round, step === 0 && s.hidden)} onClick={() => go(-1)} aria-label={t.prev} tabIndex={step === 0 ? -1 : 0}>
              <span aria-hidden>←</span>
            </button>
            <button ref={nextBtn} type="button" className={s.cta} onClick={() => go(1)}>
              {step === n - 1 ? t.arrive : t.next} <span aria-hidden>→</span>
            </button>
          </div>
        ) : null}

        {phase === 'open' ? (
          <button
            ref={readBtn}
            type="button"
            className={cx(s.cta, s.ctaRead)}
            onClick={() => {
              sfx.chime();
              setFinale(true);
            }}
          >
            {t.read}
          </button>
        ) : null}
      </div>

      {phase === 'ready' && !leaving ? <Hint>{t.hintSwipe}</Hint> : null}
      {phase === 'scroll' ? <Hint>{t.hintTap}</Hint> : null}

      {/* penunjuk sentuh kalau penerima diam, satu per tahap */}
      <TapCue target={intro} show={phase === 'intro'} delay={4000} />
      <TapCue target={nextBtn} show={phase === 'journey' && !leaving} delay={4200} />
      <TapCue target={cap} show={phase === 'ready' && !leaving} kind="drag" dir={{ x: 0, y: -5 }} at={{ x: 0.5, y: 0.6 }} />
      <TapCue target={rolled} show={phase === 'scroll'} />
      <TapCue target={readBtn} show={phase === 'open' && !finale} delay={3800} />

      {game === 'on' ? (
        <IjazahGame
          t={t.game}
          onDone={() => {
            setGame('done');
            setPhase('scroll');
            sfx.pop();
          }}
        />
      ) : null}

      <Confetti burst={burst} colors={GOLD} origin={{ x: 0.5, y: 0.7 }} count={110} />

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
