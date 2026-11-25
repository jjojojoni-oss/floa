'use client';

import { type CSSProperties, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Petals, Sprite, Stage, TapCue, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { type Milestone, dayDiff, elapsed, milestoneOn, milestones, parseDate, startOfDay } from './date';
import { SleepyEngine } from './Game';
import { LOCALE_TAG, TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BACKDROP = '/art/bg-anniversary.webp';
/** layar pertama (peron malam): ditunggu sampai siap supaya adegannya muncul utuh */
const ART = [
  'bg-anniversary',
  'anniversary-atap',
  'anniversary-papan',
  'anniversary-jam-peron',
  'anniversary-gerbong',
  'anniversary-pintu',
  'anniversary-peron',
  'anniversary-bangku',
  'anniversary-karcis',
];
/** kabin & pemandangan jendela: dimuat diam-diam selagi penerima di peron */
const CABIN = [
  'anniversary-kabin',
  'anniversary-tirai',
  'anniversary-lampu',
  'anniversary-jauh',
  'anniversary-sawah',
  'anniversary-dekat',
  'anniversary-halte',
  'anniversary-patok',
  'anniversary-terowongan',
];
/** baru dibutuhkan belakangan */
const LATE = [
  'anniversary-jembatan',
  'anniversary-kereta',
  'anniversary-lampion',
  'anniversary-papan-besar',
  'anniversary-amplop',
  'game-anniversary-kereta',
  'bunga-kamboja',
  'bunga-kamboja-pink',
  'daun-2',
  'daun-4',
  'kelopak-pink',
  'kelopak-putih',
];

/**
 * ticket → peron malam: kereta menunggu, papan "Stasiun {tanggal jadian}", jam stasiun; karcis karton di bangku diketuk (dilubangi)
 * doors  → pintu gerbong digeser (atau diketuk); cahaya hangat tumpah, kamera masuk ke gerbong
 * blind  → kabin: kerai jendela ditarik ke atas (atau diketuk); peluit, kereta berangkat, peron bergeser pergi
 * ride   → pemandangan berjalan (gunung, sawah, desa, tiang listrik), hujan di kaca; jendela diketuk untuk mampir
 * stop   → tiap stasiun = satu kenangan: papan nama stasiun, foto terselip di bingkai jendela, catatan di secarik kertas
 * run    → jendela ditahan (atau diketuk): ngebut melewati patok kilometer = milestone (100 hari, 1 tahun, …)
 * tunnel → gelap sejenak di terowongan
 * bridge → momen "wah": keluar terowongan ke jembatan panjang, langit penuh bintang, kembang api & lampion
 * arrive → kereta masuk "Stasiun Hari Ini": papan besar berisi ucapan utama + hitungan waktu bersama → mini-game
 * letter → amplop di bangku peron → surat
 */
type Phase = 'ticket' | 'doors' | 'blind' | 'ride' | 'stop' | 'run' | 'tunnel' | 'bridge' | 'arrive' | 'letter';

/* ukuran jendela & lapisan pemandangan (em; sama dengan art/sprites/53-anniversary.js, 32 satuan = 1em) */
const WIN = { w: 21.375, h: 16 };
const FAR = { w: 32, f: 0.07 };
const MID = { w: 40, f: 0.3 };
const NEAR = { w: 30, f: 1 };
const HALT_W = 30;
const POST_W = 5.3125;
const PORTAL_W = 35;
/** kecepatan jelajah (em/detik lapisan dekat), percepatan, perlambatan rem */
const CRUISE = 17;
const ACC = 10;
const BRAKE = 5.6;
/** jarak pengereman: stasiun berikutnya baru muncul dari tepi kanan jendela */
const STOP_AHEAD = 25;
const POST_GAP = 30;
const BOOST = 1;
const BOOST_HOLD = 1.7;

/** lampu untai di depan gerbong saat tiba: [kiri em, atas em] di sepanjang lengkung */
const FESTOON: [number, number][] = Array.from({ length: 23 }, (_, i) => {
  const u = i / 22;
  return [0.9 + u * 22.6, 9.1 + 3.4 * (1 - Math.pow(2 * u - 1, 2))];
});
/** kembang api di langit jembatan: [x %, y %, jeda s, warna, jari-jari em] */
const FIREWORKS: [number, number, number, string, number][] = [
  [20, 62, 0.4, '#ffd27a', 3.2],
  [80, 56, 1.2, '#f6a2b4', 3],
  [50, 74, 2, '#fff1cc', 3.6],
  [9, 30, 2.8, '#ff9e6a', 2],
  [91, 24, 3.5, '#ffe08a', 2],
  [34, 84, 4.2, '#f6a2b4', 2.4],
  [68, 82, 5, '#ffd27a', 2.6],
];
/** lampion yang naik dari kota di tepi sungai: [x %, jeda s, lama s, goyang em, skala] */
const LANTERNS: [number, number, number, number, number][] = [
  [70, 0.2, 13, 0.8, 1],
  [84, 1.1, 15, -0.9, 0.8],
  [62, 2, 14, 0.6, 0.9],
  [92, 2.9, 16, -0.6, 0.7],
  [76, 3.8, 13.5, 0.9, 1.1],
  [56, 4.7, 15.5, -0.7, 0.75],
  [88, 5.6, 14, 0.5, 0.95],
  [66, 6.5, 15, -0.8, 0.85],
  [96, 7.4, 13, 0.6, 0.7],
];

const SPARKS = Array.from({ length: 24 }, (_, k) => k * 15);

const reducedNow = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mod = (a: number, m: number) => ((a % m) + m) % m;
/** peluit kereta dua nada (nada-nada sfx ditumpuk) */
const whistle = () => {
  sfx.note(2);
  sfx.note(4);
};

type Rail = {
  D: number;
  v: number;
  go: boolean;
  target: number | null;
  onStop: (() => void) | null;
  /** dicek tiap bingkai saat kereta jalan (mis. "peron sudah lewat? rem ke stasiun berikutnya") */
  watch: (() => void) | null;
  boost: number;
  haltAt: number;
  posts: number[];
  passed: number;
  tunnelAt: number;
  last: number;
};

export default function Anniversary(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BACKDROP}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

/** 0 → 1 selama `ms` sejak `active` menyala (angka yang menghitung naik) */
function useCountUp(active: boolean, ms: number, delay = 300) {
  const [u, setU] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (reducedNow()) {
      setU(1);
      return;
    }
    let raf = 0;
    const t0 = performance.now() + delay;
    const tick = (now: number) => {
      const v = Math.max(0, Math.min(1, (now - t0) / ms));
      setU(1 - Math.pow(1 - v, 3));
      if (v < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, ms, delay]);
  return u;
}

/** angka dalam kotak-kotak kecil seperti odometer mekanis */
function Digits({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cx(s.digits, className)} aria-hidden>
      {Array.from(value).map((ch, i) =>
        /\d/.test(ch) ? (
          <b key={i} className={s.digit}>
            {ch}
          </b>
        ) : (
          <i key={i} className={s.sep}>
            {ch}
          </i>
        ),
      )}
    </span>
  );
}

/** papan nama stasiun (lukisan enamel + tulisan DOM) */
function StationSign({ small, name, sub, className }: { small: string; name: string; sub?: string; className?: string }) {
  return (
    <div className={cx(s.sign, className)}>
      <Sprite name="anniversary-papan" className={s.signArt} />
      <div className={s.signText}>
        <span className={s.signSmall}>{small}</span>
        <b className={cx(s.signName, name.length > 14 && s.long, name.length > 19 && s.xl)}>{name}</b>
        {sub ? <span className={s.signSub}>{sub}</span> : null}
      </div>
    </div>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const locale = useLocale();
  const t = TEXT[locale];
  const tag = LOCALE_TAG[locale];
  const later = useTimers();
  const ready = useArtReady(ART);

  const to = data.to.trim() || t.you;
  const from = data.from.trim();
  const title = data.title.trim();

  const { start, diff, counting, marks, todayMark, stops } = useMemo(() => {
    const start = parseDate(data.date);
    const today = startOfDay(new Date());
    const diff = start ? dayDiff(start, today) : 0;
    const counting = !!start && diff >= 0;
    // stasiun ke-i = catatan ke-i + foto ke-i (+ cerita foto ke-i), dipasangkan SEBELUM yang kosong dilewati
    const n = Math.min(5, Math.max(data.notes.length, data.photos.length));
    const stops: { note: string; photo: string | null; cap: string }[] = [];
    for (let i = 0; i < n; i++) {
      const note = (data.notes[i] ?? '').trim();
      const photo = data.photos[i] || null;
      const cap = photo ? (data.captions?.[i] ?? '').trim() : '';
      if (note || photo) stops.push({ note, photo, cap });
    }
    return {
      start,
      diff,
      counting,
      marks: start && counting ? milestones(start, today) : ([] as Milestone[]),
      todayMark: start && counting ? milestoneOn(start, today) : null,
      stops,
    };
  }, [data.date, data.notes, data.photos, data.captions]);

  const [phase, setPhaseState] = useState<Phase>('ticket');
  const phaseRef = useRef<Phase>('ticket');
  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };
  const [punched, setPunched] = useState(false);
  const [doorP, setDoorP] = useState(0);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [boarding, setBoarding] = useState(false);
  const [blindP, setBlindP] = useState(0);
  const [blindUp, setBlindUp] = useState(false);
  const [departed, setDeparted] = useState(false);
  const [moving, setMoving] = useState(false);
  /** jendela boleh diketuk sekarang (peron sebelumnya sudah lewat / kereta sudah berhenti) */
  const [canTap, setCanTapState] = useState(false);
  const canTapRef = useRef(false);
  const setCanTap = (v: boolean) => {
    canTapRef.current = v;
    setCanTapState(v);
  };
  /** yang terjadi pada ketukan jendela berikutnya: mampir di stasiun, atau ngebut ke hari ini */
  const [next, setNextState] = useState<'stop' | 'run'>(stops.length ? 'stop' : 'run');
  const nextRef = useRef<'stop' | 'run'>(stops.length ? 'stop' : 'run');
  const setNext = (v: 'stop' | 'run') => {
    nextRef.current = v;
    setNextState(v);
  };
  /** papan di peron jendela: -1 = stasiun keberangkatan, k = stasiun kenangan ke-k */
  const [signIdx, setSignIdx] = useState(-1);
  const [stopIdx, setStopIdx] = useState(-1);
  const [leaving, setLeaving] = useState(false);
  const [toast, setToast] = useState<number>(-1);
  const [ctaOn, setCtaOn] = useState(false);
  const [arrDoors, setArrDoors] = useState(false);
  const [game, setGame] = useState<'off' | 'on' | 'done'>('off');
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);
  const [now, setNow] = useState(() => new Date());

  const ticketRef = useRef<HTMLButtonElement>(null);
  const doorHitRef = useRef<HTMLButtonElement>(null);
  const winHitRef = useRef<HTMLButtonElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const envRef = useRef<HTMLButtonElement>(null);
  const winRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  const haltRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const rainRef = useRef<HTMLDivElement>(null);
  const postRefs = useRef<(HTMLDivElement | null)[]>([]);
  const emPx = useRef(16);
  const rail = useRef<Rail>({
    D: 0,
    v: 0,
    go: false,
    target: null,
    onStop: null,
    watch: null,
    boost: 1,
    haltAt: 0,
    posts: [],
    passed: 0,
    tunnelAt: Infinity,
    last: 0,
  });
  const nextStop = useRef(0);
  const once = useRef<Record<string, boolean>>({});
  const drag = useRef<{
    id: number;
    x0: number;
    y0: number;
    size: number;
    moved: boolean;
    p: number;
  } | null>(null);
  const holding = useRef(false);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = reducedNow();
  }, []);

  // jam stasiun & hitungan waktu berdetak tiap detik
  useEffect(() => {
    if (finale) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [finale]);

  // kabin, lukisan & foto yang baru dibutuhkan belakangan disiapkan diam-diam setelah peron tampil
  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => {
      [...CABIN.map((n) => `/art/${n}.webp`), ...LATE.map((n) => `/art/${n}.webp`), ...stops.map((x) => x.photo)].forEach((src) => {
        if (!src) return;
        const img = new Image();
        img.src = src;
        img.decode?.().catch(() => {});
      });
    }, 300);
    return () => clearTimeout(id);
  }, [ready, stops]);

  // fokus mengikuti tombol lanjut (pengguna papan ketik / pembaca layar), kecuali di pratinjau editor
  useEffect(() => {
    if (mode === 'preview' || !ctaOn) return;
    const id = setTimeout(() => ctaRef.current?.focus({ preventScroll: true }), 600);
    return () => clearTimeout(id);
  }, [ctaOn, phase, mode]);

  /* ───────────── mesin kereta: satu jarak tempuh D menggerakkan semua lapisan jendela ───────────── */
  const cabinOn = phase === 'blind' || phase === 'ride' || phase === 'stop' || phase === 'run' || phase === 'tunnel';

  const apply = () => {
    const r = rail.current;
    const px = emPx.current;
    const D = r.D;
    const tx = (el: HTMLElement | null, em: number, show = true) => {
      if (!el) return;
      el.style.transform = `translate3d(${(em * px).toFixed(1)}px,0,0)`;
      el.style.visibility = show ? 'visible' : 'hidden';
    };
    tx(farRef.current, -mod(D * FAR.f, FAR.w));
    tx(midRef.current, -mod(D * MID.f, MID.w));
    tx(nearRef.current, -mod(D * NEAR.f, NEAR.w));
    tx(haltRef.current, (WIN.w - HALT_W) / 2 + (r.haltAt - D), Math.abs(r.haltAt - D) < 27);
    r.posts.forEach((at, i) => tx(postRefs.current[i], WIN.w / 2 - POST_W / 2 + (at - D), Math.abs(at - D) < 14));
    tx(portalRef.current, (WIN.w - PORTAL_W) / 2 + (r.tunnelAt - D), Math.abs(r.tunnelAt - D) < 29);
    if (rainRef.current) rainRef.current.style.transform = `skewX(${(-r.v * 1.6).toFixed(1)}deg)`;
  };

  useEffect(() => {
    if (!cabinOn) return;
    const win = winRef.current;
    const measure = () => {
      if (win?.clientWidth) emPx.current = win.clientWidth / WIN.w;
      apply();
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' && win ? new ResizeObserver(measure) : null;
    if (ro && win) ro.observe(win);
    let raf = 0;
    const r = rail.current;
    r.last = 0;
    const step = (tNow: number) => {
      const dt = r.last ? Math.min(0.05, (tNow - r.last) / 1000) : 0;
      r.last = tNow;
      if (r.target != null) {
        const rem = r.target - r.D;
        r.v = Math.min(Math.sqrt(2 * BRAKE * Math.max(0, rem)), r.v + ACC * dt, CRUISE);
        r.D = Math.min(r.target, r.D + r.v * dt);
        if (r.target - r.D < 0.02 || r.v < 0.05) {
          r.D = r.target;
          r.v = 0;
          r.target = null;
          const cb = r.onStop;
          r.onStop = null;
          cb?.();
        }
      } else {
        const top = r.go ? CRUISE * r.boost : 0;
        r.v = r.v < top ? Math.min(top, r.v + ACC * r.boost * dt) : Math.max(top, r.v - BRAKE * 1.6 * dt);
        r.D += r.v * dt;
      }
      r.watch?.();
      apply();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cabinOn]);

  /* ── 1. karcis ── */
  const punch = () => {
    if (once.current.punch || phaseRef.current !== 'ticket') return;
    once.current.punch = true;
    setPunched(true);
    sfx.crack();
    sfx.tap();
    haptic(24);
    later(
      () => {
        sfx.pop();
        haptic(10);
      },
      reduce.current ? 60 : 420,
    );
    later(() => setPhase('doors'), reduce.current ? 700 : 2100);
  };

  /* ── 2. pintu gerbong ── */
  const openDoors = () => {
    if (once.current.doors || phaseRef.current !== 'doors') return;
    once.current.doors = true;
    drag.current = null;
    setDoorP(1);
    setDoorsOpen(true);
    sfx.whoosh();
    sfx.blow();
    haptic(22);
    later(() => setBoarding(true), reduce.current ? 300 : 1300);
    later(
      () => {
        setPhase('blind');
        setBoarding(false);
      },
      reduce.current ? 500 : 2200,
    );
  };

  /** seret (pintu: ke samping, kerai: ke atas); ketukan biasa juga dihitung */
  const onDragDown = (e: ReactPointerEvent<HTMLButtonElement>, axis: 'x' | 'y') => {
    if (e.button > 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    drag.current = {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      size: (axis === 'x' ? r.width : r.height) || 1,
      moved: false,
      p: 0,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const onDragMove = (e: ReactPointerEvent<HTMLButtonElement>, axis: 'x' | 'y', set: (p: number) => void, fire: () => void) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dist = axis === 'x' ? Math.abs(e.clientX - d.x0) : Math.max(0, d.y0 - e.clientY);
    if (dist > 6) d.moved = true;
    d.p = Math.min(1, dist / (d.size * (axis === 'x' ? 0.45 : 0.55)));
    set(d.p);
    if (d.p >= 1) {
      drag.current = null;
      fire();
    }
  };
  const onDragUp = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean, set: (p: number) => void, fire: () => void) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (cancelled) return set(0);
    if (!d.moved || d.p > 0.4) fire();
    else set(0);
  };

  /* ── 3. kerai naik, kereta berangkat ── */
  const depart = () => {
    setPhase('ride');
    setNext(stops.length ? 'stop' : 'run');
    setMoving(true);
    setDeparted(true);
    sfx.whoosh();
    haptic(20);
    const r = rail.current;
    if (reduce.current) {
      r.D = r.haltAt + 40;
      apply();
      later(() => setCanTap(true), 400);
      return;
    }
    r.go = true;
    r.watch = () => {
      if (r.D - r.haltAt > 24) {
        r.watch = null;
        setCanTap(true);
      }
    };
  };
  const raiseBlind = () => {
    if (once.current.blind || phaseRef.current !== 'blind') return;
    once.current.blind = true;
    drag.current = null;
    setBlindP(1);
    setBlindUp(true);
    sfx.rustle();
    haptic(14);
    later(whistle, reduce.current ? 150 : 1300);
    later(depart, reduce.current ? 350 : 2100);
  };

  /* ── 4. mampir di tiap stasiun ── */
  const stopAtNext = () => {
    const k = nextStop.current;
    if (k >= stops.length) return;
    setCanTap(false);
    setSignIdx(k);
    const r = rail.current;
    const arrive = () => {
      nextStop.current = k + 1;
      setStopIdx(k);
      setPhase('stop');
      setMoving(false);
      sfx.blow();
      later(() => sfx.chime(), 260);
      haptic(16);
      later(() => setCanTap(true), reduce.current ? 300 : 1100);
    };
    if (reduce.current) {
      r.D += 40;
      r.haltAt = r.D;
      r.v = 0;
      r.go = false;
      apply();
      later(arrive, 200);
      return;
    }
    sfx.tug();
    r.haltAt = r.D + STOP_AHEAD;
    r.target = r.haltAt;
    r.go = false;
    r.onStop = arrive;
  };
  const leave = () => {
    if (leaving) return;
    setCanTap(false);
    setLeaving(true);
    sfx.whoosh();
    haptic(12);
    later(
      () => {
        setLeaving(false);
        setStopIdx(-1);
        setPhase('ride');
        setMoving(true);
        const hasNext = nextStop.current < stops.length;
        setNext(hasNext ? 'stop' : 'run');
        const r = rail.current;
        if (reduce.current) {
          r.D += 40;
          apply();
          if (hasNext) later(stopAtNext, 300);
          else later(() => setCanTap(true), 300);
          return;
        }
        r.go = true;
        r.watch = () => {
          if (r.D - r.haltAt > 26) {
            r.watch = null;
            if (hasNext) stopAtNext();
            else setCanTap(true);
          }
        };
      },
      reduce.current ? 120 : 420,
    );
  };

  /* ── 5. ngebut lewat milestone → terowongan → jembatan ── */
  const toBridge = () => {
    setPhase('bridge');
    setMoving(false);
    sfx.whoosh();
    later(
      () => {
        sfx.success();
        haptic(30);
      },
      reduce.current ? 100 : 700,
    );
    later(() => setCtaOn(true), reduce.current ? 300 : 4600);
  };
  const enterTunnel = () => {
    if (once.current.tunnel) return;
    once.current.tunnel = true;
    setPhase('tunnel');
    setToast(-1);
    sfx.whoosh();
    haptic(20);
    later(() => sfx.whoosh(), 600);
    later(toBridge, reduce.current ? 600 : 1700);
  };
  const startRun = (hold: boolean) => {
    const r = rail.current;
    if (once.current.run) {
      if (hold) r.boost = BOOST_HOLD;
      return;
    }
    if (phaseRef.current !== 'ride' || nextRef.current !== 'run' || !canTapRef.current) return;
    once.current.run = true;
    setPhase('run');
    setCanTap(false);
    whistle();
    haptic(20);
    r.posts = marks.map((_, i) => r.D + 22 + i * POST_GAP);
    r.passed = 0;
    r.tunnelAt = r.D + 22 + marks.length * POST_GAP + 6;
    if (reduce.current) {
      marks.forEach((_, i) =>
        later(
          () => {
            setToast(i);
            sfx.score(i);
          },
          200 + i * 900,
        ),
      );
      later(enterTunnel, 400 + marks.length * 900);
      return;
    }
    r.boost = hold ? BOOST_HOLD : BOOST;
    r.go = true;
    r.watch = () => {
      if (r.passed < r.posts.length && r.D >= r.posts[r.passed] - 9) {
        const i = r.passed;
        r.passed += 1;
        setToast(i);
        sfx.score(i);
        haptic(10);
      }
      if (r.D >= r.tunnelAt - 0.4) {
        r.watch = null;
        enterTunnel();
      }
    };
  };

  /* jendela: kerai diseret, ketuk untuk mampir/lanjut, tahan untuk ngebut */
  const onWinDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0) return;
    const ph = phaseRef.current;
    if (ph === 'blind') return onDragDown(e, 'y');
    if ((ph === 'ride' && nextRef.current === 'run' && canTapRef.current) || ph === 'run') {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* pointer sudah tidak aktif */
      }
      holding.current = true;
      startRun(true);
    }
  };
  const release = () => {
    if (!holding.current) return;
    holding.current = false;
    rail.current.boost = BOOST;
  };
  const onWinUp = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    if (phaseRef.current === 'blind') onDragUp(e, cancelled, setBlindP, raiseBlind);
    release();
  };
  const onWinClick = (e: { detail: number }) => {
    const ph = phaseRef.current;
    // ketukan dari papan ketik (klik dari pointer sudah ditangani di onWinDown/onWinUp)
    if (ph === 'blind') return e.detail === 0 ? raiseBlind() : undefined;
    if (!canTapRef.current) return;
    if (ph === 'ride' && nextRef.current === 'stop') return stopAtNext();
    if (ph === 'stop') return leave();
    if (ph === 'ride' && nextRef.current === 'run' && e.detail === 0) return startRun(false);
  };

  /* ── 6. tiba di Stasiun Hari Ini → mini-game → amplop ── */
  const arrive = () => {
    if (once.current.arrive) return;
    once.current.arrive = true;
    setCtaOn(false);
    setPhase('arrive');
    sfx.whoosh();
    const q = reduce.current;
    later(
      () => {
        sfx.blow();
        haptic(20);
      },
      q ? 100 : 3000,
    );
    later(() => setArrDoors(true), q ? 150 : 3300);
    later(
      () => {
        setBurst((b) => b + 1);
        sfx.chime();
        haptic(26);
      },
      q ? 200 : 3600,
    );
    later(() => setCtaOn(true), q ? 400 : 4800);
  };
  const getOff = () => {
    if (game !== 'off') return;
    setCtaOn(false);
    sfx.pop();
    haptic(12);
    setGame('on');
  };
  const gameDone = () => {
    setGame('done');
    setPhase('letter');
    sfx.chime();
    haptic(15);
  };
  const openLetter = () => {
    if (finale) return;
    sfx.chime();
    haptic(15);
    setFinale(true);
  };

  /* ───────────────────────── tampilan ───────────────────────── */
  const fullFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(tag, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [tag],
  );
  const shortFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(tag, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    [tag],
  );
  const num = (n: number) => n.toLocaleString(tag);
  const pad = (n: number) => String(n).padStart(2, '0');
  const markText = (m: Milestone) => (m.kind === 'years' && m.n === 1 ? t.markYear : fmt(m.kind === 'years' ? t.markYears : t.markDays, { n: num(m.n) }));

  const startName = start ? fullFmt.format(start) : t.firstDay;
  const el = start && counting ? elapsed(start, now) : null;
  const oc = useCountUp(departed, 1800, 400);
  const ac = useCountUp(phase === 'arrive' || phase === 'letter', 1600, 1600);
  const hms = el ? `${pad(el.hours)}:${pad(el.minutes)}:${pad(el.seconds)}` : `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const cur = phase === 'stop' && stopIdx >= 0 ? stops[stopIdx] : null;
  const platformOn = phase === 'ticket' || phase === 'doors' || phase === 'arrive' || phase === 'letter';
  const arrival = phase === 'arrive' || phase === 'letter';
  const playing = game === 'on';
  const visited = phase === 'stop' ? stopIdx + 1 : nextStop.current;
  /** langit jendela: senja saat berangkat, makin malam di tiap stasiun, malam penuh saat ngebut */
  const night = phase === 'run' || phase === 'tunnel' ? 1 : stops.length ? Math.min(0.8, (visited / stops.length) * 0.8) : departed ? 0.5 : 0;
  const names = from ? `${to} & ${from}` : to;
  /** label koper di amplop cukup nama depan (tulisan tangan kecil) */
  const tagName = to.split(/\s+/)[0];
  const dateOf = (m: Milestone) => fullFmt.format(m.date);

  // jam stasiun
  const secs = now.getSeconds();
  const mins = now.getMinutes() + secs / 60;
  const hrs = (now.getHours() % 12) + mins / 60;

  const clock = (
    <div className={s.clock} aria-hidden>
      <Sprite name="anniversary-jam-peron" className={s.clockArt} />
      <svg className={s.hands} viewBox="-50 -50 100 100">
        <path d="M-2.6,6L-1.4,-24L1.4,-24L2.6,6Z" fill="#1b2a4e" transform={`rotate(${hrs * 30})`} />
        <path d="M-1.9,7L-1,-36L1,-36L1.9,7Z" fill="#1b2a4e" transform={`rotate(${mins * 6})`} />
        <g transform={`rotate(${secs * 6})`}>
          <path d="M0,10V-38" stroke="#a8243a" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="0" cy="-27" r="2.6" fill="#a8243a" />
        </g>
        <circle r="3.2" fill="#c99a3e" stroke="#4a300a" strokeWidth="0.8" />
      </svg>
    </div>
  );

  /* ── peron (awal & tiba) ── */
  let platform = null;
  if (platformOn) {
    const signName = arrival ? t.today : startName;
    const signSub = arrival ? (el ? fmt(t.dayN, { n: num(el.dayNumber) }) : t.route) : t.km0;
    platform = (
      <div className={cx(s.platform, boarding && s.boarding, arrival && s.arrival)}>
        {/* uap lokomotif yang tak kelihatan, mengepul dari kiri */}
        <div className={s.steam} aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <i key={i} style={{ '--i': i } as CSSProperties} />
          ))}
        </div>
        <div className={cx(s.train, arrival && s.trainIn)}>
          <Sprite name="anniversary-gerbong" className={s.car} />
          <div
            className={cx(s.door, (doorsOpen || arrDoors) && s.doorOpen, drag.current && phase === 'doors' && s.dragging)}
            style={{ '--dp': arrival ? (arrDoors ? 1 : 0) : doorP } as CSSProperties}
          >
            <Sprite name="anniversary-pintu" className={cx(s.leaf, s.leafL)} />
            <Sprite name="anniversary-pintu" className={cx(s.leaf, s.leafR)} />
          </div>
          <span className={cx(s.doorGlow, (doorsOpen || arrDoors) && s.on)} aria-hidden />
        </div>
        <span className={cx(s.spill, (doorsOpen || arrDoors) && s.on)} aria-hidden />
        <Sprite name="anniversary-peron" className={s.floor} />
        <span className={cx(s.col, s.colL)} aria-hidden />
        <span className={cx(s.col, s.colR)} aria-hidden />
        <Sprite name="anniversary-atap" className={s.canopy} />
        <span className={s.lampGlow} aria-hidden />
        {arrival ? (
          <div className={s.festoon} aria-hidden>
            <svg viewBox="0 0 244 140" preserveAspectRatio="none">
              <path d={`M${FESTOON.map(([x, y]) => `${(x * 10).toFixed(1)},${(y * 10).toFixed(1)}`).join('L')}`} fill="none" stroke="#1a1410" strokeWidth="1.4" />
            </svg>
            {FESTOON.map(([x, y], i) => (
              <i key={i} style={{ left: `${x}em`, top: `${y}em`, '--i': i } as CSSProperties} />
            ))}
          </div>
        ) : null}
        <StationSign small={t.station} name={signName} sub={signSub} className={s.hangSign} />
        {arrival ? (
          <>
            <span className={cx(s.garland, s.garlandL)} aria-hidden>
              <Sprite name="daun-2" className={s.gLeaf1} />
              <Sprite name="daun-4" className={s.gLeaf2} />
              <Sprite name="bunga-kamboja-pink" className={s.gFlower} />
            </span>
            <span className={cx(s.garland, s.garlandR)} aria-hidden>
              <Sprite name="daun-4" className={s.gLeaf1} />
              <Sprite name="daun-2" className={s.gLeaf2} />
              <Sprite name="bunga-kamboja" className={s.gFlower} />
            </span>
          </>
        ) : null}
        {clock}

        {phase === 'ticket' || phase === 'doors' || phase === 'letter' ? <Sprite name="anniversary-bangku" className={cx(s.bench, phase === 'letter' && s.benchIn)} /> : null}

        {phase === 'ticket' || phase === 'doors' ? (
          <button
            ref={ticketRef}
            type="button"
            className={cx(s.ticket, punched && s.punched, phase === 'doors' && s.ticketAway)}
            onClick={punch}
            disabled={punched}
            aria-label={fmt(t.punchLabel, { to })}
          >
            <Sprite name="anniversary-karcis" className={s.tkArt} />
            <span className={s.tkBand}>
              <b>{t.line}</b>
              <i>{t.ticketNo}</i>
            </span>
            <span className={s.tkBody}>
              <span className={s.tkFor}>{t.ticketFor}</span>
              <b className={cx(s.tkName, to.length > 10 && s.long, to.length > 15 && s.xl)}>{to}</b>
              <span className={s.tkRoute}>
                {start ? shortFmt.format(start) : t.firstDay} <em>→</em> {t.today}
              </span>
              <span className={s.tkMeta}>{t.ticketMeta}</span>
              {from ? <span className={cx(s.tkFrom, from.length > 14 && s.long)}>{fmt(t.ticketFrom, { from })}</span> : null}
            </span>
            <span className={s.tkPunch}>{t.punchHere}</span>
            {punched ? (
              <>
                <span className={s.hole} aria-hidden />
                <span className={s.chad} aria-hidden />
                <span className={s.stamp} aria-hidden>
                  <b>{t.stamp}</b>
                  <i>{t.stampSub}</i>
                </span>
              </>
            ) : null}
          </button>
        ) : null}

        {phase === 'doors' && !doorsOpen ? (
          <button
            ref={doorHitRef}
            type="button"
            className={s.doorHit}
            aria-label={t.doorsLabel}
            onPointerDown={(e) => onDragDown(e, 'x')}
            onPointerMove={(e) => onDragMove(e, 'x', setDoorP, openDoors)}
            onPointerUp={(e) => onDragUp(e, false, setDoorP, openDoors)}
            onPointerCancel={(e) => onDragUp(e, true, setDoorP, openDoors)}
            onClick={(e) => {
              if (e.detail === 0) openDoors();
            }}
          />
        ) : null}

        {arrival ? (
          <div className={cx(s.board, phase === 'letter' && s.boardAway, playing && s.boardHide)} aria-live="polite">
            <Sprite name="anniversary-papan-besar" className={s.boardArt} />
            <div className={s.boardFace}>
              <span className={s.bWelcome}>{t.welcome}</span>
              <span className={s.bStation}>{t.todayStation}</span>
              <span className={s.bRule} aria-hidden />
              <b className={cx(s.bTitle, (title || t.titleFallback).length > 24 && s.long, (title || t.titleFallback).length > 34 && s.xl)}>
                {title || fmt(t.titleFallback, { to })}
              </b>
              <em className={cx(s.bNames, names.length > 24 && s.long)}>{names}</em>
            </div>
            <div
              className={s.boardPanel}
              role="timer"
              aria-label={el ? `${t.counterLabel} ${el.years} ${t.years}, ${el.months} ${t.months}, ${el.days} ${t.days}` : `${t.nowTime} ${hms}`}
            >
              {el && diff > 0 ? (
                <>
                  <div className={s.tiles} aria-hidden>
                    {(
                      [
                        [el.years, t.years],
                        [el.months, t.months],
                        [el.days, t.days],
                      ] as const
                    ).map(([v, l], i) => (
                      <span key={i} className={s.tile}>
                        <b>{Math.round(v * ac)}</b>
                        <i>{l}</i>
                      </span>
                    ))}
                  </div>
                  <div className={s.panelLine} aria-hidden>
                    {el.exact ? (el.years === 1 ? t.exactOne : fmt(t.exact, { y: el.years })) : todayMark ? markText(todayMark) : fmt(t.dayN, { n: num(el.dayNumber) })} ·{' '}
                    <b key={hms}>{hms}</b>
                  </div>
                </>
              ) : (
                <div className={s.panelPlain} aria-hidden>
                  {el ? <b className={s.panelFirst}>{t.firstToday}</b> : null}
                  <span>{t.nowTime}</span>
                  <Digits value={hms} className={s.panelDigits} />
                  {start && !counting ? (
                    <em>
                      {fmt(t.futureLine, {
                        n: num(-diff),
                        date: fullFmt.format(start),
                      })}
                    </em>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {phase === 'letter' ? (
          <button ref={envRef} type="button" className={s.envelope} onClick={openLetter} aria-label={fmt(t.letterLabel, { to })} disabled={finale}>
            <span className={s.envGlow} aria-hidden />
            <Sprite name="anniversary-amplop" className={s.envArt} />
            <span className={cx(s.envTag, tagName.length > 9 && s.long)}>{fmt(t.letterTag, { to: tagName })}</span>
          </button>
        ) : null}
      </div>
    );
  }

  /* ── kabin ── */
  let cabin = null;
  if (cabinOn) {
    const signName = signIdx < 0 ? startName : t.stations[signIdx % t.stations.length];
    const signSub = signIdx < 0 ? t.km0 : fmt(t.stopOf, { i: signIdx + 1, n: stops.length });
    cabin = (
      <div className={cx(s.cabin, moving && s.moving, phase === 'tunnel' && s.inTunnel)}>
        <div className={s.rig}>
          <div
            ref={winRef}
            className={cx(s.win, phase === 'tunnel' && s.dark)}
            style={
              {
                '--night': night,
                '--rain': night < 0.65 && departed ? 1 : 0,
              } as CSSProperties
            }
          >
            <span className={s.skyDusk} aria-hidden />
            <span className={s.skyNight} aria-hidden />
            <span className={s.winStars} aria-hidden />
            <div ref={farRef} className={cx(s.layer, s.far)} aria-hidden>
              <Sprite name="anniversary-jauh" />
              <Sprite name="anniversary-jauh" />
            </div>
            <div ref={midRef} className={cx(s.layer, s.mid)} aria-hidden>
              <Sprite name="anniversary-sawah" />
              <Sprite name="anniversary-sawah" />
            </div>
            <div ref={nearRef} className={cx(s.layer, s.near)} aria-hidden>
              <Sprite name="anniversary-dekat" />
              <Sprite name="anniversary-dekat" />
            </div>
            <div ref={haltRef} className={s.halt}>
              <Sprite name="anniversary-halte" className={s.haltArt} />
              <StationSign small={t.station} name={signName} sub={signSub} className={s.haltSign} />
            </div>
            {marks.map((m, i) => (
              <div
                key={`post${i}`}
                ref={(node) => {
                  postRefs.current[i] = node;
                }}
                className={s.post}
                aria-hidden
              >
                <Sprite name="anniversary-patok" className={s.postArt} />
                <span className={s.postLabel}>
                  <b className={cx(String(m.n).length > 3 && s.long)}>{num(m.n)}</b>
                  <i>{m.kind === 'days' ? t.unitDays : t.unitYear}</i>
                </span>
              </div>
            ))}
            <div ref={portalRef} className={s.portal} aria-hidden>
              <Sprite name="anniversary-terowongan" className={s.portalArt} />
            </div>
            <span className={s.tunnelDark} aria-hidden />
            <div ref={rainRef} className={s.rain} aria-hidden>
              <span />
            </div>
            <span className={s.glass} aria-hidden />
            <div className={cx(s.blind, blindUp && s.blindUp, drag.current && phase === 'blind' && s.dragging)} style={{ '--bp': blindP } as CSSProperties} aria-hidden>
              <Sprite name="anniversary-tirai" className={s.blindArt} />
            </div>
          </div>
          <Sprite name="anniversary-kabin" className={s.cabinArt} />
          <span className={s.tunnelShade} aria-hidden />
          <Sprite name="anniversary-lampu" className={cx(s.sconce, s.sconceL)} />
          <Sprite name="anniversary-lampu" className={cx(s.sconce, s.sconceR)} />

          {/* odometer kuningan: waktu bersama, hidup terus */}
          <div className={s.odo} role="timer" aria-label={el ? `${t.together} ${num(el.totalSeconds > 0 ? diff : 0)} ${t.days}` : `${t.nowTime} ${hms}`}>
            <span className={s.odoLabel}>{el ? t.together : t.nowTime}</span>
            <span className={s.odoRow}>
              {el ? (
                <>
                  <Digits value={num(Math.round(diff * oc))} />
                  <span className={s.odoUnit}>{t.days}</span>
                </>
              ) : null}
              <span className={s.odoTime}>{departed || !el ? hms : '00:00:00'}</span>
            </span>
          </div>

          {toast >= 0 && marks[toast] ? (
            <div key={`toast${toast}`} className={s.toast} role="status">
              <span>{t.passing}</span>
              <b>{markText(marks[toast])}</b>
              <i>{dateOf(marks[toast])}</i>
            </div>
          ) : null}

          {phase === 'ride' && departed && nextStop.current === 0 && !once.current.run ? (
            <p className={s.slipDepart}>
              {fmt(t.departSlip, {
                start: start ? fullFmt.format(start) : t.firstDay,
              })}
            </p>
          ) : null}

          {cur ? (
            <div key={`stop${stopIdx}`} className={cx(s.memory, leaving && s.out)} aria-live="polite">
              {cur.photo ? (
                <figure className={cx(s.print, !cur.note && s.printSolo)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cur.photo} alt={fmt(t.photoAlt, { i: stopIdx + 1 })} draggable={false} />
                  {cur.cap ? <figcaption className={cx(cur.cap.length > 34 && s.long, cur.cap.length > 58 && s.xl)}>{cur.cap}</figcaption> : null}
                </figure>
              ) : null}
              {cur.note ? <p className={cx(s.slip, !cur.photo && s.slipWide, cur.note.length > 44 && s.long)}>{cur.note}</p> : null}
            </div>
          ) : null}

          {phase !== 'tunnel' ? (
            <button
              ref={winHitRef}
              type="button"
              className={s.winHit}
              aria-label={phase === 'blind' ? t.blindLabel : phase === 'stop' ? t.leaveLabel : next === 'run' ? t.runLabel : t.windowLabel}
              onPointerDown={onWinDown}
              onPointerMove={(e) => (phaseRef.current === 'blind' ? onDragMove(e, 'y', setBlindP, raiseBlind) : undefined)}
              onPointerUp={(e) => onWinUp(e, false)}
              onPointerCancel={(e) => onWinUp(e, true)}
              onPointerLeave={release}
              onContextMenu={(e) => e.preventDefault()}
              onClick={onWinClick}
            />
          ) : null}
        </div>
      </div>
    );
  }

  /* ── jembatan: momen "wah" ── */
  let bridge = null;
  if (phase === 'bridge') {
    const big = el ? (diff > 0 ? fmt(t.bridgeDays, { n: num(diff) }) : t.bridgeFirst) : t.bridgePlain;
    bridge = (
      <div className={s.bridge}>
        <span className={s.flash} aria-hidden />
        <div className={s.twinkles} aria-hidden>
          {Array.from({ length: 14 }, (_, i) => (
            <i
              key={i}
              style={
                {
                  left: `${(i * 37) % 97}%`,
                  top: `${(i * 23) % 52}%`,
                  '--i': i,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div className={s.lanterns} aria-hidden>
          {LANTERNS.map(([x, d, dur, sway, sc], i) => (
            <span
              key={i}
              style={
                {
                  left: `${x}%`,
                  '--d': `${d}s`,
                  '--dur': `${dur}s`,
                  '--sway': `${sway}em`,
                  '--sc': sc,
                } as CSSProperties
              }
            >
              <Sprite name="anniversary-lampion" className={s.lanternArt} />
            </span>
          ))}
        </div>
        <div className={s.fireworks} aria-hidden>
          {FIREWORKS.map(([x, y, d, c, r], i) => (
            <span
              key={i}
              className={s.fw}
              style={
                {
                  left: `${x}%`,
                  top: `${y}%`,
                  '--d': `${d}s`,
                  '--c': c,
                  '--r': `${r}em`,
                } as CSSProperties
              }
            >
              <i className={s.trail} />
              <i className={s.bloom} />
              {SPARKS.map((a, k) => (
                <b
                  key={a}
                  style={
                    {
                      '--a': `${a}deg`,
                      '--k': k % 2 ? 0.66 : 1,
                    } as CSSProperties
                  }
                />
              ))}
            </span>
          ))}
        </div>
        <Sprite name="anniversary-jembatan" className={s.vista} />
        <div className={s.bTrain} aria-hidden>
          <span className={s.beam} />
          <Sprite name="anniversary-kereta" className={s.bTrainArt} />
          <span className={s.puffs}>
            {[0, 1, 2, 3, 4].map((i) => (
              <i key={i} style={{ '--i': i } as CSSProperties} />
            ))}
          </span>
        </div>
        <div className={s.skyText} aria-live="polite">
          <p className={s.skyEyebrow}>{t.bridgeEyebrow}</p>
          <p className={s.skyBig}>{big}</p>
          <p className={s.skySub}>{t.bridgeSub}</p>
        </div>
        {!ctaOn ? <button type="button" className={s.skipHit} onClick={() => setCtaOn(true)} aria-label={t.skipLabel} /> : null}
      </div>
    );
  }

  /* ── petunjuk ── */
  let hint = null;
  if (!finale && !playing) {
    if (phase === 'ticket' && ready && !punched) hint = <Hint key="hPunch">{t.hintPunch}</Hint>;
    else if (phase === 'doors' && !doorsOpen) hint = <Hint key="hDoors">{t.hintDoors}</Hint>;
    else if (phase === 'blind' && !blindUp) hint = <Hint key="hBlind">{t.hintBlind}</Hint>;
    else if (phase === 'ride' && canTap)
      hint = <Hint key={`hRide${next}${nextStop.current}`}>{next === 'run' ? t.hintRun : nextStop.current === 0 ? t.hintStopFirst : t.hintStop}</Hint>;
    else if (phase === 'stop' && canTap && !leaving) hint = <Hint key={`hStop${stopIdx}`}>{stopIdx + 1 < stops.length ? t.hintStop : t.hintLast}</Hint>;
    else if (phase === 'letter') hint = <Hint key="hLetter">{t.hintLetter}</Hint>;
  }

  let cue = null;
  if (!finale && !playing) {
    if (phase === 'ticket' && ready && !punched) cue = <TapCue key="cPunch" target={ticketRef} at={{ x: 0.845, y: 0.6 }} delay={2200} />;
    else if (phase === 'doors' && !doorsOpen) cue = <TapCue key="cDoors" target={doorHitRef} kind="drag" dir={{ x: 3, y: 0 }} at={{ x: 0.5, y: 0.45 }} delay={1800} />;
    else if (phase === 'blind' && !blindUp) cue = <TapCue key="cBlind" target={winHitRef} kind="drag" dir={{ x: 0, y: -3.5 }} at={{ x: 0.5, y: 0.72 }} delay={1800} />;
    else if (phase === 'ride' && canTap)
      cue =
        next === 'run' ? (
          <TapCue key="cRun" target={winHitRef} kind="hold" at={{ x: 0.5, y: 0.45 }} delay={2400} />
        ) : (
          <TapCue key={`cRide${nextStop.current}`} target={winHitRef} at={{ x: 0.62, y: 0.42 }} delay={2400} />
        );
    else if (phase === 'stop' && canTap && !leaving) cue = <TapCue key={`cStop${stopIdx}`} target={winHitRef} at={{ x: 0.62, y: 0.3 }} delay={4200} />;
    else if ((phase === 'bridge' || phase === 'arrive') && ctaOn) cue = <TapCue key={`cCta${phase}`} target={ctaRef} delay={phase === 'bridge' ? 3600 : 4200} />;
    else if (phase === 'letter') cue = <TapCue key="cLetter" target={envRef} at={{ x: 0.42, y: 0.45 }} delay={2400} />;
  }

  return (
    <div className={cx(s.wrap, ready && s.ready, finale && s.over)}>
      {platform}
      {cabin}
      {bridge}
      {phase === 'blind' ? <span key="flashIn" className={s.flashIn} aria-hidden /> : null}
      {phase === 'arrive' || (phase === 'letter' && !finale) ? (
        <div className={s.petals} aria-hidden>
          <Petals kinds={['putih', 'pink']} count={8} />
        </div>
      ) : null}

      {!finale && !playing && ctaOn && (phase === 'bridge' || phase === 'arrive') ? (
        <div className={s.foot}>
          {phase === 'arrive' ? <p className={s.announce}>{t.announce}</p> : null}
          <button key={`cta${phase}`} ref={ctaRef} type="button" className={s.cta} onClick={phase === 'bridge' ? arrive : getOff}>
            {phase === 'bridge' ? t.toArrive : t.getOff} <span aria-hidden>→</span>
          </button>
        </div>
      ) : null}

      {hint}
      {cue}

      <Confetti burst={burst} shapes="hearts" count={70} origin={{ x: 0.5, y: 0.3 }} colors={['#f0b44c', '#fff3da', '#f29aa5', '#c8372d', '#ffd98a']} />
      <Confetti burst={burst} count={50} origin={{ x: 0.5, y: 0.36 }} colors={['#fbf5e6', '#f0b44c', '#f1d58a', '#f29aa5', '#9fb2e8']} />

      {playing ? <SleepyEngine t={t.game} onDone={gameDone} /> : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja-pink"
          theme={{
            backdrop: BACKDROP,
            ink: '#f8ecd4',
            paper: '#fffaf0',
            paperInk: '#3b2a22',
          }}
          onReplay={onReplay}
        >
          {el ? <div className={s.finaleCount}>{fmt(t.finaleCount, { n: num(el.dayNumber) })}</div> : null}
        </Finale>
      ) : null}
    </div>
  );
}
