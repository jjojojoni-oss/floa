'use client';

import { type PointerEvent as ReactPointerEvent, type RefObject, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Petals, Sprite, Stage, TapCue, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { type Milestone, addDays, dayDiff, elapsed, milestoneOn, milestones, parseDate, startOfDay } from './date';
import { StopCalendar } from './Game';
import { LOCALE_TAG, TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BACKDROP = '/art/bg-anniversary.webp';
const ART = ['bg-anniversary', 'anniversary-jam', 'anniversary-tutup', 'anniversary-tutup-dalam', 'anniversary-rantai'];

/**
 * closed  → jam saku tertutup, tutupnya berukir inisial; mahkota ditekan untuk membuka
 * now     → jam menunjukkan waktu sungguhan; mahkota ditahan untuk memutar balik waktu
 * rewind  → jarum berputar mundur, tanggal & hitungan hari mundur sampai hari jadian
 * first   → waktu berhenti di hari pertama
 * moment  → tiap kenangan (foto bundar + catatan) tampil di dalam tutup jam
 * forward → waktu berjalan maju lagi, berhenti sejenak di tiap milestone
 * arrived → sampai di detik ini: jam berdetak lagi, hitungan lama bersama tampil di tutup
 * back    → jam dibalik: ucapan utama terukir di punggungnya → mini-game → surat
 */
type Phase = 'closed' | 'now' | 'rewind' | 'first' | 'moment' | 'forward' | 'arrived' | 'back';

type Angles = { h: number; m: number; s: number };
type HandRefs = { h: RefObject<SVGGElement | null>; m: RefObject<SVGGElement | null>; s: RefObject<SVGGElement | null> };

/** putaran penuh tiap jarum selama memutar balik waktu: posenya kembali sama, seperti "jam yang sama, di hari yang lain" */
const TURNS: Angles = { h: 720, m: 5760, s: 12960 };

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const easeInOut = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
const initial = (name: string) => Array.from(name.trim())[0]?.toUpperCase() ?? '';

export default function Anniversary(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BACKDROP}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

/** Jarum baja biru di atas dial lukisan. Sudutnya diatur lewat ref (per frame) supaya putarannya mulus. */
function Hands({ refs, live }: { refs: HandRefs; live: boolean }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const steel = `url(#st${id})`;
  return (
    <svg className={cx(s.hands, live && s.live)} viewBox="-206 -206 412 412" aria-hidden>
      <defs>
        <linearGradient id={`st${id}`} gradientUnits="userSpaceOnUse" x1="-8" y1="0" x2="8" y2="0">
          <stop offset="0" stopColor="#4a72ad" />
          <stop offset="0.5" stopColor="#27456e" />
          <stop offset="1" stopColor="#10203c" />
        </linearGradient>
        <radialGradient id={`cp${id}`} gradientUnits="userSpaceOnUse" cx="-3" cy="-4" r="14">
          <stop offset="0" stopColor="#fff4cc" />
          <stop offset="0.6" stopColor="#c99a3e" />
          <stop offset="1" stopColor="#6e4b14" />
        </radialGradient>
      </defs>
      <g ref={refs.h} className={s.hand}>
        <path d="M-6,20L-2.7,-62L2.7,-62L6,20Z" fill={steel} />
        <circle cx="0" cy="-74" r="12" fill="none" stroke={steel} strokeWidth="4.6" />
        <path d="M-2.6,-86L0,-114L2.6,-86Z" fill={steel} stroke={steel} strokeWidth="1.6" strokeLinejoin="round" />
      </g>
      <g ref={refs.m} className={s.hand}>
        <path d="M-4.6,20L-2.1,-100L2.1,-100L4.6,20Z" fill={steel} />
        <circle cx="0" cy="-112" r="11" fill="none" stroke={steel} strokeWidth="4.2" />
        <path d="M-2.4,-123L0,-170L2.4,-123Z" fill={steel} stroke={steel} strokeWidth="1.5" strokeLinejoin="round" />
      </g>
      <g ref={refs.s} className={cx(s.hand, s.sec)}>
        <path d="M0,46L0,-184" stroke="#b8322a" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="0" cy="34" r="7" fill="#b8322a" />
      </g>
      <circle r="11" fill={`url(#cp${id})`} stroke="#47300b" strokeOpacity="0.6" />
    </svg>
  );
}

/** 0 → 1 selama `ms` sejak `active` menyala (untuk angka yang menghitung naik) */
function useCountUp(active: boolean, ms: number) {
  const [u, setU] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (reduced()) {
      setU(1);
      return;
    }
    let raf = 0;
    const t0 = performance.now() + 450;
    const tick = (now: number) => {
      const v = Math.max(0, Math.min(1, (now - t0) / ms));
      setU(1 - Math.pow(1 - v, 3));
      if (v < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, ms]);
  return u;
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

  const { start, diff, counting, marks, todayMark, moments } = useMemo(() => {
    const start = parseDate(data.date);
    const today = startOfDay(new Date());
    const diff = start ? dayDiff(start, today) : 0;
    const counting = !!start && diff >= 0;
    const photos = data.photos.filter(Boolean);
    const count = Math.min(5, Math.max(data.notes.length, photos.length));
    const moments: { note: string; photo: string | null }[] = [];
    for (let i = 0; i < count; i++) {
      const note = (data.notes[i] ?? '').trim();
      const photo = photos[i] ?? null;
      if (note || photo) moments.push({ note, photo });
    }
    return {
      start,
      diff,
      counting,
      marks: start && counting ? milestones(start, today) : [],
      todayMark: start && counting ? milestoneOn(start, today) : null,
      moments,
    };
  }, [data.date, data.notes, data.photos]);

  /** ada jarak waktu yang bisa diputar balik (tanpa tanggal pun tetap bisa, hanya tanpa hitungan) */
  const rewindable = !start || diff > 0;

  const [phase, setPhase] = useState<Phase>('closed');
  /** tutup sudah selesai terbuka: mahkota boleh ditahan */
  const [armed, setArmed] = useState(false);
  /** hari ke berapa yang sedang ditunjukkan jam (0 = hari jadian) */
  const [day, setDay] = useState(Math.max(0, diff));
  const [winding, setWinding] = useState(false);
  const [alt, setAlt] = useState(false);
  const [mIdx, setMIdx] = useState(0);
  const [stamp, setStamp] = useState<Milestone | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [burst, setBurst] = useState(0);
  const [finale, setFinale] = useState(false);
  /** mini-game kalender sebelum surat: off → main → selesai */
  const [game, setGame] = useState<'off' | 'on' | 'done'>('off');

  const hRef = useRef<SVGGElement>(null);
  const mRef = useRef<SVGGElement>(null);
  const sRef = useRef<SVGGElement>(null);
  const handRefs = useMemo<HandRefs>(() => ({ h: hRef, m: mRef, s: sRef }), []);
  const hitRef = useRef<HTMLButtonElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  /** tengah malam saat adegan dimulai: sudut jarum dihitung dari sini supaya terus bertambah */
  const base = useRef(startOfDay(new Date()).getTime());
  /** sudut jarum saat waktu mulai diputar balik; null = jarum mengikuti jam sungguhan */
  const a0 = useRef<Angles | null>(null);
  const manual = useRef(false);
  const wind = useRef(0);
  const holding = useRef(false);
  const lastT = useRef(0);
  const raf = useRef(0);
  const dayRef = useRef(Math.max(0, diff));
  const click = useRef(-1);
  const arrivedOnce = useRef(false);

  const liveOn = phase === 'closed' || phase === 'now' || phase === 'arrived' || phase === 'back';

  const setHands = (a: Angles) => {
    if (hRef.current) hRef.current.style.transform = `rotate(${a.h}deg)`;
    if (mRef.current) mRef.current.style.transform = `rotate(${a.m}deg)`;
    if (sRef.current) sRef.current.style.transform = `rotate(${a.s}deg)`;
  };
  const liveAngles = (d: Date): Angles => {
    const tot = Math.floor((d.getTime() - base.current) / 1000);
    return { h: (tot / 43200) * 360, m: (tot / 3600) * 360, s: tot * 6 };
  };
  /** sudut jarum untuk kemajuan p (0 = hari jadian, 1 = sekarang) */
  const anglesAt = (p: number): Angles => {
    const a = a0.current ?? liveAngles(new Date());
    return { h: a.h - TURNS.h * (1 - p), m: a.m - TURNS.m * (1 - p), s: a.s - TURNS.s * (1 - p) };
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // jam sungguhan berdetak tiap detik selama jarumnya tidak sedang diputar
  useEffect(() => {
    if (!liveOn) return;
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [liveOn]);
  useEffect(() => {
    if (liveOn && !manual.current) setHands(liveAngles(now));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, liveOn, ready]);

  // jalan pintas ketuk kalau menahan mahkota tidak memungkinkan
  useEffect(() => {
    if (!armed || (phase !== 'now' && phase !== 'rewind')) return;
    const id = setTimeout(() => setAlt(true), 6000);
    return () => clearTimeout(id);
  }, [armed, phase]);

  // lukisan punggung jam & foto kenangan disiapkan lebih dulu
  useEffect(() => {
    if (phase !== 'now' && phase !== 'first') return;
    ['/art/anniversary-punggung.webp', ...moments.map((x) => x.photo)].forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
  }, [phase, moments]);

  // fokus mengikuti tombol lanjut (pengguna papan ketik / pembaca layar)
  useEffect(() => {
    if (mode === 'preview') return;
    if (phase === 'first' || phase === 'moment' || phase === 'arrived' || phase === 'back') {
      const id = setTimeout(() => ctaRef.current?.focus({ preventScroll: true }), 700);
      return () => clearTimeout(id);
    }
  }, [phase, mIdx, mode]);

  const tween = (dur: number, frame: (u: number) => void, done?: () => void) => {
    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const step = (tNow: number) => {
      const u = dur <= 0 ? 1 : Math.min(1, (tNow - t0) / dur);
      frame(u);
      if (u < 1) raf.current = requestAnimationFrame(step);
      else done?.();
    };
    raf.current = requestAnimationFrame(step);
  };

  /** satu "klik" roda gigi tiap sekian derajat putaran */
  const ratchet = (k: number) => {
    if (k === click.current) return;
    click.current = k;
    sfx.tap();
    haptic(3);
  };
  const showDay = (d: number) => {
    const r = Math.round(d);
    if (r === dayRef.current) return;
    dayRef.current = r;
    setDay(r);
  };

  /* ── 0. buka tutupnya ── */
  const open = () => {
    if (phase !== 'closed') return;
    sfx.crack();
    haptic(18);
    setPhase(rewindable ? 'now' : 'first');
    later(() => sfx.chime(), reduced() ? 80 : 620);
    later(() => setArmed(true), reduced() ? 120 : 1150);
  };

  /* ── 1. putar balik waktu ── */
  const applyWind = (w: number) => {
    const e = easeInOut(w);
    setHands(anglesAt(1 - e));
    showDay(Math.max(0, diff) * (1 - e));
    ratchet(Math.floor(e * 34));
  };
  const finishRewind = () => {
    if (!manual.current || wind.current < 1) return;
    cancelAnimationFrame(raf.current);
    holding.current = false;
    wind.current = 2; // selesai: tidak bisa dipicu dua kali
    setWinding(false);
    setAlt(false);
    setHands(anglesAt(0));
    showDay(0);
    setPhase('first');
    sfx.chime();
    haptic(30);
  };
  const beginRewind = () => {
    if (phase === 'now') {
      a0.current = liveAngles(new Date());
      manual.current = true;
      setPhase('rewind');
    }
    setWinding(true);
  };
  const startHold = () => {
    if (!armed || (phase !== 'now' && phase !== 'rewind') || wind.current > 1) return;
    beginRewind();
    // tiap tekanan sendiri sudah memutar sedikit, jadi ketuk berkali-kali pun sampai
    wind.current = Math.min(1, wind.current + 0.07);
    holding.current = true;
    lastT.current = performance.now();
    cancelAnimationFrame(raf.current);
    const step = (tNow: number) => {
      const dt = Math.min(64, tNow - lastT.current);
      lastT.current = tNow;
      // pelan di awal, kencang di tengah, pelan lagi menjelang sampai
      if (holding.current) wind.current = Math.min(1, wind.current + (dt / (reduced() ? 900 : 3000)) * (0.55 + 1.5 * Math.sin(Math.PI * wind.current)));
      applyWind(wind.current);
      if (wind.current >= 1) return finishRewind();
      if (holding.current) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  const stopHold = () => {
    if (!holding.current) return;
    holding.current = false;
    setWinding(false);
  };
  const autoWind = () => {
    if (!armed || (phase !== 'now' && phase !== 'rewind') || wind.current > 1) return;
    beginRewind();
    holding.current = false;
    const w0 = wind.current;
    tween((reduced() ? 300 : 2400) * (1 - w0), (u) => {
      wind.current = w0 + (1 - w0) * u;
      applyWind(wind.current);
    }, finishRewind);
  };

  /* ── 2. kenangan di dalam tutup ── */
  /** jarum detik menyapu satu putaran penuh: tanda satu kenangan lewat */
  const sweep = () => {
    if (!a0.current) return;
    const f = anglesAt(0);
    tween(reduced() ? 0 : 800, (u) => setHands({ ...f, s: f.s + 360 * easeInOut(u) }));
  };
  const toMoment = (i: number) => {
    sfx.pop();
    haptic(12);
    setMIdx(i);
    setPhase('moment');
    sweep();
  };

  /* ── 3. waktu berjalan maju lagi ── */
  const stampSound = () => {
    sfx.crack();
    sfx.pop();
    haptic(24);
  };
  const arrive = () => {
    if (arrivedOnce.current) return;
    arrivedOnce.current = true;
    manual.current = false;
    a0.current = null;
    showDay(Math.max(0, diff));
    setStamp(null);
    setNow(new Date());
    setPhase('arrived');
    sfx.success();
    haptic(30);
    later(() => setBurst((v) => v + 1), reduced() ? 50 : 350);
  };
  const runForward = () => {
    sfx.whoosh();
    haptic(14);
    setPhase('forward');
    const quick = reduced();
    if (!a0.current) {
      // waktunya tidak pernah diputar balik (hari jadiannya hari ini): langsung sampai
      later(arrive, quick ? 60 : 500);
      return;
    }
    if (!start || diff <= 0) {
      tween(quick ? 200 : 1600, (u) => {
        setHands(anglesAt(easeInOut(u)));
        ratchet(Math.floor(u * 20));
      }, arrive);
      return;
    }
    const segs: { at: number; mark: Milestone | null }[] = [...marks.map((m) => ({ at: dayDiff(start, m.date), mark: m as Milestone | null })), { at: diff, mark: null }];
    let fromDay = 0;
    let k = 0;
    const next = () => {
      const seg = segs[k];
      const span = (seg.at - fromDay) / diff;
      const dur = quick ? 160 : Math.max(520, Math.min(1500, 400 + 2600 * span));
      const d0 = fromDay;
      tween(dur, (u) => {
        const d = d0 + (seg.at - d0) * easeInOut(u);
        setHands(anglesAt(d / diff));
        showDay(d);
        ratchet(Math.floor((d / diff) * 46));
      }, () => {
        fromDay = seg.at;
        k += 1;
        if (!seg.mark) return arrive();
        // berhenti sejenak di tiap milestone supaya capnya terbaca
        setStamp(seg.mark);
        stampSound();
        later(() => {
          setStamp(null);
          next();
        }, quick ? 500 : 1050);
      });
    };
    next();
  };

  /* ── 4. punggung jam, lalu surat ── */
  const flip = () => {
    if (phase !== 'arrived') return;
    sfx.whoosh();
    haptic(16);
    setPhase('back');
    later(() => sfx.chime(), reduced() ? 60 : 700);
  };
  const openLetter = () => {
    if (finale || game === 'on') return;
    if (game === 'off') {
      sfx.pop();
      haptic(12);
      setGame('on');
      return;
    }
    sfx.chime();
    haptic(15);
    setFinale(true);
  };
  const gameDone = () => {
    setGame('done');
    sfx.chime();
    haptic(15);
    setFinale(true);
  };

  const onPrimary = () => {
    if (phase === 'first') return moments.length ? toMoment(0) : runForward();
    if (phase === 'moment') return mIdx + 1 < moments.length ? toMoment(mIdx + 1) : runForward();
    if (phase === 'arrived') return flip();
    if (phase === 'back') return openLetter();
  };

  /* ── tampilan ── */
  const fullFmt = useMemo(() => new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'long', year: 'numeric' }), [tag]);
  const dowFmt = useMemo(() => new Intl.DateTimeFormat(tag, { weekday: 'long' }), [tag]);
  const timeFmt = useMemo(() => new Intl.DateTimeFormat(tag, { hour: '2-digit', minute: '2-digit' }), [tag]);
  const num = (n: number) => n.toLocaleString(tag);
  const pad = (n: number) => String(n).padStart(2, '0');

  const el = start && counting ? elapsed(start, now) : null;
  const cu = useCountUp(phase === 'arrived' || phase === 'back', 1500);
  const shown = start ? addDays(start, day) : null;
  /** tanggal yang tampil di jendela dial */
  const dialDate = liveOn || !shown ? now : shown;
  const cur = phase === 'moment' ? moments[mIdx] : null;
  const playing = game === 'on';
  const markText = (m: Milestone) => (m.kind === 'years' && m.n === 1 ? t.markYear : fmt(m.kind === 'years' ? t.markYears : t.markDays, { n: num(m.n) }));

  let head;
  if (phase === 'closed') {
    head = (
      <div key="names">
        <div className={s.eyebrow}>{fmt(t.headFor, { to })}</div>
        {from ? <div className={s.from}>{fmt(t.headFrom, { from })}</div> : null}
      </div>
    );
  } else if (phase === 'now') {
    head = (
      <div key="now">
        <div className={s.eyebrow}>{t.nowEyebrow}</div>
        <div className={s.big}>{timeFmt.format(now)}</div>
        <div className={s.sub}>{t.nowSub}</div>
      </div>
    );
  } else if (phase === 'rewind' || phase === 'forward') {
    head = (
      <div key="run">
        <div className={s.eyebrow}>{phase === 'rewind' ? t.rewinding : t.forwarding}</div>
        {shown ? <div className={cx(s.big, s.rolling)}>{fullFmt.format(shown)}</div> : null}
      </div>
    );
  } else if (phase === 'first') {
    head = (
      <div key="first">
        <div className={s.eyebrow}>{start ? t.firstDay : t.firstPlain}</div>
        {start ? <div className={s.big}>{fullFmt.format(start)}</div> : null}
        {start ? <div className={s.sub}>{dowFmt.format(start)}</div> : null}
      </div>
    );
  } else if (phase === 'moment') {
    head = (
      <div key={`m${mIdx}`}>
        <div className={s.eyebrow}>{fmt(t.momentOf, { i: mIdx + 1, n: moments.length })}</div>
        {start ? <div className={s.sub}>{fmt(t.since, { date: fullFmt.format(start) })}</div> : null}
      </div>
    );
  } else if (phase === 'arrived') {
    head = (
      <div key="today">
        <div className={s.eyebrow}>{t.todayEyebrow}</div>
        <div className={s.big}>{el ? (el.exact ? (el.years === 1 ? t.exactOne : fmt(t.exact, { y: el.years })) : fmt(t.dayN, { n: num(el.dayNumber) })) : t.today}</div>
        {el && todayMark && !el.exact ? <div className={s.sub}>{markText(todayMark)}</div> : null}
      </div>
    );
  } else {
    head = (
      <div key="back">
        <div className={s.eyebrow}>{t.backEyebrow}</div>
      </div>
    );
  }

  /** isi bagian dalam tutup jam */
  let plate;
  if (phase === 'closed' || phase === 'now') {
    plate = (
      <div key="ded" className={s.ded}>
        <span>{t.dedFor}</span>
        <b className={cx(to.length > 9 && s.long, to.length > 14 && s.xl)}>{to}</b>
        {from ? <em>{fmt(t.dedFrom, { from })}</em> : null}
      </div>
    );
  } else if (phase === 'moment' && cur) {
    plate = cur.photo ? (
      <div key={`p${mIdx}`} className={s.photo}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cur.photo} alt={fmt(t.momentAlt, { i: mIdx + 1 })} draggable={false} />
      </div>
    ) : (
      // tanpa foto: catatannya sendiri yang tertulis di dalam tutup
      <div key={`p${mIdx}`} className={s.noPhoto}>
        <Sprite name={mIdx % 2 ? 'bunga-kamboja' : 'bunga-kamboja-pink'} className={s.noPhotoArt} />
        <em className={cx(cur.note.length > 34 && s.long)}>{cur.note}</em>
      </div>
    );
  } else if (phase === 'forward' && stamp) {
    const n = num(stamp.n);
    plate = (
      <div key={`st${stamp.kind}${stamp.n}`} className={s.stamp}>
        <svg viewBox="-10 -10 20 16" aria-hidden>
          <path d="M0,5C-9,-2 -5,-9 0,-4C5,-9 9,-2 0,5Z" />
        </svg>
        <b className={cx(n.length > 3 && s.long)}>{n}</b>
        <i>{stamp.kind === 'days' ? t.unitDays : stamp.n === 1 ? t.unitYear : t.unitYears}</i>
      </div>
    );
  } else if (phase === 'arrived' || phase === 'back') {
    plate = el ? (
      <div key="count" className={s.counter} role="timer" aria-label={`${t.counterLabel} ${el.years} ${t.years}, ${el.months} ${t.months}, ${el.days} ${t.days}`}>
        <span className={s.counterLabel}>{t.together}</span>
        <div className={s.tiles} aria-hidden>
          {(
            [
              [el.years, t.years],
              [el.months, t.months],
              [el.days, t.days],
            ] as const
          ).map(([v, l], i) => (
            <div key={i} className={s.tile}>
              <b>{Math.round(v * cu)}</b>
              <span>{l}</span>
            </div>
          ))}
        </div>
        <div className={s.hms} aria-hidden>
          <b>{pad(el.hours)}</b>
          <i>:</i>
          <b>{pad(el.minutes)}</b>
          <i>:</i>
          <b key={el.seconds} className={s.tick}>
            {pad(el.seconds)}
          </b>
        </div>
        <div className={s.hmsLabel} aria-hidden>
          <span>{t.hours}</span>
          <span>{t.minutes}</span>
          <span>{t.seconds}</span>
        </div>
      </div>
    ) : (
      <div key="plain" className={s.plain}>
        <b>{t.today}</b>
        <em>{t.endNote}</em>
      </div>
    );
  } else if (start) {
    const n = num(day + 1);
    plate = (
      <div key="days" className={s.days}>
        <span>{t.dayNo}</span>
        <b className={cx(n.length > 3 && s.long, n.length > 5 && s.xl)}>{n}</b>
        {phase === 'first' ? <em>{t.firstLine}</em> : null}
      </div>
    );
  } else {
    plate = (
      <div key={phase === 'first' ? 'pf' : 'pr'} className={s.plain}>
        <em>{phase === 'first' ? t.firstLine : phase === 'forward' ? t.forwarding : t.longAgo}</em>
      </div>
    );
  }

  const cta =
    phase === 'first'
      ? moments.length
        ? t.toMoments
        : t.toForward
      : phase === 'moment'
        ? mIdx + 1 < moments.length
          ? t.nextMoment
          : t.toForward
        : phase === 'arrived'
          ? t.flip
          : phase === 'back'
            ? t.openLetter
            : null;
  const [preTotal, postTotal] = t.total.split('{n}');
  const a = initial(data.to);
  const b = initial(from);
  const hitOn = phase === 'closed' || phase === 'now' || phase === 'rewind';

  return (
    <div className={cx(s.wrap, ready && s.ready, s[`ph_${phase}`], playing && s.gaming)}>
      {phase === 'arrived' || phase === 'back' ? <Petals kinds={['putih', 'pink']} count={9} /> : null}

      <div className={s.head}>{head}</div>

      {/* sinar yang berputar: mundur saat waktu diputar balik, maju saat waktu berjalan lagi */}
      <div className={cx(s.rays, winding && s.raysBack, phase === 'forward' && s.raysFwd, (phase === 'arrived' || phase === 'back') && s.raysOn)} aria-hidden>
        <span />
      </div>

      <div className={cx(s.piece, phase === 'closed' && s.closed)}>
        <Sprite name="anniversary-rantai" className={s.chain} />

        <div className={cx(s.watch, phase === 'back' && s.flipped)}>
          <div className={s.face}>
            <Sprite name="anniversary-jam" className={s.art} />
            <div className={s.dial}>
              <span className={s.dateNum}>{dialDate.getDate()}</span>
              <Hands refs={handRefs} live={liveOn} />
              <span className={s.glass} />
            </div>
            <span className={cx(s.crownFx, winding && s.crownOn)} aria-hidden />
          </div>
          <div className={cx(s.face, s.faceBack)} aria-hidden={phase !== 'back'}>
            <Sprite name="anniversary-punggung" className={s.art} />
            <div className={s.engr}>
              <div className={cx(s.engrTitle, (title || to).length > 20 && s.long, (title || to).length > 32 && s.xl)}>{title || fmt(t.backFallback, { to })}</div>
              <div className={cx(s.engrNames, (to + from).length > 20 && s.long)}>{from ? `${to} & ${from}` : to}</div>
              {start ? <div className={s.engrSince}>{fmt(t.since, { date: fullFmt.format(start) })}</div> : null}
            </div>
          </div>
        </div>

        <div className={cx(s.lid, phase !== 'closed' && s.open)}>
          <div className={s.lidFace}>
            <Sprite name="anniversary-tutup" className={s.art} />
            <span className={cx(s.mono, !b && s.solo)} aria-hidden>
              {a ? (
                b ? (
                  <>
                    {a}
                    <i>&amp;</i>
                    {b}
                  </>
                ) : (
                  a
                )
              ) : (
                '♥'
              )}
            </span>
            <span className={s.sheen} aria-hidden />
          </div>
          <div className={cx(s.lidFace, s.lidIn)}>
            <Sprite name="anniversary-tutup-dalam" className={s.art} />
            <div className={s.plate} aria-live="polite">
              {plate}
            </div>
          </div>
        </div>

        {hitOn ? (
          <button
            ref={hitRef}
            type="button"
            className={s.hit}
            aria-label={phase === 'closed' ? t.openLabel : t.windLabel}
            onClick={() => {
              if (phase === 'closed') open();
            }}
            onPointerDown={(e: ReactPointerEvent<HTMLButtonElement>) => {
              if (e.button > 0 || phase === 'closed') return;
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                /* pointer sudah tidak aktif */
              }
              startHold();
            }}
            onPointerUp={stopHold}
            onPointerCancel={stopHold}
            onContextMenu={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if ((e.key === ' ' || e.key === 'Enter') && !e.repeat && phase !== 'closed') startHold();
            }}
            onKeyUp={stopHold}
          />
        ) : null}
      </div>

      {/* catatan kenangan: secarik kertas yang terselip di bawah tutup jam */}
      {cur?.note && cur.photo && !playing ? (
        <div key={mIdx} className={cx(s.slip, cur.note.length > 40 && s.slipLong)}>
          <span>{cur.note}</span>
        </div>
      ) : null}

      {!finale && !playing ? (
        <div className={s.foot}>
          {phase === 'arrived' && el ? (
            <p key="tot" className={s.line}>
              {preTotal}
              <b>{num(el.totalSeconds)}</b>
              {postTotal}
            </p>
          ) : null}
          {cta ? (
            <button key={`${phase}${mIdx}`} ref={ctaRef} type="button" className={s.cta} onClick={onPrimary}>
              {cta} <span aria-hidden>→</span>
            </button>
          ) : null}
          {alt && (phase === 'now' || phase === 'rewind') ? (
            <button type="button" className={s.alt} onClick={autoWind}>
              {t.windAlt}
            </button>
          ) : null}
        </div>
      ) : null}

      {phase === 'closed' && ready ? <Hint key="open">{t.hintOpen}</Hint> : null}
      {phase === 'now' && armed && !alt ? <Hint key="wind">{t.hintWind}</Hint> : null}
      {phase === 'rewind' && !winding && !alt ? <Hint key="more">{t.hintWindMore}</Hint> : null}

      {finale || playing ? null : phase === 'closed' ? (
        ready ? <TapCue key="cueOpen" target={hitRef} at={{ x: 0.467, y: 0.16 }} delay={2200} /> : null
      ) : phase === 'now' && armed ? (
        <TapCue key="cueWind" target={hitRef} kind="hold" at={{ x: 0.467, y: 0.16 }} delay={2600} />
      ) : cta ? (
        <TapCue key={`cue${phase}${mIdx}`} target={ctaRef} delay={phase === 'arrived' ? 5200 : 3600} />
      ) : null}

      <Confetti burst={burst} shapes="hearts" count={80} origin={{ x: 0.5, y: 0.4 }} colors={['#e3b24f', '#fff3da', '#f29aa5', '#c8372d', '#ffd98a']} />
      <Confetti burst={burst} count={60} origin={{ x: 0.5, y: 0.46 }} colors={['#fbf5e6', '#e3b24f', '#f1d58a', '#f29aa5']} />

      {playing ? <StopCalendar t={t.game} target={start ?? startOfDay(new Date())} hasDate={!!start} tag={tag} onDone={gameDone} /> : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja-pink"
          theme={{ backdrop: BACKDROP, ink: '#fbf0d9', paper: '#fffaf0', paperInk: '#3b2a22' }}
          onReplay={onReplay}
        >
          {el ? <div className={s.finaleCount}>{fmt(t.finaleCount, { n: num(el.dayNumber) })}</div> : null}
        </Finale>
      ) : null}
    </div>
  );
}
