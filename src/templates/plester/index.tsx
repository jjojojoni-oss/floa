'use client';

import { type CSSProperties, type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Sprite, Stage, TapCue, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { AwanGame } from './Game';
import { useText } from './i18n';
import { meta } from './meta';
import { fmt } from '@/i18n/client';
import s from './style.module.css';

/* Semua posisi memakai papan 600×800: hati (kanvas 600×560) di atas, nampan di bawah. */
const BW = 600;
const BH = 800;

/** Titik di sepanjang retakan: tempat pengakuan dibaca, lalu tempat plester janjinya menempel. [x, y, sudut] */
const SLOTS: Record<number, [number, number, number][]> = {
  1: [[300, 268, 17]],
  2: [
    [301, 200, -20],
    [303, 400, 15],
  ],
  3: [
    [300, 164, -22],
    [300, 268, 17],
    [298, 428, -14],
  ],
};
const TRAY_Y = 692;
const trayX = (i: number, n: number) => 300 + (i - (n - 1) / 2) * (n >= 3 ? 124 : 150);
/** warna titik di kartu, mengikuti warna plester kain */
const DOTS = ['#e0aa74', '#f08fa5', '#7fc3a6', '#eebd3f'];

type Phase = 'intro' | 'admit' | 'but' | 'mend' | 'healed' | 'ask' | 'answered';
type PlasterState = { at: 'tray' } | { at: 'drag'; x: number; y: number } | { at: 'heart'; slot: number };
type ButState = 'idle' | 'try' | 'fall' | 'gone';

const BG = '/art/bg-plester.webp';
const ART = [BG, 'plester-hati-kiri', 'plester-hati-kanan', 'plester-hati-pulih', 'plester-nampan', 'plester-kain-1', 'plester-kain-2', 'plester-kain-3', 'plester-kain-4'];

/**
 * Catatan diisi berpasangan: baris ganjil = yang disadari (dibaca di retakan),
 * baris genap = janji untuk itu (tertulis di plester yang menutup retakan tersebut).
 * Kado lama (kurang dari 4 baris) memakai semua barisnya sebagai pengakuan.
 */
function split(notes: string[]) {
  const raw = notes.map((n) => n.trim()).filter(Boolean).slice(0, 6);
  if (raw.length >= 4) {
    return { admits: raw.filter((_, i) => i % 2 === 0).slice(0, 3), promises: raw.filter((_, i) => i % 2 === 1).slice(0, 3) };
  }
  return { admits: raw.slice(0, 3), promises: [] as string[] };
}

export default function Plester(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BG}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const { admits, promises } = split(data.notes);
  const n = admits.length ? admits.length : 3;
  const slots = SLOTS[n];
  const ready = useArtReady(ART);
  const t = useText();
  const later = useTimers();

  const [phase, setPhase] = useState<Phase>('intro');
  const [seen, setSeen] = useState(0);
  const [but, setBut] = useState<ButState>('idle');
  const [states, setStates] = useState<PlasterState[]>(() => Array.from({ length: n }, () => ({ at: 'tray' })));
  const [last, setLast] = useState<{ slot: number; plaster: number } | null>(null);
  const [answer, setAnswer] = useState<'forgive' | 'time' | null>(null);
  const [shiver, setShiver] = useState(0);
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);
  /** mini-game awan mendung: setelah semua pengakuan dibaca, sebelum plester "tapi…" */
  const [game, setGame] = useState<'off' | 'on' | 'done'>('off');

  const board = useRef<HTMLDivElement>(null);
  const crackRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const drag = useRef<{ i: number; x0: number; y0: number; moved: boolean } | null>(null);
  const dragEnd = useRef(0);
  const stuckSet = useRef(new Set<number>());
  // target penunjuk sentuh
  const startRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const butRef = useRef<HTMLButtonElement>(null);
  const readRef = useRef<HTMLButtonElement>(null);
  const trayRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const stuck = states.filter((p) => p.at === 'heart').length;
  /** plester berikutnya yang masih di nampan (untuk ketukan di hati & penunjuk sentuh) */
  const nextPl = states.findIndex((p) => p.at === 'tray');
  const crackCue = useMemo(() => ({ get current() { return crackRefs.current[seen] ?? null; } }), [seen]);
  const trayCue = useMemo(() => ({ get current() { return trayRefs.current[nextPl] ?? null; } }), [nextPl]);
  const healed = phase === 'healed' || phase === 'ask' || phase === 'answered';
  const gap = healed ? 0 : 1 - stuck / n;
  const to = data.to.trim() || t.you;
  const from = data.from.trim();

  // pembaca keyboard: fokus pindah ke retakan berikutnya
  useEffect(() => {
    if (phase !== 'admit' || seen >= n) return;
    crackRefs.current[seen]?.focus({ preventScroll: true });
  }, [phase, seen, n]);

  /* ── 1. pembuka → 2. pengakuan ── */
  const start = () => {
    sfx.tap();
    setPhase(admits.length ? 'admit' : 'but');
  };

  const reveal = (i: number) => {
    if (phase !== 'admit' || i !== seen) return;
    setSeen(i + 1);
    setShiver((v) => v + 1);
    sfx.tap();
    sfx.note(Math.max(0, 2 - i));
    haptic(12);
  };

  const go = (p: Phase) => {
    sfx.tap();
    setPhase(p);
  };

  /* ── 3. plester "tapi…" yang tidak mau menempel ── */
  const tryBut = () => {
    if (but !== 'idle') return;
    setBut('try');
    sfx.pop();
    haptic(10);
    later(() => {
      setBut('fall');
      sfx.whoosh();
    }, 760);
    later(() => setBut('gone'), 1750);
  };

  /* ── 4. janji: plester ditempel satu per satu ── */
  const stick = (i: number) => {
    if (phase !== 'mend' || stuckSet.current.has(i)) return;
    const slot = stuckSet.current.size;
    if (slot >= n) return;
    stuckSet.current.add(i);
    setStates((prev) => {
      const next = prev.slice();
      next[i] = { at: 'heart', slot };
      return next;
    });
    setLast({ slot, plaster: i });
    haptic(14);
    sfx.pop();
    sfx.note(slot + 2);
    if (slot + 1 >= n) {
      later(() => {
        setPhase('healed');
        setBurst((b) => b + 1);
        sfx.success();
        haptic(40);
      }, 1100);
      // jeda supaya janji terakhir & hati yang utuh sempat dinikmati, baru pertanyaannya
      later(() => setPhase('ask'), 1100 + (promises[slot] ? 3400 : 2200));
    }
  };

  /* ── 5. pertanyaan lembut, dua jawaban sama-sama dihormati ── */
  const respond = (a: 'forgive' | 'time') => {
    setAnswer(a);
    setPhase('answered');
    if (a === 'forgive') {
      sfx.chime();
      haptic(30);
      later(() => setBurst((b) => b + 1), 250);
    } else {
      sfx.tap();
      haptic(10);
    }
  };

  /** koordinat layar → koordinat papan (0..600, 0..800) */
  const toBoard = (e: RPointerEvent) => {
    const r = board.current?.getBoundingClientRect();
    if (!r || !r.width || !r.height) return null;
    return { x: ((e.clientX - r.left) / r.width) * BW, y: ((e.clientY - r.top) / r.height) * BH };
  };
  const onDragStart = (i: number, e: RPointerEvent<HTMLButtonElement>) => {
    if (states[i].at === 'heart') return;
    drag.current = { i, x0: e.clientX, y0: e.clientY, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onDragMove = (i: number, e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.i !== i) return;
    if (!d.moved && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 7) return;
    d.moved = true;
    const p = toBoard(e);
    if (!p) return;
    setStates((prev) => {
      if (prev[i].at === 'heart') return prev;
      const next = prev.slice();
      next[i] = { at: 'drag', x: p.x, y: p.y - 28 };
      return next;
    });
  };
  const onDragEnd = (i: number, e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.i !== i || !d.moved) return;
    dragEnd.current = performance.now();
    const p = toBoard(e);
    if (p && p.y < 584) stick(i);
    else
      setStates((prev) => {
        if (prev[i].at !== 'drag') return prev;
        const next = prev.slice();
        next[i] = { at: 'tray' };
        return next;
      });
  };

  const showTray = phase === 'but' || phase === 'mend';
  const promise = last ? promises[last.slot] : null;
  const long = to.length > 12;

  /* ── kartu di kaki layar, mengikuti tahap ── */
  let card: { label?: string; text: string; dot?: string; k: string; size?: string } | null = null;
  if (phase === 'admit' && seen > 0) {
    const text = admits[seen - 1];
    card = { k: `a${seen}`, label: fmt(t.admitLabel, { i: seen, n }), text, size: text.length > 48 ? s.long : undefined };
  } else if (phase === 'but' && but === 'gone') {
    card = { k: 'but', text: t.butLine };
  } else if ((phase === 'mend' || phase === 'healed') && promise && last) {
    card = { k: `p${last.slot}`, label: fmt(t.promiseLabel, { i: last.slot + 1, n }), text: promise, dot: DOTS[last.plaster % DOTS.length], size: promise.length > 48 ? s.long : undefined };
  }

  return (
    <div className={cx(s.wrap, ready && s.ready)}>
      <div className={s.head}>
        {healed ? (
          <div key="t">
            <div className={s.eyebrow}>{t.healedEyebrow}</div>
            <div className={cx(s.name, s.small)}>{data.title || fmt(t.titleFallback, { to })}</div>
          </div>
        ) : (
          <div key="n">
            <div className={s.eyebrow}>{t.eyebrow}</div>
            <div className={cx(s.name, long && s.small)}>{to}</div>
            {from ? <div className={s.from}>{fmt(t.fromName, { name: from })}</div> : null}
          </div>
        )}
      </div>

      <div className={s.art}>
        <div
          ref={board}
          className={cx(s.board, healed && s.healed, showTray && s.trayOn, phase === 'mend' && s.mendOn, answer === 'forgive' && s.forgiven, answer === 'time' && s.waiting)}
          style={{ '--gap': gap } as CSSProperties}
          role="group"
          aria-label={healed ? t.healedAria : t.brokenAria}
        >
          <span className={s.shadow} />
          <span className={s.glow} aria-hidden />
          <Sprite name="plester-nampan" className={s.tray} />

          <div key={shiver} className={cx(s.beat, shiver > 0 && !healed && s.shiver)}>
            <div className={s.heart}>
              <div className={s.halfL}>
                <Sprite name="plester-hati-kiri" className={s.layer} />
                <Sprite name="plester-tetes" className={s.tear} />
              </div>
              <div className={s.halfR}>
                <Sprite name="plester-hati-kanan" className={s.layer} />
              </div>
              <Sprite name="plester-hati-pulih" className={cx(s.layer, s.whole)} />
            </div>

            {/* plester janji */}
            {states.map((p, i) => {
              let x = trayX(i, n);
              let y = TRAY_Y;
              let rot = 90 + (i % 2 ? 5 : -5);
              let scale = 0.72;
              if (p.at === 'heart') [x, y, rot, scale] = [slots[p.slot][0], slots[p.slot][1], slots[p.slot][2], 0.8];
              else if (p.at === 'drag') [x, y, rot, scale] = [p.x, p.y, 24, 0.9];
              return (
                <div
                  key={i}
                  className={cx(s.pl, p.at === 'tray' && s.inTray, p.at === 'drag' && s.dragging, p.at === 'heart' && s.stuck)}
                  style={{ transform: `translate(${(x / BW) * 100}%, ${(y / BH) * 100}%)` }}
                >
                  <Sprite
                    name={`plester-kain-${(i % 4) + 1}`}
                    className={s.plImg}
                    style={{ transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})` }}
                  />
                </div>
              );
            })}
          </div>

          {/* plester "tapi…": mencoba menempel, terkelupas, jatuh */}
          {phase === 'but' && but !== 'gone' ? (
            <div className={cx(s.tapi, but === 'try' && s.tapiTry, but === 'fall' && s.tapiFall)}>
              <div className={s.tapiInner}>
                <Sprite name="plester-kain-1" className={s.tapiImg} />
                <span className={s.tapiWord}>{t.butWord}</span>
              </div>
            </div>
          ) : null}

          {/* retakan yang bisa disentuh, satu per satu */}
          {phase === 'admit'
            ? slots.map(([x, y], i) => (
                <button
                  key={i}
                  ref={(el) => {
                    crackRefs.current[i] = el;
                  }}
                  type="button"
                  className={cx(s.crack, i === seen && s.crackNow, i < seen && s.crackSeen)}
                  style={{ left: `${(x / BW) * 100}%`, top: `${(y / BH) * 100}%` }}
                  aria-label={fmt(t.crackAria, { i: i + 1, n })}
                  disabled={i !== seen}
                  onClick={() => reveal(i)}
                />
              ))
            : null}

          {/* hati utuh sebagai area sentuh: membuka retakan berikutnya / menempel plester berikutnya */}
          {phase === 'admit' && seen < n ? (
            <button type="button" className={s.heartHit} aria-hidden tabIndex={-1} onClick={() => reveal(seen)} />
          ) : null}
          {phase === 'mend' && nextPl >= 0 ? (
            <button type="button" className={s.heartHit} aria-hidden tabIndex={-1} onClick={() => stick(nextPl)} />
          ) : null}

          {phase === 'but' && but === 'idle' ? (
            <button ref={butRef} type="button" className={cx(s.hit, s.hitBut)} style={{ left: '50%', width: '30%' }} aria-label={t.butAria} onClick={tryBut} />
          ) : null}

          {phase === 'mend'
            ? states.map((p, i) =>
                p.at === 'heart' ? null : (
                  <button
                    key={i}
                    ref={(el) => {
                      trayRefs.current[i] = el;
                    }}
                    type="button"
                    className={s.hit}
                    style={{ left: `${(trayX(i, n) / BW) * 100}%`, width: n >= 3 ? '28%' : '32%' }}
                    aria-label={fmt(t.stickAria, { n: i + 1 })}
                    onClick={() => {
                      if (performance.now() - dragEnd.current < 120) return;
                      stick(i);
                    }}
                    onPointerDown={(e) => onDragStart(i, e)}
                    onPointerMove={(e) => onDragMove(i, e)}
                    onPointerUp={(e) => onDragEnd(i, e)}
                    onPointerCancel={(e) => onDragEnd(i, e)}
                  />
                ),
              )
            : null}
        </div>
      </div>

      <div className={s.foot}>
        {phase === 'intro' ? (
          <div className={s.open}>
            <p className={s.openLine}>{fmt(t.openA, { to })}</p>
            <p className={cx(s.openLine, s.openLine2)}>{t.openB}</p>
            <button ref={startRef} type="button" className={s.ghost} onClick={start}>
              {t.openCta}
            </button>
          </div>
        ) : null}

        {card ? (
          <div key={card.k} className={cx(s.tag, card.size)} style={{ '--dot': card.dot ?? 'var(--accent)' } as CSSProperties}>
            {card.label ? <span className={s.tagLabel}>{card.label}</span> : null}
            <span className={s.tagText}>{card.text}</span>
          </div>
        ) : null}

        {phase === 'admit' && seen >= n && game !== 'on' ? (
          <button
            ref={nextRef}
            type="button"
            className={s.ghost}
            onClick={() => {
              if (game === 'done') return go('but');
              sfx.tap();
              setGame('on');
            }}
            autoFocus
          >
            {t.next}
          </button>
        ) : null}
        {phase === 'but' && but === 'gone' ? (
          <button ref={nextRef} type="button" className={s.ghost} onClick={() => go('mend')} autoFocus>
            {t.next}
          </button>
        ) : null}

        {phase === 'mend' ? (
          <div className={s.count} aria-label={fmt(t.countAria, { stuck, n })}>
            {states.map((_, i) => (
              <i key={i} className={i < stuck ? s.on : undefined} />
            ))}
          </div>
        ) : null}

        {phase === 'ask' ? (
          <div className={s.ask}>
            <p className={s.askEyebrow}>{t.askEyebrow}</p>
            <p className={s.askQ}>{t.askQ}</p>
            <div className={s.choices}>
              <button type="button" className={s.choice} onClick={() => respond('forgive')}>
                {t.forgive}
              </button>
              <button type="button" className={cx(s.choice, s.choiceSoft)} onClick={() => respond('time')}>
                {t.needTime}
              </button>
            </div>
          </div>
        ) : null}

        {phase === 'answered' && answer ? (
          <>
            <div key={answer} className={cx(s.tag, s.reply)}>
              <span className={s.tagText}>{fmt(answer === 'forgive' ? t.forgiveReply : t.timeReply, { to })}</span>
              {from ? <span className={s.sign}>{fmt(t.sign, { name: from })}</span> : null}
            </div>
            <button
              ref={readRef}
              type="button"
              className={s.cta}
              onClick={() => {
                sfx.chime();
                setFinale(true);
              }}
            >
              {t.read}
            </button>
          </>
        ) : null}
      </div>

      {phase === 'admit' && seen === 0 ? <Hint>{t.admitHint}</Hint> : null}
      {phase === 'but' && but === 'idle' ? <Hint key="b">{t.butHint}</Hint> : null}
      {phase === 'mend' && stuck === 0 ? <Hint key="m">{t.hint}</Hint> : null}

      {/* penunjuk sentuh kalau penerima diam, satu per tahap */}
      <TapCue target={startRef} show={phase === 'intro'} delay={4200} />
      <TapCue target={crackCue} show={phase === 'admit' && seen < n} />
      <TapCue target={nextRef} show={(phase === 'admit' && seen >= n && game !== 'on') || (phase === 'but' && but === 'gone')} delay={3600} />

      {game === 'on' ? (
        <AwanGame
          t={t.game}
          onDone={() => {
            setGame('done');
            go('but');
          }}
        />
      ) : null}
      <TapCue target={butRef} show={phase === 'but' && but === 'idle'} />
      <TapCue target={trayCue} show={phase === 'mend' && nextPl >= 0} kind="drag" dir={{ x: 0, y: -6 }} />
      <TapCue target={readRef} show={phase === 'answered' && !finale} delay={3600} />

      <Confetti burst={burst} shapes="hearts" count={answer === 'forgive' ? 46 : 64} colors={['#ef6a6a', '#ff9aa8', '#ffc9cf', '#ffffff', '#f7b3a0']} origin={{ x: 0.5, y: 0.45 }} />

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finaleEyebrow}
          flower="bunga-kamboja"
          theme={{ backdrop: BG, ink: '#2f3b46', paper: '#fffdf8', paperInk: '#33303a' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
