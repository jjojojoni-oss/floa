'use client';

import { type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Sprite, Stage, TapCue, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { PhotobombGame } from './Game';
import { TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BACKDROP = '/art/bg-photobox.webp';
const ART = [
  'bg-photobox',
  'photobox-bilik',
  'photobox-bendera',
  'photobox-tirai',
  'photobox-koin',
  'photobox-dalam',
  'photobox-lensa',
  'photobox-konsol',
  'photobox-tombol',
  'bunga-kamboja',
  'bunga-kamboja-pink',
  'daun-2',
  'daun-4',
];

/**
 * coin   → depan bilik foto: papan namanya masih padam sampai koin dimasukkan (seret ke celah atau ketuk)
 * front  → lampu menyala; tirai digeser ke samping (atau diketuk) lalu kita "masuk" ke dalam bilik
 * inside → layar bidik + tombol rana merah besar: tiap tekanan = 3-2-1, kilat, satu foto. Tekanan terakhir mencetak
 * print  → kembali ke depan bilik: strip keluar sedikit demi sedikit dari celah, lalu ditarik lepas
 * deco   → strip membesar di tengah; tiga ketukan menempel stiker hati/bintang/bunga
 * game   → mini-game tangan iseng
 * flip   → strip dibalik
 * back   → sisi belakang strip: ada surat → Finale
 */
type Phase = 'coin' | 'front' | 'inside' | 'print' | 'deco' | 'game' | 'flip' | 'back';
type Cam = 'idle' | 'count' | 'flash' | 'show';
type StripAt = 'none' | 'slot' | 'pulled' | 'free';
type Frame = { kind: 'photo' | 'card' | 'flower'; photo: string | null; note: string; tint: number };
type Sticker = { x: number; y: number; kind: number; rot: number };

/** titik lampu di bingkai papan nama, dalam satuan lukisan bilik 720×1240 (sama dengan bulbSpots di art/sprites/63-photobox.js) */
const BULBS: [number, number][] = [];
for (let i = 0; i <= 10; i++) BULBS.push([110 + i * 50, 50]);
for (const y of [95, 139]) BULBS.push([629, y]);
for (let i = 10; i >= 0; i--) BULBS.push([110 + i * 50, 184]);
for (const y of [139, 95]) BULBS.push([91, y]);

/** lebar strip saat masih di celah bilik, dalam em milik bilik (124 dari 720 satuan lukisan; bilik = 22.5em) */
const SLOT_W = 3.875;
const FLOWERS = ['bunga-kamboja-pink', 'bunga-kamboja', 'bunga-sepatu', 'bunga-kenikir'];
const STICKERS = ['photobox-stiker-hati', 'photobox-stiker-bintang', 'photobox-stiker-bunga'];
/** tempat stiker kalau ditempel lewat papan ketik: [x %, y %, putar] */
const SPOTS: [number, number, number][] = [
  [84, 9, 14],
  [13, 46, -12],
  [82, 71, 8],
];

/** Isi satu bingkai: foto, kartu bertulisan tangan (tanpa foto), atau kartu bunga (bingkai tambahan). */
function FrameArt({ f, alt }: { f: Frame; alt: string }) {
  if (f.kind === 'photo' && f.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={f.photo} alt={alt} draggable={false} className={s.fPhoto} />;
  }
  return (
    <span className={cx(s.fCard, s[`tint${f.tint % 4}`], f.kind === 'flower' && s.fFlower)}>
      <Sprite name={FLOWERS[f.tint % 4]} className={s.fBloom} />
      <span className={cx(s.fText, f.note.length > 22 && s.long)}>{f.note}</span>
    </span>
  );
}

export default function Photobox(props: TemplateProps) {
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

  /** bingkai strip: foto ke-i berpasangan dengan tulisan ke-i (dipasangkan dulu, baru yang kosong dilewati) */
  const frames = useMemo(() => {
    const out: Frame[] = [];
    for (let i = 0; i < 4; i++) {
      const note = (data.notes[i] ?? '').trim();
      const photo = data.photos[i] || null;
      if (photo) out.push({ kind: 'photo', photo, note, tint: i });
      else if (note) out.push({ kind: 'card', photo: null, note, tint: i });
    }
    // strip foto paling sedikit tiga bingkai: sisanya kartu bunga
    for (let k = 0; out.length < 3; k++) out.push({ kind: 'flower', photo: null, note: t.flowerLines[k % t.flowerLines.length], tint: out.length + 1 });
    return out;
  }, [data.notes, data.photos, t.flowerLines]);
  const n = frames.length;

  const [phase, setPhase] = useState<Phase>('coin');
  const [paid, setPaid] = useState(false);
  /** koin yang sedang diseret: geseran dalam px */
  const [coinAt, setCoinAt] = useState<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState(false);
  /** seberapa jauh tirai sedang digeser (0..1) */
  const [slide, setSlide] = useState(0);
  const [cam, setCam] = useState<Cam>('idle');
  const [count, setCount] = useState(3);
  /** jumlah foto yang sudah diambil */
  const [taken, setTaken] = useState(0);
  const [flash, setFlash] = useState(0);
  const [strip, setStrip] = useState<StripAt>('none');
  /** bagian strip yang sudah keluar dari celah (0..1) */
  const [out, setOut] = useState(0);
  const [printed, setPrinted] = useState(false);
  const [pull, setPull] = useState(0);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);
  /** skala strip saat masih di celah (lebar celah ÷ lebar strip), dihitung dari ukuran panggung */
  const [ss, setSs] = useState(0.3);

  const wrapRef = useRef<HTMLDivElement>(null);
  const coinRef = useRef<HTMLButtonElement>(null);
  const curtainRef = useRef<HTMLButtonElement>(null);
  const shutterRef = useRef<HTMLButtonElement>(null);
  const stripRef = useRef<HTMLButtonElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ id: number; x0: number; y0: number; w: number } | null>(null);
  /** langkah sekali-jalan yang sudah terjadi (seret yang selesai + klik susulannya tidak boleh memicu dua kali) */
  const did = useRef<Record<string, boolean>>({});
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // rumus ukuran di sini harus sama dengan --em / --fb / --sfs di style.module.css
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const calc = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const em = Math.min(w / 24.4, h / 42);
      const fb = Math.min(em, (h - em * 8.6) / 38.75);
      const sfs = Math.min(em * 1.22, (h - em * 10) / 32.6);
      setSs((SLOT_W * fb) / (11 * sfs));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // foto disiapkan selagi koin & tirai dimainkan
  useEffect(() => {
    frames.forEach((f) => {
      if (!f.photo) return;
      const img = new Image();
      img.src = f.photo;
    });
  }, [frames]);

  // fokus mengikuti langkah yang aktif (pengguna papan ketik / pembaca layar)
  useEffect(() => {
    if (mode === 'preview') return;
    const el = phase === 'inside' ? shutterRef : phase === 'back' ? ctaRef : null;
    if (!el) return;
    const id = setTimeout(() => el.current?.focus({ preventScroll: true }), 900);
    return () => clearTimeout(id);
  }, [phase, mode]);

  const capture = (e: ReactPointerEvent<HTMLElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };

  /* ── 1. koin ── */
  const insert = () => {
    if (did.current.coin || phase !== 'coin') return;
    did.current.coin = true;
    drag.current = null;
    setPaid(true);
    sfx.tap();
    haptic(14);
    later(() => {
      sfx.bonk();
      sfx.chime();
    }, reduce.current ? 60 : 520);
    later(() => setPhase('front'), reduce.current ? 150 : 1050);
  };
  const coinDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0 || paid) return;
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, w: e.currentTarget.getBoundingClientRect().width || 56 };
    capture(e);
  };
  const coinMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    setCoinAt({ x: e.clientX - d.x0, y: e.clientY - d.y0 });
  };
  const coinUp = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    // dilepas di dekat celah (kira-kira dua lebar koin di atas tempat semula): masuk; kalau tidak, koin kembali
    if (!cancelled && e.clientY - d.y0 < -d.w * 1.2) insert();
    else setCoinAt(null);
  };

  /* ── 2. tirai ── */
  const openCurtain = () => {
    if (did.current.open || phase !== 'front') return;
    did.current.open = true;
    drag.current = null;
    setOpen(true);
    setSlide(0);
    sfx.whoosh();
    haptic(20);
    later(() => sfx.rustle(), 200);
    later(() => setPhase('inside'), reduce.current ? 200 : 1250);
  };
  const curtainDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0 || open) return;
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, w: e.currentTarget.getBoundingClientRect().width || 1 };
    capture(e);
  };
  const curtainMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const p = Math.min(1, Math.abs(e.clientX - d.x0) / (d.w * 0.55));
    setSlide(p);
    if (p >= 1) openCurtain();
  };
  const curtainUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (slide > 0.4) openCurtain();
    else setSlide(0);
  };

  /* ── 4. cetak ── */
  const toPrint = () => {
    if (did.current.print || phase !== 'inside') return;
    did.current.print = true;
    setPhase('print');
    sfx.whoosh();
    haptic(16);
    const d = reduce.current ? 250 : 1150;
    const step = reduce.current ? 140 : 430;
    later(() => setStrip('slot'), d - 100);
    [0.1, 0.19, 0.28, 0.37, 0.46, 0.52].forEach((v, i) =>
      later(() => {
        setOut(v);
        sfx.tug();
      }, d + i * step),
    );
    later(() => {
      setPrinted(true);
      sfx.chime();
      haptic(12);
    }, d + 6 * step);
  };

  /* ── 3. jepret ── */
  const press = () => {
    if (phase !== 'inside' || cam === 'count' || cam === 'flash') return;
    if (taken >= n) return toPrint();
    const step = reduce.current ? 230 : taken === 0 ? 640 : 470;
    setCam('count');
    setCount(3);
    sfx.tap();
    haptic(10);
    later(() => {
      setCount(2);
      sfx.tap();
    }, step);
    later(() => {
      setCount(1);
      sfx.tap();
    }, step * 2);
    later(() => {
      setCam('flash');
      setTaken((v) => v + 1);
      setFlash((v) => v + 1);
      sfx.crack();
      haptic(28);
      later(() => sfx.score(taken), 160);
      later(() => setCam('show'), reduce.current ? 160 : 620);
    }, step * 3);
  };

  const pullFree = () => {
    if (did.current.pull || !printed || strip !== 'slot') return;
    did.current.pull = true;
    drag.current = null;
    setStrip('pulled');
    setPull(0);
    setOut(1);
    sfx.untie();
    haptic(22);
    later(() => {
      setStrip('free');
      setPhase('deco');
    }, reduce.current ? 120 : 400);
    later(() => sfx.pop(), reduce.current ? 200 : 1150);
  };

  /* ── 5. stiker ── */
  const stamp = (e: ReactMouseEvent<HTMLButtonElement>) => {
    const k = stickers.length;
    if (k >= STICKERS.length) return;
    let [x, y, rot] = SPOTS[k];
    // ketukan sungguhan: stiker menempel tepat di titik yang diketuk
    if (e.detail !== 0) {
      const r = e.currentTarget.getBoundingClientRect();
      x = Math.max(9, Math.min(91, ((e.clientX - r.left) / (r.width || 1)) * 100));
      y = Math.max(4, Math.min(96, ((e.clientY - r.top) / (r.height || 1)) * 100));
      rot = [14, -12, 8][k] + (x > 50 ? 4 : -4);
    }
    setStickers((list) => [...list, { x, y, kind: k, rot }]);
    sfx.pop();
    sfx.score(k + 2);
    haptic(16);
    if (k + 1 < STICKERS.length) return;
    later(() => {
      setBurst((v) => v + 1);
      sfx.success();
      haptic(26);
    }, 320);
    later(() => setPhase('game'), reduce.current ? 1000 : 2300);
  };

  /* ── 6. balik ── */
  const flip = () => {
    if (did.current.flip || phase !== 'flip') return;
    did.current.flip = true;
    drag.current = null;
    setFlipped(true);
    sfx.whoosh();
    haptic(18);
    later(() => sfx.chime(), reduce.current ? 100 : 520);
    later(() => setPhase('back'), reduce.current ? 150 : 800);
  };

  /** seret pada strip: ke bawah untuk menariknya dari celah, ke samping untuk membaliknya. Ketukan ditangani onClick. */
  const stripDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0 || (phase !== 'print' && phase !== 'flip')) return;
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, w: e.currentTarget.getBoundingClientRect().width || 60 };
    capture(e);
  };
  const stripMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (phase === 'print') {
      const p = Math.min(1, Math.max(0, e.clientY - d.y0) / (d.w * 1.3));
      setPull(p);
      if (p >= 1) pullFree();
    } else if (phase === 'flip' && Math.abs(e.clientX - d.x0) > d.w * 0.22) flip();
  };
  const stripUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (phase !== 'print') return;
    if (pull > 0.4) pullFree();
    else setPull(0);
  };
  const stripClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (phase === 'print') pullFree();
    else if (phase === 'deco') stamp(e);
    else if (phase === 'flip') flip();
  };

  const read = () => {
    if (finale) return;
    sfx.chime();
    haptic(15);
    setFinale(true);
  };

  /* ── tampilan ── */
  const playing = phase === 'game';
  const inBooth = phase === 'inside';
  const afterPrint = phase === 'deco' || phase === 'game' || phase === 'flip' || phase === 'back';
  const lit = paid;
  const shown = taken > 0 ? frames[taken - 1] : null;
  const pose = t.poses[Math.min(taken, n - 1) % t.poses.length];
  const allTaken = taken >= n && cam === 'show';
  const left = STICKERS.length - stickers.length;
  const stripLabel = phase === 'print' ? t.pullLabel : phase === 'deco' ? t.decoLabel : t.flipLabel;
  const stripLive = (phase === 'print' && printed && strip === 'slot') || (phase === 'deco' && left > 0) || (phase === 'flip' && !flipped);
  const signSub = phase === 'print' ? t.printing : lit ? fmt(t.signFor, { to }) : t.signOff;

  return (
    <div
      ref={wrapRef}
      className={cx(s.wrap, ready && s.ready, lit && s.isLit, open && s.isOpen, inBooth && s.inBooth, afterPrint && s.dim, finale && s.over)}
      style={{ '--ss': ss } as CSSProperties}
    >
      {/* ── depan bilik ── */}
      <div className={s.outside} aria-hidden={inBooth}>
        <Sprite name="photobox-bendera" className={s.bunting} />
        <div className={s.booth}>
          <Sprite name="photobox-bilik" className={s.boothArt} decoding="sync" />
          <span className={s.signGlow} aria-hidden />
          {BULBS.map(([x, y], i) => (
            <i key={i} className={s.bulb} style={{ left: `${(x / 720) * 100}%`, top: `${(y / 1240) * 100}%`, '--i': i } as CSSProperties} aria-hidden />
          ))}
          <div className={s.sign}>
            <b className={s.signTitle}>{t.sign}</b>
            <span key={signSub} className={cx(s.signSub, signSub.length > 26 && s.long, phase === 'print' && s.blink)}>
              {signSub}
            </span>
          </div>
          <span className={cx(s.corsage, s.corsageA)} aria-hidden>
            <Sprite name="daun-2" className={s.csLeaf1} />
            <Sprite name="daun-4" className={s.csLeaf2} />
            <Sprite name="bunga-kamboja-pink" className={s.csFlower} />
          </span>
          <span className={cx(s.corsage, s.corsageB)} aria-hidden>
            <Sprite name="daun-4" className={s.csLeaf1} />
            <Sprite name="daun-2" className={s.csLeaf2} />
            <Sprite name="bunga-kamboja" className={s.csFlower} />
          </span>

          <div className={s.curtain} style={{ '--sl': slide } as CSSProperties} aria-hidden>
            <Sprite name="photobox-tirai" className={s.curtainArt} />
          </div>
          {phase === 'front' && !open ? (
            <button
              ref={curtainRef}
              type="button"
              className={s.curtainHit}
              aria-label={t.curtainLabel}
              onPointerDown={curtainDown}
              onPointerMove={curtainMove}
              onPointerUp={curtainUp}
              onPointerCancel={curtainUp}
              onClick={openCurtain}
            />
          ) : null}

          {phase === 'coin' ? (
            <button
              ref={coinRef}
              type="button"
              className={cx(s.coin, paid && s.coinIn, coinAt && !paid && s.coinDrag)}
              style={{ '--cx': `${coinAt?.x ?? 0}px`, '--cy': `${coinAt?.y ?? 0}px` } as CSSProperties}
              disabled={paid}
              aria-label={t.coinLabel}
              onPointerDown={coinDown}
              onPointerMove={coinMove}
              onPointerUp={(e) => coinUp(e, false)}
              onPointerCancel={(e) => coinUp(e, true)}
              onClick={insert}
            >
              <span className={s.coinBob}>
                <Sprite name="photobox-koin" className={s.coinArt} />
              </span>
              {!paid && !coinAt ? <span className={cx(s.coinTag, from.length > 12 && s.long)}>{from ? fmt(t.coinFrom, { from }) : t.coinFree}</span> : null}
            </button>
          ) : null}
        </div>
      </div>

      {/* ── di dalam bilik ── */}
      {phase === 'front' || phase === 'inside' || phase === 'print' ? (
        <div className={s.inside} aria-hidden={!inBooth}>
          <div className={s.lens}>
            <Sprite name="photobox-lensa" className={s.lensArt} />
            <i className={cx(s.lamp, s.lampL, cam === 'flash' && s.lampOn)} aria-hidden />
            <i className={cx(s.lamp, s.lampR, cam === 'flash' && s.lampOn)} aria-hidden />
            <i className={cx(s.rec, cam === 'count' && s.recOn)} aria-hidden />
          </div>

          <div className={s.vf} aria-live="polite">
            <div className={s.vfScreen}>
              {shown ? (
                <div key={taken} className={cx(s.vfShot, cam === 'count' && s.vfDim)}>
                  <FrameArt f={shown} alt={fmt(t.photoAlt, { i: taken })} />
                  {shown.kind === 'photo' && shown.note ? <p className={cx(s.vfCap, shown.note.length > 28 && s.long)}>{shown.note}</p> : null}
                </div>
              ) : (
                <div className={cx(s.vfIdle, cam === 'count' && s.vfDim)}>
                  <Sprite name="bunga-kamboja-pink" className={s.idleBloom} />
                  <b className={cx(s.idleTitle, to.length > 12 && s.long)}>{fmt(t.idleTitle, { to })}</b>
                  <span className={s.idleSub}>{t.idleSub}</span>
                </div>
              )}
              {cam === 'count' ? (
                <div className={s.vfCount}>
                  <span className={s.pose}>{pose}</span>
                  <b key={count} className={s.count}>
                    {count}
                  </b>
                </div>
              ) : null}
              {cam === 'flash' || (cam === 'show' && taken > 0) ? (
                <span key={`snap${taken}`} className={s.snap} aria-hidden>
                  {t.snap}
                </span>
              ) : null}
              <span className={s.vfChip}>{fmt(t.poseOf, { i: Math.min(n, cam === 'count' ? taken + 1 : Math.max(1, taken)), n })}</span>
              <span className={s.brackets} aria-hidden />
              <span className={s.glare} aria-hidden />
            </div>
          </div>

          <div className={s.thumbs} aria-hidden>
            {frames.map((f, i) => (
              <span key={i} className={cx(s.thumb, i < taken && s.thumbOn)}>
                {i < taken ? <FrameArt f={f} alt="" /> : <b>{i + 1}</b>}
              </span>
            ))}
          </div>

          <div className={s.console}>
            <Sprite name="photobox-konsol" className={s.consoleArt} />
            <button
              ref={shutterRef}
              type="button"
              className={cx(s.shutter, cam === 'count' && s.shutterBusy, (cam === 'idle' || cam === 'show') && inBooth && s.shutterReady)}
              disabled={!inBooth}
              tabIndex={inBooth ? 0 : -1}
              aria-label={allTaken ? t.printLabel : t.shutterLabel}
              onClick={press}
            >
              <Sprite name="photobox-tombol" className={s.shutterArt} />
            </button>
          </div>
        </div>
      ) : null}

      {/* kilat putih */}
      {flash ? <span key={flash} className={s.flash} aria-hidden /> : null}

      {/* ── strip foto ── */}
      <span className={s.scrim} aria-hidden />
      {strip !== 'none' ? (
        <div
          className={cx(s.stripPos, strip === 'free' ? s.free : s.atSlot, strip === 'pulled' && s.pulled, playing && s.away, phase === 'deco' && left > 0 && s.decorating)}
          style={{ '--out': out, '--pull': pull } as CSSProperties}
        >
          <div className={s.stripMove}>
            <div className={cx(s.strip3d, flipped && s.flipped, phase === 'flip' && !flipped && s.tease)}>
              <div className={s.face}>
                {frames.map((f, i) => (
                  <div key={i} className={s.frame}>
                    <div className={s.shot}>
                      <FrameArt f={f} alt={fmt(t.photoAlt, { i: i + 1 })} />
                      <span className={s.shotEdge} aria-hidden />
                    </div>
                    {f.kind === 'photo' && f.note ? <p className={cx(s.cap, f.note.length > 26 && s.long)}>{f.note}</p> : null}
                  </div>
                ))}
                <div className={s.tail}>
                  <b className={cx(s.tailTitle, title.length > 18 && s.long)}>{title}</b>
                  <span className={s.tailStamp}>{t.stamp}</span>
                </div>
                {stickers.map((st, i) => (
                  <span key={i} className={s.sticker} style={{ left: `${st.x}%`, top: `${st.y}%`, '--rot': `${st.rot}deg` } as CSSProperties} aria-hidden>
                    <Sprite name={STICKERS[st.kind]} className={s.stickerArt} />
                  </span>
                ))}
                <span className={s.gloss} aria-hidden />
              </div>
              <div className={cx(s.face, s.backFace)} aria-hidden={!flipped}>
                <span className={s.backEyebrow}>{t.backEyebrow}</span>
                <div className={s.backNote}>
                  <span className={s.tape} aria-hidden />
                  <b className={cx(s.backFor, to.length > 10 && s.long)}>{fmt(t.backFor, { to })}</b>
                  <span className={s.backRule} aria-hidden />
                  <p className={s.backLine}>{t.backLine}</p>
                </div>
                <div className={s.backSign}>
                  <Sprite name="bunga-kamboja" className={s.backBloom} />
                  {from ? <em className={cx(s.backFrom, from.length > 12 && s.long)}>{from}</em> : null}
                  <span className={s.tailStamp}>{t.stamp}</span>
                </div>
              </div>
            </div>
            <button
              ref={stripRef}
              type="button"
              className={s.stripHit}
              disabled={!stripLive}
              tabIndex={stripLive ? 0 : -1}
              aria-label={stripLabel}
              onPointerDown={stripDown}
              onPointerMove={stripMove}
              onPointerUp={stripUp}
              onPointerCancel={stripUp}
              onClick={stripClick}
            />
          </div>
        </div>
      ) : null}

      {/* lembar stiker + catatan kecil di samping strip */}
      {phase === 'deco' ? (
        <>
          <div className={s.sheet} aria-hidden>
            {STICKERS.map((name, i) => (
              <span key={name} className={cx(s.sheetItem, i < stickers.length && s.used, i === stickers.length && s.nextUp)}>
                <Sprite name={name} className={s.sheetArt} />
              </span>
            ))}
          </div>
          <p key={left ? 'a' : 'b'} className={s.decoNote} role="status">
            {left ? (
              <>
                {t.decoTitle}
                <i>{fmt(t.decoLeft, { n: left })}</i>
              </>
            ) : (
              t.decoDone
            )}
          </p>
        </>
      ) : null}
      {phase === 'flip' && !flipped ? <p className={cx(s.decoNote, s.tease2)}>{t.flipTease}</p> : null}

      {!finale && phase === 'back' ? (
        <div className={s.foot}>
          <button ref={ctaRef} type="button" className={s.cta} onClick={read}>
            {t.read} <span aria-hidden>→</span>
          </button>
        </div>
      ) : null}

      {phase === 'coin' && ready && !paid ? <Hint key="hCoin">{t.hintCoin}</Hint> : null}
      {phase === 'front' && !open ? <Hint key="hCurtain">{t.hintCurtain}</Hint> : null}
      {inBooth && taken === 0 && cam === 'idle' ? <Hint key="hShutter">{t.hintShutter}</Hint> : null}
      {inBooth && taken === 1 && cam === 'show' && n > 1 ? <Hint key="hNext">{t.hintNext}</Hint> : null}
      {inBooth && allTaken ? <Hint key="hPrint">{t.hintPrint}</Hint> : null}
      {phase === 'print' && printed && strip === 'slot' ? <Hint key="hPull">{t.hintPull}</Hint> : null}
      {phase === 'deco' && stickers.length === 0 ? <Hint key="hDeco">{t.hintDeco}</Hint> : null}
      {phase === 'flip' && !flipped ? <Hint key="hFlip">{t.hintFlip}</Hint> : null}

      {finale || playing ? null : phase === 'coin' ? (
        ready && !paid ? <TapCue key="cueCoin" target={coinRef} kind="drag" dir={{ x: -0.4, y: -5 }} at={{ x: 0.5, y: 0.5 }} delay={2200} /> : null
      ) : phase === 'front' ? (
        !open ? <TapCue key="cueCurtain" target={curtainRef} kind="drag" dir={{ x: -5, y: 0 }} at={{ x: 0.72, y: 0.45 }} delay={2200} /> : null
      ) : phase === 'inside' ? (
        cam === 'idle' || allTaken ? <TapCue key={`cueShutter${taken}`} target={shutterRef} delay={taken ? 3200 : 2400} /> : null
      ) : phase === 'print' ? (
        printed && strip === 'slot' ? <TapCue key="cuePull" target={stripRef} kind="drag" dir={{ x: 0, y: 3.4 }} at={{ x: 0.5, y: 0.82 }} delay={1800} /> : null
      ) : phase === 'deco' ? (
        left > 0 ? <TapCue key={`cueDeco${stickers.length}`} target={stripRef} at={{ x: SPOTS[stickers.length][0] / 100, y: SPOTS[stickers.length][1] / 100 }} delay={stickers.length ? 4200 : 2600} /> : null
      ) : phase === 'flip' ? (
        !flipped ? <TapCue key="cueFlip" target={stripRef} at={{ x: 0.5, y: 0.45 }} delay={2400} /> : null
      ) : phase === 'back' ? (
        <TapCue key="cueRead" target={ctaRef} delay={3200} />
      ) : null}

      <Confetti burst={burst} count={100} origin={{ x: 0.5, y: 0.5 }} colors={['#e8503a', '#ffd36e', '#ffffff', '#2c3d68', '#ff9fb2', '#bfe0d2']} />

      {playing ? (
        <PhotobombGame
          t={t.game}
          onDone={() => {
            setPhase('flip');
            sfx.pop();
          }}
        />
      ) : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja-pink"
          theme={{ backdrop: BACKDROP, ink: '#1f2a44', paper: '#fffaf0', paperInk: '#2b2a3a' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
