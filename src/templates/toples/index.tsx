'use client';

import { type CSSProperties, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, HoldButton, Sprite, Stage, TapCue, Typewriter, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { SleepyStars } from './Game';
import { TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BACKDROP = '/art/bg-toples.webp';
const ART = ['bg-toples', 'toples-lampu', 'toples-kaca-belakang', 'toples-kaca-depan', 'toples-gabus', 'toples-surat', 'bungkus-label'];

/**
 * corked → toples masih bergabus; gabusnya dicabut (tarik ke atas atau ketuk)
 * open   → toples dikocok (geser kiri-kanan atau ketuk) sampai satu bintang melayang keluar
 * out    → bintang melayang keluar lewat mulut toples, menunggu diketuk (bintang emas: ditahan, atau diketuk dua kali)
 * read   → lipatannya terbuka jadi secarik kertas panjang (+ foto kecil); lalu kertasnya digantung di untaian lampu
 * done   → semua kertas sudah digantung
 * game   → mini-game: membangunkan bintang yang ketiduran
 * letter → surat di dasar toples → Finale
 */
type Phase = 'corked' | 'open' | 'out' | 'read' | 'done' | 'game' | 'letter';

/** tumpukan bintang di dalam toples (kanvas 460×640): [x, y, putaran], dari dasar ke atas */
const PILE: [number, number, number][] = [
  [230, 520, 6],
  [120, 506, -16],
  [340, 510, 20],
  [174, 410, 24],
  [292, 402, -18],
  [234, 300, 8],
  [128, 312, -26],
];
/** tempat bintang melayang setelah keluar: persis di atas mulut toples */
const HOVER = { x: 230, y: 34, s: 1.38 };
/** warna kertas tiap bintang (urut sama dengan lukisan toples-bintang-1…5) */
const PAPER = ['#ffdbe4', '#fff4de', '#d4f1e2', '#d5e7fb', '#ffe1c2'];
const GOLD_PAPER = '#ffe9a6';

/** kawat untaian lampu (kanvas 780×200), sama dengan art/sprites/58-toples.js */
const wire = (t: number): [number, number] => [(1 - t) * (1 - t) * -10 + 2 * (1 - t) * t * 390 + t * t * 790, (1 - t) * (1 - t) * 34 + 2 * (1 - t) * t * 214 + t * t * 34];
const BULBS = [0.08, 0.2, 0.32, 0.44, 0.56, 0.68, 0.8, 0.92];
/** gantungan kertas di antara bohlam */
const SLOTS = [0.14, 0.26, 0.38, 0.5, 0.62, 0.74, 0.86];
/** gantungan untuk kertas ke-i dari n: selalu simetris; jumlah genap mengosongkan gantungan tengah */
const slotOf = (i: number, n: number) => (n % 2 ? (SLOTS.length - n) / 2 + i : (SLOTS.length - 1 - n) / 2 + i + (i < n / 2 ? 0 : 1));

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Toples(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BACKDROP}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const locale = useLocale();
  const t = TEXT[locale];
  const later = useTimers();

  /** foto ke-i mengikuti bintang ke-i; catatan kosong dilewati tanpa menggeser pasangan fotonya */
  const items = useMemo(() => {
    const list = data.notes
      .map((note, i) => ({ note: note.trim(), photo: data.photos[i] || null }))
      .filter((x) => x.note)
      .slice(0, 7);
    return list.length ? list : t.fallback.map((note) => ({ note, photo: null as string | null }));
  }, [data.notes, data.photos, t]);
  const n = items.length;
  /** bintang terakhir adalah bintang emas (kalau bintangnya lebih dari satu) */
  const gold = n >= 2 ? n - 1 : -1;
  const spriteOf = (i: number) => (i === gold ? 'toples-bintang-emas' : `toples-bintang-${(i % 5) + 1}`);
  const paperOf = (i: number) => (i === gold ? GOLD_PAPER : PAPER[i % 5]);
  const ready = useArtReady([...ART, ...items.map((_, i) => spriteOf(i))]);

  const to = data.to.trim();
  const from = data.from.trim();

  const [phase, setPhase] = useState<Phase>('corked');
  /** berapa bintang yang sudah digantung */
  const [k, setK] = useState(0);
  const [shakes, setShakes] = useState(0);
  const [typed, setTyped] = useState(false);
  /** bintang yang sedang dibaca ulang dari untaian lampu */
  const [view, setView] = useState<number | null>(null);
  /** bintang emas sedang bersiap keluar sendiri */
  const [auto, setAuto] = useState(false);
  const [alt, setAlt] = useState(false);
  const [again, setAgain] = useState(false);
  const [burst, setBurst] = useState(0);
  const [spark, setSpark] = useState(0);
  const [letterOut, setLetterOut] = useState(false);
  const [awake, setAwake] = useState(false);
  const [finale, setFinale] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const jarIn = useRef<HTMLDivElement>(null);
  const corkEl = useRef<HTMLSpanElement>(null);
  const corkBtn = useRef<HTMLButtonElement>(null);
  const jarBtn = useRef<HTMLButtonElement>(null);
  const starEl = useRef<HTMLElement | null>(null);
  const goldEl = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const letterBtn = useRef<HTMLButtonElement>(null);
  const energy = useRef(0);
  const pending = useRef(false);
  const peak = useRef(0);
  const pull = useRef<{ id: number; y0: number } | null>(null);
  const drag = useRef<{ id: number; x0: number; last: number; dir: number; travel: number; moved: boolean } | null>(null);

  const goldOut = phase === 'out' && k === gold;
  const reading = phase === 'read' ? k : view;

  // jalan pintas ketuk kalau menahan bintang emas tidak memungkinkan: setelah 5 detik, satu ketukan cukup
  useEffect(() => {
    if (!goldOut) return;
    setAlt(false);
    const id = setTimeout(() => setAlt(true), 5000);
    return () => clearTimeout(id);
  }, [goldOut]);

  // foto tiap bintang, selotipnya, dan tokoh mini-game disiapkan selagi toplesnya dikocok
  useEffect(() => {
    if (phase !== 'open') return;
    ['/art/toples-selotip.webp', '/art/game-toples-bantal.webp', '/art/game-toples-bintang.webp', '/art/game-toples-topi.webp', ...items.map((x) => x.photo)].forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
  }, [phase, items]);

  // fokus mengikuti langkahnya (pengguna papan ketik / pembaca layar)
  useEffect(() => {
    if (mode === 'preview') return;
    const el = phase === 'out' && !goldOut ? starEl.current : phase === 'letter' ? letterBtn.current : null;
    if (!el) return;
    const id = setTimeout(() => el.focus({ preventScroll: true }), 900);
    return () => clearTimeout(id);
  }, [phase, goldOut, mode]);
  useEffect(() => {
    if (mode !== 'preview' && (typed || view !== null)) ctaRef.current?.focus({ preventScroll: true });
  }, [typed, view, mode]);

  /* ── 1. gabus ── */
  const pop = () => {
    if (phase !== 'corked') return;
    pull.current = null;
    setPhase('open');
    sfx.pop();
    haptic(22);
    later(() => sfx.chime(), 260);
  };
  const onCorkDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (phase !== 'corked' || e.button > 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
    pull.current = { id: e.pointerId, y0: e.clientY };
  };
  const onCorkMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const p = pull.current;
    if (!p || p.id !== e.pointerId) return;
    const dy = Math.min(0, e.clientY - p.y0);
    // gabus ikut terangkat, makin tinggi makin longgar
    corkEl.current?.style.setProperty('--cy', String(dy * 0.7));
    if (dy < -30) pop();
  };
  const onCorkUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const p = pull.current;
    if (!p || p.id !== e.pointerId) return;
    pull.current = null;
    corkEl.current?.style.setProperty('--cy', '0');
  };

  /* ── 2. kocok ── */
  const release = () => {
    pending.current = false;
    energy.current = 0;
    setPhase('out');
    sfx.pop();
    haptic(14);
  };
  /** satu guncangan: toples dan bintang-bintangnya bergoyang; cukup tenaga → satu bintang keluar */
  const shake = (amount: number) => {
    if (phase !== 'open' || auto || view !== null || pending.current) return;
    setShakes((v) => v + 1);
    sfx.tap();
    haptic(8);
    if (!reduced()) {
      const dir = shakes % 2 ? 1 : -1;
      jarIn.current?.animate([{ transform: 'translateX(0) rotate(0)' }, { transform: `translateX(${dir * 0.5}em) rotate(${dir * 4}deg)` }, { transform: `translateX(${-dir * 0.3}em) rotate(${-dir * 2.4}deg)` }, { transform: 'translateX(0) rotate(0)' }], { duration: 420, easing: 'ease-out' });
      wrapRef.current?.querySelectorAll<HTMLElement>('[data-rattle]').forEach((el, i) => {
        const a = ((i * 73 + shakes * 41) % 30) - 15;
        el.animate([{ transform: 'none' }, { transform: `translate(${a * 0.02}em, ${-0.5 - (i % 3) * 0.22}em) rotate(${a}deg)` }, { transform: `translate(${-a * 0.012}em, 0.08em) rotate(${-a * 0.4}deg)` }, { transform: 'none' }], { duration: 520 + (i % 3) * 60, easing: 'cubic-bezier(0.3, 1.4, 0.5, 1)' });
      });
    }
    energy.current += amount;
    // bintang pertama perlu dikocok sungguhan; berikutnya cukup sekali supaya tidak melelahkan
    if (energy.current >= (k === 0 ? 3 : 1.5)) {
      pending.current = true;
      sfx.note(k);
      later(release, 300);
    }
  };
  const onJarDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (phase !== 'open' || e.button > 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
    drag.current = { id: e.pointerId, x0: e.clientX, last: e.clientX, dir: 0, travel: 0, moved: false };
    jarIn.current?.setAttribute('data-drag', '');
  };
  const onJarMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    if (Math.abs(dx) > 6) d.moved = true;
    const step = e.clientX - d.last;
    d.last = e.clientX;
    const dir = Math.abs(step) < 0.5 ? 0 : Math.sign(step);
    if (dir && dir !== d.dir) {
      // berbalik arah setelah bergeser cukup jauh = satu guncangan
      if (d.dir !== 0 && d.travel > 14) shake(1);
      d.dir = dir;
      d.travel = 0;
    }
    d.travel += Math.abs(step);
    jarIn.current?.style.setProperty('--sx', String(Math.max(-22, Math.min(22, dx * 0.5))));
  };
  const onJarUp = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    jarIn.current?.removeAttribute('data-drag');
    jarIn.current?.style.setProperty('--sx', '0');
    if (cancelled) return;
    // ketukan tanpa geseran: guncangan yang lebih kuat (dua ketukan cukup)
    if (!d.moved) shake(1.5);
    else if (d.travel > 14) shake(1);
  };

  /* ── 3. bintang dibuka ── */
  const openStar = () => {
    if (phase !== 'out') return;
    setTyped(false);
    setAgain(false);
    setPhase('read');
    sfx.rustle();
    haptic(12);
    if (k === gold) {
      setSpark((v) => v + 1);
      later(() => sfx.chime(), 280);
    }
  };
  const onGoldHold = (p: number) => {
    starEl.current?.style.setProperty('--hold', String(p));
  };
  // dilepas terlalu cepat (atau cuma diketuk, secepat apa pun): ketukan berikutnya langsung membukanya,
  // jadi tanpa menahan pun dua ketukan selalu cukup (satu saja kalau petunjuk ketuknya sudah tampil)
  const onGoldTap = () => {
    if (again || alt) openStar();
    else setAgain(true);
  };

  /* ── 4. digantung di untaian lampu ── */
  const hang = () => {
    if (phase !== 'read') return;
    const next = k + 1;
    setK(next);
    sfx.pop();
    sfx.note(k + 2);
    haptic(12);
    if (next >= n) {
      setPhase('done');
      later(() => {
        setBurst((v) => v + 1);
        sfx.success();
        haptic(30);
      }, 520);
      later(() => setPhase('game'), reduced() ? 900 : 2700);
      return;
    }
    setPhase('open');
    energy.current = 0;
    if (next === gold) {
      // yang terakhir tidak perlu dikocok: bintang emas keluar sendiri
      setAuto(true);
      later(() => {
        setAuto(false);
        release();
        sfx.chime();
      }, reduced() ? 300 : 1500);
    }
  };

  /* ── 5. mini-game selesai → surat di dasar toples ── */
  const gameDone = () => {
    setAwake(true);
    setPhase('letter');
    sfx.chime();
    haptic(15);
  };
  const takeLetter = () => {
    if (phase !== 'letter' || letterOut) return;
    setLetterOut(true);
    sfx.whoosh();
    haptic(15);
    later(() => {
      sfx.chime();
      setFinale(true);
    }, reduced() ? 150 : 850);
  };

  /* ── tampilan ── */
  const name = to || t.you;
  /**
   * Label gantungnya kecil. "untuk Ibu" muat sebaris; nama yang lebih panjang turun ke baris kedua, dan
   * nama yang sangat panjang cukup kata pertamanya (nama lengkap sudah ada di kepala layar).
   * Ukuran hurufnya dalam satuan kanvas toples (--u), mengikuti jumlah huruf.
   */
  const tagLine = to ? fmt(t.tag, { to }) : t.tagAnon;
  const tagSplit = tagLine.length > 13;
  const tagWord = to.length > 12 ? to.split(/\s+/)[0] : to;
  const tagSize = tagSplit ? (tagWord.length <= 9 ? 30 : tagWord.length <= 12 ? 25 : tagWord.length <= 16 ? 19 : 15.5) : tagLine.length <= 10 ? 33 : 26;
  const title = data.title.trim() || fmt(t.titleFallback, { to: name });
  const goldSoon = (phase === 'open' && auto) || goldOut;
  const playing = phase === 'game';

  let head;
  if (phase === 'done' || phase === 'game') {
    head = (
      <div key="done">
        <div className={s.eyebrow}>{t.done}</div>
        <div className={cx(s.name, s.small, title.length > 24 && s.tiny)}>{title}</div>
      </div>
    );
  } else if (phase === 'letter') {
    head = (
      <div key="letter">
        <div className={s.eyebrow}>{t.letterEyebrow}</div>
        <div className={cx(s.name, s.small)}>{t.letterTitle}</div>
      </div>
    );
  } else if (goldSoon) {
    head = (
      <div key="gold">
        <div className={s.eyebrow}>{t.goldEyebrow}</div>
        <div className={cx(s.name, s.small, t.goldTitle.length > 24 && s.tiny)}>{t.goldTitle}</div>
      </div>
    );
  } else {
    head = (
      <div key="names">
        <div className={s.eyebrow}>{t.jarFor}</div>
        <div className={cx(s.name, name.length > 12 && s.small)}>{name}</div>
        {from ? <div className={s.from}>{fmt(t.from, { from })}</div> : null}
      </div>
    );
  }

  const cur = reading !== null ? items[reading] : null;
  const ctaLabel = view !== null ? t.close : n === 1 ? t.hangOnly : k === gold ? t.hangLast : k + 1 === gold ? t.hangOneLeft : t.hang;
  const ctaOn = view !== null || typed;
  const canReread = view === null && ((phase === 'open' && !auto) || (phase === 'letter' && !letterOut));

  /** satu penunjuk sentuh untuk langkah yang sedang aktif */
  const cue =
    finale || playing || reading !== null
      ? reading !== null && ctaOn
        ? { key: `cta${reading}`, target: ctaRef, kind: 'tap' as const, at: undefined, dir: undefined, delay: 3400 }
        : null
      : phase === 'corked'
        ? ready
          ? { key: 'cork', target: corkBtn, kind: 'drag' as const, at: { x: 0.5, y: 0.6 }, dir: { x: 0, y: -3 }, delay: 2200 }
          : null
        : phase === 'open' && !auto
          ? { key: `shake${k}`, target: jarBtn, kind: 'drag' as const, at: { x: 0.36, y: 0.5 }, dir: { x: 4, y: 0 }, delay: k === 0 ? 2200 : 3000 }
          : phase === 'out'
            ? goldOut
              ? { key: 'gold', target: goldEl, kind: 'hold' as const, at: { x: 0.5, y: 0.55 }, dir: undefined, delay: 2400 }
              : { key: `star${k}`, target: starEl, kind: 'tap' as const, at: undefined, dir: undefined, delay: 2400 }
            : phase === 'letter' && !letterOut
              ? { key: 'letter', target: letterBtn, kind: 'tap' as const, at: { x: 0.5, y: 0.8 }, dir: undefined, delay: 2600 }
              : null;

  return (
    <div ref={wrapRef} className={cx(s.wrap, ready && s.ready, awake && s.awake, playing && s.gaming)}>
      <div className={s.head}>{head}</div>

      {/* kunang-kunang kecil di udara senja */}
      <div className={s.flies} aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} />
        ))}
      </div>

      {/* untaian lampu: kertas yang sudah dibaca digantung di sini (sekaligus penghitungnya) */}
      <div className={s.lights} role="group" aria-label={fmt(t.count, { k, n })}>
        <Sprite name="toples-lampu" className={s.lightsArt} />
        {BULBS.map((b, i) => {
          const [x, y] = wire(b);
          return <i key={i} className={s.glow} style={{ left: `${(x / 780) * 100}%`, top: `${((y + 24) / 200) * 100}%`, '--d': `${((i * 0.43) % 1.9).toFixed(2)}s` } as CSSProperties} aria-hidden />;
        })}
        {items.map((_, i) => {
          const [x, y] = wire(SLOTS[slotOf(i, n)]);
          const hung = i < k;
          // kertas yang sudah digantung boleh dibaca lagi selagi toplesnya menunggu (dikocok, atau suratnya diambil)
          const tappable = hung && canReread;
          return (
            <button
              key={i}
              type="button"
              className={cx(s.hung, hung && s.hungOn, i === gold && s.hungGold)}
              style={{ left: `${(x / 780) * 100}%`, top: `${(y / 200) * 100}%`, '--d': `${((i * 0.61) % 2.2).toFixed(2)}s`, '--paper': paperOf(i) } as CSSProperties}
              disabled={!tappable}
              tabIndex={tappable ? 0 : -1}
              aria-hidden={!hung}
              aria-label={fmt(t.hungLabel, { i: i + 1 })}
              onClick={() => {
                sfx.tap();
                setView(i);
              }}
            >
              {/* secarik kertas yang sudah dibaca, dijepit bintang kecilnya; gantungan kosong = garis putus-putus */}
              {hung ? (
                <span className={s.flagIn}>
                  <span className={s.flag} />
                  <Sprite name={spriteOf(i)} className={s.flagStar} />
                </span>
              ) : (
                <span className={s.slot} />
              )}
            </button>
          );
        })}
      </div>

      {/* cahaya hangat di balik toples setelah semua bintang "bangun" */}
      <span className={s.jarGlow} aria-hidden />

      <div className={s.jar} role="group" aria-label={t.jar}>
        <div ref={jarIn} className={s.jarIn}>
          <Sprite name="toples-kaca-belakang" className={s.layer} />
          <span className={cx(s.letter, k >= n - 1 && s.letterPeek, phase === 'letter' && s.letterShow, letterOut && s.letterOut)} aria-hidden>
            <Sprite name="toples-surat" className={s.fill} />
          </span>

          {items.map((_, i) => {
            if (i < k) return null;
            const isCur = i === k && (phase === 'out' || phase === 'read');
            const [px, py, pr] = PILE[n - 1 - i];
            const vars = (isCur ? { '--x': HOVER.x, '--y': HOVER.y, '--r': '0deg', '--s': HOVER.s } : { '--x': px, '--y': py, '--r': `${pr}deg`, '--s': 1 }) as CSSProperties;
            const tappable = isCur && phase === 'out' && i !== gold;
            return (
              <button
                key={i}
                type="button"
                ref={isCur ? (el) => { starEl.current = el; } : undefined}
                className={cx(s.star, isCur && s.out, isCur && phase === 'read' && s.opened, i === gold && s.gold)}
                style={vars}
                disabled={!tappable}
                tabIndex={tappable ? 0 : -1}
                aria-hidden={!tappable}
                aria-label={fmt(t.starLabel, { i: i + 1, n })}
                onClick={openStar}
              >
                <span className={s.starIn} data-rattle={isCur ? undefined : ''}>
                  <Sprite name={spriteOf(i)} className={s.fill} />
                </span>
              </button>
            );
          })}

          <Sprite name="toples-kaca-depan" className={cx(s.layer, s.front)} />
          <span ref={corkEl} className={cx(s.cork, phase !== 'corked' && s.popped)} aria-hidden>
            <Sprite name="toples-gabus" className={s.fill} />
          </span>
          <span className={s.tag} aria-hidden>
            <Sprite name="bungkus-label" className={s.fill} />
            <span className={cx(s.tagText, tagSplit && s.tagTwo)} style={{ fontSize: `calc(var(--u) * ${tagSize})` }}>
              {tagSplit ? (
                <>
                  <small>{t.tagFor}</small>
                  {tagWord}
                </>
              ) : (
                tagLine
              )}
            </span>
          </span>
        </div>

        {phase === 'corked' ? (
          <button
            ref={corkBtn}
            type="button"
            className={s.corkHit}
            aria-label={t.corkLabel}
            onPointerDown={onCorkDown}
            onPointerMove={onCorkMove}
            onPointerUp={onCorkUp}
            onPointerCancel={onCorkUp}
            onClick={pop}
          />
        ) : null}
        {phase === 'open' ? (
          <button
            ref={jarBtn}
            type="button"
            className={s.jarHit}
            aria-label={t.shakeLabel}
            disabled={auto || view !== null}
            onPointerDown={onJarDown}
            onPointerMove={onJarMove}
            onPointerUp={(e) => onJarUp(e, false)}
            onPointerCancel={(e) => onJarUp(e, true)}
            // papan ketik & pembaca layar mengirim "klik" tanpa penunjuk (detail 0); ketukan jari sudah ditangani di atas
            onClick={(e) => {
              if (e.detail === 0) shake(1.5);
            }}
          />
        ) : null}
        {goldOut ? (
          <span ref={goldEl} className={s.goldSpot} onClick={onGoldTap}>
            <HoldButton ms={1300} onComplete={openStar} onProgress={onGoldHold} label={t.goldLabel} className={s.goldHold}>
              <span />
            </HoldButton>
          </span>
        ) : null}
        {phase === 'letter' ? <button ref={letterBtn} type="button" className={s.jarHit} aria-label={t.letterLabel} onClick={takeLetter} disabled={letterOut || view !== null} /> : null}
      </div>

      {/* lipatan bintang yang terbuka: secarik kertas panjang bertulisan tangan (+ foto kalau ada) */}
      {cur && reading !== null && !finale ? (
        <div
          key={`${view !== null ? 'v' : 'r'}${reading}`}
          className={s.read}
          role="dialog"
          aria-label={reading === gold ? t.special : fmt(t.starOf, { i: reading + 1, n })}
          onClick={(e) => {
            if (e.target === e.currentTarget && view !== null) setView(null);
          }}
        >
          {cur.photo ? (
            <span className={s.snap}>
              <Sprite name="toples-selotip" className={s.tape} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cur.photo} alt={fmt(t.photoAlt, { i: reading + 1 })} draggable={false} />
            </span>
          ) : null}
          <div className={s.stripWrap}>
            <div className={cx(s.strip, reading === gold && s.stripGold)} style={{ '--paper': paperOf(reading) } as CSSProperties} onClick={() => setTyped(true)}>
              <span className={s.stripLabel}>
                <Sprite name={spriteOf(reading)} className={s.stripStar} />
                {reading === gold ? t.special : fmt(t.starOf, { i: reading + 1, n })}
              </span>
              <p className={cx(s.note, cur.note.length > 54 && s.noteLong)} aria-live="polite">
                {ctaOn ? cur.note : <Typewriter text={cur.note} speed={30} onDone={() => setTyped(true)} />}
              </p>
            </div>
          </div>
          <button ref={ctaRef} type="button" className={cx(s.cta, ctaOn && s.ctaOn)} tabIndex={ctaOn ? 0 : -1} onClick={view !== null ? () => setView(null) : hang}>
            {ctaLabel} {view === null ? <span aria-hidden>→</span> : null}
          </button>
        </div>
      ) : null}

      {!finale && !playing ? (
        <div className={s.foot}>
          {phase === 'letter' && !letterOut ? (
            <button type="button" className={cx(s.cta, s.ctaOn)} onClick={takeLetter}>
              {t.takeLetter} <span aria-hidden>→</span>
            </button>
          ) : null}
        </div>
      ) : null}

      {phase === 'corked' && ready ? (
        <Hint key="hCork">
          {t.hintCork}
          <span className={s.or}> · {t.orTap}</span>
        </Hint>
      ) : null}
      {phase === 'open' && !auto && view === null ? (
        <Hint key={`hShake${k}`}>
          {k === 0 ? t.hintShake : fmt(t.hintShakeMore, { n: n - k })}
          {k === 0 ? <span className={s.or}> · {t.orTap}</span> : null}
        </Hint>
      ) : null}
      {phase === 'out' && !goldOut ? <Hint key={`hStar${k}`}>{t.hintStar}</Hint> : null}
      {goldOut ? (
        <Hint key={again ? 'hGoldAgain' : alt ? 'hGoldAlt' : 'hGold'}>
          {again ? t.goldAgain : alt ? t.hintGoldAlt : t.hintGold}
          {alt && !again ? <span className={s.or}> · {t.orTap}</span> : null}
        </Hint>
      ) : null}

      {cue ? <TapCue key={`cue-${cue.key}`} target={cue.target} kind={cue.kind} at={cue.at} dir={cue.dir} delay={cue.delay} /> : null}

      <Confetti burst={burst} colors={['#ffb8c9', '#ffeda0', '#b9e8d0', '#bddbf9', '#ffd3a2', '#ffffff']} origin={{ x: 0.5, y: 0.34 }} count={110} />
      <Confetti burst={spark} colors={['#ffdb72', '#fff8d6', '#f0b434', '#ffffff']} origin={{ x: 0.5, y: 0.46 }} count={46} />

      {playing ? <SleepyStars t={t.game} onDone={gameDone} /> : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-lila"
          theme={{ backdrop: BACKDROP, ink: meta.palette.ink, paper: '#fffaf0', paperInk: '#3b2a44' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
