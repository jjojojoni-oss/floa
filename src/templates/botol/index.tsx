'use client';

import { type CSSProperties, type PointerEvent as ReactPointerEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Sprite, Stage, TapCue, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { CRAB_SPOTS, Crab, CrabGame } from './Game';
import { TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BACKDROP = '/art/bg-botol.webp';
const ART = ['bg-botol', 'botol-ombak', 'botol-basah', 'botol-ombak-jauh', 'botol-kaca', 'botol-gabus', 'botol-gulungan', 'botol-pasir-1', 'botol-pasir-2', 'botol-nyiur'];
/** lukisan yang baru dipakai belakangan: disiapkan selagi botolnya masih terapung */
const LATER_ART = ['botol-label', 'botol-kerang-1', 'botol-kerang-2', 'botol-kerang-3', 'botol-bintang', 'botol-ranting', 'botol-perangko', 'game-botol-kepiting'];

/**
 * sea    → pantai senja; botol terapung jauh, tiap ombak membawanya mendekat; ditarik (atau diketuk) ke pasir
 * sand   → botol penuh pasir: diusap (atau diketuk tiga kali) sampai bersih, lalu labelnya kelihatan
 * cork   → gabus ditarik searah leher botol (atau diketuk): plop, gabusnya terlempar ke pasir
 * pour   → botol dimiringkan: gulungan kecil meluncur keluar satu per satu; diketuk untuk dibuka
 *          (catatan + kartu pos); tiap gulungan yang dibaca meninggalkan satu kerang di tepi ombak
 * write  → botol ditegakkan; judul ditulis di pasir huruf demi huruf, ombak besar naik dan berhenti
 *          tepat sebelum tulisannya; waktu surut, seekor kepiting ketahuan membawa gabusnya
 * game   → mini-game kepiting
 * letter → gulungan terakhir (yang paling besar) ditarik keluar dari mulut botol → surat
 */
type Phase = 'sea' | 'sand' | 'cork' | 'pour' | 'write' | 'game' | 'letter';

/** pose botol di dunia lukisan: [x, y] pusat dalam em lukisan (1em = 32 satuan), putaran (derajat), skala */
type Pose = [number, number, number, number];
const FAR: Pose[] = [
  [16.8, 18.7, -8, 0.16],
  [15.2, 21, 7, 0.23],
  [13.6, 24, -7, 0.32],
  [12.2, 27.2, 5, 0.44],
];
const REST: Pose = [10.4, 36.6, -18, 1];
const TIP: Pose = [10.4, 36.2, 20, 1];
const UP: Pose = [4.9, 37.2, -90, 0.8];
const lerp = (a: Pose, b: Pose, u: number): Pose => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, a[3] + (b[3] - a[3]) * u];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** lebar dunia lukisan dalam em (780 satuan) */
const WORLD_W = 24.375;
/** arah leher botol yang rebah (−18°), untuk menarik gabus */
const AXIS: [number, number] = [Math.cos((18 * Math.PI) / 180), -Math.sin((18 * Math.PI) / 180)];

/** tempat gulungan kecil di dalam botol: [x, y] dari pusat botol dalam satuan lukisan, putaran */
const SLOTS: Array<[number, number, number]> = [
  [1, 19, 3],
  [-9, -21, -5],
  [-107, 23, -2],
  [-117, -19, 5],
  [-55, 1, 14],
];
/** gumpal pasir di atas kaca: [x, y] dari pusat botol (satuan lukisan), putaran, skala, lukisan */
const CLUMPS: Array<[number, number, number, number, string]> = [
  [-112, -22, -8, 0.8, 'botol-pasir-1'],
  [18, 16, 10, 0.86, 'botol-pasir-2'],
  [128, -4, 34, 0.5, 'botol-pasir-1'],
  [-176, 26, 150, 0.62, 'botol-pasir-1'],
];
const SHELLS = ['botol-kerang-1', 'botol-kerang-2', 'botol-bintang', 'botol-kerang-3', 'botol-kerang-1'];
/** kerlip di jalur cahaya matahari: [x, y] em lukisan, ukuran */
const GLINTS: Array<[number, number, number]> = [
  [15.2, 17.9, 0.26],
  [14.7, 19.0, 0.3],
  [15.9, 19.9, 0.32],
  [14.2, 21.2, 0.38],
  [16.4, 22.4, 0.42],
  [15.0, 23.7, 0.5],
  [13.5, 25.0, 0.54],
  [16.9, 25.7, 0.5],
  [15.4, 27.0, 0.6],
];

/** titik (dx, dy) dari pusat botol (satuan lukisan) → em lukisan, untuk pose tertentu */
function toWorld(p: Pose, dx: number, dy: number): [number, number] {
  const a = (p[2] * Math.PI) / 180;
  const x = (dx * p[3]) / 32;
  const y = (dy * p[3]) / 32;
  return [p[0] + x * Math.cos(a) - y * Math.sin(a), p[1] + x * Math.sin(a) + y * Math.cos(a)];
}

type Drag = { id: number; x0: number; y0: number; moved: boolean };
type DragCfg = {
  on: boolean;
  /** seberapa jauh gerakan (px) searah yang diminta */
  proj: (dx: number, dy: number) => number;
  /** jarak penuh dalam em lukisan */
  dist: number;
  value: number;
  set: (p: number) => void;
  done: () => void;
  tap: () => void;
};
type Puff = { id: number; x: number; y: number };

export default function Botol(props: TemplateProps) {
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

  const to = data.to.trim() || t.you;
  const from = data.from.trim();
  const title = data.title.trim() || t.titleFallback;

  /** gulungan: catatan ke-i berpasangan dengan foto ke-i; yang kosong dua-duanya dilewati */
  const scrolls = useMemo(() => {
    const out: { note: string; photo: string | null }[] = [];
    const n = Math.min(5, Math.max(data.notes.length, data.photos.length));
    for (let i = 0; i < n; i++) {
      const note = (data.notes[i] ?? '').trim();
      const photo = data.photos[i] || null;
      if (note || photo) out.push({ note, photo });
    }
    if (!out.length) out.push({ note: t.emptyNote, photo: null });
    return out;
  }, [data.notes, data.photos, t.emptyNote]);
  const N = scrolls.length;

  /** judul dipecah per kata lalu per huruf, supaya bisa ditulis satu-satu */
  const words = useMemo(() => {
    let k = 0;
    return title.split(/\s+/).map((w) => Array.from(w).map((ch) => ({ ch, i: k++ })));
  }, [title]);
  const total = useMemo(() => words.reduce((a, w) => a + w.length, 0), [words]);

  const [phase, setPhase] = useState<Phase>('sea');
  /** langkah botol mendekat (0..3; 3 = sudah di tepi ombak) */
  const [step, setStep] = useState(0);
  const [haul, setHaul] = useState(0);
  const [landed, setLanded] = useState(false);
  /** gumpal pasir yang sudah tersapu */
  const [rubbed, setRubbed] = useState(0);
  const [brush, setBrush] = useState<[number, number]>([0.7, 1.5]);
  const [puffs, setPuffs] = useState<Puff[]>([]);
  const [pull, setPull] = useState(0);
  const [wiggle, setWiggle] = useState(false);
  const [popped, setPopped] = useState(false);
  const [tilt, setTilt] = useState(0);
  const [tipped, setTipped] = useState(false);
  /** jumlah gulungan yang sudah keluar dari botol */
  const [next, setNext] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [read, setRead] = useState(0);
  const [writing, setWriting] = useState(false);
  const [written, setWritten] = useState(0);
  const [pen, setPen] = useState<{ x: number; y: number } | null>(null);
  const [beat, setBeat] = useState<'write' | 'rush' | 'stop' | 'crab'>('write');
  const [wave, setWave] = useState<{ kind: 'idle' | 'land' | 'rush'; k: number }>({ kind: 'idle', k: 0 });
  /** jejak basah ombak besar terakhir (tetap ada sampai mengering sendiri) */
  const [wetOnce, setWetOnce] = useState<{ kind: 'land' | 'rush'; k: number } | null>(null);
  /** kepiting di adegan utama: mengintip sambil membawa gabus (sebelum game) / pamit (sesudahnya) */
  const [crab, setCrab] = useState<'none' | 'peek' | 'bye'>('none');
  const [game, setGame] = useState<'off' | 'on' | 'done'>('off');
  const [tug, setTug] = useState(0);
  const [pulled, setPulled] = useState(false);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);

  const worldRef = useRef<HTMLDivElement>(null);
  const seaRef = useRef<HTMLButtonElement>(null);
  const rubRef = useRef<HTMLButtonElement>(null);
  const corkRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLButtonElement>(null);
  const noteBtnRef = useRef<HTMLButtonElement>(null);
  const letterRef = useRef<HTMLButtonElement>(null);
  const charRefs = useRef<Array<HTMLElement | null>>([]);
  const drag = useRef<Drag | null>(null);
  const rub = useRef({ id: -1, acc: 0, done: 0, lx: 0, ly: 0, moved: false });
  const wrote = useRef(false);
  const puffId = useRef(0);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // lukisan & foto yang dipakai belakangan disiapkan lebih dulu
  useEffect(() => {
    [...LATER_ART.map((n) => `/art/${n}.webp`), ...scrolls.map((sc) => sc.photo)].forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
  }, [scrolls]);

  // fokus mengikuti langkah yang aktif (pengguna papan ketik / pembaca layar)
  useEffect(() => {
    if (mode === 'preview') return;
    const el = open !== null ? noteBtnRef : phase === 'sand' ? rubRef : phase === 'cork' ? corkRef : phase === 'pour' ? (waiting ? scrollRef : tipRef) : phase === 'letter' ? letterRef : null;
    if (!el) return;
    const id = setTimeout(() => el.current?.focus({ preventScroll: true }), 500);
    return () => clearTimeout(id);
  }, [phase, open, waiting, mode]);

  /** 1 em lukisan dalam px layar */
  const emPx = () => (worldRef.current?.getBoundingClientRect().width ?? 390) / WORLD_W;
  const ms = (v: number, fast = 0.2) => (reduce.current ? Math.round(v * fast) : v);

  /** seret searah tertentu sampai penuh, atau cukup ketuk */
  const dragProps = (c: DragCfg) => ({
    onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => {
      if (e.button > 0 || !c.on) return;
      drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* pointer sudah tidak aktif */
      }
    },
    onPointerMove: (e: ReactPointerEvent<HTMLButtonElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId || !c.on) return;
      const dx = e.clientX - d.x0;
      const dy = e.clientY - d.y0;
      if (Math.hypot(dx, dy) > 7) d.moved = true;
      if (!d.moved) return;
      const p = clamp01(c.proj(dx, dy) / (c.dist * emPx()));
      c.set(p);
      if (p >= 1) {
        drag.current = null;
        c.done();
      }
    },
    onPointerUp: (e: ReactPointerEvent<HTMLButtonElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      drag.current = null;
      c.set(0);
      if (!c.on) return;
      if (!d.moved) c.tap();
      else if (c.value > 0.45) c.done();
    },
    onPointerCancel: () => {
      drag.current = null;
      c.set(0);
    },
    onClick: (e: { detail: number }) => {
      // ketukan dari papan ketik (klik dari pointer sudah ditangani di atas)
      if (e.detail === 0 && c.on) c.tap();
    },
  });

  /* ── 1. laut: botol mendekat, lalu ditarik ke pasir ── */
  useEffect(() => {
    if (!ready || phase !== 'sea' || landed || step >= 3) return;
    const id = setTimeout(() => setStep((v) => Math.min(3, v + 1)), reduce.current ? 350 : step === 0 ? 1500 : 1900);
    return () => clearTimeout(id);
  }, [ready, phase, landed, step]);

  const land = () => {
    if (landed || phase !== 'sea') return;
    setLanded(true);
    setHaul(0);
    sfx.whoosh();
    haptic(18);
    setWave((w) => ({ kind: 'land', k: w.k + 1 }));
    setWetOnce({ kind: 'land', k: 1 });
    later(() => sfx.blow(), ms(500));
    later(() => setPhase('sand'), ms(2300, 0.12));
    later(() => setWave((w) => (w.kind === 'land' ? { kind: 'idle', k: w.k + 1 } : w)), 3300);
  };
  const hurry = () => {
    if (step >= 3) return land();
    setStep((v) => Math.min(3, v + 1));
    sfx.tap();
    haptic(8);
  };

  /* ── 2. pasir diusap ── */
  const puff = (x: number, y: number) => {
    const id = ++puffId.current;
    setPuffs((p) => [...p, { id, x, y }]);
    later(() => setPuffs((p) => p.filter((q) => q.id !== id)), 800);
  };
  const addRub = (amount: number, at?: [number, number]) => {
    const r = rub.current;
    if (phase !== 'sand' || r.done >= CLUMPS.length) return;
    r.acc = Math.min(1, r.acc + amount);
    const n = Math.min(CLUMPS.length, Math.floor(r.acc * CLUMPS.length + 0.02));
    if (n <= r.done) return;
    for (let i = r.done; i < n; i++) {
      const [cx0, cy0] = toWorld(REST, CLUMPS[i][0], CLUMPS[i][1]);
      puff(at ? at[0] : cx0, at ? at[1] : cy0);
    }
    r.done = n;
    setRubbed(n);
    sfx.pencil();
    haptic(8);
    if (n >= CLUMPS.length) {
      later(() => sfx.chime(), 200);
      later(() => setPhase('cork'), ms(1900, 0.15));
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
    const em = emPx();
    // arah usapan dalam kerangka botol yang rebah (−18°): gumpal pasir tersapu ke arah itu
    const a = (18 * Math.PI) / 180;
    const ux = dx / dist;
    const uy = dy / dist;
    setBrush([(ux * Math.cos(a) - uy * Math.sin(a)) * 1.8, (ux * Math.sin(a) + uy * Math.cos(a)) * 1.8]);
    const box = worldRef.current?.getBoundingClientRect();
    addRub(dist / em / 30, box ? [(e.clientX - box.left) / em, (e.clientY - box.top) / em] : undefined);
  };
  const rubUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const r = rub.current;
    if (r.id !== e.pointerId) return;
    r.id = -1;
    if (!r.moved) addRub(0.34);
  };

  /* ── 3. gabus ── */
  const pop = () => {
    if (popped || phase !== 'cork') return;
    setPopped(true);
    setPull(0);
    setWiggle(false);
    sfx.pop();
    haptic(26);
    later(() => sfx.tap(), ms(720));
    later(() => setPhase('pour'), ms(1900, 0.15));
  };
  const tapCork = () => {
    if (wiggle || popped) return;
    setWiggle(true);
    sfx.tug();
    later(() => act.current.pop(), ms(430));
  };

  /* ── 4. gulungan kecil ── */
  const tip = () => {
    if (phase !== 'pour' || tipped || sliding || waiting || open !== null || next >= N) return;
    setTipped(true);
    setTilt(0);
    sfx.whoosh();
    haptic(12);
    later(() => {
      setSliding(true);
      setNext((v) => v + 1);
      sfx.tap();
    }, ms(480));
    later(() => {
      setSliding(false);
      setWaiting(true);
      sfx.pop();
    }, ms(1480));
    later(() => setTipped(false), ms(1250));
  };
  const openNote = () => {
    if (!waiting) return;
    setWaiting(false);
    setOpen(next - 1);
    sfx.rustle();
    haptic(10);
  };
  const closeNote = () => {
    if (open === null || closing) return;
    setClosing(true);
    sfx.whoosh();
    const r = read + 1;
    later(() => {
      setOpen(null);
      setClosing(false);
      setRead(r);
      sfx.note(r);
      haptic(12);
      if (r < N) later(() => act.current.tip(), ms(800));
      else later(() => act.current.startWrite(), ms(1500));
    }, ms(420));
  };

  /* ── 5. tulisan di pasir + ombak yang berhenti ── */
  const startWrite = () => {
    setPhase('write');
    setBeat('write');
    sfx.whoosh();
    later(() => setWriting(true), ms(1300));
  };
  useEffect(() => {
    if (!writing || wrote.current) return;
    if (written >= total) {
      wrote.current = true;
      sfx.chime();
      haptic(14);
      const d = reduce.current ? 0.3 : 1;
      later(() => {
        setBeat('rush');
        setWave((w) => ({ kind: 'rush', k: w.k + 1 }));
        setWetOnce({ kind: 'rush', k: 2 });
        sfx.whoosh();
        sfx.blow();
      }, 1100 * d);
      later(() => {
        setBeat('stop');
        haptic(22);
      }, 2500 * d);
      later(() => {
        setBeat('crab');
        setCrab('peek');
        sfx.squeak();
        setWave((w) => ({ kind: 'idle', k: w.k + 1 }));
      }, 5500 * d);
      later(() => {
        setPhase('game');
        setGame('on');
      }, 7400 * d);
      return;
    }
    if (reduce.current) {
      setWritten(total);
      return;
    }
    const id = setTimeout(() => {
      if (written % 4 === 0) sfx.pencil();
      setWritten((v) => v + 1);
    }, 105);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writing, written, total]);

  // ranting mengikuti huruf yang sedang ditulis
  useLayoutEffect(() => {
    if (!writing) return;
    const el = charRefs.current[Math.min(written, total - 1)];
    if (!el) return;
    setPen({ x: el.offsetLeft + (written >= total ? el.offsetWidth : el.offsetWidth * 0.5), y: el.offsetTop + el.offsetHeight * 0.74 });
  }, [writing, written, total]);

  /* ── 6. game selesai → gulungan terakhir ── */
  const gameDone = () => {
    setGame('done');
    setPhase('letter');
    setCrab('bye');
    sfx.chime();
    later(() => setCrab('none'), 2600);
  };
  const pullLetter = () => {
    if (pulled || phase !== 'letter') return;
    setPulled(true);
    setTug(0);
    sfx.whoosh();
    haptic(20);
    later(() => {
      sfx.success();
      setBurst((v) => v + 1);
    }, ms(700));
    later(() => setFinale(true), ms(1700));
  };

  /** pengatur waktu memanggil versi terbaru fungsi-fungsi ini (bukan salinan lama dari saat ia dipasang) */
  const act = useRef({ tip, startWrite, pop });
  act.current = { tip, startWrite, pop };

  /* ── tampilan ── */
  const playing = game === 'on';
  const atSea = phase === 'sea';
  const upright = phase === 'write' || phase === 'game' || phase === 'letter';
  const clean = rubbed >= CLUMPS.length;
  const dragging = haul > 0 || tilt > 0;
  const pose: Pose = atSea ? (landed ? REST : haul > 0 ? lerp(FAR[3], REST, haul) : FAR[step]) : upright ? UP : tipped ? TIP : tilt > 0 ? lerp(REST, TIP, tilt * 0.7) : REST;
  /** senja makin dalam seiring cerita berjalan */
  const dusk = atSea ? 0 : phase === 'sand' ? 0.1 : phase === 'cork' ? 0.16 : phase === 'pour' ? 0.2 + (read / N) * 0.14 : phase === 'write' ? 0.42 : 0.52;

  let eyebrow = from ? fmt(t.eyebrowFrom, { from }) : t.eyebrowAnon;
  let cap = '';
  if (atSea) {
    eyebrow = t.eyebrowSea;
    cap = landed ? t.capLanded : step < 3 ? fmt(t.capDrift, { to }) : t.capArrive;
  } else if (phase === 'sand') cap = clean ? fmt(t.capClean, { to }) : t.capSand;
  else if (phase === 'cork') cap = popped ? t.capPop : t.capCork;
  else if (phase === 'pour') cap = read >= N ? t.capAll : waiting ? fmt(t.capScroll, { i: next, n: N }) : sliding ? t.capOut : read > 0 ? t.capNext : t.capTip;
  else if (phase === 'write') {
    eyebrow = t.eyebrowSand;
    cap = beat === 'write' ? (from ? fmt(t.capWrite, { from }) : t.capWriteAnon) : beat === 'rush' ? t.capRush : beat === 'stop' ? t.capStop : t.capCrab;
  } else if (phase === 'letter') cap = pulled ? t.capPull : t.capLetter;

  const sc = open !== null ? scrolls[open] : null;
  /** gulungan yang sedang di luar botol (meluncur atau menunggu diketuk) */
  const outIdx = sliding || waiting ? next - 1 : -1;
  const slideVars = useMemo(() => {
    if (outIdx < 0) return undefined;
    const [dx, dy, rot] = SLOTS[outIdx % SLOTS.length];
    const a = toWorld(TIP, dx, dy);
    const b = toWorld(TIP, 150, 0);
    const c = toWorld(TIP, 262, 0);
    return { '--x0': a[0], '--y0': a[1], '--r0': rot + 20, '--x1': b[0], '--y1': b[1], '--x2': c[0], '--y2': c[1] } as CSSProperties;
  }, [outIdx]);
  const corkWhere = !popped ? 'in' : crab === 'peek' || playing ? 'crab' : game === 'done' ? 'back' : 'sand';
  const nameLen = Array.from(to).length;

  return (
    <div
      className={cx(s.wrap, ready && s.ready, finale && s.over, playing && s.gaming)}
      style={{ '--dusk': dusk } as CSSProperties}
    >
      <div ref={worldRef} className={cx(s.world, s[`p_${phase}`])}>
        {/* laut: kerlip di jalur cahaya, alun jauh, burung pulang */}
        {GLINTS.map(([x, y, r], i) => (
          <i key={i} className={s.glint} style={{ left: `${x}em`, top: `${y}em`, width: `${r}em`, height: `${r}em`, '--i': i } as CSSProperties} aria-hidden />
        ))}
        <Sprite name="botol-ombak-jauh" className={cx(s.swell, s.swellA)} />
        <Sprite name="botol-ombak-jauh" className={cx(s.swell, s.swellB)} />
        <Sprite name="botol-ombak-jauh" className={cx(s.swell, s.swellC)} />
        <svg className={s.birds} viewBox="0 0 60 24" aria-hidden>
          <path d="M2,10q6,-7 11,0q5,-7 11,0M34,18q5,-6 9,0q4,-6 9,0" />
        </svg>

        {/* jejak basah + lembar ombak yang naik-turun di pasir */}
        <div className={s.wetBox} aria-hidden>
          <Sprite name="botol-basah" className={s.wet} />
          {wetOnce ? <Sprite key={wetOnce.k} name="botol-basah" className={cx(s.wet, s[`wet_${wetOnce.kind}`])} /> : null}
        </div>
        {scrolls.map((_, i) =>
          i < read ? (
            <Sprite
              key={i}
              name={SHELLS[i % SHELLS.length]}
              className={cx(s.shell, i === 4 && s.shellAlt)}
              style={{ left: `${14.2 + (i - (N - 1) / 2) * 2.8}em`, top: `${i % 2 ? 31.7 : 31.1}em`, '--r': `${(i * 37) % 50 - 25}deg` } as CSSProperties}
            />
          ) : null,
        )}
        <Sprite name="botol-ombak" className={cx(s.wave, s.waveB)} />
        <Sprite key={wave.k} name="botol-ombak" className={cx(s.wave, s.waveA, s[`wave_${wave.kind}`])} />

        {/* tulisan di pasir */}
        {phase === 'write' || phase === 'game' || phase === 'letter' ? (
          <div className={s.sandText} aria-hidden={!writing}>
            <p className={cx(s.sandIn, total <= 12 && s.short, total > 20 && s.long, written >= total && writing && s.done)} aria-label={title}>
              {words.map((w, wi) => (
                <span key={wi}>
                  <span className={cx(s.word, w.length > 13 && s.breakable)} aria-hidden>
                    {w.map(({ ch, i }) => (
                      <i
                        key={i}
                        ref={(el) => {
                          charRefs.current[i] = el;
                        }}
                        className={cx(i < written && s.on)}
                      >
                        {ch}
                      </i>
                    ))}
                  </span>
                  {wi < words.length - 1 ? ' ' : null}
                </span>
              ))}
              {writing && pen ? (
                <span className={cx(s.pen, written >= total && s.penDone)} style={{ transform: `translate(${pen.x}px, ${pen.y}px)` }} aria-hidden>
                  <Sprite name="botol-ranting" className={s.stick} />
                </span>
              ) : null}
            </p>
          </div>
        ) : null}

        {/* gabus yang sudah lepas: terlempar ke pasir, lalu dikembalikan kepiting */}
        {corkWhere === 'sand' || corkWhere === 'back' ? <Sprite key={corkWhere} name="botol-gabus" className={cx(s.corkOut, corkWhere === 'back' && s.corkBack)} /> : null}
        {popped && phase === 'cork' ? (
          <span className={s.popRing} aria-hidden>
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
        ) : null}

        {/* gulungan yang meluncur keluar / menunggu diketuk */}
        {outIdx >= 0 ? (
          <button
            ref={scrollRef}
            type="button"
            className={cx(s.scroll, sliding ? s.slide : s.wait)}
            style={slideVars}
            disabled={!waiting}
            onClick={openNote}
            aria-label={fmt(t.scrollLabel, { i: outIdx + 1 })}
          >
            <Sprite name="botol-gulungan" className={s.scrollArt} />
          </button>
        ) : null}

        {/* botolnya: isi dulu (di balik kaca), lalu kaca, pasir, dan label */}
        {upright ? <span className={s.standShadow} aria-hidden /> : null}
        <div
          className={cx(s.bottle, atSea && !landed && s.afloat, atSea && landed && s.landing, !atSea && s.ashore, dragging && s.dragging, landed && s.sandy, clean && s.clean, phase !== 'sea' && phase !== 'sand' && s.tagged, tipped && s.tip, upright && s.up)}
          style={{ '--bx': pose[0], '--by': pose[1], '--br': pose[2], '--bs': pose[3] } as CSSProperties}
          aria-hidden
        >
          <div className={s.bob}>
            <span className={s.bShadow} />
            <Sprite
              name="botol-gulungan"
              className={cx(s.inScroll, s.bigScroll, phase === 'letter' && s.peek, pulled && s.pulled)}
              style={{ '--tug': tug } as CSSProperties}
            />
            {scrolls.map((_, i) => {
              if (i < next) return null;
              const [dx, dy, rot] = SLOTS[i % SLOTS.length];
              return <Sprite key={i} name="botol-gulungan" className={s.inScroll} style={{ '--lx': (235 + dx) / 32, '--ly': (85 + dy) / 32, '--lr': rot } as CSSProperties} />;
            })}
            {corkWhere === 'in' ? <Sprite name="botol-gabus" className={cx(s.cork, wiggle && s.wiggle)} style={{ '--pull': pull } as CSSProperties} /> : null}
            <Sprite name="botol-kaca" className={s.glass} />
            <span className={s.sparkles}>
              <i />
              <i />
              <i />
            </span>
            {CLUMPS.map(([dx, dy, rot, sc0, art], i) => (
              <Sprite
                key={i}
                name={art}
                className={cx(s.clump, i < rubbed && s.off)}
                style={{ '--lx': (235 + dx) / 32, '--ly': (85 + dy) / 32, '--lr': rot, '--ls': sc0, '--fx': brush[0], '--fy': brush[1] } as CSSProperties}
              />
            ))}
            <div className={s.tag}>
              <Sprite name="botol-label" className={s.tagArt} />
              <div className={s.tagText}>
                <span>{t.tagFor}</span>
                <b className={cx(nameLen > 9 && s.long, nameLen > 15 && s.xl)}>{to}</b>
              </div>
            </div>
          </div>
        </div>

        {/* butir pasir yang beterbangan saat diusap */}
        {puffs.map((p) => (
          <span key={p.id} className={s.puff} style={{ left: `${p.x}em`, top: `${p.y}em` }} aria-hidden>
            {Array.from({ length: 9 }, (_, i) => (
              <i key={i} style={{ '--a': `${i * 40 + (p.id * 23) % 40}deg`, '--d': `${1.3 + ((i * 7 + p.id) % 5) * 0.34}em` } as CSSProperties} />
            ))}
          </span>
        ))}

        {/* kepiting yang ketahuan membawa gabus (sebelum game) lalu pamit (sesudahnya) */}
        {crab !== 'none' && !playing ? (
          <span
            className={cx(s.crabSpot, s[`crab_${crab}`])}
            style={{ '--x': CRAB_SPOTS[crab === 'peek' ? 0 : 3][0], '--y': CRAB_SPOTS[crab === 'peek' ? 0 : 3][1] } as CSSProperties}
            aria-hidden
          >
            <Crab mood={crab === 'peek' ? 'cheeky' : 'sorry'} cork={crab === 'peek'} />
          </span>
        ) : null}

        <Sprite name="botol-nyiur" className={s.palm} />
        <Sprite name="botol-nyiur" className={cx(s.palm, s.palmR)} />
        <div className={s.dusk} aria-hidden />

        {/* bidang sentuh tiap langkah */}
        {atSea && ready && !landed ? (
          <button
            ref={seaRef}
            type="button"
            className={cx(s.hit, s.hitSea)}
            aria-label={t.seaLabel}
            {...dragProps({ on: true, proj: (_dx, dy) => (step >= 3 ? dy : 0), dist: 7.5, value: haul, set: setHaul, done: land, tap: hurry })}
          />
        ) : null}
        {phase === 'sand' && !clean ? (
          <button
            ref={rubRef}
            type="button"
            className={cx(s.hit, s.hitRub)}
            aria-label={t.rubLabel}
            onPointerDown={rubDown}
            onPointerMove={rubMove}
            onPointerUp={rubUp}
            onPointerCancel={rubUp}
            onClick={(e) => {
              if (e.detail === 0) addRub(0.34);
            }}
          />
        ) : null}
        {phase === 'cork' && !popped ? (
          <button
            ref={corkRef}
            type="button"
            className={cx(s.hit, s.hitCork)}
            aria-label={t.corkLabel}
            {...dragProps({ on: !wiggle, proj: (dx, dy) => dx * AXIS[0] + dy * AXIS[1], dist: 2.4, value: pull, set: setPull, done: pop, tap: tapCork })}
          />
        ) : null}
        {phase === 'pour' && next === 0 && !tipped ? (
          <button
            ref={tipRef}
            type="button"
            className={cx(s.hit, s.hitTip)}
            aria-label={t.tipLabel}
            {...dragProps({ on: true, proj: (_dx, dy) => -dy, dist: 3.4, value: tilt, set: setTilt, done: tip, tap: tip })}
          />
        ) : null}
        {phase === 'write' && writing && written < total ? <button type="button" className={cx(s.hit, s.hitWrite)} aria-label={t.skipWrite} onClick={() => setWritten(total)} /> : null}
        {phase === 'letter' && !pulled ? (
          <button
            ref={letterRef}
            type="button"
            className={cx(s.hit, s.hitLetter)}
            aria-label={t.letterLabel}
            {...dragProps({ on: true, proj: (_dx, dy) => -dy, dist: 3.2, value: tug, set: setTug, done: pullLetter, tap: pullLetter })}
          />
        ) : null}
      </div>

      {/* keterangan di langit */}
      {!finale && !playing && open === null && cap ? (
        <div key={cap} className={s.head} role="status">
          <span className={s.eyebrow}>{eyebrow}</span>
          <p className={cx(s.cap, cap.length > 44 && s.capLong)}>{cap}</p>
        </div>
      ) : null}

      {/* gulungan yang dibuka: catatan + kartu pos */}
      {sc && open !== null ? (
        <div className={cx(s.noteLayer, closing && s.closing)}>
          <button type="button" className={s.noteScrim} onClick={closeNote} aria-label={t.noteClose} tabIndex={-1} />
          <div className={s.note} role="dialog" aria-label={fmt(t.noteNo, { i: open + 1, n: N })}>
            <span className={s.roll} aria-hidden />
            <div className={s.noteGrow}>
              <div className={s.noteClip}>
                <div className={s.noteBody} onClick={closeNote}>
                  <span className={s.noteNo}>{fmt(t.noteNo, { i: open + 1, n: N })}</span>
                  {sc.photo ? (
                    <figure className={s.postcard}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sc.photo} alt={fmt(t.photoAlt, { i: open + 1 })} draggable={false} className={s.photo} />
                      <svg className={s.postmark} viewBox="0 0 120 60" aria-hidden>
                        <circle cx="30" cy="30" r="24" />
                        <circle cx="30" cy="30" r="17" />
                        <path d="M56,14q8,-6 16,0t16,0t16,0t16,0M56,26q8,-6 16,0t16,0t16,0t16,0M56,38q8,-6 16,0t16,0t16,0t16,0M56,50q8,-6 16,0t16,0t16,0t16,0" />
                      </svg>
                      <Sprite name="botol-perangko" className={s.stamp} />
                    </figure>
                  ) : (
                    <span className={s.noteDeco} aria-hidden>
                      <i />
                      <Sprite name={SHELLS[open % SHELLS.length]} className={s.noteShell} />
                      <i />
                    </span>
                  )}
                  {sc.note ? <p className={cx(s.noteText, !sc.photo && s.big, sc.note.length > 46 && s.long)}>{sc.note}</p> : null}
                  <button
                    ref={noteBtnRef}
                    type="button"
                    className={s.noteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeNote();
                    }}
                  >
                    {open + 1 >= N ? t.noteLast : t.noteNext}
                  </button>
                </div>
              </div>
            </div>
            <span className={cx(s.roll, s.rollB)} aria-hidden />
          </div>
        </div>
      ) : null}

      {atSea && ready && !landed && step < 3 ? <Hint key="hSea">{t.hintSea}</Hint> : null}
      {atSea && ready && !landed && step >= 3 ? <Hint key="hLand">{t.hintLand}</Hint> : null}
      {phase === 'sand' && !clean ? <Hint key="hRub">{t.hintRub}</Hint> : null}
      {phase === 'cork' && !popped ? <Hint key="hCork">{t.hintCork}</Hint> : null}
      {phase === 'pour' && next === 0 && !tipped ? <Hint key="hTip">{t.hintTip}</Hint> : null}
      {phase === 'pour' && waiting && read === 0 ? <Hint key="hScroll">{t.hintScroll}</Hint> : null}
      {phase === 'letter' && !pulled ? <Hint key="hLetter">{t.hintLetter}</Hint> : null}

      {finale || playing || open !== null ? null : atSea ? (
        ready && !landed && step >= 3 ? <TapCue key="cueLand" target={seaRef} kind="drag" dir={{ x: 0, y: 4 }} at={{ x: 0.5, y: 0.69 }} delay={2200} /> : null
      ) : phase === 'sand' ? (
        !clean ? <TapCue key="cueRub" target={rubRef} kind="drag" dir={{ x: 3.4, y: -0.8 }} at={{ x: 0.36, y: 0.52 }} delay={2200} /> : null
      ) : phase === 'cork' ? (
        !popped ? <TapCue key="cueCork" target={corkRef} kind="drag" dir={{ x: 2.6, y: -0.9 }} at={{ x: 0.52, y: 0.5 }} delay={2200} /> : null
      ) : phase === 'pour' ? (
        next === 0 && !tipped ? (
          <TapCue key="cueTip" target={tipRef} kind="drag" dir={{ x: 0.4, y: -3.2 }} at={{ x: 0.13, y: 0.7 }} delay={2200} />
        ) : waiting ? (
          <TapCue key={`cueScroll${next}`} target={scrollRef} delay={next === 1 ? 1800 : 3600} />
        ) : null
      ) : phase === 'letter' ? (
        !pulled ? <TapCue key="cueLetter" target={letterRef} kind="drag" dir={{ x: 0, y: -3.4 }} at={{ x: 0.5, y: 0.42 }} delay={2400} /> : null
      ) : null}

      <Confetti burst={burst} count={90} origin={{ x: 0.5, y: 0.5 }} colors={['#ffd98a', '#fff3da', '#1f8a8a', '#f2775f', '#7fd0c0', '#ffb7a2']} />

      {playing ? <CrabGame t={t.game} onDone={gameDone} /> : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja"
          theme={{
            bg: `linear-gradient(180deg, rgba(34, 24, 66, 0.58), rgba(70, 34, 80, 0.3) 46%, rgba(60, 30, 50, 0.34)), url(${BACKDROP})`,
            ink: '#fff3e2',
            paper: '#fffaf0',
            paperInk: '#3b2318',
          }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
