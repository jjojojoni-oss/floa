'use client';

import { type CSSProperties, type PointerEvent as ReactPointerEvent, createRef, useEffect, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Sprite, Stage, TapCue, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { Cat, CatGame, Doorstep, type Mood } from './Game';
import { TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const ART = ['bg-rumah', 'rumah-dalam', 'rumah-badan', 'rumah-fasad', 'rumah-atap', 'rumah-tirai', 'rumah-bohlam', 'game-rumah-kucing', 'game-rumah-ekor'];
/** baru dibutuhkan belakangan: dimuat diam-diam setelah adegan pertama tampil */
const LATE = ['rumah-malam', 'rumah-bulan', 'rumah-asap', 'game-rumah-teras', 'rumah-keset', 'rumah-surat', 'bunga-kamboja'];

/**
 * bell  → rumah boneka tertutup saat senja, semua jendela gelap: bel diketuk, ding-dong, lampu teras menyala
 * open  → muka rumah digeser ke kanan (atau diketuk) dan terbuka seperti pintu lemari: lima ruangan gelap
 * rooms → lampu tiap ruangan dinyalakan (ketuk, atau tarik rantainya ke bawah): kamarnya hangat, benda kecilnya
 *         hidup, kenangannya muncul di atas dan fotonya tergantung di dinding. Lampu loteng ngambek: dua kali.
 * night → momen "wah": muka rumah menutup, kamera mundur, malam turun, lampu untai menyala satu-satu, cerobong
 *         mengepulkan asap berbentuk hati, kunang-kunang, judul tertulis di papan atas pintu
 * game  → mini-game: si Oren tidur di keset dan tidak mau pindah
 * mat   → keset diangkat (seret ke atas atau ketuk): surat terlipat di bawahnya → surat
 */
type Phase = 'bell' | 'open' | 'rooms' | 'night' | 'game' | 'mat';

type Room = {
  /** kotak ruangan (satuan dunia: x0, y0, x1, y1) */
  box: [number, number, number, number];
  /** pusat cahaya lampu */
  lamp: [number, number];
  /** rantai lampu: x, y, panjang */
  chain: [number, number, number];
  /** bingkai foto di dinding: x, y, lebar, tinggi */
  photo: [number, number, number, number];
};
/** urutan = urutan kenangan: ruang tamu, dapur, kamar tidur, loteng, teras */
const ROOMS: Room[] = [
  { box: [124, 952, 381, 1184], lamp: [254, 1018], chain: [268, 1012, 34], photo: [160, 1004, 56, 46] },
  { box: [399, 952, 656, 1184], lamp: [515, 1016], chain: [527, 1010, 34], photo: [432, 998, 52, 42] },
  { box: [124, 718, 381, 932], lamp: [332, 846], chain: [343, 849, 15], photo: [252, 752, 48, 42] },
  { box: [144, 486, 636, 700], lamp: [390, 588], chain: [397, 598, 46], photo: [432, 624, 44, 38] },
  { box: [399, 718, 656, 932], lamp: [527, 780], chain: [538, 780, 26], photo: [546, 802, 44, 36] },
];
/** loteng: lampunya ngambek, perlu dibujuk dua kali */
const GAG = 3;
/** lampu untai di bawah lis atap, dari ujung kiri naik ke bubungan lalu turun ke kanan */
const BULBS: [number, number][] = [
  [86, 775], [126, 740], [166, 705], [206, 670], [246, 636], [286, 601], [326, 566], [366, 531],
  [414, 531], [454, 566], [494, 601], [534, 636], [574, 670], [614, 705], [654, 740], [694, 775],
];
/** cahaya jendela yang memancar keluar di malam hari (pusat x, y, jari-jari x, y) */
const HALOS: [number, number, number, number][] = [
  [228, 1108, 96, 76], [552, 1108, 96, 76], [232, 815, 92, 86], [540, 836, 104, 118], [390, 618, 60, 60],
];
/** kunang-kunang (satuan dunia): x, y, jeda, lama */
const FLIES: [number, number, number, number][] = [
  [52, 1120, 0, 4.4], [726, 1100, -1.2, 5.2], [150, 980, -2.6, 4.8], [646, 960, -0.6, 5.6], [30, 860, -3.4, 4.6],
  [748, 860, -1.8, 5], [250, 1290, -2.2, 5.4], [560, 1300, -0.4, 4.6], [96, 740, -3, 5.8], [690, 700, -1.4, 4.9],
  [410, 1320, -2.8, 5.2], [720, 1220, -3.8, 4.4],
];
const OPEN_DEG = 104;

/** cahaya lampu yang memenuhi ruangan: titik terang di lampu + kerucut cahaya ke bawah */
function glowOf(r: Room) {
  const w = r.box[2] - r.box[0];
  const h = r.box[3] - r.box[1];
  const x = (((r.lamp[0] - r.box[0]) / w) * 100).toFixed(1);
  const y = (((r.lamp[1] - r.box[1]) / h) * 100).toFixed(1);
  const y2 = Math.min(92, ((r.lamp[1] - r.box[1]) / h) * 100 + 34).toFixed(1);
  return [
    `radial-gradient(circle at ${x}% ${y}%, rgba(255, 244, 210, 0.85), rgba(255, 214, 140, 0.34) 18%, rgba(255, 190, 110, 0) 56%)`,
    `radial-gradient(ellipse 46% 62% at ${x}% ${y2}%, rgba(255, 206, 130, 0.3), rgba(255, 190, 110, 0) 70%)`,
  ].join(', ');
}

/** satuan dunia → em (1em di dalam dunia = 32 satuan) */
const u = (n: number) => `${+(n / 32).toFixed(4)}em`;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export default function Rumah(props: TemplateProps) {
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
  const title = data.title.trim() || t.titleFallback;
  const chars = useMemo(() => Array.from(title), [title]);

  /** kenangan ke-i berpasangan dengan foto ke-i (dipasangkan per ruangan dulu, yang kosong diberi celetukan rumah) */
  const items = useMemo(
    () =>
      ROOMS.map((_, i) => {
        const note = (data.notes[i] ?? '').trim();
        return { note: note || t.roomEmpty[i], own: !!note, photo: data.photos[i] || null };
      }),
    [data.notes, data.photos, t.roomEmpty],
  );

  const [phase, setPhase] = useState<Phase>('bell');
  const [rang, setRang] = useState(false);
  const [catMood, setCatMood] = useState<Mood>('sleep');
  /** muka rumah: 0 tertutup … 1 terbuka penuh */
  const [ang, setAng] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [opened, setOpened] = useState(false);
  const [lit, setLit] = useState<boolean[]>(() => ROOMS.map(() => false));
  const [pulls, setPulls] = useState<number[]>(() => ROOMS.map(() => 0));
  /** 0 belum dicoba, 1 ngambek, 2 akhirnya menyala */
  const [gag, setGag] = useState(0);
  const [flick, setFlick] = useState(false);
  const [beam, setBeam] = useState(false);
  /** ruangan yang kenangannya sedang tampil di atas */
  const [shown, setShown] = useState<number | null>(null);
  const [nightOn, setNightOn] = useState(false);
  const [bulbs, setBulbs] = useState(0);
  const [smoke, setSmoke] = useState(false);
  const [engraved, setEngraved] = useState(0);
  const [engraving, setEngraving] = useState(false);
  /** kamera mendekat ke papan nama selagi judulnya tertulis */
  const [zoom, setZoom] = useState(false);
  const [cta, setCta] = useState(false);
  const [lifted, setLifted] = useState(false);
  const [matPull, setMatPull] = useState(0);
  const [letterOut, setLetterOut] = useState(false);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);

  const phaseRef = useRef<Phase>('bell');
  phaseRef.current = phase;
  const litRef = useRef<boolean[]>(lit);
  const gagRef = useRef(0);
  /** lampu loteng sedang berkedip: ketukan menunggu sampai ia selesai ngambek */
  const flickRef = useRef(false);
  const angRef = useRef(0);
  angRef.current = ang;
  const openedRef = useRef(false);
  const reduce = useRef(false);
  const hitRef = useRef<HTMLButtonElement>(null);
  const bellRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const matRef = useRef<HTMLButtonElement>(null);
  const letterRef = useRef<HTMLButtonElement>(null);
  const chainRefs = useMemo(() => ROOMS.map(() => createRef<HTMLSpanElement>()), []);
  /** seret muka rumah / tarik rantai / angkat keset; seret yang baru terjadi membatalkan klik sesudahnya */
  const drag = useRef<{ id: number; x0: number; y0: number; w: number; room: number; done: boolean } | null>(null);
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

  /* ── 1. bel ── */
  const ring = () => {
    if (rang || phaseRef.current !== 'bell') return;
    setRang(true);
    sfx.note(7);
    later(() => sfx.note(4), 380);
    haptic(14);
    later(() => setCatMood('peek'), ms(500));
    later(() => setCatMood('sleep'), ms(1700));
    later(() => setPhase('open'), ms(2600, 0.3));
  };

  /* ── 2. muka rumah dibuka ── */
  const openFacade = () => {
    if (openedRef.current || phaseRef.current !== 'open') return;
    openedRef.current = true;
    drag.current = null;
    setDragging(false);
    setOpened(true);
    setAng(1);
    sfx.tug();
    later(() => sfx.whoosh(), 120);
    haptic(18);
    later(() => setPhase('rooms'), ms(1200));
  };

  /* ── 3. lampu tiap ruangan ── */
  const toNight = () => {
    if (phaseRef.current !== 'rooms') return;
    setPhase('night');
    setShown(null);
    setOpened(false);
    setAng(0);
    later(() => {
      sfx.bonk();
      haptic(14);
    }, ms(1500, 0.1));
    later(() => setNightOn(true), ms(500, 0.1));
    BULBS.forEach((_, i) =>
      later(
        () => {
          setBulbs(i + 1);
          if (i % 2 === 0) sfx.note(i / 2);
        },
        ms(2300 + i * 130, 0.1),
      ),
    );
    later(() => setSmoke(true), ms(3600, 0.15));
    later(() => !reduce.current && setZoom(true), 4700);
    later(() => setEngraving(true), ms(5800, 0.15));
  };
  const light = (i: number) => {
    if (phaseRef.current !== 'rooms' || litRef.current[i] || (i === GAG && flickRef.current)) return;
    setPulls((p) => p.map((v, k) => (k === i ? v + 1 : v)));
    setShown(i);
    sfx.tug();
    haptic(10);
    if (i === GAG && gagRef.current === 0) {
      // lampu loteng ngambek: berkedip, lalu padam lagi
      gagRef.current = 1;
      flickRef.current = true;
      setGag(1);
      setFlick(true);
      later(() => sfx.tap(), 260);
      later(() => sfx.tap(), 560);
      later(() => {
        flickRef.current = false;
        setFlick(false);
        sfx.wahwah();
      }, ms(1300, 0.2));
      return;
    }
    if (i === GAG) {
      gagRef.current = 2;
      setGag(2);
      setBeam(true);
      later(() => setBeam(false), ms(2600, 0.3));
    }
    const next = litRef.current.map((v, k) => v || k === i);
    litRef.current = next;
    setLit(next);
    later(() => {
      sfx.pop();
      sfx.note([2, 4, 5, 7, 6][i]);
    }, 110);
    if (next.every(Boolean)) {
      const read = Math.min(5600, Math.max(3000, items[i].note.length * 60));
      later(toNight, ms(read, 0.3));
    }
  };

  /* ── 4. judul tertulis di papan atas pintu ── */
  useEffect(() => {
    if (!engraving) return;
    if (reduce.current) {
      setEngraved(chars.length);
      later(() => setCta(true), 900);
      return;
    }
    let n = 0;
    const step = () => {
      n += 1;
      setEngraved(n);
      if (n % 2) sfx.tap();
      if (n < chars.length) later(step, chars[n - 1] === ' ' ? 40 : 80);
      else {
        later(() => {
          sfx.chime();
          haptic(16);
          setBurst((v) => v + 1);
        }, 220);
        later(() => setZoom(false), 2200);
        later(() => setCta(true), 3400);
      }
    };
    later(step, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engraving]);

  /* ── 5. game, keset, surat ── */
  const toGame = () => {
    if (phaseRef.current !== 'night' || !cta) return;
    sfx.tap();
    setPhase('game');
  };
  const gameDone = () => {
    setPhase('mat');
    sfx.whoosh();
  };
  const lift = () => {
    if (lifted || phaseRef.current !== 'mat') return;
    drag.current = null;
    setLifted(true);
    setMatPull(0);
    sfx.rustle();
    haptic(16);
  };
  const openLetter = () => {
    if (!lifted || letterOut || phaseRef.current !== 'mat') return;
    setLetterOut(true);
    sfx.crack();
    haptic(16);
    later(() => {
      sfx.chime();
      setFinale(true);
    }, ms(1100, 0.3));
  };

  /* ── gestur: seret muka rumah ke kanan, tarik rantai ke bawah, angkat keset ke atas ── */
  const capture = (e: ReactPointerEvent<HTMLElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const onDown = (room: number) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0) return;
    dragged.current = false;
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, w: e.currentTarget.getBoundingClientRect().width, room, done: false };
    capture(e);
  };
  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || d.done) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    const ph = phaseRef.current;
    if (ph === 'open' && d.room === -1) {
      if (dx > 6) {
        dragged.current = true;
        setDragging(true);
      }
      if (!dragged.current) return;
      const p = clamp01(dx / (d.w * 0.7));
      setAng(p);
      if (p > 0.6) {
        d.done = true;
        openFacade();
      }
    } else if (ph === 'rooms' && d.room >= 0 && dy > 14) {
      dragged.current = true;
      d.done = true;
      light(d.room);
    } else if (ph === 'mat' && d.room === -2) {
      const up = -dy;
      if (up > 6) dragged.current = true;
      if (!dragged.current) return;
      const p = clamp01(up / (d.w * 0.5));
      setMatPull(p);
      if (p > 0.5) {
        d.done = true;
        lift();
      }
    }
  };
  const onUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (d.done) return;
    const ph = phaseRef.current;
    if (ph === 'open' && d.room === -1 && dragged.current) {
      setDragging(false);
      if (angRef.current > 0.25) openFacade();
      else setAng(0);
    }
    if (ph === 'mat' && d.room === -2 && dragged.current) {
      if (matPull > 0.2) lift();
      else setMatPull(0);
    }
  };
  /** ketukan instan (tanpa seret) selalu cukup */
  const tapped = () => {
    if (dragged.current) {
      dragged.current = false;
      return false;
    }
    return true;
  };
  const onFacadeTap = () => {
    if (!tapped()) return;
    if (phaseRef.current === 'bell') ring();
    else if (phaseRef.current === 'open') openFacade();
  };

  /* ── tampilan ── */
  const night = phase === 'night';
  const litCount = lit.filter(Boolean).length;
  const nextRoom = lit.findIndex((v) => !v);
  const away = phase === 'game' || phase === 'mat' || finale;
  const noteMode = phase === 'rooms' && shown !== null;
  const sulking = noteMode && shown === GAG && gag === 1;
  const item = shown !== null ? items[shown] : null;
  const say =
    phase === 'bell'
      ? rang
        ? t.sayRang
        : t.sayBell
      : phase === 'open'
        ? t.sayOpen
        : phase === 'rooms'
          ? t.sayRooms
          : cta
            ? t.sayCat
            : engraving
              ? t.sayTitle
              : t.sayNight;
  const facadeStyle = { transform: `rotateY(${(ang * OPEN_DEG).toFixed(2)}deg)` } as CSSProperties;

  return (
    <div className={cx(s.wrap, ready && s.ready, nightOn && s.night, zoom && s.zoom, away && s.away, finale && s.over)}>
      <div className={s.cam} aria-hidden={away || undefined}>
        <Sprite name="bg-rumah" className={s.bg} decoding="sync" />
        <Sprite name="rumah-malam" className={s.sky} />
        <span className={s.dim} />
        <span className={s.aura} />
        <span className={cx(s.star, nightOn && s.starGo)} />
        <div className={cx(s.house, rang && s.porchOn)}>
          <Sprite name="rumah-bulan" className={s.moon} />
          {/* isi kamar + benda-benda kecil yang hidup saat lampunya menyala */}
          <Sprite name="rumah-dalam" className={s.dalam} decoding="sync" />
          <span className={cx(s.pendulum, lit[0] && s.live)} />
          <span className={cx(s.curtain, s.curtainK, lit[1] && s.live)}>
            <Sprite name="rumah-tirai" className={s.fill} />
          </span>
          <span className={cx(s.curtain, s.curtainB1, lit[2] && s.live)}>
            <Sprite name="rumah-tirai" className={s.fill} />
          </span>
          <span className={cx(s.curtain, s.curtainB2, lit[2] && s.live)}>
            <Sprite name="rumah-tirai" className={s.fill} />
          </span>
          {ROOMS.map((r, i) => (
            <span
              key={`d${i}`}
              className={cx(s.dark, i === GAG && s.tri, lit[i] && s.off, i === GAG && flick && s.flicker)}
              style={{ left: u(r.box[0] - 2), top: u(r.box[1] - 2), width: u(r.box[2] - r.box[0] + 4), height: u(r.box[3] - r.box[1] + 4) }}
            />
          ))}
          {ROOMS.map((r, i) => (
            <span
              key={`g${i}`}
              className={cx(s.glow, i === GAG && s.tri, lit[i] && s.on, i === GAG && flick && s.flash)}
              style={{
                left: u(r.box[0]),
                top: u(r.box[1]),
                width: u(r.box[2] - r.box[0]),
                height: u(r.box[3] - r.box[1]),
                background: glowOf(r),
              }}
            />
          ))}
          {/* bohlam loteng: berayun saat menyala, cemberut saat ngambek */}
          <span className={cx(s.bulb, lit[GAG] && s.bulbOn, flick && s.bulbFlick, gag === 1 && !flick && s.bulbSulk)}>
            <Sprite name="rumah-bohlam" className={s.fill} />
            {gag === 1 || beam ? (
              <svg className={s.bulbFace} viewBox="0 0 30 110" aria-hidden>
                {gag === 1 ? (
                  <>
                    <path d="M9.6,93.4l3,1.2M20.4,93.4l-3,1.2" stroke="#3a2a1e" strokeWidth={1.1} strokeLinecap="round" />
                    <path d="M12.4,101q2.6,-2 5.2,0" fill="none" stroke="#3a2a1e" strokeWidth={1} strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <path d="M9.6,95q1.6,-2 3.2,0M17.2,95q1.6,-2 3.2,0" fill="none" stroke="#3a2a1e" strokeWidth={1} strokeLinecap="round" />
                    <path d="M12,99.4q3,2.8 6,0" fill="none" stroke="#3a2a1e" strokeWidth={1} strokeLinecap="round" />
                  </>
                )}
              </svg>
            ) : null}
          </span>
          {gag === 1 && !flick && phase === 'rooms' ? (
            <span key="hmph" className={s.hmph}>
              <b>{t.gagHmph}</b>
            </span>
          ) : beam ? (
            <span key="hehe" className={cx(s.hmph, s.hehe)}>
              <b>{t.gagHehe}</b>
            </span>
          ) : null}
          {/* uap teko, nada radio, debu berkilau di loteng */}
          <span className={cx(s.steam, lit[1] && s.live)}>
            <i />
            <i />
            <i />
          </span>
          <span className={cx(s.tunes, lit[4] && s.live)}>
            <i>♪</i>
            <i>♫</i>
          </span>
          <span className={cx(s.motes, lit[GAG] && s.live)}>
            {Array.from({ length: 7 }, (_, k) => (
              <i key={k} />
            ))}
          </span>
          {/* foto kecil di dinding tiap ruangan */}
          {ROOMS.map((r, i) =>
            lit[i] && items[i].photo ? (
              <span key={`p${i}`} className={s.frame} style={{ left: u(r.photo[0]), top: u(r.photo[1]), width: u(r.photo[2]), height: u(r.photo[3]) }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={items[i].photo!} alt={fmt(t.photoAlt, { room: t.rooms[i].toLowerCase() })} draggable={false} />
              </span>
            ) : null,
          )}

          <Sprite name="rumah-badan" className={s.badan} decoding="sync" />

          {/* rantai lampu */}
          {ROOMS.map((r, i) => (
            <span
              key={`c${i}-${pulls[i]}`}
              hidden={phase !== 'rooms' && phase !== 'open'}
              ref={chainRefs[i]}
              className={cx(s.chain, pulls[i] > 0 && s.pulled, lit[i] && s.chainLit)}
              style={{ left: u(r.chain[0] - 6), top: u(r.chain[1]), height: u(r.chain[2] + 8) }}
            />
          ))}

          {/* muka rumah: berengsel di kanan, terbuka seperti pintu lemari */}
          <div className={cx(s.fasad, dragging && s.dragging, opened && s.opened, night && s.closing)} style={facadeStyle}>
            <div className={s.front}>
              <Sprite name="rumah-fasad" className={s.fill} decoding="sync" />
              <span className={s.porch} />
              <span ref={bellRef} className={cx(s.bell, rang && s.rung)}>
                {rang ? (
                  <>
                    <svg className={s.dingA} viewBox="0 0 24 24" aria-hidden>
                      <path d="M9 18V5l11-2v13" fill="none" stroke="#fff6e0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="6.5" cy="18" r="3" fill="#fff6e0" />
                      <circle cx="17.5" cy="16" r="3" fill="#fff6e0" />
                    </svg>
                    <svg className={s.dingB} viewBox="0 0 24 24" aria-hidden>
                      <path d="M10 18V4l7 3" fill="none" stroke="#fff6e0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="7.5" cy="18" r="3" fill="#fff6e0" />
                    </svg>
                  </>
                ) : null}
              </span>
              {HALOS.map(([x, y, rx, ry], i) => (
                <span key={`h${i}`} className={s.halo} style={{ left: u(x - 100 - rx), top: u(y - 476 - ry), width: u(rx * 2), height: u(ry * 2) }} />
              ))}
              <div className={s.sign}>
                <span className={cx(s.signText, chars.length > 14 && s.long, chars.length > 28 && s.xl)}>
                  {chars.map((ch, i) => (
                    <span key={i} className={cx(s.ch, i < engraved && s.cut)}>
                      {ch}
                    </span>
                  ))}
                </span>
              </div>
            </div>
            <div className={s.back}>
              <span className={s.backPaint} />
            </div>
          </div>

          <Sprite name="rumah-atap" className={s.atap} decoding="sync" />
          <span className={s.bulbs} aria-hidden>
            {BULBS.map(([x, y], i) => (
              <i key={i} className={cx(i < bulbs && s.on)} style={{ left: u(x), top: u(y) }} />
            ))}
          </span>
          {smoke ? (
            <span className={s.smoke} aria-hidden>
              {[0, 1, 2].map((k) => (
                <Sprite key={k} name="rumah-asap" className={s.heart} style={{ animationDelay: `${k * 1.6}s` }} />
              ))}
            </span>
          ) : null}
          <Cat mood={catMood} className={s.cat} />
          <span className={cx(s.tag, phase === 'rooms' && s.tagAway)}>
            <b>{fmt(t.tag, { to })}</b>
          </span>

          {/* area sentuh */}
          {(phase === 'bell' && !rang) || (phase === 'open' && !opened) ? (
            <button
              ref={hitRef}
              type="button"
              className={cx(s.hit, phase === 'open' && s.hitDrag)}
              aria-label={phase === 'bell' ? t.bellLabel : t.openLabel}
              onPointerDown={onDown(-1)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onClick={onFacadeTap}
            />
          ) : null}
          {phase === 'rooms'
            ? ROOMS.map((r, i) =>
                lit[i] ? null : (
                  <button
                    key={`b${i}`}
                    type="button"
                    className={cx(s.roomHit, i === GAG && s.tri)}
                    style={{ left: u(r.box[0]), top: u(r.box[1]), width: u(r.box[2] - r.box[0]), height: u(r.box[3] - r.box[1]) }}
                    aria-label={fmt(t.roomLabel, { room: t.rooms[i].toLowerCase() })}
                    onPointerDown={onDown(i)}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onPointerCancel={onUp}
                    onClick={() => tapped() && light(i)}
                  />
                ),
              )
            : null}
        </div>

        <span className={cx(s.flies, night && s.fliesOn)} aria-hidden>
          {FLIES.map(([x, y, d, dur], i) => (
            <i key={i} style={{ left: u(x), top: u(y), animationDelay: `${d}s`, animationDuration: `${dur}s` }} />
          ))}
        </span>
      </div>

      {/* kepala: untuk siapa + celetukan, atau kenangan ruangan yang baru menyala */}
      {!away ? (
        <div className={s.head}>
          {noteMode && item ? (
            <>
              <span className={s.roomName}>{t.rooms[shown!]}</span>
              <p key={`n${shown}-${gag}`} className={cx(s.note, (sulking || !item.own) && s.noteSoft)} role="status">
                {sulking ? t.sayGag : item.note}
              </p>
            </>
          ) : (
            <>
              <span className={s.eyebrow}>{t.eyebrow}</span>
              <b className={cx(s.name, to.length > 11 && s.long, to.length > 16 && s.xl)}>{to}</b>
              <p key={say} className={s.say} role="status">
                {say}
              </p>
            </>
          )}
          {phase === 'rooms' ? (
            <span className={s.pips} aria-hidden>
              {lit.map((on, i) => (
                <i key={i} className={cx(on && s.on, i === GAG && gag === 1 && !on && s.sulk)} />
              ))}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* langkah keset: teras dari dekat, keset diangkat, surat di bawahnya */}
      {phase === 'mat' && !finale ? (
        <div className={s.step}>
          <Doorstep>
            <button ref={letterRef} type="button" className={cx(s.letter, lifted && s.letterLive, letterOut && s.letterOut)} disabled={!lifted || letterOut} aria-label={t.letterLabel} onClick={openLetter}>
              <span className={s.letterArt}>
                <Sprite name="rumah-surat" className={s.fill} />
              </span>
            </button>
            <button
              ref={matRef}
              type="button"
              className={cx(s.mat, lifted && s.matOff)}
              disabled={lifted}
              aria-label={t.matLabel}
              onPointerDown={onDown(-2)}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onClick={() => tapped() && lift()}
            >
              <span className={s.matArt} style={!lifted && matPull > 0 ? ({ transform: `perspective(${u(1600)}) rotateX(${(-matPull * 55).toFixed(1)}deg)`, animation: 'none' } as CSSProperties) : undefined}>
                <Sprite name="rumah-keset" className={s.fill} />
              </span>
            </button>
            <Cat mood="sleep" className={s.basketCat} />
          </Doorstep>
          <div className={s.head}>
            <span className={s.eyebrow}>{t.matEyebrow}</span>
            <p key={lifted ? 'f' : 'l'} className={s.matLine}>
              {lifted ? fmt(t.matFound, { to }) : t.matLine}
            </p>
          </div>
        </div>
      ) : null}

      {night && cta && !finale ? (
        <div className={s.foot}>
          <button ref={ctaRef} type="button" className={s.cta} onClick={toGame}>
            {t.toGame} <span aria-hidden>→</span>
          </button>
        </div>
      ) : null}

      {phase === 'bell' && ready && !rang ? <Hint key="hBell">{t.hintBell}</Hint> : null}
      {phase === 'open' && !opened ? <Hint key="hOpen">{t.hintOpen}</Hint> : null}
      {phase === 'rooms' && litCount < ROOMS.length ? <Hint key={gag === 1 && shown === GAG ? 'hGag' : 'hRooms'}>{gag === 1 && shown === GAG ? t.hintGag : t.hintRooms}</Hint> : null}
      {phase === 'mat' && !lifted ? <Hint key="hMat">{t.hintMat}</Hint> : null}
      {phase === 'mat' && lifted && !letterOut ? <Hint key="hLetter">{t.hintLetter}</Hint> : null}

      {finale ? null : phase === 'bell' ? (
        ready && !rang ? <TapCue key="cueBell" target={bellRef} delay={2200} /> : null
      ) : phase === 'open' ? (
        !opened ? <TapCue key="cueOpen" target={hitRef} kind="drag" dir={{ x: 4, y: 0 }} at={{ x: 0.2, y: 0.62 }} delay={1800} /> : null
      ) : phase === 'rooms' ? (
        nextRoom >= 0 ? <TapCue key={`cueRoom${nextRoom}-${gag}`} target={chainRefs[gag === 1 && shown === GAG ? GAG : nextRoom]} delay={litCount === 0 ? 1600 : 4200} at={{ x: 0.5, y: 0.85 }} /> : null
      ) : phase === 'night' ? (
        cta ? <TapCue key="cueGame" target={ctaRef} delay={3200} /> : null
      ) : phase === 'mat' ? (
        !lifted ? <TapCue key="cueMat" target={matRef} kind="drag" dir={{ x: 0, y: -3 }} at={{ x: 0.5, y: 0.7 }} delay={2000} /> : !letterOut ? <TapCue key="cueLetter" target={letterRef} delay={2200} /> : null
      ) : null}

      <Confetti burst={burst} count={60} origin={{ x: 0.5, y: 0.6 }} colors={['#fff4cc', '#ffd98a', '#ffc2a8', '#fffdf5', '#d9694a']} />

      {phase === 'game' ? <CatGame t={t.game} onDone={gameDone} /> : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja"
          theme={{
            bg: 'linear-gradient(180deg, rgba(12, 16, 44, 0.42), rgba(16, 18, 48, 0.3) 46%, rgba(12, 14, 38, 0.6)), #141a3c url(/art/rumah-malam.webp)',
            ink: '#fff3e2',
            paper: '#fffaf0',
            paperInk: '#3b2a22',
          }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
