'use client';

import { type CSSProperties, type KeyboardEvent, type PointerEvent, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Sprite, Stage, TapCue, Typewriter, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { GAME_TEXT, useText } from './i18n';
import { StarGame } from './StarGame';
import { meta } from './meta';
import { fmt, useLocale } from '@/i18n/client';
import s from './style.module.css';

/** Titik menetap tiap lampion di langit: [kiri %, atas %, skala]. */
const SLOTS: Record<number, [number, number, number][]> = {
  1: [[50, 36, 0.42]],
  2: [
    [30, 34, 0.38],
    [70, 40, 0.36],
  ],
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
  6: [
    [14, 31, 0.3],
    [86, 27, 0.28],
    [37, 33, 0.32],
    [63, 37, 0.33],
    [24, 46, 0.38],
    [77, 48, 0.36],
  ],
};

const BG = '/art/bg-lampion.webp';
const ART = [BG, 'lampion', 'lampion-padam', 'lampion-bulan', 'lampion-kecil', 'game-bintang'];

/** intro → wish (lampion satu per satu) → sky (langit penuh) → stars (mini-game bintang jatuh) → letter */
type Phase = 'intro' | 'wish' | 'sky' | 'stars' | 'letter';

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
  const t = useText();
  const locale = useLocale();
  const notes = data.notes.map((x) => x.trim()).filter(Boolean).slice(0, 6);
  const photos = data.photos.filter(Boolean);
  const n = notes.length ? notes.length : 3;
  const slots = SLOTS[n];
  const ready = useArtReady(ART);
  const later = useTimers();

  /** lampion kedua dari terakhir (atau yang kedua kalau cuma 3) malas terbang dulu */
  const lazyIdx = n >= 4 ? n - 2 : n === 3 ? 1 : -1;

  const [phase, setPhase] = useState<Phase>('intro');
  const [beat, setBeat] = useState(0);
  const [typed, setTyped] = useState(false);
  const [cur, setCur] = useState(0);
  const [lit, setLit] = useState(false);
  const [canGo, setCanGo] = useState(false);
  const [damp, setDamp] = useState(0);
  const [lazy, setLazy] = useState<'none' | 'stuck' | 'go'>('none');
  const [quip, setQuip] = useState<string | null>(null);
  const [preLast, setPreLast] = useState(false);
  const [bursts, setBursts] = useState(0);
  const [confetti, setConfetti] = useState(0);
  const [reread, setReread] = useState<number | null>(null);
  /** foto polaroid yang sedang diperbesar (indeks harapan) */
  const [big, setBig] = useState<number | null>(null);
  const [finale, setFinale] = useState(false);
  /** jeda hening sebelum narasi penutup, supaya hati dari lampion sempat terbentuk */
  const [calm, setCalm] = useState(false);
  /** lampion surat sudah sampai di bawah */
  const [landed, setLanded] = useState(false);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ y0: number; moved: boolean } | null>(null);
  const dragEnd = useRef(0);
  const busy = useRef(false);
  const rereadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** benda yang sekarang harus disentuh (untuk penunjuk TapCue) */
  const cueEl = useRef<HTMLElement | null>(null);

  // kerlip bintang di atas lukisan (bintang lukisannya sendiri diam)
  const stars = useMemo(() => {
    const r = seeded(7);
    return Array.from({ length: 18 }, () => ({ x: r() * 100, y: r() * 56, z: 0.12 + r() * 0.14, d: r() * 4 }));
  }, []);

  /** lampion orang lain di kejauhan yang naik lalu membentuk hati di atas danau */
  const heart = useMemo(() => {
    const r = seeded(21);
    const N = 26;
    return Array.from({ length: N }, (_, k) => {
      const a = (k / N) * Math.PI * 2;
      const hx = 16 * Math.sin(a) ** 3;
      const hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
      const top = 52 + hy * 0.78;
      return {
        x: 50 + hx * 1.55 + (r() - 0.5) * 1.4,
        y: top + (r() - 0.5) * 1.2,
        from: 74 - top + r() * 6,
        w: 0.85 + r() * 0.55,
        delay: 0.2 + (k % 13) * 0.16 + r() * 0.5,
        bob: r() * 4,
      };
    });
  }, []);

  /** kunang-kunang yang mondar-mandir di dekat dermaga */
  const flies = useMemo(() => {
    const r = seeded(33);
    return Array.from({ length: 7 }, () => ({
      x: 8 + r() * 84,
      y: 60 + r() * 26,
      dx: (r() - 0.5) * 6,
      dy: (r() - 0.5) * 4,
      d: 5 + r() * 5,
      delay: -r() * 8,
    }));
  }, []);

  const goNextBeat = (len: number, after: () => void) => {
    if (!typed) {
      setTyped(true); // ketukan pertama: tampilkan kalimatnya utuh
      return;
    }
    sfx.tap();
    if (beat + 1 < len) {
      setBeat(beat + 1);
      setTyped(false);
    } else after();
  };

  const startWishes = () => {
    setPhase('wish');
    setBeat(0);
    setTyped(false);
  };

  const light = (i: number) => {
    if (i !== cur || lit || busy.current) return;
    if (i === 0 && damp === 0) {
      // korek pertama lembap: cuma memercik
      setDamp(1);
      setQuip(t.damp);
      sfx.crack();
      haptic(18);
      return;
    }
    setDamp(2);
    setQuip(null);
    setLit(true);
    setCanGo(false);
    setTyped(false);
    sfx.pop();
    haptic(16);
    // biasanya dibuka oleh Typewriter selesai; ini cadangan kalau onDone tak terpanggil
    later(() => setCanGo(true), notes[i] ? 2600 + notes[i].length * 36 : 900);
  };

  const fly = (i: number, fast: boolean) => {
    setCur(i + 1);
    setLit(false);
    setCanGo(false);
    setDy(0);
    setBursts((b) => b + 1);
    haptic(fast ? 24 : 14);
    sfx.whoosh();
    sfx.note(i);
    busy.current = false;
    if (i + 1 >= n) {
      later(() => {
        setPhase('sky');
        setBeat(0);
        setTyped(false);
        setConfetti(1);
        sfx.success();
        haptic(40);
        later(() => setCalm(true), 3600);
      }, 2400);
    } else if (i + 1 === n - 1 && n >= 2) {
      setPreLast(true);
      setTyped(false);
    }
  };

  const release = (i: number) => {
    if (i !== cur || busy.current) return;
    if (!lit) return light(i);
    if (!canGo) return;
    setQuip(null);
    if (i === lazyIdx) {
      // lampion ini naik sedikit, ragu, turun lagi… lalu tiba-tiba melesat
      busy.current = true;
      setLazy('stuck');
      setQuip(t.lazy);
      sfx.whoosh();
      later(() => {
        setLazy('go');
        setQuip(t.lazyGo);
        fly(i, true);
        later(() => setQuip(null), 2600);
      }, 2300);
      return;
    }
    fly(i, false);
  };

  const onKey = (i: number) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowUp') {
      e.preventDefault();
      release(i);
    }
  };

  const showReread = (i: number) => {
    if (rereadTimer.current) clearTimeout(rereadTimer.current);
    setReread(i);
    sfx.note(i);
    rereadTimer.current = later(() => setReread(null), 3200 + (notes[i]?.length ?? 0) * 45);
  };

  const pointer = (i: number) => ({
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      drag.current = { y0: e.clientY, moved: false };
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d || !lit) return;
      const v = e.clientY - d.y0;
      if (Math.abs(v) > 6 && !d.moved) {
        d.moved = true;
        setDragging(true);
      }
      if (d.moved) setDy(Math.min(10, v));
    },
    onPointerUp: (e: PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      drag.current = null;
      setDragging(false);
      if (!d || !d.moved) return;
      dragEnd.current = performance.now();
      if (e.clientY - d.y0 < -26) release(i);
      else setDy(0);
    },
    onPointerCancel: () => {
      drag.current = null;
      setDragging(false);
      setDy(0);
    },
    onClick: () => {
      if (performance.now() - dragEnd.current < 120) return;
      release(i);
    },
    onKeyDown: onKey(i),
  });

  const skyish = phase === 'sky' || phase === 'stars' || phase === 'letter';

  /** polaroid kecil di kartu; diketuk untuk diperbesar */
  const snapBtn = (i: number) => (
    <button
      type="button"
      className={s.snap}
      aria-label={fmt(t.photoOpen, { n: i + 1 })}
      onClick={() => {
        sfx.tap();
        setBig(i);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photos[i]} alt={fmt(t.photoAlt, { n: i + 1 })} draggable={false} />
    </button>
  );
  const long = (data.to || '').length > 12;
  const isLast = cur === n - 1;
  const note = phase === 'wish' && !preLast && cur < n ? notes[cur] ?? null : null;
  const photo = phase === 'wish' && !preLast && cur < n && lit ? photos[cur] : undefined;
  const narration =
    phase === 'intro'
      ? t.intro[beat]
      : phase === 'sky'
        ? calm
          ? t.outro[beat]
          : null
        : phase === 'wish' && preLast && !quip // tunggu celetukan lampion malas selesai dulu
          ? t.beforeLast
          : null;

  /** apa yang sekarang harus disentuh: satu saja pada satu waktu */
  const cueOn: 'tell' | 'light' | 'release' | 'letter' | null =
    finale || big !== null
      ? null
      : narration
        ? 'tell'
        : phase === 'wish' && !preLast && cur < n && lazy !== 'stuck'
          ? lit ? (canGo ? 'release' : null) : 'light'
          : phase === 'letter' && landed
            ? 'letter'
            : null;
  const cue = (key: typeof cueOn) => (cueOn === key ? (el: HTMLElement | null) => { cueEl.current = el; } : undefined);

  let hint: string | null = null;
  if (phase === 'wish' && !preLast && cur < n && lazy !== 'stuck') hint = lit ? (canGo ? t.hintRelease : null) : t.hintLight;
  if (phase === 'letter') hint = landed ? t.letterHint : t.reread;

  return (
    <div className={cx(s.wrap, ready && s.ready)}>
      <div className={s.sky} aria-hidden>
        {stars.map((st, i) => (
          <i key={i} className={s.star} style={{ left: `${st.x}%`, top: `${st.y}%`, fontSize: `${st.z}em`, animationDelay: `${-st.d}s` }} />
        ))}
        <Sprite name="lampion-bulan" className={s.moon} />
        <span className={cx(s.reflect, (lit || cur > 0) && s.reflectOn, skyish && s.reflectWide)} />
      </div>

      {/* lampion-lampion orang lain, membentuk hati di kejauhan */}
      {skyish ? (
        <div className={s.crowd} aria-hidden>
          {heart.map((c, i) => (
            <span
              key={i}
              style={{ left: `${c.x}%`, top: `${c.y}%`, width: `${c.w}em`, '--from': c.from, animationDelay: `${c.delay}s` } as CSSProperties}
            >
              <i style={{ animationDelay: `${-c.bob}s` }}>
                <Sprite name="lampion-kecil" />
              </i>
            </span>
          ))}
        </div>
      ) : null}

      {/* kunang-kunang */}
      <div className={s.flies} aria-hidden>
        {flies.map((f, i) => (
          <i
            key={i}
            style={{ left: `${f.x}%`, top: `${f.y}%`, '--dx': `${f.dx}em`, '--dy': `${f.dy}em`, '--d': `${f.d}s`, '--delay': `${f.delay}s` } as CSSProperties}
          />
        ))}
        {bursts > 0
          ? Array.from({ length: 5 }, (_, k) => (
              <b key={`${bursts}-${k}`} style={{ '--k': k, animationDelay: `${k * 0.14}s` } as CSSProperties} />
            ))
          : null}
      </div>

      <div className={s.head}>
        {skyish ? (
          <div key="t">
            <div className={s.eyebrow}>{t.doneEyebrow}</div>
            <div className={cx(s.name, s.small)}>{data.title || fmt(t.titleFallback, { to: data.to || t.you })}</div>
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
        const isReady = phase === 'wish' && !preLast && i === cur;
        // lampion pertama sudah menunggu di dermaga sejak narasi pembuka
        const idle = phase === 'intro' && i === 0 && beat >= 1;
        const waiting = !flown && !isReady && !idle;
        const special = i === n - 1 && n >= 2;
        // setelah narasi penutup, lampion di langit bisa diketuk untuk membaca lagi harapannya
        const canReread = flown && phase === 'letter' && !!notes[i];
        return (
          // dua lapis seukuran stage: gerak mendatar dan menaik punya lengkung waktu sendiri
          <div
            key={i}
            className={cx(s.fly, flown && s.flown, isReady && s.ready2, idle && s.idle, waiting && s.wait, i === lazyIdx && lazy === 'go' && s.zoom)}
            style={{ transform: flown ? `translateX(${x - 50}%)` : undefined, '--sc': sc, '--i': i } as CSSProperties}
          >
            <div className={s.flyY} style={{ transform: flown ? `translateY(calc(${y - 100}% + 17.2em))` : undefined }}>
              <div
                ref={isReady ? cue('light') ?? cue('release') : undefined}
                className={cx(s.lan, isReady && dragging && s.dragging, isReady && lit && s.isLit, flown && s.isLit, i === lazyIdx && lazy === 'stuck' && s.stuck, special && s.special)}
                style={{ transform: isReady && dy ? `translateY(${dy}px)` : undefined }}
                role={isReady ? 'button' : undefined}
                tabIndex={isReady ? 0 : undefined}
                aria-label={isReady ? fmt(lit ? t.releaseAria : t.lightAria, { n: i + 1 }) : undefined}
                aria-hidden={isReady || canReread ? undefined : true}
                {...(isReady ? pointer(i) : {})}
              >
                <div
                  className={cx(s.lanScale, canReread && s.tappable)}
                  role={canReread ? 'button' : undefined}
                  tabIndex={canReread ? 0 : undefined}
                  aria-label={canReread ? fmt(t.rereadAria, { n: i + 1 }) : undefined}
                  onClick={canReread ? () => showReread(i) : undefined}
                  onKeyDown={
                    canReread
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            showReread(i);
                          }
                        }
                      : undefined
                  }
                >
                  <div className={s.lanBob}>
                    <span className={s.glow} />
                    <Sprite name="lampion-padam" className={cx(s.lanImg, s.unlitImg)} />
                    <Sprite name="lampion" className={cx(s.lanImg, s.litImg)} />
                    {isReady && damp === 1 && !lit ? <span key="spark" className={s.spark} /> : null}
                    {isReady && lit ? <span className={s.flare} /> : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* lampion yang turun membawa surat */}
      {phase === 'letter' ? (
        <button
          ref={cue('letter')}
          type="button"
          className={s.letterLan}
          aria-label={t.letterAria}
          onClick={() => {
            sfx.chime();
            haptic(20);
            setFinale(true);
          }}
          onAnimationEnd={(e) => e.target === e.currentTarget && setLanded(true)}
        >
          <span className={s.letterBob}>
            <span className={s.letterGlow} />
            <Sprite name="lampion" className={s.letterImg} />
            <span className={s.letterString} />
            <span className={s.letter}>
              <Sprite name="bunga-melati" className={s.letterFlower} />
              <span className={s.letterTo}>{fmt(t.letterTo, { to: data.to || t.you })}</span>
            </span>
          </span>
        </button>
      ) : null}

      <div className={s.foot}>
        {narration ? (
          <button
            ref={cue('tell')}
            type="button"
            key={`${phase}-${beat}-${preLast}`}
            className={cx(s.card, s.tell)}
            onClick={() => {
              if (phase === 'intro') goNextBeat(t.intro.length, startWishes);
              else if (phase === 'sky')
                goNextBeat(t.outro.length, () => setPhase('stars'));
              else if (preLast) {
                if (!typed) setTyped(true);
                else {
                  sfx.tap();
                  setPreLast(false);
                }
              }
            }}
          >
            {typed ? <span>{narration}</span> : <Typewriter key={narration} text={narration} speed={30} onDone={() => setTyped(true)} />}
            {typed ? <span className={s.tapNext}>{t.tapNext}</span> : <span className={s.tapNext} style={{ visibility: 'hidden' }}>·</span>}
          </button>
        ) : phase === 'letter' && reread !== null && notes[reread] ? (
          <div key={`r${reread}`} className={cx(s.card, s.recall, notes[reread].length > 58 && s.cardLong, photos[reread] && s.cardPhoto)} role="status">
            {photos[reread] ? snapBtn(reread) : null}
            <span className={cx(s.cardNo, reread === n - 1 && n >= 2 && s.cardNoSpecial)}>
              {reread === n - 1 && n >= 2 ? t.lastWish : fmt(t.wishNo, { n: reread + 1, total: n })}
            </span>
            {notes[reread]}
          </div>
        ) : phase === 'wish' && cur < n && !preLast ? (
          <div key={`w${cur}`} className={cx(s.card, isLast && n >= 2 && s.cardSpecial, notes[cur] && notes[cur].length > 58 && s.cardLong, photo && s.cardPhoto)}>
            {photo ? snapBtn(cur) : null}
            <span className={cx(s.cardNo, isLast && n >= 2 && s.cardNoSpecial)}>{isLast && n >= 2 ? t.lastWish : fmt(t.wishNo, { n: cur + 1, total: n })}</span>
            {note ? (
              lit ? (
                <Typewriter key={`t${cur}`} text={note} speed={34} onDone={() => setCanGo(true)} />
              ) : (
                <span className={s.unlit}>{t.unlitCard}</span>
              )
            ) : null}
          </div>
        ) : null}
        {quip ? (
          <div key={quip} className={s.quip}>
            {quip}
          </div>
        ) : null}
      </div>

      {hint && big === null ? <Hint key={hint}>{hint}</Hint> : null}
      <TapCue
        target={cueEl}
        show={cueOn !== null}
        kind={cueOn === 'release' ? 'drag' : 'tap'}
        dir={{ x: 0, y: -5 }}
        at={cueOn === 'letter' ? { x: 0.5, y: 0.72 } : cueOn === 'light' || cueOn === 'release' ? { x: 0.5, y: 0.55 } : undefined}
        delay={cueOn === 'tell' ? 3400 : 2600}
      />

      {phase === 'stars' ? (
        <StarGame
          t={GAME_TEXT[locale]}
          onDone={() => {
            setPhase('letter');
            sfx.chime();
            later(() => setLanded(true), 4400);
          }}
        />
      ) : null}

      {big !== null && photos[big] ? (
        <button type="button" className={s.bigWrap} aria-label={t.photoClose} onClick={() => setBig(null)}>
          <span className={s.big}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[big]} alt={fmt(t.photoAlt, { n: big + 1 })} draggable={false} />
            {notes[big] ? <span className={s.bigCap}>{notes[big]}</span> : null}
          </span>
        </button>
      ) : null}

      {confetti ? (
        <Confetti burst={confetti} origin={{ x: 0.5, y: 0.7 }} count={60} shapes="hearts" colors={['#ffd27a', '#ffb85c', '#ffe9b8', '#ff9a6b', '#fff3d6']} />
      ) : null}

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
