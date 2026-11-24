'use client';

import { type CSSProperties, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Sprite, Stage, TapCue, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { ShyCapsule } from './Game';
import { type GachaText, TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BACKDROP = '/art/bg-gacha.webp';
const COLORS = ['koral', 'kuning', 'toska', 'lila', 'biru', 'jingga'] as const;
type Color = (typeof COLORS)[number] | 'emas';
const ART = [
  'bg-gacha',
  'gacha-mesin',
  'gacha-kaca',
  'gacha-kenop',
  'gacha-koin',
  'gacha-nampan',
  'gacha-laci',
  'gacha-bawah',
  'gacha-bawah-emas',
  'gacha-atas-emas',
  ...COLORS.map((c) => `gacha-atas-${c}`),
];

/**
 * coin   → mesin kapsul dengan koin emas di nampan; koin diseret ke lubangnya (atau diketuk)
 * turn   → kenop diputar satu putaran penuh (seret melingkar, atau ketuk); tiap 45° berbunyi klik
 * drop   → kubah bergetar, satu kapsul hilang dari tumpukan
 * jam    → (sekali) kapsulnya nyangkut di mulut corong: mesin digoyang dua kali
 * ready  → kapsul menunggu di corong; diketuk untuk dibuka
 * open   → dua belahan terpisah, secarik catatan (dan foto) keluar; diketuk untuk disimpan ke nampan
 * gold   → kapsul terakhir, emas: isinya ucapan utama, dengan sinar dan konfeti
 * game   → mini-game kapsul pemalu
 * drawer → laci hadiah ditarik, amplopnya naik → surat
 */
type Phase = 'coin' | 'turn' | 'drop' | 'jam' | 'ready' | 'open' | 'gold' | 'game' | 'drawer';

/**
 * Tumpukan kapsul di dalam kubah. x/y = jarak dari pusat kubah dalam satuan lukisan (kanvas mesin 600×944,
 * pusat kubah 300,290; lihat art/sprites/61-gacha.js). order = urutan keluar (-1 hiasan, 99 kapsul emas).
 */
const PILE: { x: number; y: number; rot: number; color: Color; order: number }[] = [
  { x: -38, y: 150, rot: 20, color: 'jingga', order: -1 },
  { x: 38, y: 150, rot: -30, color: 'koral', order: -1 },
  { x: -114, y: 88, rot: 40, color: 'lila', order: -1 },
  { x: -38, y: 88, rot: -12, color: 'kuning', order: -1 },
  { x: 38, y: 88, rot: 70, color: 'toska', order: -1 },
  { x: 114, y: 88, rot: -50, color: 'biru', order: -1 },
  { x: -152, y: 26, rot: 14, color: 'biru', order: 4 },
  { x: -76, y: 26, rot: -60, color: 'koral', order: -1 },
  { x: 76, y: 26, rot: 32, color: 'jingga', order: 5 },
  { x: 152, y: 26, rot: -24, color: 'lila', order: 3 },
  { x: -95, y: -38, rot: 50, color: 'kuning', order: 1 },
  { x: -15, y: -46, rot: -18, color: 'toska', order: 2 },
  { x: 70, y: -38, rot: 96, color: 'koral', order: 0 },
  { x: 0, y: 26, rot: 8, color: 'emas', order: 99 },
];

type Item = { note: string; photo: string | null; color: Color };

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Kapsul utuh: belahan bawah (bening / emas) + belahan atas berwarna, dua lukisan di kanvas yang sama. */
function Capsule({ color, className, style }: { color: Color; className?: string; style?: CSSProperties }) {
  return (
    <span className={cx(s.cap, className)} style={style}>
      <Sprite name={color === 'emas' ? 'gacha-bawah-emas' : 'gacha-bawah'} />
      <Sprite name={`gacha-atas-${color}`} />
    </span>
  );
}

export default function Gacha(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BACKDROP}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

/**
 * Kapsul yang sedang dibuka, di depan mesin. Kapsul naik dari corong, bergetar, lalu dua belahannya
 * terpisah dan isinya keluar. `fresh` = baru keluar dari mesin (false = dibaca ulang dari nampan).
 */
function Reveal({
  item,
  index,
  n,
  gold,
  fresh,
  title,
  to,
  from,
  t,
  mode,
  target,
  onOpened,
  onDone,
}: {
  item: Item;
  index: number;
  n: number;
  gold: boolean;
  fresh: boolean;
  title: string;
  to: string;
  from: string;
  t: GachaText;
  mode: TemplateProps['mode'];
  /** slot nampan tujuan belahan kapsul ini */
  target: () => HTMLElement | null;
  onOpened?: () => void;
  onDone: () => void;
}) {
  const later = useTimers();
  const [st, setSt] = useState<'in' | 'open' | 'out'>(fresh ? 'in' : 'open');
  /** isi sudah sempat terlihat: baru boleh disimpan (supaya ketukan beruntun tidak melewatkannya) */
  const [armed, setArmed] = useState(!fresh);
  const [fly, setFly] = useState<{ x: number; y: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const cbs = useRef({ onOpened, onDone });
  cbs.current = { onOpened, onDone };

  useEffect(() => {
    if (!fresh) return;
    const quick = reduced();
    later(() => {
      setSt('open');
      sfx.pop();
      haptic(gold ? 30 : 16);
      if (gold) sfx.success();
      else later(() => sfx.note(index), 160);
      cbs.current.onOpened?.();
    }, quick ? 90 : 860);
    later(() => setArmed(true), quick ? 220 : gold ? 2100 : 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!gold || !armed || mode === 'preview') return;
    const id = setTimeout(() => ctaRef.current?.focus({ preventScroll: true }), 300);
    return () => clearTimeout(id);
  }, [gold, armed, mode]);

  const leave = () => {
    if (st !== 'open' || !armed) return;
    const quick = reduced();
    const r = root.current?.getBoundingClientRect();
    const tr = fresh ? target()?.getBoundingClientRect() : null;
    if (r && tr) setFly({ x: tr.left + tr.width / 2 - (r.left + r.width / 2), y: tr.top + tr.height / 2 - (r.top + r.height * 0.41) });
    setSt('out');
    sfx.whoosh();
    haptic(10);
    later(() => cbs.current.onDone(), quick ? 60 : fresh ? 440 : 240);
  };

  const color: Color = gold ? 'emas' : item.color;
  return (
    <div
      ref={root}
      className={cx(s.rv, s[`rv_${st}`], gold && s.rvGold, !gold && item.photo ? s.hasPhoto : null, !fresh && s.rvReview)}
      style={fly ? ({ '--kx': `${fly.x}px`, '--ky': `${fly.y}px` } as CSSProperties) : undefined}
    >
      <span className={s.rvScrim} aria-hidden />
      {gold ? (
        <span className={s.rays} aria-hidden>
          <i />
        </span>
      ) : (
        <button type="button" className={s.rvHit} aria-label={fresh ? t.keepLabel : t.close} onClick={leave} />
      )}
      <div className={s.rvBody}>
        {gold ? (
          <div className={s.rvCard} role="status">
            <div className={s.goldCard}>
              <span className={s.goldEyebrow}>{t.goldEyebrow}</span>
              <b className={cx(s.goldTitle, title.length > 22 && s.long, title.length > 34 && s.xl)}>{title}</b>
              <span className={s.goldRule} aria-hidden />
              <em className={cx(s.goldFor, to.length > 14 && s.long)}>{fmt(t.goldFor, { to })}</em>
              {from ? <em className={cx(s.goldFrom, from.length > 14 && s.long)}>{fmt(t.goldFrom, { from })}</em> : null}
              <span className={s.goldRare}>{t.goldRare}</span>
            </div>
          </div>
        ) : (
          <div className={s.rvCard} role="status">
            <div className={s.slip}>
              <span className={s.slipNo}>{fmt(t.capOf, { i: index + 1, n })}</span>
              {item.photo ? (
                <span className={s.slipPhoto}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.photo} alt={fmt(t.photoAlt, { i: index + 1 })} draggable={false} />
                </span>
              ) : (
                <Sprite name={index % 2 ? 'bunga-kamboja' : 'bunga-kamboja-pink'} className={s.slipFlower} />
              )}
              {item.note ? <p className={cx(s.slipNote, item.note.length > 44 && s.long)}>{item.note}</p> : null}
            </div>
          </div>
        )}
        <span className={cx(s.rvHalf, s.rvBot)} aria-hidden>
          <Sprite name={gold ? 'gacha-bawah-emas' : 'gacha-bawah'} />
        </span>
        <span className={cx(s.rvHalf, s.rvTop)} aria-hidden>
          <Sprite name={`gacha-atas-${color}`} />
        </span>
      </div>
      {gold ? (
        armed && st === 'open' ? (
          <div className={s.foot}>
            <button ref={ctaRef} type="button" className={s.cta} onClick={leave}>
              {t.goldNext} <span aria-hidden>→</span>
            </button>
          </div>
        ) : null
      ) : (
        <p className={cx(s.rvKeep, armed && st === 'open' && s.on)} aria-hidden>
          {fresh ? t.keep : t.close}
        </p>
      )}
      {gold && armed && st === 'open' ? <TapCue key="cueGold" target={ctaRef} delay={3600} /> : null}
    </div>
  );
}

type Drag = { id: number; x0: number; y0: number; moved: boolean };

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const t = TEXT[useLocale()];
  const later = useTimers();
  const ready = useArtReady(ART);

  const to = data.to.trim() || t.you;
  const from = data.from.trim();
  const title = data.title.trim() || t.goldFallback;

  /** kapsul ke-i = kalimat ke-i + foto ke-i (dipasangkan dulu, baru yang kosong dua-duanya dilewati) */
  const items = useMemo(() => {
    const out: Item[] = [];
    const count = Math.min(6, Math.max(data.notes.length, data.photos.length));
    for (let i = 0; i < count; i++) {
      const note = (data.notes[i] ?? '').trim();
      const photo = data.photos[i] || null;
      if (note || photo) out.push({ note, photo, color: COLORS[out.length % COLORS.length] });
    }
    // belum ada isi sama sekali: mesinnya tetap punya satu kapsul sebelum yang emas
    if (!out.length) out.push({ note: t.emptyNote, photo: null, color: COLORS[0] });
    return out;
  }, [data.notes, data.photos, t.emptyNote]);
  const n = items.length;
  const total = n + 1;
  /** kapsul kedua sengaja nyangkut (kalau kapsulnya cukup banyak untuk bercanda) */
  const jamAt = n >= 2 ? 1 : -1;

  const [phase, setPhase] = useState<Phase>('coin');
  const [coin, setCoin] = useState<'rest' | 'drag' | 'fly' | 'in' | 'gone'>('rest');
  const [paid, setPaid] = useState(false);
  /** kapsul yang sedang dikerjakan (n = kapsul emas) */
  const [cur, setCur] = useState(0);
  /** berapa kapsul yang sudah keluar dari kubah / sudah tersimpan di nampan */
  const [out, setOut] = useState(0);
  const [kept, setKept] = useState(0);
  const [rumble, setRumble] = useState(false);
  const [nudges, setNudges] = useState(0);
  const [view, setView] = useState<{ i: number; fresh: boolean } | null>(null);
  const [say, setSay] = useState<string | null>(null);
  const [game, setGame] = useState<'off' | 'on' | 'done'>('off');
  const [drawer, setDrawer] = useState<'shut' | 'open' | 'up'>('shut');
  /** seberapa jauh laci sedang ditarik (0..1) */
  const [pull, setPull] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);

  const phaseRef = useRef<Phase>('coin');
  const machineRef = useRef<HTMLDivElement>(null);
  const pileRef = useRef<HTMLDivElement>(null);
  const coinRef = useRef<HTMLButtonElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const knobHit = useRef<HTMLButtonElement>(null);
  const capRef = useRef<HTMLButtonElement>(null);
  const nudgeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLButtonElement>(null);
  const readRef = useRef<HTMLButtonElement>(null);
  const slots = useRef<(HTMLButtonElement | null)[]>([]);
  const cd = useRef<Drag | null>(null);
  const coff = useRef({ x: 0, y: 0 });
  /** kenop: sudut tampil, putaran terkumpul sejak kapsul terakhir, takik klik terakhir */
  const angle = useRef(0);
  const acc = useRef(0);
  const notch = useRef(0);
  const kd = useRef<(Drag & { a: number }) | null>(null);
  const spin = useRef(0);
  const nd = useRef<Drag | null>(null);
  const dd = useRef<Drag | null>(null);

  const go = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };
  const q = (ms: number, fast: number) => (reduced() ? fast : ms);

  useEffect(() => () => cancelAnimationFrame(spin.current), []);

  // foto kapsul disiapkan selagi koin & kenop dimainkan
  useEffect(() => {
    items.forEach((it) => {
      if (!it.photo) return;
      const img = new Image();
      img.src = it.photo;
    });
    ['gacha-laci-dalam', 'gacha-amplop', 'game-gacha-pot'].forEach((name) => {
      const img = new Image();
      img.src = `/art/${name}.webp`;
    });
  }, [items]);

  // fokus mengikuti tombol "baca surat" (pengguna papan ketik / pembaca layar)
  useEffect(() => {
    if (mode === 'preview' || drawer !== 'up') return;
    const id = setTimeout(() => readRef.current?.focus({ preventScroll: true }), 600);
    return () => clearTimeout(id);
  }, [drawer, mode]);

  /* ── 1. koin ── */
  const moveCoin = (x: number, y: number, extra = '') => {
    coff.current = { x, y };
    if (coinRef.current) coinRef.current.style.transform = `translate(${x}px, ${y}px) ${extra}`;
  };
  const slotDelta = () => {
    const c = coinRef.current?.getBoundingClientRect();
    const sl = slotRef.current?.getBoundingClientRect();
    if (!c || !sl) return null;
    return { x: sl.left + sl.width / 2 - (c.left + c.width / 2), y: sl.top + sl.height / 2 - (c.top + c.height / 2), size: c.width };
  };
  const insertCoin = () => {
    if (phaseRef.current !== 'coin' || coin === 'fly' || coin === 'in' || coin === 'gone') return;
    const d = slotDelta();
    const x = coff.current.x + (d?.x ?? 0);
    const y = coff.current.y + (d?.y ?? 0);
    cd.current = null;
    setCoin('fly');
    moveCoin(x, y, 'scale(0.62)');
    sfx.whoosh();
    haptic(10);
    later(() => {
      setCoin('in');
      moveCoin(x, y, 'scale(0.08, 0.6)');
      sfx.crack();
      haptic(22);
    }, q(430, 40));
    later(() => {
      setCoin('gone');
      setPaid(true);
      sfx.chime();
      setSay(t.sayPaid);
      go('turn');
    }, q(760, 100));
  };
  const coinDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0 || phaseRef.current !== 'coin' || coin !== 'rest') return;
    cd.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const coinMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = cd.current;
    if (!d || d.id !== e.pointerId) return;
    const x = e.clientX - d.x0;
    const y = e.clientY - d.y0;
    if (!d.moved && Math.hypot(x, y) > 6) {
      d.moved = true;
      setCoin('drag');
    }
    if (d.moved) moveCoin(x, y, 'scale(1.08)');
  };
  const coinUp = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const d = cd.current;
    if (!d || d.id !== e.pointerId) return;
    cd.current = null;
    if (!d.moved) {
      if (!cancelled) insertCoin();
      return;
    }
    // dilepas di dekat lubangnya (atau sudah lebih dari separuh jalan): masuk; kalau tidak, kembali ke nampan
    const left = slotDelta();
    const total0 = left ? Math.hypot(left.x + coff.current.x, left.y + coff.current.y) : 0;
    const near = left ? Math.hypot(left.x, left.y) < Math.max(left.size * 1.5, total0 * 0.5) : false;
    if (!cancelled && near) {
      setCoin('rest');
      insertCoin();
      return;
    }
    setCoin('rest');
    moveCoin(0, 0);
  };

  /* ── 2. kenop ── */
  const kick = () => {
    if (reduced()) return;
    pileRef.current?.animate?.([{ transform: 'translateY(0)' }, { transform: 'translateY(-0.5%)' }, { transform: 'translateY(0)' }], { duration: 150 });
  };
  const dispense = () => {
    if (phaseRef.current !== 'turn') return;
    cancelAnimationFrame(spin.current);
    kd.current = null;
    acc.current = 0;
    notch.current = 0;
    const gold = cur === n;
    const jam = cur === jamAt;
    go('drop');
    setRumble(true);
    sfx.rustle();
    haptic(24);
    later(() => sfx.bonk(), q(420, 40));
    later(() => setRumble(false), q(980, 80));
    later(() => {
      setOut(cur + 1);
      if (jam) {
        setNudges(0);
        sfx.wahwah();
        setSay(t.sayJam);
        go('jam');
      } else {
        sfx.pop();
        if (gold) later(() => sfx.chime(), 200);
        setSay(gold ? t.sayGoldOut : t.sayReady);
        go('ready');
      }
    }, q(800, 110));
  };
  const advance = (delta: number) => {
    if (phaseRef.current !== 'turn') return;
    angle.current += delta;
    acc.current += delta;
    if (knobRef.current) knobRef.current.style.transform = `rotate(${angle.current}deg)`;
    const k = Math.floor(Math.abs(acc.current) / 45);
    if (k !== notch.current) {
      notch.current = k;
      sfx.tap();
      haptic(4);
      kick();
    }
    if (Math.abs(acc.current) >= 360) dispense();
  };
  /** ketukan: kenop berputar sendiri satu putaran penuh */
  const autoTurn = () => {
    if (phaseRef.current !== 'turn') return;
    cancelAnimationFrame(spin.current);
    const rest = 360 - Math.min(359, Math.abs(acc.current));
    if (reduced()) return advance(rest + 1);
    const dur = 300 + rest * 1.6;
    let done = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const u = Math.min(1, (now - t0) / dur);
      const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      const want = (rest + 1) * e;
      advance(want - done);
      done = want;
      if (u < 1 && phaseRef.current === 'turn') spin.current = requestAnimationFrame(step);
    };
    spin.current = requestAnimationFrame(step);
  };
  const knobAngle = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    return { a: (Math.atan2(y, x) * 180) / Math.PI, far: Math.hypot(x, y) > r.width * 0.09 };
  };
  const knobDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0) return;
    if (phaseRef.current === 'coin') {
      // belum bayar: kenopnya cuma bergoyang
      setSay(t.sayNoCoin);
      sfx.tug();
      haptic(8);
      if (!reduced()) knobRef.current?.animate?.([{ transform: 'rotate(0deg)' }, { transform: 'rotate(14deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(0deg)' }], { duration: 380 });
      return;
    }
    if (phaseRef.current !== 'turn') return;
    cancelAnimationFrame(spin.current);
    kd.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false, a: knobAngle(e).a };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const knobMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = kd.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 6) d.moved = true;
    if (!d.moved) return;
    const { a, far } = knobAngle(e);
    if (!far) return;
    let delta = a - d.a;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    d.a = a;
    advance(delta);
  };
  const knobUp = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const d = kd.current;
    if (!d || d.id !== e.pointerId) return;
    kd.current = null;
    if (!cancelled && !d.moved) autoTurn();
  };

  /* ── 3. nyangkut: mesin digoyang ── */
  const tilt = (v: number) => machineRef.current?.style.setProperty('--tilt', String(v));
  const nudge = (dir: number) => {
    if (phaseRef.current !== 'jam') return;
    sfx.bonk();
    haptic(18);
    tilt(0);
    if (!reduced()) {
      machineRef.current?.animate?.(
        [{ transform: `rotate(${dir * 5}deg)` }, { transform: `rotate(${dir * -3.4}deg)` }, { transform: `rotate(${dir * 1.6}deg)` }, { transform: 'rotate(0deg)' }],
        { duration: 520, easing: 'ease-out' },
      );
    }
    const k = nudges + 1;
    setNudges(k);
    if (k >= 2) {
      setSay(t.sayFree);
      later(() => sfx.pop(), 220);
      go('ready');
    } else setSay(t.sayJam2);
  };
  const nudgeDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0) return;
    nd.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const nudgeMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = nd.current;
    if (!d || d.id !== e.pointerId) return;
    const x = e.clientX - d.x0;
    if (Math.abs(x) > 6) d.moved = true;
    tilt(Math.max(-1, Math.min(1, x / (e.currentTarget.getBoundingClientRect().width * 0.3))));
  };
  const nudgeUp = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const d = nd.current;
    if (!d || d.id !== e.pointerId) return;
    nd.current = null;
    if (cancelled) return tilt(0);
    nudge(d.moved ? Math.sign(e.clientX - d.x0) || 1 : nudges % 2 ? -1 : 1);
  };

  /* ── 4. kapsul dibuka, lalu disimpan ── */
  const openCap = () => {
    if (phaseRef.current !== 'ready') return;
    sfx.tap();
    haptic(12);
    setView({ i: cur, fresh: true });
    go(cur === n ? 'gold' : 'open');
  };
  const review = (i: number) => {
    if (phaseRef.current !== 'turn' || view || i >= kept || i >= n) return;
    sfx.tap();
    setView({ i, fresh: false });
  };
  const onRevealDone = () => {
    const v = view;
    setView(null);
    if (!v || !v.fresh) return;
    setKept(v.i + 1);
    sfx.pop();
    if (v.i < n) {
      const left = total - (v.i + 1);
      setCur(v.i + 1);
      setSay(v.i + 1 === n ? t.sayGold : fmt(t.sayMore[v.i % t.sayMore.length], { left }));
      go('turn');
      return;
    }
    go('game');
    later(() => setGame('on'), q(750, 120));
  };
  const gameDone = () => {
    setGame('done');
    setSay(t.sayDrawer);
    sfx.pop();
    haptic(14);
    go('drawer');
  };

  /* ── 5. laci hadiah ── */
  const openDrawer = () => {
    if (phaseRef.current !== 'drawer' || drawer !== 'shut') return;
    dd.current = null;
    setPulling(false);
    setPull(0);
    setDrawer('open');
    sfx.whoosh();
    haptic(20);
    later(() => {
      setDrawer('up');
      sfx.chime();
      setSay(t.sayLetter);
    }, q(720, 90));
  };
  const drawerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0 || drawer !== 'shut') return;
    dd.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false };
    setPulling(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const drawerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = dd.current;
    if (!d || d.id !== e.pointerId) return;
    const y = Math.max(0, e.clientY - d.y0);
    if (y > 6) d.moved = true;
    const p = Math.min(1, y / (e.currentTarget.getBoundingClientRect().height * 2.6));
    setPull(p);
    if (p >= 1) openDrawer();
  };
  const drawerUp = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const d = dd.current;
    if (!d || d.id !== e.pointerId) return;
    dd.current = null;
    setPulling(false);
    if (!cancelled && (!d.moved || pull > 0.4)) return openDrawer();
    setPull(0);
  };
  const read = () => {
    if (finale || drawer !== 'up') return;
    sfx.chime();
    haptic(15);
    setFinale(true);
  };

  /* ── tampilan ── */
  const playing = game === 'on';
  const isGold = cur === n;
  const left = total - out;
  const sayText = say ?? fmt(t.sayCoin, { n: total });
  const sign = fmt(t.signFor, { to });
  const chuteColor: Color = isGold ? 'emas' : items[Math.min(cur, n - 1)].color;
  const shown = view ? (view.i < n ? items[view.i] : items[n - 1]) : null;
  const calm = !view && !finale && !playing;

  return (
    <div className={cx(s.wrap, ready && s.ready, playing && s.gaming, (phase === 'game' || phase === 'drawer') && s.noTray, finale && s.over)}>
      <div className={s.head}>
        <div className={s.eyebrow}>
          <b>{t.eyebrow}</b>
          {from ? <span>{fmt(t.fromLine, { from })}</span> : null}
        </div>
        <p key={sayText} className={s.say} aria-live="polite">
          {sayText}
        </p>
      </div>

      <div ref={machineRef} className={cx(s.machine, rumble && s.rumbling)}>
        <Sprite name="gacha-mesin" className={s.layer} decoding="sync" />
        <div ref={pileRef} className={s.pile} aria-hidden>
          {PILE.map((p, i) => {
            const gold = p.order === 99;
            const gone = gold ? out > n : p.order >= 0 && p.order < n && p.order < out;
            return (
              <Capsule
                key={i}
                color={p.color}
                className={cx(s.pc, gone && s.pcGone, gold && s.pcGold, gold && isGold && phase === 'turn' && s.pcGlow)}
                style={{ left: `calc(var(--u) * ${249 + p.x})`, top: `calc(var(--u) * ${239 + p.y})`, '--r': `${p.rot}deg`, '--i': i } as CSSProperties}
              />
            );
          })}
        </div>
        <Sprite name="gacha-kaca" className={s.glass} decoding="sync" />
        <span className={s.sheen} aria-hidden />

        <div className={cx(s.sign, sign.length > 15 && s.long, sign.length > 21 && s.xl)}>{sign}</div>
        <i className={cx(s.lamp, paid && s.lampOn)} aria-hidden />
        <div className={s.count} role="status" aria-label={fmt(t.leftLabel, { left })}>
          <b key={paid ? left : -1}>{paid ? left : '?'}</b>
        </div>

        <span ref={slotRef} className={s.slotSpot} aria-hidden />
        {phase === 'coin' ? <div className={s.slotHit} onClick={insertCoin} aria-hidden /> : null}

        <div ref={knobRef} className={s.knob} aria-hidden>
          <Sprite name="gacha-kenop" className={s.knobArt} />
        </div>
        <button
          ref={knobHit}
          type="button"
          className={s.knobHit}
          disabled={phase !== 'turn' && phase !== 'coin'}
          tabIndex={phase === 'turn' ? 0 : -1}
          aria-label={t.knobLabel}
          aria-hidden={phase !== 'turn'}
          onPointerDown={knobDown}
          onPointerMove={knobMove}
          onPointerUp={(e) => knobUp(e, false)}
          onPointerCancel={(e) => knobUp(e, true)}
          onClick={(e) => {
            // ketukan dari papan ketik (klik dari pointer sudah ditangani di atas)
            if (e.detail === 0) autoTurn();
          }}
        />

        <div className={s.chute}>
          {phase === 'ready' || phase === 'jam' ? (
            <button
              key={cur}
              ref={capRef}
              type="button"
              className={cx(s.chuteCap, phase === 'jam' ? s.stuck : cur === jamAt ? s.freed : s.dropIn)}
              disabled={phase !== 'ready'}
              onClick={openCap}
              aria-label={t.capLabel}
            >
              <Capsule color={chuteColor} className={s.chuteArt} />
            </button>
          ) : null}
        </div>
        {phase === 'ready' && isGold ? <span className={s.twinkle} aria-hidden /> : null}

        {/* laci hadiah di alas mesin: isinya baru terlihat saat ditarik */}
        <div className={cx(s.drawer, !pulling && s.eased, phase === 'drawer' && drawer === 'shut' && s.drawerCall)} style={{ '--dp': drawer === 'shut' ? pull : 1 } as CSSProperties}>
          <div className={s.drawerClip} aria-hidden>
            <div className={s.drawerIn}>
              <Sprite name="gacha-laci-dalam" className={s.drawerInArt} />
              {drawer !== 'up' ? <Sprite name="gacha-amplop" className={s.envIn} /> : null}
            </div>
          </div>
          <button
            ref={drawerRef}
            type="button"
            className={s.drawerFront}
            disabled={phase !== 'drawer' || drawer !== 'shut'}
            tabIndex={phase === 'drawer' && drawer === 'shut' ? 0 : -1}
            aria-label={t.drawerLabel}
            aria-hidden={phase !== 'drawer'}
            onPointerDown={drawerDown}
            onPointerMove={drawerMove}
            onPointerUp={(e) => drawerUp(e, false)}
            onPointerCancel={(e) => drawerUp(e, true)}
            onClick={(e) => {
              if (e.detail === 0) openDrawer();
            }}
          >
            <Sprite name="gacha-laci" className={s.drawerArt} />
          </button>
          {drawer === 'up' ? (
            <button type="button" className={s.envOut} onClick={read} aria-label={t.letterLabel}>
              <Sprite name="gacha-amplop" className={s.envArt} />
            </button>
          ) : null}
        </div>

        {phase === 'jam' ? (
          <>
            <span className={s.bubble} aria-hidden>
              {t.jamBubble}
            </span>
            <button
              ref={nudgeRef}
              type="button"
              className={s.nudgeHit}
              aria-label={t.nudgeLabel}
              onPointerDown={nudgeDown}
              onPointerMove={nudgeMove}
              onPointerUp={(e) => nudgeUp(e, false)}
              onPointerCancel={(e) => nudgeUp(e, true)}
              onClick={(e) => {
                if (e.detail === 0) nudge(1);
              }}
            />
          </>
        ) : null}
      </div>

      {/* nampan: koin menunggu di sini, lalu belahan kapsul yang sudah dibuka berkumpul */}
      <div className={s.tray}>
        <Sprite name="gacha-nampan" className={s.trayArt} />
        <div className={s.slots}>
          {Array.from({ length: total }, (_, i) => {
            const got = i < kept;
            const gold = i === n;
            const can = got && !gold && phase === 'turn';
            return (
              <button
                key={i}
                ref={(el) => {
                  slots.current[i] = el;
                }}
                type="button"
                className={cx(s.slot, got && s.got, gold && s.slotGold)}
                disabled={!can}
                tabIndex={can ? 0 : -1}
                aria-hidden={!got}
                aria-label={fmt(t.slotLabel, { i: i + 1 })}
                onClick={() => review(i)}
              >
                {got ? (
                  <>
                    <Sprite name={gold ? 'gacha-bawah-emas' : 'gacha-bawah'} className={s.slotBot} />
                    <Sprite name={`gacha-atas-${gold ? 'emas' : items[i].color}`} className={s.slotTop} />
                  </>
                ) : (
                  <i className={s.slotDot} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {coin !== 'gone' ? (
        <button
          ref={coinRef}
          type="button"
          className={cx(s.coin, s[`coin_${coin}`])}
          disabled={coin === 'fly' || coin === 'in'}
          aria-label={t.coinLabel}
          onPointerDown={coinDown}
          onPointerMove={coinMove}
          onPointerUp={(e) => coinUp(e, false)}
          onPointerCancel={(e) => coinUp(e, true)}
          onClick={(e) => {
            if (e.detail === 0) insertCoin();
          }}
        >
          <Sprite name="gacha-koin" className={s.coinArt} />
        </button>
      ) : null}

      {view && shown ? (
        <Reveal
          key={`${view.i}${view.fresh ? 'f' : 'r'}`}
          item={shown}
          index={view.i}
          n={n}
          gold={view.i === n}
          fresh={view.fresh}
          title={title}
          to={to}
          from={from}
          t={t}
          mode={mode}
          target={() => slots.current[view.i] ?? null}
          onOpened={view.i === n ? () => setBurst((v) => v + 1) : undefined}
          onDone={onRevealDone}
        />
      ) : null}

      {calm && drawer === 'up' ? (
        <div className={s.foot}>
          <button ref={readRef} type="button" className={s.cta} onClick={read}>
            {t.read} <span aria-hidden>→</span>
          </button>
        </div>
      ) : null}

      {calm && phase === 'coin' && ready && coin === 'rest' ? <Hint key="hCoin">{t.hintCoin}</Hint> : null}
      {calm && phase === 'turn' && cur === 0 ? <Hint key="hTurn">{t.hintTurn}</Hint> : null}
      {calm && phase === 'turn' && isGold && cur > 0 ? <Hint key="hGold">{t.hintGold}</Hint> : null}
      {calm && phase === 'ready' && cur === 0 ? <Hint key="hTap">{t.hintTap}</Hint> : null}
      {calm && phase === 'jam' ? <Hint key="hJam">{t.hintJam}</Hint> : null}
      {calm && phase === 'drawer' && drawer === 'shut' ? <Hint key="hDrawer">{t.hintDrawer}</Hint> : null}

      {!calm ? null : phase === 'coin' ? (
        ready && coin === 'rest' ? <TapCue key="cueCoin" target={coinRef} kind="drag" dir={{ x: -4.4, y: -9.5 }} delay={2200} /> : null
      ) : phase === 'turn' ? (
        <TapCue key={`cueKnob${cur}`} target={knobHit} delay={cur === 0 ? 2400 : 4200} />
      ) : phase === 'ready' ? (
        <TapCue key={`cueCap${cur}`} target={capRef} delay={cur === 0 ? 2000 : 3600} />
      ) : phase === 'jam' ? (
        <TapCue key="cueJam" target={nudgeRef} kind="drag" dir={{ x: 3, y: 0 }} at={{ x: 0.42, y: 0.72 }} delay={2200} />
      ) : phase === 'drawer' ? (
        drawer === 'shut' ? (
          <TapCue key="cueDrawer" target={drawerRef} kind="drag" dir={{ x: 0, y: 2.6 }} delay={2200} />
        ) : drawer === 'up' ? (
          <TapCue key="cueRead" target={readRef} delay={3200} />
        ) : null
      ) : null}

      <Confetti burst={burst} shapes="hearts" count={70} origin={{ x: 0.5, y: 0.42 }} colors={['#ff5d73', '#ffd36e', '#fff6e2', '#ff9aa8', '#f2c14e']} />
      <Confetti burst={burst} count={90} origin={{ x: 0.5, y: 0.46 }} colors={['#f2c14e', '#fff3c4', '#ff5d73', '#3fbfab', '#a58bea', '#ffffff']} />

      {playing ? <ShyCapsule t={t.game} onDone={gameDone} /> : null}

      {finale ? (
        <Finale data={data} mode={mode} eyebrow={t.finale} flower="bunga-kamboja-pink" theme={{ backdrop: BACKDROP, ink: '#1f3a3a', paper: '#fffaf0', paperInk: '#3b2a22' }} onReplay={onReplay} />
      ) : null}
    </div>
  );
}
