'use client';

import { type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Sprite, Stage, TapCue, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { type Milestone, addDays, dayDiff, elapsed, milestoneOn, milestones, parseDate, startOfDay } from './date';
import { LOCALE_TAG, TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BACKDROP = '/art/bg-anniversary.webp';
const ART = ['bg-anniversary', 'anniversary-papan', 'anniversary-bilah', 'anniversary-klip', 'anniversary-cap'];
/** lembar tanggal biasa yang berkelebat di antara milestone */
const FILL_MAX = 10;
/** lama lembar milestone bertahan di atas (cap dihentakkan, lalu sempat terbaca) */
const MARK_HOLD = 900;

export default function Anniversary(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BACKDROP}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

type Sheet =
  | { kind: 'first' | 'flip' | 'today'; date: Date; mark?: Milestone | null }
  | { kind: 'moment'; n: number; note: string; photo: string | null }
  | { kind: 'cover' }
  | { kind: 'end' };

type Fall = { fx: number; fr: number; peek: number; sway: number; rx: number; ry: number; fast: boolean };

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** acak yang selalu sama untuk indeks yang sama, supaya render ulang tidak mengubah bentuk sobekan */
function prng(seed: number) {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** tepi atas bergerigi bekas sobekan */
function jagged(seed: number) {
  const r = prng(seed + 11);
  const n = 22;
  const pts = ['0% 0.44em'];
  for (let i = 1; i <= n; i++) pts.push(`${((i / n) * 100).toFixed(1)}% ${(i % 2 ? 0.06 + r() * 0.14 : 0.34 + r() * 0.3).toFixed(2)}em`);
  return `polygon(${pts.join(',')},100% 100%,0% 100%)`;
}

function fallOf(i: number, fast: boolean, flyOff: boolean): Fall {
  const r = prng(i * 7 + 3);
  const side = i % 2 ? 1 : -1;
  return {
    fx: side * (fast ? 2.5 + r() * 6 : 1.2 + r() * 4.2),
    fr: side * (6 + r() * 24) * (r() < 0.3 ? -1 : 1),
    peek: flyOff ? -19 : 2.3 + r() * 2.9,
    sway: r() < 0.5 ? -1 : 1,
    // kertas berkibar: seberapa jauh lembar menekuk ke depan/belakang & memutar saat jatuh
    rx: 30 + r() * 26,
    ry: 14 + r() * 18,
    fast,
  };
}

/* ───────────── odometer: angka berputar ke nilainya, lalu berdetak mulus ───────────── */

const STRIP = Array.from({ length: 30 }, (_, i) => i % 10);

/** satu kolom angka; berputar maju (9 → 0 lewat putaran berikutnya, tidak mundur) */
function Col({ d, go, dur, delay }: { d: number; go: boolean; dur: number; delay: number }) {
  const [pos, setPos] = useState(0);
  const [snap, setSnap] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (!go) return;
    if (first.current) {
      first.current = false;
      setPos(10 + d);
      return;
    }
    setSnap(false);
    setPos((p) => {
      const cur = p % 10;
      if (d === cur) return p;
      return d > cur ? p - cur + d : p - cur + 10 + d;
    });
  }, [go, d]);
  return (
    <span className={s.col}>
      <span
        className={cx(s.reel, snap && s.snapNow)}
        style={{ '--p': pos, '--dur': `${dur}ms`, '--delay': `${delay}ms` } as CSSProperties}
        onTransitionEnd={() => {
          if (pos >= 20) {
            setSnap(true);
            setPos((p) => p - 10);
          }
        }}
      >
        {STRIP.map((n, i) => (
          <span key={i}>{n}</span>
        ))}
      </span>
    </span>
  );
}

function Roll({ value, delay = 0, spin = 1500 }: { value: string; delay?: number; spin?: number }) {
  const [go, setGo] = useState(false);
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const quick = reduced();
    const a = setTimeout(() => setGo(true), quick ? 0 : delay + 40);
    const b = setTimeout(() => setSettled(true), quick ? 0 : delay + spin + 400);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [delay, spin]);
  const chars = [...value];
  const digits = chars.filter((c) => /\d/.test(c)).length;
  let k = 0;
  return (
    <span className={s.roll} aria-hidden>
      {chars.map((ch, i) => {
        const key = chars.length - i;
        if (!/\d/.test(ch)) {
          return (
            <span key={`s${key}`} className={s.sep}>
              {ch}
            </span>
          );
        }
        // kolom kanan berhenti terakhir: putaran awal sedikit berjenjang dari kiri ke kanan
        const stagger = (k++ / Math.max(1, digits)) * 260;
        return <Col key={`d${key}`} d={Number(ch)} go={go} dur={settled ? 420 : spin} delay={settled ? 0 : stagger} />;
      })}
    </span>
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

  const { sheets, start, counting } = useMemo(() => {
    const start = parseDate(data.date);
    const today = startOfDay(new Date());
    const counting = !!start && start.getTime() <= today.getTime();
    const list: Sheet[] = [start ? { kind: 'first', date: start } : { kind: 'cover' }];
    const photos = data.photos.filter(Boolean);
    const count = Math.min(5, Math.max(data.notes.length, photos.length));
    let n = 0;
    for (let i = 0; i < count; i++) {
      const note = (data.notes[i] ?? '').trim();
      const photo = photos[i] ?? null;
      if (note || photo) list.push({ kind: 'moment', n: ++n, note, photo });
    }
    if (start && counting) {
      const diff = dayDiff(start, today);
      // milestone yang sungguh terlewati + lembar biasa di antaranya, urut tanggal
      const marks = milestones(start, today);
      const used = new Set(marks.map((m) => dayDiff(start, m.date)));
      const k = Math.max(0, Math.min(FILL_MAX, diff - 1 - marks.length));
      const flips: { at: number; mark: Milestone | null }[] = marks.map((m) => ({ at: dayDiff(start, m.date), mark: m }));
      // lembar biasa tidak boleh menempel di dekat milestone (terasa seperti dobel)
      const gap = Math.max(1, Math.floor(diff / (k + 1) / 2));
      const near = (at: number) => marks.some((m) => Math.abs(dayDiff(start, m.date) - at) < gap);
      for (let i = 1; i <= k; i++) {
        const at = Math.round((diff * i) / (k + 1));
        if (at <= 0 || at >= diff || used.has(at) || near(at)) continue;
        used.add(at);
        flips.push({ at, mark: null });
      }
      flips.sort((a, b) => a.at - b.at).forEach((f) => list.push({ kind: 'flip', date: addDays(start, f.at), mark: f.mark }));
      list.push({ kind: 'today', date: today, mark: milestoneOn(start, today) });
    } else list.push({ kind: 'end' });
    return { sheets: list, start, counting };
  }, [data.date, data.notes, data.photos]);

  const last = sheets.length - 1;
  const moments = sheets.filter((x) => x.kind === 'moment').length;
  const flips = sheets.filter((x) => x.kind === 'flip').length;
  const firstFlip = last - flips;

  /** indeks lembar teratas; lembar di bawah indeks ini sudah disobek */
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);
  const [falls, setFalls] = useState<Record<number, Fall>>({});
  const [arrived, setArrived] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [burst, setBurst] = useState(0);
  const [finale, setFinale] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [dayShown, setDayShown] = useState(0);
  const drag = useRef<{ id: number; x0: number; y0: number; dy: number; el: HTMLElement } | null>(null);
  const moved = useRef(false);
  /** sobekan terakhir dari keyboard: fokus dipindah ke lembar berikutnya supaya bisa lanjut tanpa Tab */
  const viaKeys = useRef(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  /** lembar teratas yang bisa disobek (tombolnya berganti tiap sobekan) */
  const topCue = useMemo(
    () => ({
      get current() {
        return blockRef.current?.querySelector<HTMLButtonElement>('button') ?? null;
      },
    }),
    [],
  );

  const jags = useMemo(() => sheets.map((_, i) => jagged(i)), [sheets]);
  const lastSheet = sheets[last];
  const isToday = lastSheet.kind === 'today';
  const todayMark = lastSheet.kind === 'today' ? lastSheet.mark : null;

  const el = start && counting ? elapsed(start, now) : null;

  const stampSound = () => {
    sfx.crack();
    sfx.pop();
    haptic(24);
  };

  const arrive = () => {
    later(() => {
      setArrived(true);
      if (isToday) {
        sfx.success();
        haptic(30);
        later(() => setBurst((v) => v + 1), 650);
        if (todayMark) later(stampSound, 1700);
      } else sfx.chime();
      later(
        () => {
          setNow(new Date());
          setShowCounter(true);
        },
        isToday ? (todayMark ? 2500 : 2100) : 500,
      );
    }, 320);
  };

  const tearOne = (fast: boolean) => {
    const i = idxRef.current;
    if (i >= last) return;
    idxRef.current = i + 1;
    const cur = sheets[i];
    // di tengah rentetan, separuh lembar biasa terbang keluar layar supaya tumpukan di bawah tidak menggunung
    const flyOff = cur.kind === 'flip' && !cur.mark && i % 2 === 0;
    setFalls((f) => ({ ...f, [i]: fallOf(i, fast, flyOff) }));
    setIdx(i + 1);
    if (cur.kind === 'flip') {
      // rentetan: sobekan ringan + nada yang terus naik
      sfx.tap();
      const k = i - firstFlip;
      if (k % 2 === 0 || cur.mark) sfx.note(Math.floor(k / 2));
    } else {
      sfx.crack();
      later(() => sfx.whoosh(), 110);
    }
    haptic(fast ? 6 : 14);
    const next = sheets[i + 1];
    if (next.kind === 'flip') {
      if (next.mark) later(stampSound, 170);
      // pelan → cepat → pelan lagi; berhenti sejenak di tiap milestone supaya capnya terbaca
      const k = i + 1 - firstFlip;
      const u = flips > 1 ? k / (flips - 1) : 1;
      const wait = next.mark ? MARK_HOLD : cur.kind === 'flip' ? 70 + 280 * Math.pow(Math.abs(2 * u - 1), 2.4) : 560;
      later(() => tearOne(true), wait);
    } else if (i + 1 === last) {
      if (next.kind === 'today' && cur.kind === 'flip') {
        // rem terakhir: jeda sebentar sebelum hari ini mendarat
        later(arrive, 120);
      } else arrive();
    }
  };

  const top = sheets[idx];
  const canTear = idx < last && top.kind !== 'flip';

  const onDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0 || !canTear) return;
    moved.current = false;
    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dy: 0, el: target };
  };
  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    d.dy = e.clientY - d.y0;
    if (Math.abs(dx) > 6 || Math.abs(d.dy) > 6) moved.current = true;
    if (moved.current) {
      const pull = Math.max(0, d.dy);
      d.el.style.animation = 'none';
      d.el.style.transition = 'none';
      // kertas tertarik: menekuk ke depan dari tepi atasnya yang masih terjepit
      d.el.style.transform = `perspective(40em) translate(${dx * 0.12}px, ${pull * 0.4}px) rotate(${dx / 60}deg) rotateX(${Math.min(28, pull / 6)}deg)`;
    }
  };
  const onEnd = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    d.el.style.animation = '';
    d.el.style.transition = '';
    d.el.style.transform = '';
    if (moved.current) later(() => (moved.current = false), 80);
    if (cancelled || !moved.current) return;
    if (d.dy > (d.el.offsetHeight || 1) * 0.16) tearOne(false);
  };
  const onTap = (e: ReactMouseEvent) => {
    // detail 0 = dari keyboard; klik yang menyusul seretan diabaikan
    if (e.detail !== 0 && moved.current) {
      moved.current = false;
      return;
    }
    viaKeys.current = e.detail === 0;
    if (canTear) tearOne(false);
  };

  useEffect(() => {
    if (!viaKeys.current) return;
    blockRef.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
  }, [idx]);

  useEffect(() => {
    if (showCounter && viaKeys.current) openRef.current?.focus({ preventScroll: true });
  }, [showCounter]);

  // penghitung berdetak tiap detik setelah sampai di hari ini
  useEffect(() => {
    if (!showCounter || !counting) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [showCounter, counting]);

  // "hari ke-N" menghitung naik setelah lingkaran spidol selesai digambar
  const target = el?.dayNumber ?? 0;
  useEffect(() => {
    if (!arrived || !isToday || !target) return;
    if (reduced() || target < 3) {
      setDayShown(target);
      return;
    }
    let raf = 0;
    let t0 = 0;
    const startAt = performance.now() + 950;
    const tick = (now: number) => {
      if (now < startAt) {
        raf = requestAnimationFrame(tick);
        return;
      }
      t0 = t0 || now;
      const u = Math.min(1, (now - t0) / 1300);
      setDayShown(Math.max(1, Math.round(target * (1 - Math.pow(1 - u, 3)))));
      if (u < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [arrived, isToday, target]);

  const monthFmt = useMemo(() => new Intl.DateTimeFormat(tag, { month: 'long' }), [tag]);
  const dowFmt = useMemo(() => new Intl.DateTimeFormat(tag, { weekday: 'long' }), [tag]);
  const fullFmt = useMemo(() => new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'long', year: 'numeric' }), [tag]);
  const num = (n: number) => n.toLocaleString(tag);
  const pad = (n: number) => String(n).padStart(2, '0');

  const owner = from ? `${to} & ${from}` : to;
  const markText = (m: Milestone) => (m.kind === 'years' && m.n === 1 ? t.markYear : fmt(m.kind === 'years' ? t.markYears : t.markDays, { n: num(m.n) }));

  const openLetter = () => {
    if (finale) return;
    sfx.chime();
    haptic(15);
    setFinale(true);
  };

  const stamp = (m: Milestone, today: boolean) => {
    const n = num(m.n);
    const unit = m.kind === 'days' ? t.unitDays : m.n === 1 ? t.unitYear : t.unitYears;
    return (
      <span className={cx(s.stamp, today && s.stampToday, today && arrived && s.stampOn)} aria-hidden>
        <Sprite name="anniversary-cap" className={s.stampRing} />
        <span className={s.stampTxt}>
          <svg viewBox="-10 -10 20 16" className={s.stampHeart}>
            <path d="M0,5C-9,-2 -5,-9 0,-4C5,-9 9,-2 0,5Z" />
          </svg>
          <b className={cx(n.length > 3 && s.longNum, n.length > 5 && s.xlNum)}>{n}</b>
          <i>{unit}</i>
        </span>
      </span>
    );
  };

  const dateSheet = (sh: Extract<Sheet, { date: Date }>) => {
    const sunday = sh.date.getDay() === 0;
    const day = sh.date.getDate();
    const today = sh.kind === 'today';
    return (
      <>
        <span className={s.band}>
          <b>{monthFmt.format(sh.date)}</b>
          <i>{sh.date.getFullYear()}</i>
        </span>
        <span className={s.numWrap}>
          <span className={cx(s.num, sunday && s.sunday, day > 9 && s.two)}>{day}</span>
          {today ? (
            <svg className={cx(s.circle, arrived && s.drawn)} viewBox="0 0 300 220" preserveAspectRatio="none" aria-hidden>
              <path pathLength={1} d="M158,14C246,6 290,58 280,112C268,180 168,212 86,198C20,186 -4,122 26,70C52,26 118,8 186,20" />
            </svg>
          ) : null}
        </span>
        <span className={s.dow}>{dowFmt.format(sh.date)}</span>
        {sh.kind === 'first' ? <span className={s.scribble}>{t.firstDay}</span> : null}
        {today && el ? (
          <span className={cx(s.scribble, s.late, sh.mark && s.withStamp, arrived && s.shown)}>
            {el.exact ? (el.years === 1 ? t.exactOne : fmt(t.exact, { y: el.years })) : fmt(t.dayN, { n: num(dayShown || 1) })}
          </span>
        ) : null}
        {sh.mark ? stamp(sh.mark, today) : null}
        {today ? <span className={cx(s.glint, arrived && s.glintGo)} aria-hidden /> : null}
      </>
    );
  };

  const body = (sh: Sheet) => {
    if (sh.kind === 'first' || sh.kind === 'flip' || sh.kind === 'today') return dateSheet(sh);
    if (sh.kind === 'moment') {
      return (
        <>
          <span className={s.band}>
            <b>{t.moment}</b>
            <i>
              {sh.n}/{moments}
            </i>
          </span>
          {sh.photo ? (
            <span className={cx(s.snap, sh.note.length > 44 && s.compact)}>
              <Sprite name="anniversary-klip" className={s.clip} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sh.photo} alt="" draggable={false} />
            </span>
          ) : (
            <Sprite name={sh.n % 2 ? 'bunga-kamboja-pink' : 'bunga-kamboja'} className={s.sticker} />
          )}
          {sh.note ? (
            <span className={cx(s.note, !sh.photo && s.big, sh.note.length > (sh.photo ? 38 : 24) && s.long, sh.note.length > 44 && s.xl)}>{sh.note}</span>
          ) : null}
        </>
      );
    }
    if (sh.kind === 'cover') {
      return (
        <>
          <span className={s.band}>
            <b>{t.coverBand}</b>
            <i>floa</i>
          </span>
          <Sprite name="bunga-kamboja-pink" className={s.sticker} />
          <span className={cx(s.note, s.big, to.length > 12 && s.long)}>{fmt(t.coverTitle, { to })}</span>
          <span className={s.scribble}>{t.coverSub}</span>
        </>
      );
    }
    return (
      <>
        <span className={s.band}>
          <b>{t.today}</b>
          <i>∞</i>
        </span>
        <Sprite name="bunga-kamboja" className={s.sticker} />
        <span className={cx(s.note, s.big, s.long)}>{t.endNote}</span>
      </>
    );
  };

  const label = (sh: Sheet, i: number) => {
    let what =
      sh.kind === 'moment'
        ? `${fmt(t.sheetMoment, { i: sh.n, n: moments })}${sh.note ? `: ${sh.note}` : ''}`
        : sh.kind === 'cover' || sh.kind === 'end'
          ? t.coverBand
          : fmt(t.sheetDate, { date: fullFmt.format(sh.date) });
    if ((sh.kind === 'flip' || sh.kind === 'today') && sh.mark) what += ` · ${markText(sh.mark)}`;
    return i < last ? `${what}${/[.!?…]$/.test(what) ? '' : '.'} ${t.tearLabel}` : what;
  };

  // yang dirender: semua lembar yang sudah disobek + lembar teratas + satu di bawahnya
  const visible = sheets.map((sh, i) => ({ sh, i })).filter(({ i }) => i <= idx + 1);
  const [pre, post] = t.total.split('{n}');

  return (
    <div className={cx(s.wrap, ready && s.ready)}>
      <div className={s.head}>
        {top.kind === 'flip' && start ? (
          // selama rentetan: hitungan hari ikut berlari bersama lembar yang disobek
          <div key="run" className={cx(s.runCount, top.mark && s.runMark)} aria-hidden>
            <span>{fmt(t.dayN, { n: '' }).trim()}</span>
            <b>{num(dayDiff(start, top.date) + 1)}</b>
          </div>
        ) : (
          <div key="names">
            <div className={s.eyebrow}>{fmt(t.headFor, { to })}</div>
            {from ? <div className={s.from}>{fmt(t.headFrom, { from })}</div> : null}
          </div>
        )}
      </div>

      {/* cahaya hangat yang memancar dari balik kalender saat sampai di hari ini */}
      <div className={cx(s.rays, arrived && isToday && s.raysOn)} aria-hidden>
        <span className={s.raysSpin} />
        <span className={s.raysGlow} />
      </div>

      <div className={s.cal}>
        <Sprite name="anniversary-papan" className={s.board} />
        <div className={s.owner}>
          <div className={cx(s.ownerName, owner.length > 15 && s.mid, owner.length > 26 && s.small)}>{owner}</div>
          <div className={s.ownerSince}>{start ? fmt(t.since, { date: fullFmt.format(start) }) : t.boardPlain}</div>
        </div>

        <div className={s.block} ref={blockRef}>
          <span className={s.edge} style={{ '--left': Math.max(0.2, 1 - idx / Math.max(1, last)) } as CSSProperties} aria-hidden />
          {visible.map(({ sh, i }) => {
            const torn = i < idx;
            const isTop = i === idx;
            const f = falls[i];
            const style = torn
              ? ({
                  '--fx': `${f.fx}em`,
                  '--fr': `${f.fr}deg`,
                  '--peek': `${f.peek}em`,
                  '--sway': f.sway,
                  '--rx': `${f.rx}deg`,
                  '--ry': `${f.ry * f.sway}deg`,
                  zIndex: 20 + i,
                } as CSSProperties)
              : ({ zIndex: isTop ? 4 : 3 } as CSSProperties);
            const inner = (
              <>
                <span className={s.shade} style={torn ? { clipPath: jags[i] } : undefined} aria-hidden />
                <span className={s.paper} style={torn ? { clipPath: jags[i] } : undefined}>
                  {body(sh)}
                </span>
              </>
            );
            return isTop && canTear ? (
              <button
                key={i}
                type="button"
                className={cx(s.sheet, s.top)}
                style={style}
                aria-label={label(sh, i)}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={(e) => onEnd(e, false)}
                onPointerCancel={(e) => onEnd(e, true)}
                onClick={onTap}
              >
                {inner}
              </button>
            ) : (
              <div
                key={i}
                className={cx(s.sheet, torn && s.torn, torn && f.fast && s.fast, isTop && s.current, isTop && arrived && s.landed)}
                style={style}
                role={isTop ? 'img' : undefined}
                aria-label={isTop ? label(sh, i) : undefined}
                aria-hidden={!isTop}
              >
                {inner}
              </div>
            );
          })}
          <span className={cx(s.stub, idx > 0 && s.stubOn)} aria-hidden />
        </div>
        <Sprite name="anniversary-bilah" className={s.strip} />
      </div>

      {showCounter ? (
        <div className={cx(s.counter, !el && s.plain)}>
          {el ? (
            <>
              <div className={s.tiles} role="timer" aria-label={`${t.counterLabel} ${el.years} ${t.years}, ${el.months} ${t.months}, ${el.days} ${t.days}`}>
                {(
                  [
                    [String(el.years), t.years, true],
                    [String(el.months), t.months, true],
                    [String(el.days), t.days, true],
                    [pad(el.hours), t.hours, false],
                    [pad(el.minutes), t.minutes, false],
                    [pad(el.seconds), t.seconds, false],
                  ] as const
                ).map(([v, l, big], i) => (
                  <div key={i} className={cx(s.tile, big && s.major)}>
                    <b>
                      <Roll value={v} delay={i * 110} />
                    </b>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
              <div className={s.total}>
                {pre}
                <span className={s.totalNum}>
                  <Roll value={num(el.totalSeconds)} delay={500} spin={1900} />
                </span>
                {post}
              </div>
            </>
          ) : null}
          <button type="button" ref={openRef} className={s.open} onClick={openLetter}>
            {t.openLetter} <span aria-hidden>→</span>
          </button>
        </div>
      ) : null}

      <Confetti burst={burst} shapes="hearts" count={80} origin={{ x: 0.5, y: 0.42 }} colors={['#c8372d', '#e8c268', '#fff3da', '#f29aa5', '#f2542d']} />
      <Confetti burst={burst} count={70} origin={{ x: 0.5, y: 0.5 }} colors={['#fbf5e6', '#f4ecd8', '#c8372d', '#e8c268']} />

      {idx === 0 && canTear ? <Hint key="t0">{t.hintTear}</Hint> : null}
      {idx > 0 && canTear ? <Hint key="t1">{t.hintTearMore}</Hint> : null}
      {finale ? null : canTear ? (
        <TapCue key={`tear${idx}`} target={topCue} kind="drag" at={{ x: 0.5, y: 0.32 }} dir={{ x: 0, y: 3.2 }} />
      ) : showCounter ? (
        <TapCue key="open" target={openRef} delay={4500} />
      ) : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja-pink"
          theme={{ bg: `url(${BACKDROP}) center bottom / cover no-repeat`, ink: meta.palette.ink, paper: '#fffaf0', paperInk: '#3b2a22' }}
          onReplay={onReplay}
        >
          {el ? <div className={s.finaleCount}>{fmt(t.finaleCount, { n: num(el.dayNumber) })}</div> : null}
        </Finale>
      ) : null}
    </div>
  );
}
