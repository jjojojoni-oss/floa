'use client';

import { type CSSProperties, Fragment, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Sprite, Stage, TapCue, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { CloudGame } from './Game';
import { TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BACKDROP = '/art/bg-bolakaca.webp';
const SKIES = ['pagi', 'siang', 'senja', 'malam'];
const ART = [
  'bg-bolakaca',
  ...SKIES.map((n) => `bolakaca-langit-${n}`),
  'bolakaca-dunia',
  'bolakaca-dunia-malam',
  'bolakaca-kaca',
  'bolakaca-debu',
  'bolakaca-alas',
  'bolakaca-pita',
  'bolakaca-pita-simpul',
  'bolakaca-kunci',
  'kelopak-pink',
  'kelopak-putih',
];
/** baru dibutuhkan belakangan: dimuat diam-diam setelah adegan pertama tampil */
const LATE = ['bolakaca-bulan', 'bolakaca-lampion', 'bolakaca-bawah', 'bolakaca-surat', 'game-bolakaca-awan', 'game-bolakaca-rumah', 'bunga-kamboja-pink'];

/**
 * ribbon → bola kaca berdebu di ambang jendela, berpita kado: pitanya diketuk, simpulnya lepas
 * dust   → kaca diusap (atau diketuk tiga kali): debunya terhapus di bawah jari
 * shake  → bola diayun kiri-kanan (atau diketuk): kelopak & kilau berputar di dalam kaca lalu turun pelan;
 *          sesudahnya satu kalimat tertulis di langit dunia mungilnya. Tiap kocokan memajukan waktu di dalam
 *          bola: pagi → siang → senja → malam (kunang-kunang, jendela menyala)
 * plate  → pelat kuningan di alas mengukir judul huruf demi huruf
 * wind   → kunci kecil di alas diputar (seret melingkar atau ketuk): momen "wah": rumah kecilnya menyala,
 *          lampu untai hidup satu-satu, lampion-lampion kecil naik menembus kaca; lalu awan kecil iseng datang
 * game   → mini-game awan iseng
 * flip   → bola dibalik (ketuk)
 * under  → bagian bawah alas: surat terlipat diketuk → surat
 */
type Phase = 'ribbon' | 'dust' | 'shake' | 'plate' | 'wind' | 'glow' | 'game' | 'flip' | 'under';

const TICKS = 4;
const STEP = 90;
/** frasa kotak musik saat kunci diputar penuh (indeks tangga nada sfx.note) */
const TUNE = [4, 2, 4, 5, 7, 5, 4, 2, 3, 4];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** nilai di antara titik-titik per jam (0 pagi, 1 siang, 2 senja, 3 malam) */
const seg = (stops: number[], p: number) => {
  const i = Math.max(0, Math.min(stops.length - 2, Math.floor(p)));
  return stops[i] + (stops[i + 1] - stops[i]) * (p - i);
};
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixHex = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
};
/** posisi matahari di langit bola (persen kotak dalam): terbit di kiri, tinggi di siang, tenggelam di kanan */
function sunAt(p: number) {
  const a = Math.PI * (0.92 - 0.42 * Math.min(p, 2.7));
  return { x: 50 + Math.cos(a) * 34, y: 50 + (0.25 - Math.sin(a) * 1.05) * 50 };
}
const SUN = ['#fff1cc', '#fffdf2', '#ffb06a'];

/** lampion yang naik menembus kaca: [x em lukisan, jeda s, lama s, goyang em, skala] */
const LANTERNS: [number, number, number, number, number][] = [
  [11.6, 0, 8.4, 0.8, 1.2],
  [13.4, 0.45, 9.6, -0.9, 0.95],
  [10.2, 0.95, 9, -0.6, 0.8],
  [14.6, 1.45, 8.8, 0.7, 1.1],
  [12.4, 1.9, 10, 0.9, 0.7],
  [9.4, 2.4, 9.2, 0.5, 1],
  [13.9, 2.9, 9.8, -0.7, 0.85],
  [11.8, 3.4, 8.6, -0.5, 1.15],
  [10.8, 3.9, 9.4, 0.6, 0.75],
  [14.2, 4.4, 9, -0.4, 1],
  [12.9, 4.9, 9.6, 0.5, 0.9],
];
/** kunang-kunang di padang (persen kotak dalam) */
const FLIES: [number, number, number, number][] = [
  [18, 70, 0, 4.2],
  [30, 64, -1.4, 5],
  [64, 66, -2.6, 4.6],
  [78, 72, -0.8, 5.4],
  [46, 78, -3.2, 4.4],
  [86, 62, -2, 5.2],
  [12, 76, -3.8, 4.8],
  [56, 60, -1.2, 5.6],
];
/** lampu untai: di bawah atap rumah lalu menyambung ke dahan kamboja (persen kotak dalam) */
const BULBS: [number, number][] = [
  [29.4, 61.2],
  [33.4, 62],
  [37.4, 62.4],
  [41.4, 62.4],
  [45.4, 62.4],
  [49.4, 62.4],
  [53.4, 62],
  [57.4, 61.2],
  [61.6, 59.4],
  [65.2, 57.2],
  [68.6, 55.6],
  [72, 54.8],
  [75.4, 55.4],
  [78.8, 57],
];

/* ───────────── kelopak & kilau di dalam kaca ───────────── */

/** gd = kedalaman di rumput tempat ia mendarat (supaya kelopak tersebar di padang, tidak berjajar di satu garis) */
type Flake = { x: number; y: number; vx: number; vy: number; a: number; s: number; k: number; ph: number; c: number; gd: number };
type Snow = { drag: (dx: number) => void; release: () => void; tap: () => void; kick: (k: number) => void; flip: () => void; stop: () => void };
/** permukaan rumput di dalam bola (satuan jari-jari, pusat bola = 0,0) */
const ground = (x: number) => 0.53 + 0.14 * x * x + 0.02 * x;
const GLITTER = ['#fff4c2', '#ffffff', '#ffd1e0', '#f6d38a'];

/**
 * Fisika kecil di kanvas: tiap partikel merasakan gravitasi (diputar mengikuti bola), gaya semu dari percepatan
 * bola yang diayun, pusaran yang menguat dengan guncangan, dan hambatan air. Kelopak melayang-layang, kilau
 * turun lebih pelan. Bola sendiri ikut bergoyang mengikuti jari (atau ayunan otomatis saat diketuk).
 */
function startSnow(canvas: HTMLCanvasElement, globe: HTMLElement, reduce: boolean): Snow | null {
  const g = canvas.getContext('2d');
  if (!g) return null;
  const imgs = ['kelopak-pink', 'kelopak-putih'].map((n) => {
    const im = new Image();
    im.src = `/art/${n}.webp`;
    im.onload = () => wake();
    return im;
  });
  const flakes: Flake[] = Array.from({ length: 80 }, (_, i) => {
    const x = (Math.random() * 2 - 1) * 0.6;
    const k = i < 34 ? 0 : 1;
    const gd = Math.random() * 0.12;
    return { x, y: ground(x) + gd, vx: 0, vy: 0, a: Math.random() * 6.28, s: k ? 0.6 + Math.random() * 0.9 : 0.75 + Math.random() * 0.5, k, ph: Math.random() * 6.28, c: i % 4, gd };
  });
  let size = 0;
  let R = 1;
  let dpr = 1;
  let X = 0;
  let V = 0;
  let A = 0;
  let dragX: number | null = null;
  let auto = -1;
  let flipT = -1;
  let E = 0;
  let dir = 1;
  let raf = 0;
  let last = 0;
  let t = 0;
  let running = false;

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    size = r.width;
    R = r.width / 2;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.width * dpr);
    wake();
  };

  const draw = () => {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, size, size);
    for (const f of flakes) {
      const px = (f.x + 1) * R;
      const py = (f.y + 1) * R;
      if (f.k === 0) {
        const im = imgs[f.c % 2];
        if (!im.complete || !im.naturalWidth) continue;
        const h = R * 0.145 * f.s;
        const w = h * 0.727;
        const rest = Math.abs(f.vx) + Math.abs(f.vy) < 0.02;
        g.save();
        g.translate(px, py);
        g.rotate(f.a);
        g.scale(rest ? 1 : 0.35 + 0.65 * Math.abs(Math.cos(t * 2.4 + f.ph)), rest ? 0.62 : 1);
        g.globalAlpha = 0.95;
        g.drawImage(im, -w / 2, -h / 2, w, h);
        g.restore();
      } else {
        const r = R * 0.017 * f.s;
        g.globalAlpha = 0.55 + 0.45 * Math.sin(t * 5 + f.ph);
        g.fillStyle = GLITTER[f.c];
        g.beginPath();
        g.moveTo(px, py - r * 1.8);
        g.lineTo(px + r * 0.45, py - r * 0.45);
        g.lineTo(px + r * 1.8, py);
        g.lineTo(px + r * 0.45, py + r * 0.45);
        g.lineTo(px, py + r * 1.8);
        g.lineTo(px - r * 0.45, py + r * 0.45);
        g.lineTo(px - r * 1.8, py);
        g.lineTo(px - r * 0.45, py - r * 0.45);
        g.closePath();
        g.fill();
      }
    }
    g.globalAlpha = 1;
  };

  const tick = (now: number) => {
    const dt = Math.min(0.034, Math.max(0.001, (now - last) / 1000));
    last = now;
    t += dt;
    // posisi bola: mengikuti jari, ayunan otomatis, atau pegas kembali ke tengah
    let nx: number;
    if (auto >= 0) {
      auto += dt;
      nx = 0.22 * R * Math.sin(2 * Math.PI * 3 * auto) * Math.exp(-2.2 * auto);
      if (auto > 1.4) auto = -1;
    } else if (dragX !== null) {
      nx = X + (dragX - X) * Math.min(1, dt * 22);
    } else {
      const acc = -120 * X - 14 * V;
      nx = X + (V + acc * dt) * dt;
    }
    const nv = (nx - X) / dt;
    A = A * 0.6 + ((nv - V) / dt) * 0.4;
    V = nv;
    X = nx;
    let Y = 0;
    let flip = 0;
    if (flipT >= 0) {
      flipT = Math.min(1, flipT + dt / 0.95);
      flip = 180 * (flipT < 0.5 ? 2 * flipT * flipT : 1 - Math.pow(-2 * flipT + 2, 2) / 2);
      Y = -Math.sin(Math.PI * flipT) * 0.32 * R;
    }
    const rot = flip + (X / R) * 14;
    if (!reduce) globe.style.transform = `translate3d(${X.toFixed(2)}px, ${Y.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg)`;

    const an = reduce ? 0 : A / R;
    E = Math.min(2.6, E * Math.exp(-1.05 * dt) + Math.abs(an) * dt * 0.09);
    if (Math.abs(V) > R * 0.05) dir = V > 0 ? -1 : 1;
    const th = (rot * Math.PI) / 180;
    const cs = Math.cos(th);
    const sn = Math.sin(th);
    let moving = false;
    for (const f of flakes) {
      const G = f.k ? 0.56 : 0.95;
      const kd = f.k ? 2.4 : 1.8;
      // gravitasi + gaya semu percepatan bola, dalam kerangka bola
      let ax = G * sn - an * 0.06 * cs;
      let ay = G * cs + an * 0.06 * sn;
      if (E > 0.01) {
        // pusaran (menyinggung lingkaran), ditarik sedikit ke tengah supaya tidak menempel di kaca, lalu aduk acak
        const r = Math.hypot(f.x, f.y) || 1;
        const pull = E * 2.2 * Math.max(0, r - 0.45);
        const lift = Math.min(1.4, E) * G * (0.8 + 0.5 * Math.sin(t * 1.7 + f.ph));
        ax += (-f.y / r) * E * 1.5 * dir - (f.x / r) * pull + Math.sin(t * 2.3 + f.ph * 1.7 + f.y * 3) * E * 1.8;
        ay += (f.x / r) * E * 1.5 * dir - (f.y / r) * pull + Math.cos(t * 1.9 + f.ph + f.x * 3) * E * 1.8 - lift;
      }
      if (f.k === 0 && f.vy > 0.05) ax += Math.sin(t * 3.1 + f.ph) * 0.7;
      f.vx += ax * dt;
      f.vy += ay * dt;
      const damp = Math.exp(-kd * dt);
      f.vx *= damp;
      f.vy *= damp;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      if (f.k === 0) f.a += (f.vx * 2.4 + f.vy * 0.6 + (Math.abs(f.vy) > 0.05 ? Math.sin(t * 2 + f.ph) * 0.8 : 0)) * dt;
      // dinding kaca
      const r = Math.hypot(f.x, f.y);
      const lim = 0.93;
      if (r > lim) {
        const ux = f.x / r;
        const uy = f.y / r;
        f.x = ux * lim;
        f.y = uy * lim;
        const vn = f.vx * ux + f.vy * uy;
        if (vn > 0) {
          f.vx -= 1.4 * vn * ux;
          f.vy -= 1.4 * vn * uy;
        }
      }
      // rumput (hanya saat bola tegak)
      if (cs > 0.6) {
        const gy = ground(f.x) + f.gd;
        if (f.y > gy) {
          f.y = gy;
          if (f.vy > 0) f.vy = 0;
          f.vx *= Math.exp(-7 * dt);
        }
      }
      if (Math.abs(f.vx) + Math.abs(f.vy) > 0.006) moving = true;
    }
    draw();
    const still = !moving && auto < 0 && dragX === null && Math.abs(X) < 0.3 && Math.abs(V) < 2 && E < 0.02 && (flipT < 0 || flipT >= 1);
    if (still) {
      running = false;
      return;
    }
    raf = requestAnimationFrame(tick);
  };

  /** sentakan: kelopak yang rebah di rumput terlempar ke atas, pusarannya menguat */
  function kick(k: number) {
    if (reduce) return;
    E = Math.min(2.6, E + 1.1 * k);
    for (const f of flakes) {
      const low = f.y > ground(f.x) + f.gd - 0.08 ? 1 : 0.35;
      f.vy -= (0.5 + Math.random() * 1.1) * k * low;
      f.vx += (Math.random() - 0.5) * 1.2 * k;
    }
  }

  function wake() {
    if (running || !size) {
      if (!size) draw();
      return;
    }
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  return {
    drag(dx) {
      dragX = Math.max(-0.32 * R, Math.min(0.32 * R, dx));
      wake();
    },
    release() {
      dragX = null;
      wake();
    },
    tap() {
      auto = 0;
      kick(1);
      wake();
    },
    kick(k) {
      kick(k);
      wake();
    },
    flip() {
      flipT = 0;
      wake();
    },
    stop() {
      cancelAnimationFrame(raf);
      running = false;
      ro.disconnect();
    },
  };
}

