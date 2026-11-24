'use client';

import { type CSSProperties, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Sprite, Stage, TapCue, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { SleepyNoteGame } from './Game';
import { TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BACKDROP = '/art/bg-kotakmusik.webp';
const ART = [
  'bg-kotakmusik',
  'kotakmusik-badan',
  'kotakmusik-taplak',
  'kotakmusik-tutup',
  'kotakmusik-tutup-dalam',
  'kotakmusik-laci',
  'kotakmusik-laci-rahasia',
  'kotakmusik-kunci',
  'kotakmusik-kunci-putar',
  'kotakmusik-bangau',
  'kotakmusik-not-1',
  'kotakmusik-not-2',
  'kotakmusik-kilau',
];
/** baru dibutuhkan setelah laci-laci: dimuat belakangan supaya adegan pertama cepat tampil */
const LATE = ['kotakmusik-dasar', 'kotakmusik-beludru', 'game-kotakmusik-not', 'game-kotakmusik-bantal', 'bunga-kamboja-pink'];

/**
 * key     → kotak tertutup, kunci kuningan rebah di meja: diketuk atau diseret ke lubang kunci
 * wind    → kunci diputar (seret melingkar atau ketuk); berbunyi krek tiap seperlima putaran
 * lid     → tutup diangkat (seret ke atas atau ketuk): silinder berputar, bangau kertas menari, not melayang,
 *           ukiran di cermin menyala
 * drawers → laci-laci kecil diketuk satu per satu: secarik catatan + pigura mungil mendarat di meja
 * slow    → lagunya melambat lalu "ketiduran": kunci harus diputar lagi
 * secret  → laci rahasia di bawah cermin menyembul
 * last    → isi laci rahasia; tombol menuju dasar kotak
 * game    → mini-game si Not yang ngantukan
 * under   → dasar kotak dari atas: lapisan beludru diangkat (seret pita atau ketuk)
 * letter  → amplop terlihat → surat
 */
type Phase = 'key' | 'wind' | 'lid' | 'drawers' | 'slow' | 'secret' | 'last' | 'game' | 'under' | 'letter';

/** rongga laci di lukisan badan kotak (satuan lukisan; sama dengan SLOTS di art/sprites/65-kotakmusik.js) */
const SLOTS: [number, number][] = [
  [34, 160],
  [350, 160],
  [34, 268],
  [350, 268],
];
const TICKS = 5;
/** derajat putaran kunci per bunyi "krek" */
const STEP = 72;

/**
 * not & kilau yang naik dari silinder: [sprite, kiri %, lama s, jeda s, goyang em, tinggi naik em].
 * Yang di tengah hanya naik sampai tepi bawah cermin (ukirannya tetap terbaca); yang di sisi naik tinggi ke dinding.
 */
const FLOAT: [string, number, number, number, number, number][] = [
  ['not-1', 5, 5.6, 0, 0.8, 11],
  ['kilau', 15, 4.6, -1.6, -0.6, 9.6],
  ['not-2', 30, 3.4, -2, -0.7, 4.2],
  ['kilau', 45, 3, -0.6, 0.6, 3.6],
  ['not-1', 60, 3.6, -1.3, 0.7, 4.4],
  ['kilau', 85, 4.8, -2.2, 0.8, 10],
  ['not-2', 95, 6.2, -4.4, -0.9, 11.4],
  ['not-2', 11, 6, -3.4, 0.9, 11.2],
  ['kilau', 91, 5, -3.6, -0.6, 9.4],
];

/** frasa kotak musik (indeks tangga nada sfx.note) */
const TUNE_OPEN = [0, 2, 3, 5, 4, 3, 5, 7];
const TUNE_DRAWER = [
  [2, 4],
  [3, 5],
  [4, 6],
  [5, 7],
];
const TUNE_BACK = [3, 5, 7, 5, 7];

export default function KotakMusik(props: TemplateProps) {
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

  /** isi laci: catatan ke-i berpasangan dengan foto ke-i (dipasangkan dulu, baru yang kosong dibuang) */
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
  /** laci depan yang berisi (maks. 4); isi terakhir selalu masuk laci rahasia */
  const front = items.length - 1;

  const [phase, setPhase] = useState<Phase>('key');
  /** kunci rebah sedang diseret (px) */
  const [keyAt, setKeyAt] = useState<{ x: number; y: number } | null>(null);
  const [angle, setAngle] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [open, setOpen] = useState(false);
  const [lidP, setLidP] = useState(0);
  const [opened, setOpened] = useState<boolean[]>([]);
  /** catatan yang sedang tergeletak di meja (indeks items) */
  const [card, setCard] = useState<number | null>(null);
  const [asleep, setAsleep] = useState(false);
  const [secretOpen, setSecretOpen] = useState(false);
  const [lifted, setLifted] = useState(false);
  const [velP, setVelP] = useState(0);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);
  /** kilau emas yang menyembur saat tutup terbuka */
  const [glitter, setGlitter] = useState(0);

  const boxRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef<HTMLButtonElement>(null);
  const winderRef = useRef<HTMLButtonElement>(null);
  const lidRef = useRef<HTMLButtonElement>(null);
  const drawerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const nextDrawerRef = useRef<HTMLButtonElement | null>(null);
  const secretRef = useRef<HTMLButtonElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const velvetRef = useRef<HTMLButtonElement>(null);
  const reduce = useRef(false);
  const phaseRef = useRef<Phase>('key');
  phaseRef.current = phase;
  const clicksRef = useRef(0);
  const asleepRef = useRef(false);
  asleepRef.current = asleep;
  const slowed = useRef(false);
  /** seret: kunci rebah, putaran kunci, tutup, beludru */
  const keyDrag = useRef<{ id: number; x0: number; y0: number; moved: boolean } | null>(null);
  const wind = useRef<{ id: number; cx: number; cy: number; last: number; acc: number } | null>(null);
  const lift = useRef<{ id: number; y0: number; p: number } | null>(null);
  /** seret baru saja terjadi: klik yang menyusul diabaikan */
  const dragged = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // lukisan untuk langkah belakangan (dasar kotak, mini-game) dimuat diam-diam setelah adegan tampil
  useEffect(() => {
    if (!ready) return;
    LATE.forEach((n) => {
      const img = new Image();
      img.src = `/art/${n}.webp`;
    });
  }, [ready]);

  // foto laci disiapkan selagi kunci diputar
  useEffect(() => {
    items.forEach((it) => {
      if (!it.photo) return;
      const img = new Image();
      img.src = it.photo;
    });
  }, [items]);

  const play = (seq: number[], gap = 150, at = 0) => seq.forEach((n, i) => later(() => sfx.note(n), at + i * gap));
  /** kecepatan semua animasi mekanik (silinder, bangau, not) */
  const setRate = (r: number) => {
    try {
      boxRef.current?.getAnimations({ subtree: true }).forEach((a) => {
        a.playbackRate = r;
      });
    } catch {
      /* browser lama: lagunya langsung berhenti saja */
    }
  };

  /* ── 1. kunci dipasang ── */
  const insertKey = () => {
    if (phaseRef.current !== 'key') return;
    setKeyAt(null);
    setPhase('wind');
    sfx.whoosh();
    haptic(12);
    later(() => sfx.bonk(), reduce.current ? 60 : 420);
  };
  const onKeyDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0 || phase !== 'key') return;
    dragged.current = false;
    keyDrag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const onKeyMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = keyDrag.current;
    if (!d || d.id !== e.pointerId) return;
    const x = e.clientX - d.x0;
    const y = e.clientY - d.y0;
    if (Math.hypot(x, y) > 6) {
      d.moved = true;
      dragged.current = true;
    }
    if (d.moved) setKeyAt({ x, y });
  };
  const onKeyUp = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const d = keyDrag.current;
    if (!d || d.id !== e.pointerId) return;
    keyDrag.current = null;
    if (!d.moved) return; // ketukan: ditangani onClick
    // dilepas cukup dekat ke kotak (terangkat dari meja): masuk ke lubangnya
    if (!cancelled && e.clientY - d.y0 < -28) insertKey();
    else setKeyAt(null);
  };

  /* ── 2. kunci diputar ── */
  const wound = () => {
    sfx.chime();
    haptic(24);
    if (phaseRef.current === 'wind') {
      setPhase('lid');
    } else if (phaseRef.current === 'slow') {
      // lagunya bangun lagi, dan laci rahasia menyembul
      setAsleep(false);
      setRate(1);
      play(TUNE_BACK, 130, 200);
      later(() => {
        setPhase('secret');
        setBurst((v) => v + 1);
        sfx.success();
        haptic(30);
      }, reduce.current ? 200 : 1000);
    }
  };
  const canWind = phase === 'wind' || (phase === 'slow' && asleep);
  const click = () => {
    if (!(phaseRef.current === 'wind' || (phaseRef.current === 'slow' && asleepRef.current))) return;
    if (clicksRef.current >= TICKS) return;
    const n = clicksRef.current + 1;
    clicksRef.current = n;
    setClicks(n);
    sfx.tap();
    sfx.score(n);
    haptic(8);
    if (n >= TICKS) wound();
  };
  const onWindDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0 || !canWind) return;
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
    // terlalu dekat ke poros: sudutnya belum bisa dipercaya
    if (Math.hypot(e.clientX - w.cx, e.clientY - w.cy) < 8) return;
    const a = Math.atan2(e.clientY - w.cy, e.clientX - w.cx);
    let d = ((a - w.last) * 180) / Math.PI;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    w.last = a;
    if (Math.abs(d) < 0.4) return;
    dragged.current = true;
    setSpinning(false);
    // arah mana pun dihitung (roda giginya pemaaf), tapi kuncinya selalu tampak berputar searah jarum jam
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
    if (!canWind || clicksRef.current >= TICKS) return;
    setSpinning(true);
    setAngle((v) => v + STEP);
    click();
  };

  /* ── 3. tutup diangkat ── */
  const startSlow = () => {
    if (slowed.current || phaseRef.current !== 'drawers') return;
    slowed.current = true;
    setPhase('slow');
    if (reduce.current) {
      clicksRef.current = 2;
      setClicks(2);
      later(() => setAsleep(true), 300);
      return;
    }
    // lagunya makin pelan, penanda putaran padam satu-satu, lalu… tertidur
    const drop = (n: number) => {
      clicksRef.current = n;
      setClicks(n);
    };
    setRate(0.55);
    sfx.note(5);
    drop(4);
    later(() => {
      setRate(0.3);
      sfx.note(4);
      drop(3);
    }, 700);
    later(() => {
      setRate(0.14);
      sfx.note(2);
      drop(2);
    }, 1600);
    later(() => {
      setAsleep(true);
      sfx.wahwah();
      haptic(18);
    }, 2700);
  };
  const openLid = () => {
    if (open || phaseRef.current !== 'lid') return;
    setOpen(true);
    setLidP(0);
    sfx.whoosh();
    haptic(22);
    later(() => {
      sfx.chime();
      setGlitter((v) => v + 1);
      haptic(30);
    }, reduce.current ? 80 : 420);
    play(TUNE_OPEN, 170, reduce.current ? 200 : 900);
    later(() => setPhase('drawers'), reduce.current ? 250 : 1700);
    // kado tanpa laci depan (cuma satu catatan): dengarkan sebentar, lalu lagunya langsung ngantuk
    if (front === 0) later(startSlow, reduce.current ? 900 : 5200);
  };
  /** seret ke atas (tutup kotak, lapisan beludru); ketukan ditangani onClick */
  const onLiftDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0) return;
    dragged.current = false;
    lift.current = { id: e.pointerId, y0: e.clientY, p: 0 };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const onLiftMove = (e: ReactPointerEvent<HTMLButtonElement>, set: (p: number) => void, fire: () => void) => {
    const d = lift.current;
    if (!d || d.id !== e.pointerId) return;
    const dist = d.y0 - e.clientY;
    if (Math.abs(dist) > 6) dragged.current = true;
    d.p = Math.max(0, Math.min(1, dist / 90));
    set(d.p);
    if (d.p >= 1) {
      lift.current = null;
      fire();
    }
  };
  const onLiftUp = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean, set: (p: number) => void, fire: () => void) => {
    const d = lift.current;
    if (!d || d.id !== e.pointerId) return;
    lift.current = null;
    set(0);
    if (!cancelled && dragged.current && d.p > 0.4) fire();
  };
  const tapLift = (fire: () => void) => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    fire();
  };

  /* ── 4. laci-laci kecil ── */
  const openDrawer = (i: number) => {
    if (i >= front) return;
    const ph = phaseRef.current;
    if (opened[i]) {
      // laci yang sudah terbuka: catatannya boleh dibaca lagi
      if (ph === 'drawers' || ph === 'slow' || ph === 'secret' || ph === 'last') {
        sfx.tap();
        setCard(i);
      }
      return;
    }
    if (ph !== 'drawers') return;
    const next = [...opened];
    next[i] = true;
    setOpened(next);
    setCard(i);
    sfx.pop();
    haptic(14);
    play(TUNE_DRAWER[i % TUNE_DRAWER.length], 150, 160);
    let n = 0;
    for (let k = 0; k < front; k++) if (next[k]) n++;
    // semua laci depan sudah dibuka: beri waktu membaca, lalu lagunya melambat
    if (n >= front) later(startSlow, reduce.current ? 900 : 3400);
  };

  /* ── 5. laci rahasia ── */
  const openSecret = () => {
    if (phaseRef.current === 'last') {
      sfx.tap();
      setCard(items.length - 1);
      return;
    }
    if (phaseRef.current !== 'secret') return;
    setSecretOpen(true);
    setCard(items.length - 1);
    setPhase('last');
    sfx.pop();
    later(() => sfx.chime(), 200);
    haptic(26);
    setBurst((v) => v + 1);
  };

  /* ── 6. dasar kotak ── */
  const toGame = () => {
    if (phaseRef.current !== 'last') return;
    sfx.tap();
    haptic(10);
    setCard(null);
    setPhase('game');
  };
  const gameDone = () => {
    setCard(null);
    setPhase('under');
    sfx.whoosh();
  };
  const liftVelvet = () => {
    if (lifted || phaseRef.current !== 'under') return;
    setLifted(true);
    setVelP(0);
    sfx.rustle();
    haptic(20);
    later(() => {
      setPhase('letter');
      sfx.chime();
    }, reduce.current ? 150 : 800);
  };
  const read = () => {
    if (finale) return;
    sfx.chime();
    haptic(15);
    setFinale(true);
  };

  /* ── tampilan ── */
  const inserted = phase !== 'key';
  const playing = open && !asleep;
  const under = phase === 'under' || phase === 'letter';
  const secretOut = phase === 'secret' || phase === 'last' || phase === 'game' || under;
  const nextDrawer = phase === 'drawers' ? Array.from({ length: front }, (_, i) => i).find((i) => !opened[i]) : undefined;
  nextDrawerRef.current = nextDrawer === undefined ? null : drawerRefs.current[nextDrawer] ?? null;
  const say =
    phase === 'key'
      ? t.sayKey
      : phase === 'wind'
        ? t.sayWind
        : phase === 'lid'
          ? open
            ? t.sayPlay
            : t.sayLid
          : phase === 'drawers'
            ? front > 0
              ? t.sayDrawers
              : t.sayPlay
            : phase === 'slow'
              ? asleep
                ? t.saySlow
                : t.saySlowing
              : phase === 'secret'
                ? t.saySecret
                : t.sayLast;
  const shown = card === null ? null : items[card];
  const isLast = card === items.length - 1;

  return (
    <div className={cx(s.wrap, ready && s.ready, open && s.dim, under && s.down, finale && s.over)}>
      {/* kamar meredup begitu kotaknya terbuka, supaya cahaya dari dalam kotak yang jadi bintangnya */}
      <span className={s.dusk} aria-hidden />
      <div className={s.world} aria-hidden={under || finale || undefined}>
        <Sprite name="kotakmusik-taplak" className={s.lace} />
        <div
          ref={boxRef}
          className={cx(s.box, open && s.open, playing && s.playing, asleep && s.asleep, canWind && clicks > 0 && (clicks % 2 ? s.tickA : s.tickB))}
        >
          {/* cahaya keemasan dari dalam kotak: menyembur saat tutup terbuka, berdenyut selama lagunya main */}
          <span className={s.rays} aria-hidden />

          {/* tutup terbuka: cermin dengan ukiran */}
          <div className={s.lidOpen}>
            <Sprite name="kotakmusik-tutup-dalam" className={s.fill} />
            <div className={s.mirror}>
              <b className={cx(s.engraved, title.length > 18 && s.long, title.length > 30 && s.xl)}>{title}</b>
            </div>
          </div>

          <Sprite name="kotakmusik-badan" className={s.body} />
          <span className={s.pins} aria-hidden />
          <span className={s.bloom} aria-hidden />

          {/* laci rahasia di bawah cermin */}
          <button
            ref={secretRef}
            type="button"
            className={cx(s.secret, secretOut && s.secretOut, secretOpen && s.secretOpen)}
            disabled={!(phase === 'secret' || phase === 'last')}
            tabIndex={phase === 'secret' || phase === 'last' ? 0 : -1}
            aria-label={t.secretLabel}
            onClick={openSecret}
          >
            <span className={s.secretSlip} aria-hidden />
            <Sprite name="kotakmusik-laci-rahasia" className={s.secretArt} />
          </button>

          {/* sepasang bangau kertas di atas per */}
          <div className={s.crane} aria-hidden>
            <div className={s.craneSpin}>
              <Sprite name="kotakmusik-bangau" className={s.fill} />
            </div>
          </div>

          {/* not & kilau yang naik dari silinder */}
          <div className={s.notes} aria-hidden>
            {FLOAT.map(([name, x, dur, delay, sway, rise], i) => (
              <span key={i} className={s.float} style={{ left: `${x}%`, '--d': `${dur}s`, '--delay': `${delay}s`, '--sway': sway, '--rise': rise } as CSSProperties}>
                <Sprite name={`kotakmusik-${name}`} className={cx(s.floatArt, name === 'kilau' && s.twinkle)} />
              </span>
            ))}
          </div>

          {/* laci-laci kecil di muka kotak */}
          {SLOTS.map(([x, y], i) => {
            const has = i < front;
            const isOpen = !!opened[i];
            return (
              <button
                key={i}
                ref={(el) => {
                  drawerRefs.current[i] = el;
                }}
                type="button"
                className={cx(s.drawer, isOpen && s.drawerOpen, has && !isOpen && phase === 'drawers' && s.live, card === i && s.reading)}
                style={{ left: `calc(${x - 4}em / 32)`, top: `calc(${290 + y - 4}em / 32)` }}
                disabled={!has || !open}
                tabIndex={has && phase === 'drawers' ? 0 : -1}
                aria-label={fmt(t.drawerLabel, { i: i + 1 })}
                aria-expanded={has ? isOpen : undefined}
                onClick={() => openDrawer(i)}
              >
                <span className={s.lining} aria-hidden />
                <span className={s.slip} aria-hidden />
                <Sprite name="kotakmusik-laci" className={s.drawerArt} />
                <i className={s.glint} aria-hidden />
              </button>
            );
          })}

          {/* penanda putaran + kunci di lubangnya */}
          <div className={s.ticks} aria-hidden>
            {Array.from({ length: TICKS }, (_, i) => (
              <i key={i} className={cx(i < clicks && s.on)} />
            ))}
          </div>
          <button
            ref={winderRef}
            type="button"
            className={cx(s.winder, inserted && s.in, canWind && s.canWind)}
            disabled={!canWind}
            tabIndex={canWind ? 0 : -1}
            aria-label={t.windLabel}
            onPointerDown={onWindDown}
            onPointerMove={onWindMove}
            onPointerUp={onWindUp}
            onPointerCancel={onWindUp}
            onClick={tapWind}
          >
            <span className={cx(s.winderTurn, spinning && s.snap)} style={{ transform: `rotate(${angle}deg)` }}>
              <Sprite name="kotakmusik-kunci-putar" className={s.fill} />
            </span>
          </button>

          {/* tutup tertutup */}
          <div className={s.lidClosed} style={{ '--lp': lidP } as CSSProperties} aria-hidden>
            <Sprite name="kotakmusik-tutup" className={s.fill} />
          </div>
          {phase === 'lid' && !open ? (
            <button
              ref={lidRef}
              type="button"
              className={s.lidHit}
              aria-label={t.lidLabel}
              onPointerDown={onLiftDown}
              onPointerMove={(e) => onLiftMove(e, setLidP, openLid)}
              onPointerUp={(e) => onLiftUp(e, false, setLidP, openLid)}
              onPointerCancel={(e) => onLiftUp(e, true, setLidP, openLid)}
              onClick={() => tapLift(openLid)}
            />
          ) : null}
        </div>

        {/* kunci kuningan yang rebah di meja */}
        <button
          ref={keyRef}
          type="button"
          className={cx(s.key, inserted && s.keyGone, keyAt && s.keyDrag)}
          style={keyAt ? { transform: `translate(${keyAt.x}px, ${keyAt.y}px) rotate(-8deg) scale(1.06)` } : undefined}
          disabled={inserted}
          tabIndex={inserted ? -1 : 0}
          aria-label={t.keyLabel}
          onPointerDown={onKeyDown}
          onPointerMove={onKeyMove}
          onPointerUp={(e) => onKeyUp(e, false)}
          onPointerCancel={(e) => onKeyUp(e, true)}
          onClick={() => {
            if (dragged.current) {
              dragged.current = false;
              return;
            }
            insertKey();
          }}
        >
          <Sprite name="kotakmusik-kunci" className={s.fill} />
        </button>

        {/* catatan dari laci, tergeletak di meja */}
        <div className={s.cardZone} aria-live="polite">
          {shown && !under ? (
            <div key={card} className={cx(s.card, isLast && s.cardGold, !shown.photo && s.cardPlain)}>
              {shown.photo ? (
                <span className={s.frame}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={shown.photo} alt={fmt(t.photoAlt, { i: (card ?? 0) + 1 })} draggable={false} />
                </span>
              ) : null}
              <span className={s.cardBody}>
                <span className={s.cardTag}>{isLast ? t.secretTag : fmt(t.drawerTag, { i: (card ?? 0) + 1 })}</span>
                {shown.note ? <span className={cx(s.cardText, shown.note.length > 44 && s.long)}>{shown.note}</span> : null}
              </span>
              {isLast ? <Sprite name="bunga-kamboja-pink" className={s.cardFlower} /> : null}
            </div>
          ) : null}
        </div>
      </div>

      {!under && phase !== 'game' ? (
        <div className={s.head}>
          <span className={s.eyebrow}>{t.eyebrow}</span>
          <b className={cx(s.name, to.length > 11 && s.long, to.length > 16 && s.xl)}>{to}</b>
          <p key={say} className={s.say} role="status">
            {say}
          </p>
        </div>
      ) : null}

      {/* dasar kotak dilihat dari atas: beludru diangkat, suratnya terlihat */}
      {under && !finale ? (
        <div className={s.under}>
          <span className={s.underEyebrow}>{t.underEyebrow}</span>
          <p key={lifted ? 'f' : 'l'} className={s.underLine}>
            {lifted ? fmt(t.underFound, { to }) : t.underLine}
          </p>
          <div className={s.tray}>
            <Sprite name="kotakmusik-dasar" className={s.fill} />
            <button
              ref={velvetRef}
              type="button"
              className={cx(s.velvet, lifted && s.lifted)}
              style={{ '--vp': velP } as CSSProperties}
              disabled={lifted}
              aria-label={t.velvetLabel}
              onPointerDown={onLiftDown}
              onPointerMove={(e) => onLiftMove(e, setVelP, liftVelvet)}
              onPointerUp={(e) => onLiftUp(e, false, setVelP, liftVelvet)}
              onPointerCancel={(e) => onLiftUp(e, true, setVelP, liftVelvet)}
              onClick={() => tapLift(liftVelvet)}
            >
              <Sprite name="kotakmusik-beludru" className={s.velvetArt} />
            </button>
          </div>
        </div>
      ) : null}

      {!finale && phase !== 'game' ? (
        <div className={s.foot}>
          {phase === 'last' ? (
            <button ref={ctaRef} type="button" className={cx(s.cta, s.ctaLate)} onClick={toGame}>
              {t.next} <span aria-hidden>→</span>
            </button>
          ) : null}
          {phase === 'letter' ? (
            <button ref={ctaRef} type="button" className={s.cta} onClick={read}>
              {t.read} <span aria-hidden>→</span>
            </button>
          ) : null}
        </div>
      ) : null}

      {phase === 'key' && ready ? <Hint key="hKey">{t.hintKey}</Hint> : null}
      {phase === 'wind' ? <Hint key="hWind">{t.hintWind}</Hint> : null}
      {phase === 'lid' && !open ? <Hint key="hLid">{t.hintLid}</Hint> : null}
      {phase === 'drawers' && front > 0 && card === null ? <Hint key="hDrawer">{t.hintDrawer}</Hint> : null}
      {phase === 'slow' && asleep ? <Hint key="hRewind">{t.hintRewind}</Hint> : null}
      {phase === 'secret' ? <Hint key="hSecret">{t.hintSecret}</Hint> : null}
      {phase === 'under' && !lifted ? <Hint key="hVelvet">{t.hintVelvet}</Hint> : null}

      {finale ? null : phase === 'key' ? (
        ready ? <TapCue key="cueKey" target={keyRef} delay={2200} /> : null
      ) : phase === 'wind' ? (
        <TapCue key="cueWind" target={winderRef} delay={2000} />
      ) : phase === 'lid' ? (
        !open ? <TapCue key="cueLid" target={lidRef} kind="drag" dir={{ x: 0, y: -3.4 }} at={{ x: 0.5, y: 0.3 }} delay={2000} /> : null
      ) : phase === 'drawers' ? (
        nextDrawer !== undefined ? <TapCue key={`cueDrawer${nextDrawer}`} target={nextDrawerRef} delay={nextDrawer === 0 ? 2200 : 5200} /> : null
      ) : phase === 'slow' ? (
        asleep ? <TapCue key="cueRewind" target={winderRef} delay={1800} /> : null
      ) : phase === 'secret' ? (
        <TapCue key="cueSecret" target={secretRef} delay={2000} />
      ) : phase === 'last' ? (
        <TapCue key="cueNext" target={ctaRef} delay={5200} />
      ) : phase === 'under' ? (
        !lifted ? <TapCue key="cueVelvet" target={velvetRef} kind="drag" dir={{ x: 0, y: -3.4 }} at={{ x: 0.5, y: 0.9 }} delay={2000} /> : null
      ) : phase === 'letter' ? (
        <TapCue key="cueRead" target={ctaRef} delay={3200} />
      ) : null}

      <Confetti burst={glitter} count={70} origin={{ x: 0.5, y: 0.42 }} colors={['#fff4cc', '#f1d58a', '#fffdf5', '#e9c66f', '#f6b8c2']} />
      <Confetti burst={burst} count={80} origin={{ x: 0.5, y: 0.4 }} colors={['#f1d58a', '#fff4cc', '#b5475a', '#f09aa6', '#fffaf0', '#c99a3e']} shapes="hearts" />

      {phase === 'game' ? <SleepyNoteGame t={t.game} onDone={gameDone} /> : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja-pink"
          theme={{
            bg: `linear-gradient(180deg, rgba(74, 32, 26, 0.5), rgba(96, 44, 34, 0.34) 46%, rgba(70, 32, 22, 0.5)), url(${BACKDROP})`,
            ink: '#fff3e2',
            paper: '#fffaf2',
            paperInk: '#3a2420',
          }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
