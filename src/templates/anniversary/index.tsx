'use client';

import { type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Sprite, Stage, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { addDays, dayDiff, elapsed, parseDate, pasaran, startOfDay } from './date';
import { LOCALE_TAG, TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BACKDROP = '/art/bg-anniversary.webp';
const ART = ['bg-anniversary', 'anniversary-papan', 'anniversary-bilah', 'anniversary-klip'];
/** lembar tanggal yang berkelebat di antara dulu dan sekarang */
const FLURRY_MAX = 14;

export default function Anniversary(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BACKDROP}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

type Sheet =
  | { kind: 'first' | 'flip' | 'today'; date: Date }
  | { kind: 'moment'; n: number; note: string; photo: string | null }
  | { kind: 'cover' }
  | { kind: 'end' };

type Fall = { fx: number; fr: number; peek: number; sway: number; fast: boolean };

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
    fast,
  };
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
      const k = Math.max(0, Math.min(FLURRY_MAX, diff - 1));
      let prev = 0;
      for (let i = 1; i <= k; i++) {
        const at = Math.max(prev + 1, Math.round((diff * i) / (k + 1)));
        prev = at;
        list.push({ kind: 'flip', date: addDays(start, at) });
      }
      list.push({ kind: 'today', date: today });
    } else list.push({ kind: 'end' });
    return { sheets: list, start, counting };
  }, [data.date, data.notes, data.photos]);

  const last = sheets.length - 1;
  const moments = sheets.filter((x) => x.kind === 'moment').length;
  const flips = sheets.filter((x) => x.kind === 'flip').length;

  /** indeks lembar teratas; lembar di bawah indeks ini sudah disobek */
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);
  const [falls, setFalls] = useState<Record<number, Fall>>({});
  const [arrived, setArrived] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [burst, setBurst] = useState(0);
  const [finale, setFinale] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const drag = useRef<{ id: number; x0: number; y0: number; dy: number; el: HTMLElement } | null>(null);
  const moved = useRef(false);

  const jags = useMemo(() => sheets.map((_, i) => jagged(i)), [sheets]);

  const arrive = () => {
    later(() => {
      setArrived(true);
      const isToday = sheets[last].kind === 'today';
      if (isToday) {
        sfx.success();
        haptic(30);
        later(() => setBurst((v) => v + 1), 550);
      } else sfx.chime();
      later(() => {
        setNow(new Date());
        setShowCounter(true);
      }, isToday ? 1250 : 500);
    }, 320);
  };

  const tearOne = (fast: boolean) => {
    const i = idxRef.current;
    if (i >= last) return;
    idxRef.current = i + 1;
    const cur = sheets[i];
    // di tengah rentetan, separuh lembar terbang keluar layar supaya tumpukan di bawah tidak menggunung
    const flyOff = cur.kind === 'flip' && i % 2 === 0;
    setFalls((f) => ({ ...f, [i]: fallOf(i, fast, flyOff) }));
    setIdx(i + 1);
    if (cur.kind === 'flip') {
      // rentetan: sobekan ringan + nada yang terus naik
      sfx.tap();
      const k = i - (last - flips);
      if (k % 2 === 0) sfx.note(k / 2);
    } else sfx.crack();
    haptic(fast ? 6 : 14);
    const next = sheets[i + 1];
    if (next.kind === 'flip') {
      // rentetan: pelan → cepat → pelan lagi
      const k = i + 1 - (last - flips);
      const u = flips > 1 ? k / (flips - 1) : 1;
      const wait = cur.kind === 'flip' ? 85 + 250 * Math.pow(Math.abs(2 * u - 1), 2.2) : 520;
      later(() => tearOne(true), wait);
    } else if (i + 1 === last) arrive();
  };

  const top = sheets[idx];
  const canTear = idx < last && top.kind !== 'flip';

  const onDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0 || !canTear) return;
    moved.current = false;
    const el = e.currentTarget;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dy: 0, el };
  };
  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    d.dy = e.clientY - d.y0;
    if (Math.abs(dx) > 6 || Math.abs(d.dy) > 6) moved.current = true;
    if (moved.current) {
      d.el.style.animation = 'none';
      d.el.style.transition = 'none';
      d.el.style.transform = `translate(${dx * 0.12}px, ${Math.max(0, d.dy) * 0.4}px) rotate(${dx / 60}deg)`;
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
    if (canTear) tearOne(false);
  };

  // penghitung berdetak tiap detik setelah sampai di hari ini
  useEffect(() => {
    if (!showCounter || !counting) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [showCounter, counting]);

  const monthFmt = useMemo(() => new Intl.DateTimeFormat(tag, { month: 'long' }), [tag]);
  const dowFmt = useMemo(() => new Intl.DateTimeFormat(tag, { weekday: 'long' }), [tag]);
  const fullFmt = useMemo(() => new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'long', year: 'numeric' }), [tag]);
  const num = (n: number) => n.toLocaleString(tag);
  const pad = (n: number) => String(n).padStart(2, '0');

  const el = start && counting ? elapsed(start, now) : null;
  const owner = from ? `${to} & ${from}` : to;

  const openLetter = () => {
    if (finale) return;
    sfx.chime();
    haptic(15);
    setFinale(true);
  };

  const dateSheet = (sh: Extract<Sheet, { date: Date }>) => {
    const sunday = sh.date.getDay() === 0;
    const day = sh.date.getDate();
    return (
      <>
        <span className={s.band}>
          <b>{monthFmt.format(sh.date)}</b>
          <i>{sh.date.getFullYear()}</i>
        </span>
        <span className={s.numWrap}>
          <span className={cx(s.num, sunday && s.sunday, day > 9 && s.two)}>{day}</span>
          {sh.kind === 'today' ? (
            <svg className={cx(s.circle, arrived && s.drawn)} viewBox="0 0 300 220" preserveAspectRatio="none" aria-hidden>
              <path pathLength={1} d="M158,14C246,6 290,58 280,112C268,180 168,212 86,198C20,186 -4,122 26,70C52,26 118,8 186,20" />
            </svg>
          ) : null}
        </span>
        <span className={s.dow}>
          {dowFmt.format(sh.date)}
          {locale === 'id' ? <em> {pasaran(sh.date)}</em> : null}
        </span>
        {sh.kind === 'first' ? <span className={s.scribble}>{t.firstDay}</span> : null}
        {sh.kind === 'today' && el ? (
          <span className={cx(s.scribble, s.late, arrived && s.shown)}>
            {el.exact ? fmt(t.exact, { y: el.years }) : fmt(t.dayN, { n: num(el.dayNumber) })}
          </span>
        ) : null}
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
    const what =
      sh.kind === 'moment'
        ? `${fmt(t.sheetMoment, { i: sh.n, n: moments })}${sh.note ? `: ${sh.note}` : ''}`
        : sh.kind === 'cover' || sh.kind === 'end'
          ? t.coverBand
          : fmt(t.sheetDate, { date: fullFmt.format(sh.date) });
    return i < last ? `${what}. ${t.tearLabel}` : what;
  };

  // yang dirender: semua lembar yang sudah disobek + lembar teratas + satu di bawahnya
  const visible = sheets.map((sh, i) => ({ sh, i })).filter(({ i }) => i <= idx + 1);

  return (
    <div className={cx(s.wrap, ready && s.ready)}>
      <div className={s.head}>
        <div className={s.eyebrow}>{fmt(t.headFor, { to })}</div>
        {from ? <div className={s.from}>{fmt(t.headFrom, { from })}</div> : null}
      </div>

      <div className={s.cal}>
        <Sprite name="anniversary-papan" className={s.board} />
        <div className={s.owner}>
          <div className={cx(s.ownerName, owner.length > 15 && s.mid, owner.length > 26 && s.small)}>{owner}</div>
          <div className={s.ownerSince}>{start ? fmt(t.since, { date: fullFmt.format(start) }) : t.boardPlain}</div>
        </div>

        <div className={s.block}>
          <span className={s.edge} style={{ '--left': Math.max(0.2, 1 - idx / Math.max(1, last)) } as CSSProperties} aria-hidden />
          {visible.map(({ sh, i }) => {
            const torn = i < idx;
            const isTop = i === idx;
            const f = falls[i];
            const style = torn
              ? ({ '--fx': `${f.fx}em`, '--fr': `${f.fr}deg`, '--peek': `${f.peek}em`, '--sway': f.sway, zIndex: 20 + i } as CSSProperties)
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
                className={cx(s.sheet, torn && s.torn, torn && f.fast && s.fast, isTop && arrived && s.landed)}
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
              <div className={s.tiles} role="timer" aria-label={t.counterLabel}>
                {(
                  [
                    [num(el.years), t.years, true],
                    [num(el.months), t.months, true],
                    [num(el.days), t.days, true],
                    [pad(el.hours), t.hours, false],
                    [pad(el.minutes), t.minutes, false],
                    [pad(el.seconds), t.seconds, false],
                  ] as const
                ).map(([v, l, big], i) => (
                  <div key={i} className={cx(s.tile, big && s.major)}>
                    <b>{v}</b>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
              <div className={s.total}>{fmt(t.total, { n: num(el.totalSeconds) })}</div>
            </>
          ) : null}
          <button type="button" className={s.open} onClick={openLetter}>
            {t.openLetter} <span aria-hidden>→</span>
          </button>
        </div>
      ) : null}

      <Confetti burst={burst} shapes="hearts" count={70} origin={{ x: 0.5, y: 0.46 }} colors={['#c8372d', '#e8c268', '#fff3da', '#f29aa5', '#f2542d']} />

      {idx === 0 && canTear ? <Hint>{t.hintTear}</Hint> : null}

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