/* ───────────── template ───────────── */

export default function BolaKaca(props: TemplateProps) {
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
  const title = data.title.trim() || t.titleFallback;
  const chars = useMemo(() => Array.from(title), [title]);

  /** kalimat ke-i berpasangan dengan foto ke-i (dipasangkan dulu, baru yang kosong dibuang) */
  const items = useMemo(() => {
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
  const N = items.length;

  const [phase, setPhase] = useState<Phase>('ribbon');
  const [untied, setUntied] = useState(false);
  const [clean, setClean] = useState(false);
  /** jumlah kocokan yang sudah dihitung (= kalimat yang diminta); menentukan jam di dalam bola */
  const [shakes, setShakes] = useState(0);
  /** kalimat yang sedang tertulis di langit */
  const [note, setNote] = useState<number | null>(null);
  const [settling, setSettling] = useState(false);
  const [engraved, setEngraved] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [lit, setLit] = useState(false);
  const [rain, setRain] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [letterOut, setLetterOut] = useState(false);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);
  const [shine, setShine] = useState(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const snowRef = useRef<HTMLCanvasElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const hitRef = useRef<HTMLButtonElement>(null);
  const bowRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef<HTMLButtonElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const letterRef = useRef<HTMLButtonElement>(null);
  const snow = useRef<Snow | null>(null);
  const reduce = useRef(false);
  const phaseRef = useRef<Phase>('ribbon');
  phaseRef.current = phase;
  const shakesRef = useRef(0);
  const revealId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clicksRef = useRef(0);
  /** usapan debu: progres 0..1, gerak terakhir, waktu bunyi terakhir */
  const wipe = useRef({ p: 0, id: -1, lx: 0, ly: 0, moved: false, sound: 0, taps: 0 });
  /** ayunan: pointer, posisi awal, jarak tempuh, sudah dihitung sebagai kocokan */
  const swing = useRef<{ id: number; x0: number; lx: number; travel: number; turns: number; dir: number; counted: boolean } | null>(null);
  const wind = useRef<{ id: number; cx: number; cy: number; last: number; acc: number } | null>(null);
  /** seret baru saja terjadi: klik yang menyusul diabaikan */
  const dragged = useRef(false);

  const ms = (v: number, r = 0.2) => (reduce.current ? Math.round(v * r) : v);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (!ready) return;
    [...LATE.map((n) => `/art/${n}.webp`), ...items.map((it) => it.photo).filter((p): p is string => !!p)].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [ready, items]);

  // kelopak & kilau
  useEffect(() => {
    if (!ready || !snowRef.current || !globeRef.current) return;
    const api = startSnow(snowRef.current, globeRef.current, reduce.current);
    snow.current = api;
    return () => {
      api?.stop();
      snow.current = null;
    };
  }, [ready]);

  // debu di kaca: dilukis ke kanvas, lalu dihapus di bawah jari
  useEffect(() => {
    const cv = dustRef.current;
    if (!ready || !cv) return;
    const im = new Image();
    im.src = '/art/bolakaca-debu.webp';
    const paint = () => {
      const r = cv.getBoundingClientRect();
      if (!r.width || !im.complete || !im.naturalWidth) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      const g = cv.getContext('2d');
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.globalAlpha = 1 - wipe.current.p * 0.8;
      g.drawImage(im, 0, 0, r.width, r.height);
      g.globalAlpha = 1;
    };
    im.onload = paint;
    const ro = new ResizeObserver(paint);
    ro.observe(cv);
    return () => ro.disconnect();
  }, [ready]);

  /* ── 1. pita ── */
  const untie = () => {
    if (untied || phaseRef.current !== 'ribbon') return;
    setUntied(true);
    sfx.untie();
    haptic(18);
    later(() => sfx.rustle(), ms(420));
    later(() => setPhase('dust'), ms(1200));
  };

  /* ── 2. debu ── */
  const eraseAt = (x: number, y: number, r: number) => {
    const cv = dustRef.current;
    const g = cv?.getContext('2d');
    if (!cv || !g) return;
    const dpr = cv.width / (cv.getBoundingClientRect().width || 1);
    g.save();
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.globalCompositeOperation = 'destination-out';
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, 'rgba(0,0,0,0.95)');
    grd.addColorStop(0.6, 'rgba(0,0,0,0.6)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
    g.restore();
  };
  const finishWipe = () => {
    if (clean) return;
    setClean(true);
    setShine((v) => v + 1);
    sfx.chime();
    haptic(20);
    later(() => setPhase('shake'), ms(1500));
  };
  const addWipe = (amount: number) => {
    const w = wipe.current;
    if (w.p >= 1) return;
    w.p = Math.min(1, w.p + amount);
    const now = performance.now();
    if (now - w.sound > 240) {
      w.sound = now;
      sfx.rustle();
      haptic(6);
    }
    if (w.p >= 1) finishWipe();
  };
  /** ketukan: satu sapuan lebar melintasi kaca */
  const swipe = () => {
    const cv = dustRef.current;
    if (!cv) return;
    const W = cv.getBoundingClientRect().width;
    const k = wipe.current.taps++ % 3;
    const y0 = [0.3, 0.52, 0.72][k];
    const steps = reduce.current ? 1 : 14;
    for (let i = 0; i <= steps; i++) {
      const u = steps === 1 ? 0.5 : i / steps;
      const draw = () => eraseAt(W * (0.08 + u * 0.84), W * (y0 + Math.sin(u * Math.PI) * -0.07 + (k - 1) * 0.02), W * 0.2);
      if (steps === 1) {
        for (let j = 0; j <= 10; j++) eraseAt(W * (0.08 + (j / 10) * 0.84), W * y0, W * 0.2);
      } else later(draw, i * 18);
    }
    addWipe(0.34);
  };

  /* ── 3. kocok ── */
  const reveal = (i: number) => {
    setNote(i);
    setSettling(false);
    sfx.note([2, 4, 5, 7, 4][i % 5]);
    later(() => sfx.note([4, 5, 7, 9, 7][i % 5]), 160);
    haptic(10);
    if (i >= N - 1) {
      const read = Math.min(5200, Math.max(2600, items[i].note.length * 55));
      later(() => phaseRef.current === 'shake' && setPhase('plate'), ms(read, 0.35));
    }
  };
  /** kalimat berikutnya muncul setelah kelopaknya turun; tiap gerakan baru menunda sedikit */
  const scheduleReveal = (wait = 2800) => {
    if (revealId.current) clearTimeout(revealId.current);
    const i = shakesRef.current - 1;
    revealId.current = later(() => {
      revealId.current = null;
      reveal(i);
    }, ms(wait, 0.2));
  };
  const countShake = () => {
    if (phaseRef.current !== 'shake') return;
    if (revealId.current) {
      // masih berputar: tunggu lagi, tanpa menghitung kocokan baru
      scheduleReveal();
      return;
    }
    if (shakesRef.current >= N) return;
    shakesRef.current += 1;
    setShakes(shakesRef.current);
    setNote(null);
    setSettling(true);
    sfx.whoosh();
    haptic(16);
    scheduleReveal();
  };
  const tapShake = () => {
    if (phaseRef.current !== 'shake') return;
    snow.current?.tap();
    countShake();
  };

  /* ── gestur di bola (pita, debu, kocok, balik) ── */
  const onDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0) return;
    dragged.current = false;
    const ph = phaseRef.current;
    if (ph === 'dust' && !clean) {
      wipe.current = { ...wipe.current, id: e.pointerId, lx: e.clientX, ly: e.clientY, moved: false };
    } else if (ph === 'shake') {
      swing.current = { id: e.pointerId, x0: e.clientX, lx: e.clientX, travel: 0, turns: 0, dir: 0, counted: false };
    } else return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const w = wipe.current;
    if (phaseRef.current === 'dust' && w.id === e.pointerId && !clean) {
      const dist = Math.hypot(e.clientX - w.lx, e.clientY - w.ly);
      if (dist < 3) return;
      const cv = dustRef.current;
      const r = cv?.getBoundingClientRect();
      if (r) {
        // sapuan bersambung, bukan titik-titik
        const n = Math.ceil(dist / 6);
        for (let i = 1; i <= n; i++) {
          const x = w.lx + ((e.clientX - w.lx) * i) / n - r.left;
          const y = w.ly + ((e.clientY - w.ly) * i) / n - r.top;
          eraseAt(x, y, r.width * 0.13);
        }
        if (dist > 2) {
          w.moved = true;
          dragged.current = true;
        }
        addWipe(dist / (r.width * 3.4));
      }
      w.lx = e.clientX;
      w.ly = e.clientY;
      return;
    }
    const sw = swing.current;
    if (phaseRef.current === 'shake' && sw && sw.id === e.pointerId) {
      const dx = e.clientX - sw.lx;
      if (Math.abs(dx) < 1) return;
      const d = Math.sign(dx);
      if (sw.dir && d !== sw.dir && Math.abs(dx) > 1.5) {
        sw.turns += 1;
        snow.current?.kick(0.45);
      }
      sw.dir = d;
      sw.travel += Math.abs(dx);
      sw.lx = e.clientX;
      if (sw.travel > 8) dragged.current = true;
      snow.current?.drag(e.clientX - sw.x0);
      const size = globeRef.current?.getBoundingClientRect().width || 300;
      if (!sw.counted && (sw.travel > size * 0.9 || (sw.turns >= 1 && sw.travel > size * 0.45))) {
        sw.counted = true;
        countShake();
      } else if (sw.counted && revealId.current) scheduleReveal();
    }
  };
  const onUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (wipe.current.id === e.pointerId) wipe.current.id = -1;
    const sw = swing.current;
    if (sw && sw.id === e.pointerId) {
      swing.current = null;
      snow.current?.release();
      // ayunan pendek yang belum dihitung tetap dihitung saat dilepas, asal cukup jauh
      if (!sw.counted && sw.travel > (globeRef.current?.getBoundingClientRect().width || 300) * 0.3) countShake();
    }
  };
  const onTap = () => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    const ph = phaseRef.current;
    if (ph === 'ribbon') untie();
    else if (ph === 'dust' && !clean) swipe();
    else if (ph === 'shake') tapShake();
    else if (ph === 'flip') turnOver();
  };

  /* ── 4. pelat kuningan diukir ── */
  useEffect(() => {
    if (phase !== 'plate') return;
    if (reduce.current) {
      setEngraved(chars.length);
      later(() => setPhase('wind'), 900);
      return;
    }
    let n = 0;
    const step = () => {
      n += 1;
      setEngraved(n);
      if (n % 2) sfx.tap();
      if (n < chars.length) later(step, chars[n - 1] === ' ' ? 40 : 85);
      else {
        later(() => {
          sfx.chime();
          haptic(14);
        }, 200);
        later(() => setPhase('wind'), 1900);
      }
    };
    later(step, 1100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ── 5. kunci diputar ── */
  const wound = () => {
    if (phaseRef.current !== 'wind') return;
    setPhase('glow');
    setLit(true);
    setNote(null);
    sfx.chime();
    haptic(30);
    later(() => {
      sfx.success();
      setBurst((v) => v + 1);
    }, ms(700));
    TUNE.forEach((n, i) => later(() => sfx.note(n), ms(1500 + i * 260, 0.1)));
    later(() => setRain(true), ms(6200, 0.3));
  };
  const click = () => {
    if (phaseRef.current !== 'wind' || clicksRef.current >= TICKS) return;
    const n = clicksRef.current + 1;
    clicksRef.current = n;
    setClicks(n);
    sfx.tap();
    sfx.score(n);
    haptic(8);
    if (n >= TICKS) later(wound, ms(260));
  };
  const onWindDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0 || phase !== 'wind') return;
    dragged.current = false;
    const r = e.currentTarget.getBoundingClientRect();
    const cxp = r.left + r.width / 2;
    const cyp = r.top + r.height / 2;
    wind.current = { id: e.pointerId, cx: cxp, cy: cyp, last: Math.atan2(e.clientY - cyp, e.clientX - cxp), acc: 0 };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const onWindMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const w = wind.current;
    if (!w || w.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - w.cx, e.clientY - w.cy) < 6) return;
    const a = Math.atan2(e.clientY - w.cy, e.clientX - w.cx);
    let d = ((a - w.last) * 180) / Math.PI;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    w.last = a;
    if (Math.abs(d) < 0.4) return;
    dragged.current = true;
    setSpinning(false);
    const step = Math.abs(d);
    setAngle((v) => v + step);
    w.acc += step;
    while (w.acc >= STEP) {
      w.acc -= STEP;
      click();
    }
  };
  const onWindUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (wind.current?.id === e.pointerId) wind.current = null;
  };
  const tapWind = () => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    if (phase !== 'wind' || clicksRef.current >= TICKS) return;
    setSpinning(true);
    setAngle((v) => v + STEP);
    click();
  };

  /* ── 6. game, balik, surat ── */
  const toGame = () => {
    if (phaseRef.current !== 'glow') return;
    sfx.tap();
    setPhase('game');
  };
  const gameDone = () => {
    setRain(false);
    setPhase('flip');
    sfx.whoosh();
  };
  function turnOver() {
    if (flipped || phaseRef.current !== 'flip') return;
    setFlipped(true);
    snow.current?.flip();
    sfx.whoosh();
    haptic(20);
    later(() => sfx.bonk(), ms(900, 0.1));
    later(() => setPhase('under'), ms(1350, 0.2));
  }
  const openLetter = () => {
    if (letterOut || phaseRef.current !== 'under') return;
    setLetterOut(true);
    sfx.rustle();
    haptic(16);
    later(() => {
      sfx.chime();
      setFinale(true);
    }, ms(1100, 0.3));
  };

  /* ── tampilan: jam di dalam bola ── */
  const p = N ? (3 * shakes) / N : 3;
  const tod = Math.min(3, Math.floor(p + 0.25));
  const sun = sunAt(p);
  const sunColor = p <= 1 ? mixHex(SUN[0], SUN[1], p) : mixHex(SUN[1], SUN[2], Math.min(1, p - 1));
  const dayWorld = {
    opacity: 1 - clamp01((p - 2.2) / 0.8),
    filter: `sepia(${seg([0.1, 0, 0.42, 0.3], p).toFixed(3)}) saturate(${seg([1, 1.06, 1.22, 1], p).toFixed(3)}) hue-rotate(${seg([0, 0, -14, -14], p).toFixed(1)}deg) brightness(${seg([1.03, 1.05, 0.9, 0.62], p).toFixed(3)})`,
  };
  const night = p > 2.45;
  const glowOn = p >= 2.7 || lit;
  const skyInk = p < 1.6 ? s.inkDay : p < 2.45 ? s.inkEve : s.inkNight;

  const inShake = phase === 'shake';
  const shownCount = note === null ? shakes - (settling ? 1 : 0) : note + 1;
  const say =
    phase === 'ribbon'
      ? t.sayRibbon
      : phase === 'dust'
        ? clean
          ? t.sayClean
          : t.sayDust
        : phase === 'shake'
          ? settling
            ? t.saySettle
            : shownCount <= 0
              ? t.sayShake
              : t.sayTime[tod]
          : phase === 'plate'
            ? t.sayPlate
            : phase === 'wind'
              ? t.sayWind
              : phase === 'glow'
                ? rain
                  ? t.sayRain
                  : t.sayGlow
                : t.sayFlip;
  const item = note === null ? null : items[note];
  const hitOn = phase === 'ribbon' || (phase === 'dust' && !clean) || (inShake && shakes <= N) || (phase === 'flip' && !flipped);
  const hitLabel = phase === 'ribbon' ? t.ribbonLabel : phase === 'dust' ? t.dustLabel : phase === 'flip' ? t.flipLabel : t.shakeLabel;
  const under = phase === 'under';

  return (
    <div className={cx(s.wrap, ready && s.ready, night && s.night, lit && s.lit, under && s.down, finale && s.over)} ref={wrapRef}>
      {/* kamar ikut berganti jam: senja menghangat, malam meredup, bola tetap terang */}
      <span className={s.eve} style={{ opacity: Math.max(0, 1 - Math.abs(p - 2)) * 0.9 }} aria-hidden />
      <span className={s.dark} style={{ opacity: clamp01(p - 2) }} aria-hidden />

      <div className={cx(s.world, phase === 'plate' && !reduce.current && s.zoom)} aria-hidden={under || finale || undefined}>
        <span className={s.contact} aria-hidden />
        <span className={s.rays} aria-hidden />

        <div ref={globeRef} className={cx(s.globe, untied && s.untied, flipped && s.flipped)}>
          <div className={s.inside}>
            {SKIES.map((n, i) => (
              <Sprite key={n} name={`bolakaca-langit-${n}`} className={s.sky} style={{ opacity: i === 0 ? 1 : clamp01(p - (i - 1)) }} />
            ))}
            <span className={s.sun} style={{ left: `${sun.x}%`, top: `${sun.y}%`, opacity: 1 - clamp01((p - 2.2) / 0.45), '--sun': sunColor } as CSSProperties} />
            <Sprite name="bolakaca-bulan" className={s.moon} style={{ opacity: clamp01((p - 2.3) / 0.5) }} />
            <Sprite name="bolakaca-dunia" className={s.land} style={dayWorld} />
            <Sprite name="bolakaca-dunia-malam" className={s.land} style={{ opacity: clamp01((p - 2.2) / 0.8) }} />
            <span className={cx(s.window, glowOn && s.windowOn)} />
            <span className={s.bulbs} aria-hidden>
              {BULBS.map(([x, y], i) => (
                <i key={i} style={{ left: `${x}%`, top: `${y}%`, transitionDelay: `${0.3 + i * 0.09}s` }} />
              ))}
            </span>
            <span className={cx(s.flies, glowOn && s.fliesOn)} aria-hidden>
              {FLIES.map(([x, y, d, dur], i) => (
                <i key={i} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s`, animationDuration: `${dur}s` }} />
              ))}
            </span>
            {rain && phase === 'glow' ? (
              <span className={s.drizzle} aria-hidden>
                <Sprite name="game-bolakaca-awan" className={s.drizzleCloud} />
                <i />
              </span>
            ) : null}
            <canvas ref={snowRef} className={s.snow} />
          </div>
          <Sprite name="bolakaca-kaca" className={s.glass} />
          {/* kalimat di langit: di atas lapisan kaca supaya kilau kacanya tidak menutupi huruf */}
          <div className={cx(s.sayNote, skyInk)} aria-live="polite">
            {item && item.note ? <SkyText key={note} text={item.note} /> : null}
          </div>
          <span key={shine} className={cx(s.shine, shine > 0 && s.shineGo)} aria-hidden />
          <canvas ref={dustRef} className={cx(s.dust, clean && s.dustGone)} />

          <Sprite name="bolakaca-alas" className={s.base} />
          <div className={cx(s.plate, phase === 'plate' && s.plateLive, engraved > 0 && s.plateOn)}>
            <span className={cx(s.engr, chars.length > 15 && s.long, chars.length > 22 && s.xl)}>
              {chars.map((ch, i) => (
                <span key={i} className={cx(s.ch, i < engraved && s.cut)}>
                  {ch}
                </span>
              ))}
            </span>
          </div>
          <span className={s.ticks} aria-hidden>
            {Array.from({ length: TICKS }, (_, i) => (
              <i key={i} className={cx(i < clicks && s.on)} />
            ))}
          </span>
          <button
            ref={keyRef}
            type="button"
            className={cx(s.key, phase === 'wind' && s.keyLive)}
            disabled={phase !== 'wind'}
            tabIndex={phase === 'wind' ? 0 : -1}
            aria-label={t.windLabel}
            onPointerDown={onWindDown}
            onPointerMove={onWindMove}
            onPointerUp={onWindUp}
            onPointerCancel={onWindUp}
            onClick={tapWind}
          >
            <span className={cx(s.keyTurn, spinning && s.snap)} style={{ transform: `rotate(${angle}deg)` }}>
              <Sprite name="bolakaca-kunci" className={s.fill} />
            </span>
          </button>

          {/* pita kado + label */}
          <Sprite name="bolakaca-pita" className={s.bands} />
          <div ref={bowRef} className={s.bow}>
            <Sprite name="bolakaca-pita-simpul" className={s.fill} />
          </div>
          <span className={s.tag}>
            <b>{fmt(t.tag, { to })}</b>
          </span>
        </div>

        {/* lampion yang naik menembus kaca */}
        {lit && (phase === 'glow' || phase === 'game') ? (
          <div className={s.lanterns} aria-hidden>
            {LANTERNS.map(([x, delay, dur, sway, sc], i) => (
              <span key={i} className={s.lantern} style={{ left: `${x}em`, animationDelay: `${delay}s`, animationDuration: `${dur}s`, '--sway': sway, '--k': sc } as CSSProperties}>
                <Sprite name="bolakaca-lampion" className={s.fill} />
              </span>
            ))}
          </div>
        ) : null}

        {hitOn ? (
          <button
            ref={hitRef}
            type="button"
            className={cx(s.hit, phase === 'shake' && s.hitShake, phase === 'dust' && s.hitDust)}
            aria-label={hitLabel}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onClick={onTap}
          />
        ) : null}
      </div>

      {/* foto kecil yang melayang di samping bola bersama kalimatnya */}
      {item && item.photo && !under ? (
        <span key={`ph${note}`} className={cx(s.photo, (note ?? 0) % 2 ? s.photoR : s.photoL)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.photo} alt={fmt(t.photoAlt, { i: (note ?? 0) + 1 })} draggable={false} />
        </span>
      ) : null}

      {!under && phase !== 'game' && !finale ? (
        <div className={s.head}>
          <span className={s.eyebrow}>{t.eyebrow}</span>
          <b className={cx(s.name, to.length > 11 && s.long, to.length > 16 && s.xl)}>{to}</b>
          <p key={say} className={s.say} role="status">
            {say}
          </p>
          {inShake && N > 1 ? (
            <span className={s.pips} aria-hidden>
              {items.map((_, i) => (
                <i key={i} className={cx(i < shownCount && s.on)} />
              ))}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* bagian bawah alas: surat terlipat */}
      {under && !finale ? (
        <div className={s.under}>
          <span className={s.underEyebrow}>{t.underEyebrow}</span>
          <p key={letterOut ? 'f' : 'l'} className={s.underLine}>
            {letterOut ? fmt(t.underFound, { to }) : t.underLine}
          </p>
          <div className={s.tray}>
            <Sprite name="bolakaca-bawah" className={s.fill} />
            <button ref={letterRef} type="button" className={cx(s.letter, letterOut && s.letterOut)} disabled={letterOut} aria-label={t.letterLabel} onClick={openLetter}>
              <Sprite name="bolakaca-surat" className={s.fill} />
            </button>
          </div>
        </div>
      ) : null}

      {phase === 'glow' && rain && !finale ? (
        <div className={s.foot}>
          <button ref={ctaRef} type="button" className={s.cta} onClick={toGame}>
            {t.toGame} <span aria-hidden>→</span>
          </button>
        </div>
      ) : null}

      {phase === 'ribbon' && ready ? <Hint key="hRibbon">{t.hintRibbon}</Hint> : null}
      {phase === 'dust' && !clean ? <Hint key="hDust">{t.hintDust}</Hint> : null}
      {inShake && !settling && shakes < N ? <Hint key="hShake">{t.hintShake}</Hint> : null}
      {phase === 'wind' ? <Hint key="hWind">{t.hintWind}</Hint> : null}
      {phase === 'flip' && !flipped ? <Hint key="hFlip">{t.hintFlip}</Hint> : null}
      {under && !letterOut ? <Hint key="hLetter">{t.hintLetter}</Hint> : null}

      {finale ? null : phase === 'ribbon' ? (
        ready ? <TapCue key="cueRibbon" target={bowRef} delay={2200} at={{ x: 0.5, y: 0.4 }} /> : null
      ) : phase === 'dust' ? (
        !clean ? <TapCue key="cueDust" target={hitRef} kind="drag" dir={{ x: 3.6, y: 0.4 }} at={{ x: 0.36, y: 0.36 }} delay={2000} /> : null
      ) : phase === 'shake' ? (
        !settling && shakes < N ? <TapCue key={`cueShake${shakes}`} target={hitRef} kind="drag" dir={{ x: 3.4, y: 0 }} at={{ x: 0.4, y: 0.4 }} delay={shakes === 0 ? 1800 : 5200} /> : null
      ) : phase === 'wind' ? (
        <TapCue key="cueWind" target={keyRef} delay={2000} />
      ) : phase === 'glow' ? (
        rain ? <TapCue key="cueGame" target={ctaRef} delay={3200} /> : null
      ) : phase === 'flip' ? (
        !flipped ? <TapCue key="cueFlip" target={hitRef} delay={2200} at={{ x: 0.5, y: 0.4 }} /> : null
      ) : phase === 'under' ? (
        !letterOut ? <TapCue key="cueLetter" target={letterRef} delay={2200} /> : null
      ) : null}

      <Confetti burst={burst} count={70} origin={{ x: 0.5, y: 0.36 }} colors={['#fff4cc', '#f1d58a', '#ffd1e0', '#fffdf5', '#d9578a']} />

      {phase === 'game' ? <CloudGame t={t.game} onDone={gameDone} /> : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja-pink"
          theme={{
            bg: `linear-gradient(180deg, rgba(20, 30, 62, 0.62), rgba(30, 42, 80, 0.46) 46%, rgba(20, 28, 58, 0.62)), url(${BACKDROP})`,
            ink: '#f3f6fb',
            paper: '#fffaf2',
            paperInk: '#22324a',
          }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}

/** Kalimat yang "ditulis" di langit: huruf demi huruf muncul seperti asap pesawat, kata tidak terpotong. */
function SkyText({ text }: { text: string }) {
  const words = useMemo(() => {
    let k = 0;
    return text.split(/\s+/).map((w) => Array.from(w).map((ch) => ({ ch, i: k++ })));
  }, [text]);
  const total = words.reduce((a, w) => a + w.length, 0);
  const per = Math.max(18, Math.min(32, 1700 / Math.max(1, total)));
  return (
    <p className={cx(s.skyText, total > 36 && s.long, total > 52 && s.xl)}>
      {words.map((w, wi) => (
        <Fragment key={wi}>
          {wi ? ' ' : null}
          <span className={s.word}>
            {w.map(({ ch, i }) => (
              <span key={i} className={s.glyph} style={{ animationDelay: `${(i * per) / 1000}s` }}>
                {ch}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </p>
  );
}
