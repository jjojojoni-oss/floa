'use client';

import { type CSSProperties, type PointerEvent as ReactPointerEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Sprite, Stage, TapCue, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { Parrot, ParrotGame } from './Game';
import { TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BACKDROP = '/art/bg-petaharta.webp';
const MAP = '/art/bg-petaharta-peta.webp';
const ART = ['bg-petaharta', 'bg-petaharta-peta', 'petaharta-rol', 'petaharta-tali', 'petaharta-segel', 'petaharta-label', 'petaharta-kunci', 'petaharta-perahu', 'petaharta-x', 'petaharta-bendera'];
/** lukisan yang baru dipakai belakangan: disiapkan selagi peta masih dijelajahi */
const LATER_ART = ['petaharta-kepiting', 'petaharta-gundukan', 'petaharta-gumpal', 'petaharta-lubang', 'petaharta-peti', 'petaharta-tutup', 'petaharta-tutup-buka', 'petaharta-harta', 'petaharta-gembok', 'petaharta-surat', 'game-petaharta-beo', 'game-petaharta-sayap', 'bunga-kamboja', 'daun-2', 'daun-4'];

/**
 * sealed → gulungan peta di meja kayu, diikat tali goni & disegel lilin; segel diketuk sampai patah (kunci kecil disimpan)
 * rolled → peta ditarik (atau diketuk) sampai terbentang memenuhi layar
 * map    → titik-titik diketuk berurutan: garis titik-titik tergambar sendiri, perahu kertas berlayar, petunjuk
 *          (catatan + foto) muncul sebagai sobekan kertas berpaku; satu titik iseng: cuma ada kepiting
 * dig    → peta mendekat ke tanda X; pasir diusap (atau diketuk) sampai lubangnya terbuka dan bercahaya
 * chest  → peti melompat keluar dari lubang; kunci diseret ke gembok (atau diketuk)
 * open   → tutup terbuka, cahaya emas, ucapan utama & konfeti; lalu burung beo menyambar suratnya
 * game   → mini-game beo
 * letter → surat kembali di peti, ditarik ke atas (atau diketuk) → surat penutup
 */
type Phase = 'sealed' | 'rolled' | 'map' | 'dig' | 'chest' | 'open' | 'game' | 'letter';
type P = [number, number];

/** titik-titik di peta dalam satuan lukisan 780×1500 (sama dengan art/sprites/67-petaharta.js); 1em dunia = 32 satuan */
const START: P = [300, 1330];
const CLUE_AT: P[] = [
  [596, 1224],
  [190, 1052],
  [618, 748],
  [186, 630],
  [566, 466],
];
const GAG_AT: P = [478, 920];
const X_AT: P = [300, 338];
/** petunjuk sesudah titik iseng memakai tempat-tempat ini, tergantung jumlahnya */
const AFTER: number[][] = [[], [3], [2, 4], [2, 3, 4]];
/** gumpal pasir di gundukan X: [dx, dy] satuan lukisan dari X, putaran, skala */
const CLUMPS: Array<[number, number, number, number]> = [
  [-46, 14, -12, 0.82],
  [40, 6, 16, 0.9],
  [-4, -14, 4, 1],
];

/** koin yang melompat keluar saat tutup peti terbuka: [geser em, tinggi em, putaran] */
const COINS: Array<[number, number, number]> = [
  [-6.2, 5.4, -220],
  [-4, 7.6, 160],
  [-2.2, 9, -100],
  [-0.6, 10.2, 70],
  [1.4, 9.4, -140],
  [3.4, 8, 120],
  [5.6, 6.2, -180],
  [7, 4.6, 230],
];

type Stop =
  | { kind: 'clue'; at: P; no: number; clue: number; note: string; photo: string | null }
  | { kind: 'gag'; at: P; no: number }
  | { kind: 'x'; at: P; no: number };
type Puff = { id: number; x: number; y: number };

const em = (v: number) => `${(v / 32).toFixed(4)}em`;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

/** lengkung jalur antar titik (bergantian ke kiri & kanan supaya terasa digambar tangan) */
function segPath(a: P, b: P, i: number) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const k = (i % 2 ? 1 : -1) * Math.min(0.2 * len, 64);
  const c = [(a[0] + b[0]) / 2 - (dy / len) * k, (a[1] + b[1]) / 2 + (dx / len) * k];
  return `M${a[0]},${a[1]}Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${b[0]},${b[1]}`;
}

/** lingkaran pensil yang sedikit kebablasan */
const RING = 'M44,7C24,4 7,17 6,34C5,52 22,63 40,62C58,61 70,48 68,30C66,15 54,6 38,6';

export default function PetaHarta(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BACKDROP}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const t = TEXT[useLocale()];
  const later = useTimers();
  const ready = useArtReady(ART);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const to = data.to.trim() || t.you;
  const from = data.from.trim();
  const title = data.title.trim() || t.titleFallback;

  /** urutan titik: petunjuk (catatan ke-i berpasangan dengan foto ke-i), satu titik iseng, lalu X */
  const stops = useMemo<Stop[]>(() => {
    const clues: { note: string; photo: string | null }[] = [];
    const n = Math.min(5, Math.max(data.notes.length, data.photos.length));
    for (let i = 0; i < n; i++) {
      const note = (data.notes[i] ?? '').trim();
      const photo = data.photos[i] || null;
      if (note || photo) clues.push({ note, photo });
    }
    if (!clues.length) clues.push({ note: t.emptyNote, photo: null });
    const before = Math.min(2, clues.length);
    const spots = [...[0, 1].slice(0, before), ...AFTER[clues.length - before]];
    const out: Stop[] = [];
    clues.forEach((c, i) => {
      if (i === before) out.push({ kind: 'gag', at: GAG_AT, no: out.length + 1 });
      out.push({ kind: 'clue', at: CLUE_AT[spots[i]], no: out.length + 1, clue: i, ...c });
    });
    if (before === clues.length) out.push({ kind: 'gag', at: GAG_AT, no: out.length + 1 });
    out.push({ kind: 'x', at: X_AT, no: out.length + 1 });
    return out;
  }, [data.notes, data.photos, t.emptyNote]);
  const N = stops.filter((st) => st.kind === 'clue').length;
  const segs = useMemo(() => stops.map((st, i) => segPath(i ? stops[i - 1].at : START, st.at, i)), [stops]);

  const [phase, setPhase] = useState<Phase>('sealed');
  const [broken, setBroken] = useState(false);
  const [unrolled, setUnrolled] = useState(false);
  /** jumlah titik yang sudah dicapai perahu */
  const [reached, setReached] = useState(0);
  const [sailing, setSailing] = useState(-1);
  const [boatAt, setBoatAt] = useState<{ x: number; y: number; flip: boolean; rot: number }>({ x: START[0], y: START[1], flip: false, rot: 0 });
  const [open, setOpen] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [gag, setGag] = useState<'none' | 'on' | 'done'>('none');
  const [nudge, setNudge] = useState<{ i: number; k: number } | null>(null);
  const [zoom, setZoom] = useState(false);
  const [mound, setMound] = useState(false);
  const [rubbed, setRubbed] = useState(0);
  const [brush, setBrush] = useState<[number, number]>([1.4, -1]);
  const [puffs, setPuffs] = useState<Puff[]>([]);
  const [shine, setShine] = useState(false);
  const [rise, setRise] = useState(false);
  const [keyDrag, setKeyDrag] = useState<{ x: number; y: number } | null>(null);
  const [keyBack, setKeyBack] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [lockOff, setLockOff] = useState(false);
  const [lid, setLid] = useState(false);
  const [parrot, setParrot] = useState<'none' | 'swoop' | 'bye'>('none');
  const [snatched, setSnatched] = useState(false);
  const [game, setGame] = useState<'off' | 'on' | 'done'>('off');
  const [tug, setTug] = useState(0);
  const [pulled, setPulled] = useState(false);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const bundleRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const noteBtnRef = useRef<HTMLButtonElement>(null);
  const digRef = useRef<HTMLButtonElement>(null);
  const keyRef = useRef<HTMLButtonElement>(null);
  const lockRef = useRef<HTMLSpanElement>(null);
  const chestHitRef = useRef<HTMLButtonElement>(null);
  const boatRef = useRef<HTMLSpanElement>(null);
  const segRefs = useRef<Array<SVGPathElement | null>>([]);
  const maskRefs = useRef<Array<SVGPathElement | null>>([]);
  const pRef = useRef(0);
  const drag = useRef<{ id: number; x0: number; y0: number; moved: boolean } | null>(null);
  const rub = useRef({ id: -1, acc: 0, done: 0, lx: 0, ly: 0, moved: false });
  const raf = useRef(0);
  const puffId = useRef(0);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => cancelAnimationFrame(raf.current);
  }, []);

  // lukisan & foto yang dipakai belakangan disiapkan lebih dulu
  useEffect(() => {
    [...LATER_ART.map((n) => `/art/${n}.webp`), ...stops.map((st) => (st.kind === 'clue' ? st.photo : null))].forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
  }, [stops]);

  const ms = (v: number, fast = 0.2) => (reduce.current ? Math.round(v * fast) : v);
  const emPx = () => {
    const el = wrapRef.current;
    return el ? parseFloat(getComputedStyle(el).fontSize) || 16 : 16;
  };
  const setP = (v: number) => {
    pRef.current = v;
    wrapRef.current?.style.setProperty('--p', v.toFixed(4));
  };

  /* ── 1. segel & gulungan ── */
  const breakSeal = () => {
    if (broken || phase !== 'sealed') return;
    setBroken(true);
    sfx.crack();
    haptic(24);
    later(() => sfx.untie(), ms(260));
    later(() => sfx.pop(), ms(900));
    later(() => setPhase('rolled'), ms(2100, 0.2));
  };
  const unroll = () => {
    if (unrolled || phase !== 'rolled') return;
    setUnrolled(true);
    drag.current = null;
    sfx.rustle();
    haptic(16);
    const from = pRef.current;
    const dur = reduce.current ? 0 : 1300;
    const t0 = performance.now();
    cancelAnimationFrame(raf.current);
    const step = (now: number) => {
      const u = dur ? clamp01((now - t0) / dur) : 1;
      setP(from + (1 - from) * (1 - Math.pow(1 - u, 3)));
      if (u < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    later(() => sfx.whoosh(), ms(500));
    later(() => setPhase('map'), ms(1700, 0.15));
  };
  const bundleDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0) return;
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const bundleMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dy = e.clientY - d.y0;
    if (Math.hypot(e.clientX - d.x0, dy) > 7) d.moved = true;
    if (!d.moved || phase !== 'rolled' || unrolled) return;
    const p = clamp01(Math.abs(dy) / (emPx() * 9));
    setP(p * 0.9);
    if (p >= 1) unroll();
  };
  const bundleUp = (e: ReactPointerEvent<HTMLButtonElement>, cancelled = false) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (phase === 'sealed') {
      if (!cancelled) breakSeal();
      return;
    }
    if (phase !== 'rolled' || unrolled) return;
    if (!cancelled && (!d.moved || pRef.current > 0.3)) unroll();
    else setP(0);
  };

  /* ── 2. peta: berlayar dari titik ke titik ── */
  const sail = (i: number) => {
    const path = segRefs.current[i];
    const mk = maskRefs.current[i];
    const boat = boatRef.current;
    if (!path || !mk || !boat) return arrive(i);
    setSailing(i);
    sfx.whoosh();
    haptic(10);
    const L = path.getTotalLength();
    const stop = stops[i];
    const r0 = i === 0 ? 0 : 50;
    const r1 = stop.kind === 'x' ? 62 : 52;
    const u0 = Math.min(0.4, r0 / L);
    const u1 = Math.max(0.6, 1 - r1 / L);
    const p0 = { x: boatAt.x, y: boatAt.y };
    const s0 = path.getPointAtLength(u0 * L);
    const pre = Math.hypot(s0.x - p0.x, s0.y - p0.y) > 4 ? 0.16 : 0;
    const dur = reduce.current ? 0 : Math.min(2000, 900 + L * 1.6);
    const t0 = performance.now();
    let last = { x: p0.x, y: p0.y, flip: boatAt.flip, rot: 0 };
    const place = (x: number, y: number, ax: number, ay: number) => {
      const flip = Math.abs(ax) > 0.5 ? ax < 0 : last.flip;
      const rot = Math.max(-16, Math.min(16, (Math.atan2(ay, Math.abs(ax) + 0.001) * 180) / Math.PI)) * 0.6;
      last = { x, y, flip, rot };
      boat.style.transform = `translate(${em(x)}, ${em(y)})`;
      boat.dataset.flip = flip ? '1' : '0';
      boat.style.setProperty('--rot', `${(flip ? -rot : rot).toFixed(1)}deg`);
    };
    cancelAnimationFrame(raf.current);
    const step = (now: number) => {
      const u = dur ? clamp01((now - t0) / dur) : 1;
      if (u < pre) {
        const k = ease(u / pre);
        place(p0.x + (s0.x - p0.x) * k, p0.y + (s0.y - p0.y) * k, s0.x - p0.x, s0.y - p0.y);
      } else {
        const k = ease(pre ? (u - pre) / (1 - pre) : u);
        const v = u0 + (u1 - u0) * k;
        const a = path.getPointAtLength(v * L);
        const b = path.getPointAtLength(Math.min(L, v * L + 3));
        place(a.x, a.y, b.x - a.x, b.y - a.y);
        mk.style.strokeDashoffset = String(1 - v);
      }
      if (u < 1) raf.current = requestAnimationFrame(step);
      else {
        mk.style.strokeDashoffset = '0';
        setBoatAt(last);
        arrive(i);
      }
    };
    raf.current = requestAnimationFrame(step);
  };
  const arrive = (i: number) => {
    setSailing(-1);
    setReached(i + 1);
    const st = stops[i];
    if (st.kind === 'clue') {
      sfx.pop();
      haptic(12);
      later(() => {
        setOpen(i);
        sfx.rustle();
      }, ms(260));
    } else if (st.kind === 'gag') {
      setGag('on');
      sfx.squeak();
      later(() => sfx.wahwah(), ms(500));
      haptic(18);
      later(() => setGag('done'), ms(3200, 0.3));
    } else {
      sfx.chime();
      haptic(20);
      later(() => startDig(), ms(900, 0.2));
    }
  };
  const tapStop = (i: number) => {
    if (phase !== 'map' || sailing >= 0 || open !== null || gag === 'on') return;
    if (i < reached) return;
    if (i > reached) {
      sfx.bonk();
      haptic(8);
      setNudge((v) => ({ i, k: (v?.k ?? 0) + 1 }));
      return;
    }
    setNudge(null);
    sail(i);
  };
  const closeNote = () => {
    if (open === null || closing) return;
    setClosing(true);
    sfx.whoosh();
    later(() => {
      setOpen(null);
      setClosing(false);
      sfx.note(reached);
      haptic(10);
    }, ms(420));
  };

  /* ── 3. menggali X ── */
  const startDig = () => {
    setPhase('dig');
    setZoom(true);
    later(() => {
      setMound(true);
      sfx.pop();
    }, ms(1700, 0.2));
  };
  const puff = (x: number, y: number) => {
    const id = ++puffId.current;
    setPuffs((p) => [...p, { id, x, y }]);
    later(() => setPuffs((p) => p.filter((q) => q.id !== id)), 1050);
  };
  const addRub = (amount: number) => {
    const r = rub.current;
    if (phase !== 'dig' || !mound || r.done >= CLUMPS.length) return;
    r.acc = Math.min(1, r.acc + amount);
    const n = Math.min(CLUMPS.length, Math.floor(r.acc * CLUMPS.length + 0.02));
    if (n <= r.done) return;
    for (let i = r.done; i < n; i++) puff(X_AT[0] + CLUMPS[i][0], X_AT[1] + CLUMPS[i][1] + 10);
    r.done = n;
    setRubbed(n);
    sfx.pencil();
    sfx.blow();
    haptic(10);
    if (n >= CLUMPS.length) {
      later(() => {
        setShine(true);
        sfx.chime();
        haptic(20);
      }, ms(500));
      later(() => {
        setRise(true);
        setPhase('chest');
        sfx.boing();
        haptic(30);
      }, ms(2100, 0.25));
    }
  };
  const rubDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0) return;
    rub.current = { ...rub.current, id: e.pointerId, lx: e.clientX, ly: e.clientY, moved: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const rubMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const r = rub.current;
    if (r.id !== e.pointerId) return;
    const dx = e.clientX - r.lx;
    const dy = e.clientY - r.ly;
    const dist = Math.hypot(dx, dy);
    if (dist < 3) return;
    r.lx = e.clientX;
    r.ly = e.clientY;
    r.moved = true;
    setBrush([(dx / dist) * 2.2, (dy / dist) * 2.2 - 0.6]);
    addRub(dist / emPx() / 26);
  };
  const rubUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const r = rub.current;
    if (r.id !== e.pointerId) return;
    r.id = -1;
    if (!r.moved) addRub(0.34);
  };

  /* ── 4. peti: kunci ke gembok ── */
  const unlock = () => {
    if (unlocked || phase !== 'chest' || !rise) return;
    setUnlocked(true);
    setKeyDrag(null);
    sfx.tap();
    haptic(14);
    later(() => {
      sfx.bonk();
      haptic(20);
    }, ms(650));
    later(() => {
      setLockOff(true);
      sfx.crack();
    }, ms(1000));
    later(() => {
      setLid(true);
      setPhase('open');
      setBurst((v) => v + 1);
      sfx.success();
      haptic(40);
    }, ms(1700, 0.3));
    later(() => {
      setParrot('swoop');
      sfx.squeak();
    }, ms(6400, 0.35));
    later(() => {
      setSnatched(true);
      sfx.whoosh();
      haptic(14);
    }, ms(7300, 0.35));
    later(() => {
      setPhase('game');
      setGame('on');
      setParrot('none');
    }, ms(9000, 0.35));
  };
  const keyDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0 || phase !== 'chest' || unlocked) return;
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false };
    setKeyBack(false);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const keyMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || unlocked) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (Math.hypot(dx, dy) > 7) d.moved = true;
    if (!d.moved) return;
    setKeyDrag({ x: dx, y: dy });
    const lock = lockRef.current?.getBoundingClientRect();
    if (lock && e.clientX > lock.left - 6 && e.clientX < lock.right + 6 && e.clientY > lock.top - 6 && e.clientY < lock.bottom + 6) {
      drag.current = null;
      unlock();
    }
  };
  const keyUp = (e: ReactPointerEvent<HTMLButtonElement>, cancelled = false) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (unlocked) return;
    const lock = lockRef.current?.getBoundingClientRect();
    const pad = emPx() * 2.4;
    const near = lock && e.clientX > lock.left - pad && e.clientX < lock.right + pad && e.clientY > lock.top - pad && e.clientY < lock.bottom + pad;
    if (!cancelled && (!d.moved || near)) unlock();
    else {
      setKeyBack(true);
      setKeyDrag(null);
    }
  };

  /* ── 5. game selesai → surat ── */
  const gameDone = () => {
    setGame('done');
    setSnatched(false);
    setPhase('letter');
    setParrot('bye');
    sfx.chime();
    later(() => setParrot('none'), 2600);
  };
  const pullLetter = () => {
    if (pulled || phase !== 'letter') return;
    setPulled(true);
    setTug(0);
    sfx.whoosh();
    haptic(20);
    later(() => {
      sfx.chime();
      setBurst((v) => v + 1);
    }, ms(600));
    later(() => setFinale(true), ms(1600));
  };
  const letterDrag = {
    onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => {
      if (e.button > 0) return;
      drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* pointer sudah tidak aktif */
      }
    },
    onPointerMove: (e: ReactPointerEvent<HTMLButtonElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const dy = d.y0 - e.clientY;
      if (Math.hypot(e.clientX - d.x0, dy) > 7) d.moved = true;
      if (!d.moved) return;
      const v = clamp01(dy / (emPx() * 4));
      setTug(v);
      if (v >= 1) {
        drag.current = null;
        pullLetter();
      }
    },
    onPointerUp: (e: ReactPointerEvent<HTMLButtonElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      drag.current = null;
      if (!d.moved || tug > 0.4) pullLetter();
      else setTug(0);
    },
    onPointerCancel: () => {
      drag.current = null;
      setTug(0);
    },
    onClick: (e: { detail: number }) => {
      if (e.detail === 0) pullLetter();
    },
  };

  // fokus mengikuti langkah yang aktif (pengguna papan ketik / pembaca layar)
  useEffect(() => {
    if (mode === 'preview') return;
    const el =
      open !== null
        ? noteBtnRef
        : phase === 'sealed' || phase === 'rolled'
          ? bundleRef
          : phase === 'map'
            ? nextRef
            : phase === 'dig'
              ? digRef
              : phase === 'chest'
                ? keyRef
                : phase === 'letter'
                  ? chestHitRef
                  : null;
    if (!el) return;
    const id = setTimeout(() => el.current?.focus({ preventScroll: true }), 600);
    return () => clearTimeout(id);
  }, [phase, open, reached, gag, mode]);

  /* ── tampilan ── */
  const playing = game === 'on';
  const onMap = phase === 'map' || phase === 'dig';
  const next = stops[reached];
  const nextNo = next?.no ?? stops.length;
  const clean = rubbed >= CLUMPS.length;
  const chestScene = phase === 'chest' || phase === 'open' || phase === 'game' || phase === 'letter';

  let eyebrow = from ? fmt(t.eyebrowFrom, { from }) : t.eyebrowAnon;
  let cap = '';
  if (phase === 'sealed') cap = broken ? t.capBroken : fmt(t.capSealed, { to });
  else if (phase === 'rolled') cap = t.capRolled;
  else if (phase === 'map') {
    eyebrow = fmt(t.eyebrowMap, { to });
    if (nudge) cap = stops[nudge.i]?.kind === 'x' ? t.capWrongX : fmt(t.capWrong, { i: nextNo });
    else if (sailing >= 0) cap = t.capSailing;
    else if (gag === 'on') cap = t.capGag;
    else if (reached >= stops.length) cap = t.capDig;
    else if (next?.kind === 'x') cap = t.capToX;
    else if (reached === 0) cap = t.capStart;
    else if (stops[reached - 1]?.kind === 'gag') cap = fmt(t.capAfterGag, { i: nextNo });
    else cap = fmt(t.capNext, { i: nextNo });
  } else if (phase === 'dig') {
    eyebrow = t.eyebrowDig;
    cap = shine ? t.capShine : rubbed > 0 ? t.capDigging : t.capDig;
  } else if (phase === 'chest') {
    eyebrow = t.eyebrowChest;
    cap = t.capLocked;
  } else if (phase === 'open') {
    eyebrow = t.eyebrowChest;
    cap = parrot === 'swoop' ? t.capParrot : '';
  } else if (phase === 'letter') {
    eyebrow = t.eyebrowChest;
    cap = pulled ? t.capPull : t.capLetter;
  }
  // tulisan "keliru urutan" hilang sendiri
  useEffect(() => {
    if (!nudge) return;
    const id = setTimeout(() => setNudge(null), 2000);
    return () => clearTimeout(id);
  }, [nudge]);

  const sc = open !== null ? stops[open] : null;
  const titleLen = Array.from(title).length;
  const toLen = Array.from(to).length;

  return (
    <div
      ref={wrapRef}
      className={cx(s.wrap, ready && s.ready, broken && s.broken, unrolled && s.unrolled, (phase === 'sealed' || phase === 'rolled') && s.prelude, phase !== 'sealed' && phase !== 'rolled' && s.charted, zoom && s.zoomed, chestScene && s.chestOn, lid && s.lidOpen, finale && s.over, playing && s.gaming)}
    >
      {/* ── peta (terbentang di antara dua gulungan) ── */}
      <div className={s.mapShadow} aria-hidden={!onMap}>
        <div className={s.mapLayer}>
          <div className={s.world}>
            <img src={MAP} alt="" draggable={false} className={s.mapArt} />

            <svg className={s.route} viewBox="0 0 780 1500" aria-hidden>
              <defs>
                {segs.map((d, i) => (
                  <mask key={i} id={`${uid}m${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width="780" height="1500">
                    <path
                      ref={(el) => {
                        maskRefs.current[i] = el;
                      }}
                      d={d}
                      pathLength={1}
                      fill="none"
                      stroke="#fff"
                      strokeWidth={22}
                      strokeDasharray="1 1"
                      strokeDashoffset={i < reached ? 0 : 1}
                    />
                  </mask>
                ))}
              </defs>
              {segs.map((d, i) => (
                <g key={i} mask={`url(#${uid}m${i})`}>
                  <path d={d} className={s.routeShadow} />
                  <path
                    ref={(el) => {
                      segRefs.current[i] = el;
                    }}
                    d={d}
                    className={cx(s.routeDots, stops[i].kind === 'gag' && s.routeGag)}
                  />
                </g>
              ))}
            </svg>

            {/* label tulisan tangan di peta */}
            <span className={s.label} style={{ left: em(START[0] - 4), top: em(START[1] - 34) }}>
              <span className={s.here}>
                {t.here}
                <svg viewBox="0 0 20 24" aria-hidden>
                  <path d="M10,2C8,8 12,14 10,21M5,16L10,22L15,16" />
                </svg>
              </span>
            </span>
            {from ? (
              <span className={s.label} style={{ left: em(642), top: em(1104) }}>
                <span className={cx(s.mapBy, Array.from(from).length > 12 && s.long)}>{fmt(t.mapBy, { from })}</span>
              </span>
            ) : null}

            {/* bendera di titik yang sudah dikunjungi */}
            {stops.map((st, i) =>
              st.kind === 'clue' && i < reached && open !== i ? (
                <Sprite key={`f${i}`} name="petaharta-bendera" className={s.flag} style={{ left: em(st.at[0] + 22), top: em(st.at[1] - 70) }} />
              ) : null,
            )}

            {/* kepiting di titik iseng */}
            {gag !== 'none' ? (
              <span className={cx(s.crab, gag === 'on' && s.crabOn)} style={{ left: em(GAG_AT[0] + 76), top: em(GAG_AT[1] + 22) }} aria-hidden>
                <Sprite name="petaharta-kepiting" className={s.crabArt} />
                <svg className={s.crabFace} viewBox="0 0 220 170">
                  <circle cx="94" cy="44" r="10" fill="#fffaf0" stroke="#3a1d12" strokeWidth="2" />
                  <circle cx="126" cy="44" r="10" fill="#fffaf0" stroke="#3a1d12" strokeWidth="2" />
                  <circle className={s.crabPupil} cx="96" cy="46" r="4.6" fill="#3a1d12" />
                  <circle className={s.crabPupil} cx="128" cy="46" r="4.6" fill="#3a1d12" />
                  <path d="M98,108q12,10 24,0" fill="none" stroke="#3a1d12" strokeWidth="3.4" strokeLinecap="round" />
                  <ellipse cx="80" cy="104" rx="8" ry="5" fill="#ffb4a0" opacity="0.8" />
                  <ellipse cx="140" cy="104" rx="8" ry="5" fill="#ffb4a0" opacity="0.8" />
                </svg>
                {gag === 'on' ? <span className={s.crabBubble}>{t.crabLine}</span> : null}
              </span>
            ) : null}

            {/* titik-titik bernomor + X */}
            {stops.map((st, i) => {
              const done = i < reached;
              const isNext = i === reached && phase === 'map';
              const label = st.kind === 'x' ? t.xLabel : fmt(st.kind === 'gag' ? t.gagLabel : t.stopLabel, { i: st.no });
              return (
                <button
                  key={`s${i}`}
                  ref={isNext ? nextRef : undefined}
                  type="button"
                  className={cx(s.stop, st.kind === 'x' ? s.stopX : s.stopN, done && s.done, isNext && s.next, st.kind === 'gag' && done && s.zonk)}
                  style={{ left: em(st.at[0]), top: em(st.at[1]), '--i': i } as CSSProperties}
                  onClick={() => tapStop(i)}
                  aria-label={label}
                  aria-disabled={done || !isNext}
                  tabIndex={phase === 'map' && isNext ? 0 : -1}
                  disabled={phase !== 'map'}
                >
                  {st.kind === 'x' ? (
                    <Sprite key={nudge?.i === i ? `n${nudge.k}` : 'x'} name="petaharta-x" className={cx(s.xArt, nudge?.i === i && s.shake)} />
                  ) : (
                    <span key={nudge?.i === i ? `n${nudge.k}` : 'p'} className={cx(s.pin, nudge?.i === i && s.shake)}>
                      <svg viewBox="0 0 74 70" aria-hidden>
                        <path d={RING} pathLength={1} />
                      </svg>
                      <b>{st.kind === 'gag' && !done ? '?' : st.no}</b>
                      {st.kind === 'gag' && done ? (
                        <svg className={s.cross} viewBox="0 0 40 40" aria-hidden>
                          <path d="M8,8L32,32M33,7L7,33" pathLength={1} />
                        </svg>
                      ) : null}
                    </span>
                  )}
                  {st.kind === 'gag' && done ? <span className={s.zonkTag}>{t.zonk}</span> : null}
                </button>
              );
            })}

            {/* perahu kertas */}
            <span
              ref={boatRef}
              className={cx(s.boat, sailing >= 0 && s.sailing)}
              style={{ transform: `translate(${em(boatAt.x)}, ${em(boatAt.y)})`, '--rot': `${boatAt.rot}deg` } as CSSProperties}
              data-flip={boatAt.flip ? '1' : '0'}
              aria-hidden
            >
              <span className={s.boatIn}>
                <Sprite name="petaharta-perahu" className={s.boatArt} />
              </span>
            </span>

            {/* galian di tanda X */}
            {phase === 'dig' || rise ? (
              <div className={cx(s.digSpot, mound && s.moundOn, clean && s.clean, shine && s.shining)} style={{ left: em(X_AT[0]), top: em(X_AT[1]) }} aria-hidden>
                <Sprite name="petaharta-lubang" className={s.hole} style={{ '--k': rubbed / CLUMPS.length } as CSSProperties} />
                <span className={s.holeGlow} />
                <Sprite name="petaharta-gundukan" className={s.mound} style={{ '--k': rubbed / CLUMPS.length } as CSSProperties} />
                {CLUMPS.map(([dx, dy, rot, sc0], i) => (
                  <Sprite
                    key={i}
                    name="petaharta-gumpal"
                    className={cx(s.clump, i < rubbed && s.off)}
                    style={{ left: em(dx), top: em(dy), '--r': `${rot}deg`, '--s': sc0, '--fx': brush[0], '--fy': brush[1] } as CSSProperties}
                  />
                ))}
                <span className={s.magic}>
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            ) : null}
            {puffs.map((p) => (
              <span key={p.id} className={s.puff} style={{ left: em(p.x), top: em(p.y) }} aria-hidden>
                {Array.from({ length: 14 }, (_, i) => (
                  <i key={i} style={{ '--a': `${i * 25.7 + ((p.id * 23) % 26)}deg`, '--d': `${1.6 + ((i * 7 + p.id) % 5) * 0.45}em` } as CSSProperties} />
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── gulungan peta, tali, segel ── */}
      {!unrolled || phase === 'rolled' ? (
        <div className={s.rolls} aria-hidden>
          <Sprite name="petaharta-rol" className={cx(s.roll, s.rollB)} />
          <Sprite name="petaharta-rol" className={cx(s.roll, s.rollA)} />
        </div>
      ) : null}
      {phase === 'sealed' || phase === 'rolled' ? (
        <div className={s.knot} aria-hidden>
          <Sprite name="petaharta-kunci" className={s.knotKey} />
          <Sprite name="petaharta-tali" className={s.twine} />
          <span className={s.tag}>
            <Sprite name="petaharta-label" className={s.tagArt} />
            <span className={s.tagText}>
              <span>{t.tagFor}</span>
              <b className={cx(toLen > 9 && s.long, toLen > 14 && s.xl)}>{to}</b>
            </span>
          </span>
          <span className={s.seal}>
            <Sprite name="petaharta-segel" className={cx(s.sealHalf, s.sealA)} />
            <Sprite name="petaharta-segel" className={cx(s.sealHalf, s.sealB)} />
            {broken ? (
              <span className={s.crumbs}>
                {Array.from({ length: 8 }, (_, i) => (
                  <i key={i} style={{ '--a': `${i * 45 + 10}deg`, '--d': `${2 + (i % 3) * 0.8}em` } as CSSProperties} />
                ))}
              </span>
            ) : null}
          </span>
        </div>
      ) : null}
      {phase === 'sealed' || phase === 'rolled' ? (
        <button
          ref={bundleRef}
          type="button"
          className={cx(s.hit, s.hitBundle, phase === 'rolled' && s.grab)}
          aria-label={phase === 'sealed' ? t.sealLabel : t.unrollLabel}
          disabled={!ready || (phase === 'sealed' && broken) || unrolled}
          onPointerDown={bundleDown}
          onPointerMove={bundleMove}
          onPointerUp={(e) => bundleUp(e)}
          onPointerCancel={(e) => bundleUp(e, true)}
          onClick={(e) => {
            if (e.detail !== 0) return;
            if (phase === 'sealed') breakSeal();
            else unroll();
          }}
        />
      ) : null}

      {/* bidang usap di atas gundukan */}
      {phase === 'dig' && mound && !clean ? (
        <button
          ref={digRef}
          type="button"
          className={cx(s.hit, s.hitDig)}
          aria-label={t.digLabel}
          onPointerDown={rubDown}
          onPointerMove={rubMove}
          onPointerUp={rubUp}
          onPointerCancel={rubUp}
          onClick={(e) => {
            if (e.detail === 0) addRub(0.34);
          }}
        />
      ) : null}

      {/* ── peti harta ── */}
      <div className={s.dim} aria-hidden />
      {chestScene ? (
        <>
          <div className={s.glow} aria-hidden>
            <span className={s.rays} />
            <span className={s.sparks}>
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>
          {lid ? <span className={s.flash} aria-hidden /> : null}
          {lid ? (
            <div key="title" className={s.titleBox}>
              <span className={s.titleEyebrow}>{t.chestEyebrow}</span>
              <h2 className={cx(s.title, titleLen > 18 && s.long, titleLen > 30 && s.xl)}>{title}</h2>
            </div>
          ) : null}
          <div className={cx(s.chest, rise && s.risen)}>
            <Sprite name="petaharta-tutup-buka" className={s.lidOpenArt} />
            <Sprite name="petaharta-peti" className={s.chestBody} />
            <Sprite name="petaharta-harta" className={s.treasure} />
            {lid ? (
              <span className={s.coins} aria-hidden>
                {COINS.map(([dx, h, r], i) => (
                  <i key={i} style={{ '--dx': `${dx}em`, '--h': `${h}em`, '--r': `${r}deg`, '--i': i } as CSSProperties} />
                ))}
              </span>
            ) : null}
            {!snatched ? <Sprite name="petaharta-surat" className={cx(s.scroll, phase === 'letter' && s.beckon, pulled && s.pulled)} style={{ '--tug': tug } as CSSProperties} /> : null}
            <Sprite name="petaharta-tutup" className={s.lidClosed} />
            <span ref={lockRef} className={cx(s.lock, lockOff && s.lockOff)}>
              <Sprite name="petaharta-gembok" className={s.lockArt} />
              {unlocked ? (
                <span className={s.lockKey}>
                  <Sprite name="petaharta-kunci" className={s.lockKeyArt} />
                </span>
              ) : null}
            </span>
          </div>
          {phase === 'chest' && !unlocked ? <button ref={chestHitRef} type="button" className={cx(s.hit, s.hitChest)} onClick={unlock} aria-label={t.keyLabel} tabIndex={-1} /> : null}
          {phase === 'letter' && !pulled ? <button ref={chestHitRef} type="button" className={cx(s.hit, s.hitChest, s.grab)} aria-label={t.letterLabel} {...letterDrag} /> : null}
        </>
      ) : null}

      {/* kantong kunci: kunci dari segel disimpan, lalu dipakai di gembok */}
      {broken && !finale && (phase === 'sealed' || phase === 'rolled' || (phase === 'chest' && !unlocked)) ? (
        <div className={cx(s.pouch, phase === 'chest' && s.pouchLive)}>
          <span className={s.pouchLabel}>{t.keyTag}</span>
          {!unlocked ? (
            <button
              ref={keyRef}
              type="button"
              className={cx(s.pouchKey, phase === 'sealed' && s.flyIn, keyDrag && s.dragging, keyBack && s.back)}
              style={keyDrag ? ({ transform: `translate(${keyDrag.x}px, ${keyDrag.y}px) rotate(-30deg) scale(1.15)` } as CSSProperties) : undefined}
              disabled={phase !== 'chest'}
              tabIndex={phase === 'chest' ? 0 : -1}
              aria-label={t.keyLabel}
              onPointerDown={keyDown}
              onPointerMove={keyMove}
              onPointerUp={(e) => keyUp(e)}
              onPointerCancel={(e) => keyUp(e, true)}
              onClick={(e) => {
                if (e.detail === 0) unlock();
              }}
            >
              <Sprite name="petaharta-kunci" className={s.pouchKeyArt} />
            </button>
          ) : null}
        </div>
      ) : null}

      {/* beo menyambar surat (sebelum game) / pamit (sesudahnya) */}
      {parrot !== 'none' && !playing ? (
        <span className={cx(s.parrotFly, s[`parrot_${parrot}`])} aria-hidden>
          <Parrot mood={parrot === 'bye' ? 'sorry' : 'smug'} flap scroll={parrot === 'swoop' && snatched} />
        </span>
      ) : null}

      {/* keterangan di atas */}
      {!finale && !playing && open === null && cap ? (
        <div key={cap} className={cx(s.head, onMap ? s.headInk : s.headLight)} role="status">
          <span className={cx(s.eyebrow, eyebrow.length > 26 && s.eyebrowLong)}>{eyebrow}</span>
          <p className={cx(s.cap, cap.length > 40 && s.capLong)}>{cap}</p>
        </div>
      ) : null}

      {/* sobekan kertas petunjuk */}
      {sc && sc.kind === 'clue' && open !== null ? (
        <div className={cx(s.noteLayer, closing && s.closing)}>
          <button type="button" className={s.noteScrim} onClick={closeNote} aria-label={t.clueClose} tabIndex={-1} />
          <div className={s.scrapWrap} role="dialog" aria-label={fmt(t.clueNo, { i: sc.clue + 1, n: N })}>
            <div className={s.scrap} onClick={closeNote}>
              <span className={s.clueNo}>{fmt(t.clueNo, { i: sc.clue + 1, n: N })}</span>
              {sc.photo ? (
                <figure className={s.sketch}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sc.photo} alt={fmt(t.photoAlt, { i: sc.clue + 1 })} draggable={false} className={s.photo} />
                  <svg className={s.pencil} viewBox="0 0 200 150" preserveAspectRatio="none" aria-hidden>
                    <path d="M-6,4L206,1M-4,147L204,150M3,-6L1,156M197,-5L199,155" />
                    <path d="M-3,9L203,6M196,-2L194,152" opacity="0.45" />
                  </svg>
                </figure>
              ) : (
                <span className={s.noPhoto} aria-hidden>
                  <i />
                  <Sprite name="petaharta-perahu" className={s.noPhotoBoat} />
                  <i />
                </span>
              )}
              {sc.note ? <p className={cx(s.clueText, !sc.photo && s.big, sc.note.length > 46 && s.long)}>{sc.note}</p> : null}
              <button
                ref={noteBtnRef}
                type="button"
                className={s.clueBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  closeNote();
                }}
              >
                {stops[open + 1]?.kind === 'x' ? t.clueLast : t.clueNext} <span aria-hidden>→</span>
              </button>
            </div>
            <span className={s.tack} aria-hidden />
          </div>
        </div>
      ) : null}

      {/* petunjuk & penunjuk sentuh tiap langkah */}
      {phase === 'sealed' && ready && !broken ? <Hint key="hSeal">{t.hintSeal}</Hint> : null}
      {phase === 'rolled' && !unrolled ? <Hint key="hUnroll">{t.hintUnroll}</Hint> : null}
      {phase === 'map' && sailing < 0 && open === null && gag !== 'on' && next ? (
        <Hint key={`hStop${reached}`}>{next.kind === 'x' ? t.hintX : fmt(t.hintStop, { i: next.no })}</Hint>
      ) : null}
      {phase === 'dig' && mound && !clean ? <Hint key="hDig">{t.hintDig}</Hint> : null}
      {phase === 'chest' && rise && !unlocked ? <Hint key="hKey">{t.hintKey}</Hint> : null}
      {phase === 'letter' && !pulled ? <Hint key="hLetter">{t.hintLetter}</Hint> : null}

      {finale || playing || open !== null ? null : phase === 'sealed' ? (
        ready && !broken ? <TapCue key="cueSeal" target={bundleRef} delay={2200} /> : null
      ) : phase === 'rolled' ? (
        !unrolled ? <TapCue key="cueUnroll" target={bundleRef} kind="drag" dir={{ x: 0, y: 4 }} at={{ x: 0.5, y: 0.5 }} delay={2000} /> : null
      ) : phase === 'map' ? (
        sailing < 0 && gag !== 'on' && next ? <TapCue key={`cueStop${reached}`} target={nextRef} delay={reached === 0 ? 1800 : 4200} /> : null
      ) : phase === 'dig' ? (
        mound && !clean ? <TapCue key="cueDig" target={digRef} kind="drag" dir={{ x: 3.4, y: -0.6 }} at={{ x: 0.4, y: 0.5 }} delay={2000} /> : null
      ) : phase === 'chest' ? (
        rise && !unlocked ? <TapCue key="cueKey" target={keyRef} kind="drag" dir={{ x: 7, y: -5 }} at={{ x: 0.5, y: 0.5 }} delay={2400} /> : null
      ) : phase === 'letter' ? (
        !pulled ? <TapCue key="cueLetter" target={chestHitRef} kind="drag" dir={{ x: 0, y: -3.4 }} at={{ x: 0.5, y: 0.3 }} delay={2400} /> : null
      ) : null}

      <Confetti burst={burst} count={110} origin={{ x: 0.5, y: 0.58 }} colors={['#ffd36e', '#fff3c4', '#c2412d', '#f29a6a', '#2f9f97', '#ffe9a8']} />

      {playing ? <ParrotGame t={t.game} onDone={gameDone} /> : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja"
          theme={{
            bg: `linear-gradient(180deg, rgba(42, 26, 12, 0.62), rgba(58, 36, 16, 0.42) 46%, rgba(42, 24, 10, 0.55)), url(${MAP})`,
            ink: '#fff3dc',
            paper: '#fbf2dc',
            paperInk: '#3a2a18',
          }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
