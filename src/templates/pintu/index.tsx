'use client';

import { type CSSProperties, type PointerEvent as ReactPointerEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Petals, Sprite, Stage, TapCue, Typewriter, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { BekelGame } from './Game';
import { TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const ART = ['bg-pintu', 'pintu-pensil', 'pintu-surat', 'bunga-kamboja', 'daun-2', 'daun-4'];

/**
 * intro  → seluruh sudut rumah; pensil tergantung di paku, diketuk untuk diambil
 * marks  → kamera mendekat ke kusen. Tiap garis digores (seret melintang atau ketuk), kenangannya muncul
 *          sebagai tulisan tangan di dinding, fotonya ditempel di daun pintu; lalu naik ke garis berikutnya
 *          (geser layar atau tombol). Garis terakhir "sekarang" ditekan lama (atau diketuk)
 * wide   → kamera mundur: semua garis berdenting dari bawah ke atas, ucapan utama muncul
 * game   → mini-game bola bekel
 * letter → kamera turun ke kaki kusen: surat terlipat terselip di celahnya, ditarik (atau diketuk) → surat
 */
type Phase = 'intro' | 'marks' | 'wide' | 'game' | 'letter';

/* ukuran lukisan dunia, sama dengan art/sprites/64-pintu.js */
const WW = 780;
const WH = 1500;
const JX0 = 330;
const JX1 = 414;
/** lebar dunia saat kamera dekat = ZOOM × lebar layar; CX = titik dunia yang berada di tengah layar */
const ZOOM = 1.82;
const CX = 426;
/** garis "sekarang": kamera sedikit mundur & bergeser supaya foto di daun pintu dan papan nama sama-sama utuh */
const ZOOM_NOW = 1.52;
const CX_NOW = 474;
/** paku tempat pensil tergantung (talinya 150), dan tempat pensil diletakkan di lantai setelah selesai */
const NAIL = { x: 540, y: 372 };
const HANG = { x: NAIL.x, y: NAIL.y + 300 };
const REST = { x: 474, y: 1364 };
/** kaki kusen, tempat surat terselip */
const LETTER_Y = 1214;

const LINES = ['M6,12.5C20,10 34,14.5 48,12S70,10.5 78,12', 'M6,11.5C22,13.5 36,10 50,12.5S68,13 78,11', 'M6,12C18,11 30,13.5 44,11.5S66,12.5 78,12.5'];

/** gambar kecil ala anak-anak (viewBox 60×60), digores satu per satu */
const DOODLES: string[][] = [
  // bunga
  ['M30,24c-7,-12 7,-12 0,0c11,-8 15,5 1,2c13,5 3,15 -1,3c-3,12 -15,4 -3,-2c-13,2 -9,-11 3,-3', 'M30,34q-3,10 1,20', 'M31,46q8,-7 12,-1q-6,5 -12,1'],
  // matahari
  ['M30,19a11,11 0 1 0 0.1,0', 'M30,10V4M30,50v6M10,30H4M50,30h6M16,16l-4,-4M44,16l4,-4M16,44l-4,4M44,44l4,4'],
  // bintang
  ['M30,6l7,16l17,2l-13,11l4,17l-15,-9l-15,9l4,-17l-13,-11l17,-2z'],
  // layang-layang
  ['M30,5l15,18l-15,24l-15,-24z', 'M15,23H45M30,5V47', 'M30,47q-8,5 -2,9q6,3 -1,1'],
  // rumah
  ['M10,30L30,10L50,30', 'M15,27V52H45V27', 'M26,52V38h9V52', 'M38,14V8h5v11'],
  // hati
  ['M30,50C4,32 14,8 30,22C46,8 56,32 30,50z'],
];

type Box = { w: number; h: number };
type Cam = { x: number; y: number; z: number };
type Drag = { id: number; x0: number; y0: number; size: number; moved: boolean };

const pct = (v: number) => `${(v * 100).toFixed(3)}%`;
const at = (x: number, y: number): CSSProperties => ({ left: pct(x / WW), top: pct(y / WH) });
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function Doodle({ k, className }: { k: number; className?: string }) {
  return (
    <svg className={cx(s.doodle, className)} viewBox="0 0 60 60" aria-hidden>
      {DOODLES[k % DOODLES.length].map((d, i) => (
        <path key={i} d={d} pathLength={1} style={{ '--i': i } as CSSProperties} />
      ))}
    </svg>
  );
}

export default function Pintu(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const t = TEXT[useLocale()];
  const later = useTimers();
  const ready = useArtReady(ART);

  const to = data.to.trim() || t.you;
  const from = data.from.trim();
  const title = data.title.trim() || t.titleFallback;

  /** garis: kenangan ke-i berpasangan dengan foto ke-i; yang kosong dua-duanya dilewati */
  const marks = useMemo(() => {
    const list: { note: string; photo: string | null }[] = [];
    const n = Math.min(6, Math.max(data.notes.length, data.photos.length));
    for (let i = 0; i < n; i++) {
      const note = (data.notes[i] ?? '').trim();
      const photo = data.photos[i] || null;
      if (note || photo) list.push({ note, photo });
    }
    // belum ada isi sama sekali: kusennya tetap punya tiga garis
    if (!list.length) t.emptyNotes.forEach((note) => list.push({ note, photo: null }));
    const N = list.length;
    // garis tersebar di 380..1060 (di bawah papan nama, di atas lis dinding)
    const gap = N > 1 ? Math.min(210, 680 / (N - 1)) : 0;
    return list.map((m, i) => ({
      ...m,
      y: 720 + gap * ((N - 1) / 2 - i),
      tick: i === N - 1 ? t.now : i === 0 ? t.ticks[0] : t.ticks[1 + Math.round(((i - 1) * 3) / Math.max(1, N - 3))],
    }));
  }, [data.notes, data.photos, t]);
  const N = marks.length;

  const [phase, setPhase] = useState<Phase>('intro');
  /** garis yang sedang dihadapi, dan jumlah garis yang sudah tergores */
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(0);
  /** seberapa jauh garis aktif sudah tergores (0..1); auto = sedang menggores sendiri setelah diketuk */
  const [p, setP] = useState(0);
  const [auto, setAuto] = useState(false);
  /** jari sedang menggores: pensil menempel di jari, tanpa transisi */
  const [inking, setInking] = useState(false);
  const [canClimb, setCanClimb] = useState(false);
  /** layar sedang digeser untuk naik: sejauh ini (px) */
  const [pull, setPull] = useState(0);
  const [sliding, setSliding] = useState(false);
  /** saat kamera mundur: garis ke berapa yang sudah berdenting */
  const [pinged, setPinged] = useState(-1);
  const [titled, setTitled] = useState(false);
  const [wideCta, setWideCta] = useState(false);
  const [game, setGame] = useState<'off' | 'on' | 'done'>('off');
  /** surat: sudah menyembul, seberapa jauh ditarik (0..1), sudah lepas */
  const [peek, setPeek] = useState(false);
  const [slip, setSlip] = useState(0);
  const [pulled, setPulled] = useState(false);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [box, setBox] = useState<Box | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const takeRef = useRef<HTMLButtonElement>(null);
  const drawRef = useRef<HTMLButtonElement>(null);
  const lineRef = useRef<SVGSVGElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const letterRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<Drag | null>(null);
  /** seretan terakhir benar-benar bergeser: klik yang menyusul bukan ketukan */
  const moved = useRef(false);
  const pNow = useRef(0);
  const doneNow = useRef(0);
  const holdRaf = useRef(0);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(reduce.current);
    return () => cancelAnimationFrame(holdRaf.current);
  }, []);

  // ukuran panggung: kamera dihitung dalam px supaya dunia bisa digeser & diperbesar dengan satu transform
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const read = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w && h) setBox((b) => (b && b.w === w && b.h === h ? b : { w, h }));
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // foto disiapkan selagi pensil belum diambil
  useEffect(() => {
    marks.forEach((m) => {
      if (!m.photo) return;
      const img = new Image();
      img.src = m.photo;
    });
  }, [marks]);

  // fokus mengikuti tombol lanjut (pengguna papan ketik / pembaca layar)
  useEffect(() => {
    if (mode === 'preview' || !(canClimb || wideCta)) return;
    const id = setTimeout(() => ctaRef.current?.focus({ preventScroll: true }), 500);
    return () => clearTimeout(id);
  }, [canClimb, wideCta, mode]);

  const setProgress = (v: number) => {
    pNow.current = v;
    setP(v);
  };

  /* ── 1. pensil ── */
  const takePencil = () => {
    if (phase !== 'intro') return;
    sfx.tap();
    haptic(14);
    later(() => sfx.whoosh(), 120);
    setPhase('marks');
  };

  /* ── 2. garis ── */
  const last = idx === N - 1;
  const finishLine = () => {
    if (doneNow.current > idx) return;
    doneNow.current = idx + 1;
    setDone(idx + 1);
    setAuto(false);
    setInking(false);
    setProgress(0);
    haptic(last ? 30 : 16);
    if (last) {
      sfx.success();
      setBurst((v) => v + 1);
    } else sfx.note(idx);
    const note = marks[idx].note;
    later(() => sfx.pop(), reduce.current ? 60 : 420);
    later(() => setCanClimb(true), reduce.current ? 300 : Math.min(3200, 1100 + note.length * 24));
  };
  /** ketukan: garisnya menggores sendiri sampai ujung */
  const autoLine = () => {
    if (phase !== 'marks' || auto || doneNow.current > idx) return;
    cancelAnimationFrame(holdRaf.current);
    setAuto(true);
    setProgress(1);
    sfx.pencil();
    later(finishLine, reduce.current ? 80 : 560);
  };

  const onDrawDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0 || auto) return;
    moved.current = false;
    const w = lineRef.current?.getBoundingClientRect().width || 80;
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, size: w, moved: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const onDrawMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || auto) return;
    const dx = e.clientX - d.x0;
    if (Math.abs(dx) > 6 && !d.moved) {
      d.moved = moved.current = true;
      setInking(true);
      sfx.pencil();
    }
    if (!d.moved) return;
    const v = clamp(dx / (d.size * 0.86), 0, 1);
    setProgress(v);
    if (v >= 1) {
      drag.current = null;
      finishLine();
    }
  };
  const onDrawUp = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setInking(false);
    if (!d.moved) return; // ketukan: ditangani onClick
    if (!cancelled && pNow.current > 0.5) autoLine();
    else setProgress(0);
  };
  const onDrawClick = () => {
    if (moved.current) {
      moved.current = false;
      return;
    }
    autoLine();
  };

  /** garis terakhir: selama ditekan garisnya terus memanjang; dilepas (atau diketuk) garisnya menyelesaikan diri */
  const onHoldDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0 || auto) return;
    const start = performance.now() - pNow.current * 1300;
    setInking(true);
    sfx.pencil();
    const step = (now: number) => {
      const v = Math.min(1, (now - start) / 1300);
      setProgress(v);
      if (v >= 1) return finishLine();
      holdRaf.current = requestAnimationFrame(step);
    };
    cancelAnimationFrame(holdRaf.current);
    holdRaf.current = requestAnimationFrame(step);
  };
  const onHoldUp = () => {
    cancelAnimationFrame(holdRaf.current);
    setInking(false);
  };

  /* ── 3. naik ke garis berikutnya / mundur melihat semuanya ── */
  const goWide = () => {
    setPhase('wide');
    sfx.whoosh();
    const base = reduce.current ? 250 : 1500;
    const step = reduce.current ? 90 : 250;
    marks.forEach((_, i) =>
      later(() => {
        setPinged(i);
        sfx.note(i);
        haptic(8);
      }, base + i * step),
    );
    later(() => {
      setTitled(true);
      sfx.chime();
      haptic(22);
      setBurst((v) => v + 1);
    }, base + N * step + 260);
    later(() => setWideCta(true), base + N * step + (reduce.current ? 500 : 1700));
  };
  const climb = () => {
    if (!canClimb || phase !== 'marks') return;
    setCanClimb(false);
    setSliding(false);
    setPull(0);
    haptic(10);
    if (last) return goWide();
    sfx.rustle();
    setIdx(idx + 1);
  };

  const onSwipeDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button > 0) return;
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, size: 1, moved: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const onSwipeMove = (e: ReactPointerEvent<HTMLDivElement>, max: number) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dy = Math.abs(e.clientY - d.y0);
    if (dy > 6 && !d.moved) {
      d.moved = true;
      setSliding(true);
    }
    if (d.moved) setPull(Math.min(max, dy));
  };
  const onSwipeUp = (e: ReactPointerEvent<HTMLDivElement>, cancelled: boolean, max: number) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setSliding(false);
    if (!cancelled && d.moved && Math.abs(e.clientY - d.y0) > Math.min(64, max * 0.4)) climb();
    else setPull(0);
  };

  /* ── 4. game, lalu surat di kaki kusen ── */
  const startGame = () => {
    if (phase !== 'wide') return;
    sfx.tap();
    setWideCta(false);
    setPhase('game');
    setGame('on');
  };
  const gameDone = () => {
    setGame('done');
    setPhase('letter');
    sfx.whoosh();
    later(() => {
      setPeek(true);
      sfx.rustle();
    }, reduce.current ? 150 : 1200);
  };
  const pullOut = () => {
    if (pulled || phase !== 'letter') return;
    setPulled(true);
    setSlip(1);
    sfx.rustle();
    haptic(20);
    later(() => {
      setFinale(true);
      sfx.chime();
    }, reduce.current ? 150 : 1050);
  };
  const onLetterDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0 || pulled) return;
    moved.current = false;
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, size: e.currentTarget.getBoundingClientRect().width || 120, moved: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const onLetterMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dist = Math.hypot(e.clientX - d.x0, e.clientY - d.y0);
    if (dist > 6) d.moved = moved.current = true;
    if (!d.moved) return;
    const v = Math.min(1, dist / (d.size * 0.6));
    setSlip(v);
    if (v >= 1) {
      drag.current = null;
      pullOut();
    }
  };
  const onLetterUp = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved) return; // ketukan: ditangani onClick
    if (!cancelled && slip > 0.45) pullOut();
    else setSlip(0);
  };
  const onLetterClick = () => {
    if (moved.current) {
      moved.current = false;
      return;
    }
    pullOut();
  };

  /* ── kamera ── */
  const b = box ?? { w: 390, h: 844 };
  const ww = Math.max(b.w, (b.h * WW) / WH);
  const wh = (ww * WH) / WW;
  const near = (y: number, sy: number, zoom = ZOOM, cx = CX): Cam => {
    const z = (zoom * b.w) / ww;
    return { z, x: b.w / 2 - (cx / WW) * ww * z, y: clamp(sy * b.h - (y / WH) * wh * z, b.h - wh * z, 0) };
  };
  const first = near(marks[0].y, 0.44);
  let cam: Cam;
  if (phase === 'marks') {
    cam = last ? near(marks[idx].y, 0.47, ZOOM_NOW, CX_NOW) : near(marks[idx].y, 0.44);
    if (pull) {
      const target = idx + 1 < N ? near(marks[idx + 1].y, 0.44).y : cam.y + b.h * 0.2;
      cam = { ...cam, y: Math.min(target, cam.y + pull) };
    }
  } else if (phase === 'letter') cam = near(LETTER_Y, 0.6);
  // dari jauh: kalau layarnya pendek, yang terpotong lebih banyak bagian atas (lubang angin), bukan lantainya
  else cam = { z: 1, x: (b.w - ww) / 2, y: -Math.min((wh - b.h) * 0.85, (150 / WW) * ww) };
  /** jarak geser maksimum saat naik = jarak ke garis berikutnya di layar */
  const stepPx = idx + 1 < N ? Math.max(40, near(marks[idx + 1].y, 0.44).y - near(marks[idx].y, 0.44).y) : b.h * 0.2;
  const close = phase === 'marks' || phase === 'letter';

  /* ── pensil ── */
  const drawn = done > idx;
  const pen =
    phase === 'intro'
      ? { ...HANG, rot: 0 }
      : phase === 'marks'
        ? drawn
          ? { x: JX1 + 12, y: marks[idx].y - 18, rot: 26 }
          : { x: JX0 + 6 + p * 72, y: marks[idx].y, rot: 36 }
        : { ...REST, rot: 80 };

  const playing = game === 'on';
  /** kenangan lama yang sudah turun sampai ke balik tombol di bawah layar dipudarkan dulu (dari jauh tampil lagi semua) */
  const em = Math.min(b.w / 24.4, b.h / 42);
  const unit = (wh * cam.z) / WH;
  /** di kaki kusen, kenangan yang terpotong tepi atas layar ikut dipudarkan */
  const isFar = (y: number) =>
    (phase === 'marks' && y > marks[idx].y && cam.y + y * unit + 3 * em > b.h - 6.3 * em) || (phase === 'letter' && cam.y + y * unit < 2.6 * em);
  const waiting = phase === 'marks' && !drawn && !auto;

  return (
    <div ref={wrapRef} className={cx(s.wrap, ready && box && s.ready, close && s.close, finale && s.over)}>
      <div
        className={cx(s.world, sliding && s.live, (phase === 'wide' || phase === 'letter' || (phase === 'marks' && idx === 0 && done === 0)) && s.slow)}
        style={{ width: ww, height: wh, fontSize: ww / 24.4, transform: `translate3d(${cam.x.toFixed(1)}px, ${cam.y.toFixed(1)}px, 0) scale(${cam.z.toFixed(4)})` }}
      >
        <Sprite name="bg-pintu" className={s.bg} decoding="sync" />

        {/* papan nama gantung */}
        <div className={s.sign}>
          <span className={s.signFor}>{t.signFor}</span>
          <b className={cx(s.signName, to.length > 7 && s.long, to.length > 13 && s.xl)}>{to}</b>
          {from ? <span className={cx(s.signFrom, from.length > 13 && s.long)}>{fmt(t.signFrom, { from })}</span> : null}
        </div>

        {marks.map((m, i) => {
          const isDrawn = i < done;
          const active = phase === 'marks' && i === idx;
          const isLast = i === N - 1;
          const prog = isDrawn ? 1 : active ? p : 0;
          const d = LINES[i % LINES.length];
          return (
            <div key={i} className={cx(s.mark, isDrawn && s.drawn, isLast && s.lastMark, isFar(m.y) && s.far, phase === 'wide' && pinged >= i && s.ping)} style={{ top: pct(m.y / WH) }}>
              <svg ref={active ? lineRef : undefined} className={s.line} viewBox="0 0 84 24" aria-hidden>
                <path className={s.ghost} d={d} />
                <path className={cx(s.stroke, ((active && auto) || isDrawn) && s.strokeAuto)} d={d} pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - prog} />
                {isLast ? <path className={cx(s.stroke, s.stroke2, ((active && auto) || isDrawn) && s.strokeAuto)} d="M9,17.5C26,16 50,18.5 75,16.5" pathLength={1} strokeDasharray="1 2" strokeDashoffset={1 - prog} /> : null}
              </svg>
              {isDrawn ? (
                <>
                  <div className={cx(s.note, m.note.length > 50 && s.noteLong)}>
                    <span className={s.tick}>
                      {m.tick}
                      {isLast ? (
                        <svg className={s.tickHeart} viewBox="0 0 24 22" aria-hidden>
                          <path d="M12,21C-3,10 3,-2 12,5.5C21,-2 27,10 12,21Z" />
                        </svg>
                      ) : m.photo ? (
                        <Doodle k={i} className={s.doodleSmall} />
                      ) : null}
                    </span>
                    {m.note ? <p className={s.noteText}>{reduced ? m.note : <Typewriter text={m.note} speed={20} />}</p> : null}
                  </div>
                  <div className={cx(s.side, i % 2 ? s.sideB : s.sideA)}>
                    {m.photo ? (
                      <span className={s.snap}>
                        <i className={s.washi} aria-hidden />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.photo} alt={fmt(t.photoAlt, { i: i + 1 })} draggable={false} />
                      </span>
                    ) : (
                      <Doodle k={i} className={s.doodleBig} />
                    )}
                  </div>
                </>
              ) : null}
              {active && !isDrawn ? (
                <button
                  ref={drawRef}
                  type="button"
                  className={s.drawHit}
                  aria-label={isLast ? t.holdLabel : fmt(t.drawLabel, { i: i + 1 })}
                  onPointerDown={isLast ? onHoldDown : onDrawDown}
                  onPointerMove={isLast ? undefined : onDrawMove}
                  onPointerUp={isLast ? onHoldUp : (e) => onDrawUp(e, false)}
                  onPointerCancel={isLast ? onHoldUp : (e) => onDrawUp(e, true)}
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={isLast ? autoLine : onDrawClick}
                />
              ) : null}
            </div>
          );
        })}

        {/* surat terlipat yang terselip di balik tepi kusen (dipotong di tepi itu supaya tampak menyelip) */}
        {phase === 'letter' ? (
          <div className={cx(s.slot, peek && s.peek, pulled && s.pulled)} style={{ top: pct(LETTER_Y / WH) }}>
            <button
              ref={letterRef}
              type="button"
              className={s.letter}
              style={{ '--slip': slip } as CSSProperties}
              disabled={pulled}
              aria-label={t.letterLabel}
              onPointerDown={onLetterDown}
              onPointerMove={onLetterMove}
              onPointerUp={(e) => onLetterUp(e, false)}
              onPointerCancel={(e) => onLetterUp(e, true)}
              onClick={onLetterClick}
            >
              <Sprite name="pintu-surat" className={s.letterArt} />
            </button>
          </div>
        ) : null}

        {/* pensil: tergantung di paku → di tangan → diletakkan di lantai */}
        <div
          className={cx(s.pen, phase === 'intro' && s.hang, waiting && s.waiting, inking && !auto && s.penLive, auto && s.penAuto)}
          style={{ ...at(pen.x, pen.y), '--rot': `${pen.rot}deg` } as CSSProperties}
          aria-hidden
        >
          <span className={s.penSwing}>
            <i className={s.penString} />
            <span className={s.penTilt}>
              <Sprite name="pintu-pensil" className={s.penArt} />
            </span>
          </span>
        </div>
        {phase === 'intro' ? <button ref={takeRef} type="button" className={s.takeHit} style={at(NAIL.x, NAIL.y)} onClick={takePencil} aria-label={t.pencilLabel} /> : null}
      </div>

      {/* daun-daun di latar depan: bergerak lebih cepat dari dinding saat kamera naik */}
      <div className={s.fg} style={{ transform: `translate3d(0, ${close ? ((cam.y - first.y) * 0.55).toFixed(1) : 0}px, 0)` }} aria-hidden>
        <Sprite name="daun-4" className={cx(s.fgLeaf, s.fgA)} />
        <Sprite name="daun-2" className={cx(s.fgLeaf, s.fgB)} />
        <Sprite name="daun-2" className={cx(s.fgLeaf, s.fgC)} />
      </div>

      {/* geser layar untuk naik */}
      {phase === 'marks' && canClimb ? (
        <div
          className={s.swipe}
          onPointerDown={onSwipeDown}
          onPointerMove={(e) => onSwipeMove(e, stepPx)}
          onPointerUp={(e) => onSwipeUp(e, false, stepPx)}
          onPointerCancel={(e) => onSwipeUp(e, true, stepPx)}
          aria-hidden
        />
      ) : null}

      {phase === 'intro' && ready ? <p className={s.introLine}>{t.introLine}</p> : null}
      {phase === 'marks' ? (
        <div className={s.chip} role="status">
          <span className={s.chipDots} aria-hidden>
            {marks.map((_, i) => (
              <i key={i} className={cx(i < done && s.on, i === idx && s.cur)} />
            ))}
          </span>
          {fmt(t.chip, { i: idx + 1, n: N })}
        </div>
      ) : null}

      {/* ucapan utama: muncul saat seluruh kusen terlihat */}
      {phase === 'wide' && titled ? (
        <div className={s.titleCard} role="status">
          <i className={cx(s.washi, s.washiL)} aria-hidden />
          <i className={cx(s.washi, s.washiR)} aria-hidden />
          <b className={cx(s.titleText, title.length > 24 && s.long)}>{title}</b>
          <span className={s.titleSub}>{t.wideSub}</span>
        </div>
      ) : null}
      {phase === 'wide' && titled ? (
        <div className={s.petalsBox} aria-hidden>
          <Petals kinds={['putih']} count={7} />
        </div>
      ) : null}

      {!finale && !playing ? (
        <div className={cx(s.foot, phase === 'wide' && s.footWide)}>
          {phase === 'marks' && canClimb ? (
            <>
              <button ref={ctaRef} type="button" className={s.cta} onClick={climb}>
                {last ? t.seeAll : t.climb} <span aria-hidden>{last ? '→' : '↑'}</span>
              </button>
              {!last ? <span className={s.orSwipe}>{t.orSwipe}</span> : null}
            </>
          ) : null}
          {phase === 'wide' && wideCta ? (
            <button ref={ctaRef} type="button" className={s.cta} onClick={startGame}>
              {t.next} <span aria-hidden>→</span>
            </button>
          ) : null}
        </div>
      ) : null}

      {phase === 'intro' && ready ? <Hint key="hPen">{t.hintPencil}</Hint> : null}
      {waiting && !last ? <Hint key="hDraw">{t.hintDraw}</Hint> : null}
      {waiting && last ? <Hint key="hHold">{t.hintHold}</Hint> : null}
      {phase === 'letter' && peek && !pulled ? <Hint key="hLetter">{t.hintLetter}</Hint> : null}

      {finale || playing ? null : phase === 'intro' ? (
        ready ? <TapCue key="cuePen" target={takeRef} at={{ x: 0.5, y: 0.72 }} delay={2200} /> : null
      ) : phase === 'marks' ? (
        waiting ? (
          last ? (
            <TapCue key="cueHold" target={drawRef} kind="hold" at={{ x: 0.42, y: 0.5 }} delay={2400} />
          ) : (
            <TapCue key={`cueDraw${idx}`} target={drawRef} kind="drag" dir={{ x: 3.4, y: 0 }} at={{ x: 0.26, y: 0.5 }} delay={idx === 0 ? 2400 : 4200} />
          )
        ) : canClimb ? (
          <TapCue key={`cueClimb${idx}`} target={ctaRef} delay={idx === 0 ? 3000 : 5200} />
        ) : null
      ) : phase === 'wide' ? (
        wideCta ? <TapCue key="cueWide" target={ctaRef} delay={4200} /> : null
      ) : phase === 'letter' ? (
        peek && !pulled ? <TapCue key="cueLetter" target={letterRef} kind="drag" dir={{ x: 3, y: 0.6 }} at={{ x: 0.7, y: 0.5 }} delay={2200} /> : null
      ) : null}

      <Confetti burst={burst} count={70} origin={{ x: 0.5, y: 0.44 }} colors={['#d9643a', '#ffd36e', '#fffaf0', '#8cc79a', '#ee8e62', '#f6cd3e']} />

      {playing ? <BekelGame t={t.game} onDone={gameDone} /> : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja"
          theme={{ bg: 'linear-gradient(180deg, #dbe6cd 0%, #c6d5b5 60%, #b4c6a2 100%)', ink: '#2f3327', paper: '#fffaf0', paperInk: '#3b2a22' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
