'use client';

import { type CSSProperties, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Petals, Sprite, Stage, TapCue, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { PopcornGame } from './Game';
import { TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BACKDROP = '/art/bg-bioskop.webp';
const ART = [
  'bg-bioskop',
  'bioskop-marquee',
  'bioskop-tirai',
  'bioskop-lambrekin',
  'bioskop-tali',
  'bioskop-tiket',
  'bioskop-tiket-sobek',
  'bioskop-kursi',
  'bioskop-penonton-a',
  'bioskop-penonton-b',
  'bunga-kamboja',
  'bunga-kamboja-pink',
  'daun-2',
  'daun-4',
];

/**
 * ticket → tiket bioskop untuk berdua disobek di garis perforasinya
 * front  → depan teater: papan nama berlampu, tirai tertutup; tali ditarik (atau tirai diketuk) untuk membukanya
 * leader → hitung mundur 3-2-1 di layar
 * title  → kartu judul film
 * scene  → tiap foto jadi satu adegan dengan teks di bawahnya; layar diketuk untuk adegan berikutnya.
 *          Adegan terakhir istimewa: bingkai emas, kelopak berjatuhan, dan dua penonton saling bersandar
 * break  → jeda: mini-game popcorn
 * end    → "Tamat", lalu kredit bergulir
 * post   → kartu "adegan setelah kredit" → surat
 */
type Phase = 'ticket' | 'front' | 'leader' | 'title' | 'scene' | 'break' | 'end' | 'post';

/** titik lampu di bingkai papan nama, dalam satuan lukisan 680×280 (sama dengan bulbSpots di art/sprites/57-bioskop.js) */
const BULBS: [number, number][] = [];
for (let i = 0; i < 13; i++) BULBS.push([62 + i * 46.33, 64]);
for (let i = 1; i <= 3; i++) BULBS.push([642, 64 + i * 41]);
for (let i = 12; i >= 0; i--) BULBS.push([62 + i * 46.33, 228]);
for (let i = 3; i >= 1; i--) BULBS.push([38, 64 + i * 41]);

type Drag = { id: number; x0: number; y0: number; size: number; moved: boolean };

/** Hiasan emas kartu teks: kamboja kecil diapit dua sulur. Vektor (bukan lukisan) supaya tetap tajam sekecil apa pun. */
function Ornament({ className }: { className?: string }) {
  return (
    <svg className={cx(s.orn, className)} viewBox="0 0 200 36" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M80,19H34c-9,0 -13,-4 -13,-9c0,-4 3,-6 6,-6c3,0 5,2 5,4.5" />
        <path d="M120,19h46c9,0 13,-4 13,-9c0,-4 -3,-6 -6,-6c-3,0 -5,2 -5,4.5" />
        <path d="M74,25H46M126,25h28" opacity="0.55" />
      </g>
      <g transform="translate(100 20)" fill="currentColor">
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} d="M0,0C5.2,-4.5 5.6,-11.2 0,-13.8C-5.6,-11.2 -5.2,-4.5 0,0Z" transform={`rotate(${a})`} />
        ))}
      </g>
      <circle cx="100" cy="20" r="2.3" fill="#2a1a14" />
    </svg>
  );
}

export default function Bioskop(props: TemplateProps) {
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
  const names = from ? `${to} & ${from}` : to;

  /** adegan: foto ke-i berpasangan dengan teks ke-i; yang kosong dua-duanya dilewati */
  const scenes = useMemo(() => {
    const out: { note: string; photo: string | null }[] = [];
    const n = Math.min(6, Math.max(data.notes.length, data.photos.length));
    for (let i = 0; i < n; i++) {
      const note = (data.notes[i] ?? '').trim();
      const photo = data.photos[i] || null;
      if (note || photo) out.push({ note, photo });
    }
    // belum ada foto maupun teks: filmnya tetap punya satu adegan
    if (!out.length) out.push({ note: t.emptyScene, photo: null });
    return out;
  }, [data.notes, data.photos, t.emptyScene]);

  const [phase, setPhase] = useState<Phase>('ticket');
  const [torn, setTorn] = useState(false);
  /** seberapa jauh sobekan tiket sedang ditarik (0..1) */
  const [pull, setPull] = useState(0);
  const [open, setOpen] = useState(false);
  /** seberapa jauh tali tirai sedang ditarik (0..1) */
  const [rope, setRope] = useState(0);
  const [count, setCount] = useState(3);
  const [idx, setIdx] = useState(0);
  const [cut, setCut] = useState(false);
  const [rolling, setRolling] = useState(false);
  /** mini-game popcorn di tengah film: off → main → selesai */
  const [game, setGame] = useState<'off' | 'on' | 'done'>('off');
  const [finale, setFinale] = useState(false);
  const [burst, setBurst] = useState(0);

  const stubRef = useRef<HTMLButtonElement>(null);
  const ropeRef = useRef<HTMLButtonElement>(null);
  const hitRef = useRef<HTMLButtonElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<Drag | null>(null);
  const began = useRef(false);
  const posted = useRef(false);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // foto adegan disiapkan selagi tiket & tirai dibuka
  useEffect(() => {
    scenes.forEach((sc) => {
      if (!sc.photo) return;
      const img = new Image();
      img.src = sc.photo;
    });
  }, [scenes]);

  // fokus mengikuti langkah yang aktif (pengguna papan ketik / pembaca layar)
  useEffect(() => {
    if (mode === 'preview') return;
    const el = phase === 'post' ? ctaRef : phase === 'title' || phase === 'scene' ? hitRef : null;
    if (!el) return;
    const id = setTimeout(() => el.current?.focus({ preventScroll: true }), 500);
    return () => clearTimeout(id);
  }, [phase, mode]);

  /* ── 1. tiket ── */
  const tear = () => {
    if (torn || phase !== 'ticket') return;
    setTorn(true);
    setPull(0);
    sfx.crack();
    haptic(20);
    later(() => sfx.whoosh(), 220);
    later(() => setPhase('front'), reduce.current ? 150 : 1150);
  };

  /* ── 2. tirai ── */
  const startLeader = () => {
    const step = reduce.current ? 380 : 880;
    setPhase('leader');
    setCount(3);
    sfx.tap();
    later(() => {
      setCount(2);
      sfx.tap();
    }, step);
    later(() => {
      setCount(1);
      sfx.tap();
    }, step * 2);
    later(() => {
      setPhase('title');
      sfx.chime();
    }, step * 3);
  };
  const openCurtain = () => {
    if (open || phase !== 'front') return;
    setOpen(true);
    setRope(0);
    sfx.whoosh();
    haptic(22);
    later(() => sfx.rustle(), 260);
    later(startLeader, reduce.current ? 250 : 1900);
  };

  /** seret ke bawah (sobekan tiket, tali tirai); ketukan biasa juga dihitung */
  const onDown = (e: ReactPointerEvent<HTMLButtonElement>, axis: 'x' | 'y') => {
    if (e.button > 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, size: (axis === 'x' ? r.width : r.height) || 1, moved: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const onMove = (e: ReactPointerEvent<HTMLButtonElement>, axis: 'x' | 'y', set: (p: number) => void, fire: () => void) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dist = Math.max(0, axis === 'x' ? e.clientX - d.x0 : e.clientY - d.y0);
    if (dist > 6) d.moved = true;
    const p = Math.min(1, dist / (d.size * (axis === 'x' ? 0.7 : 0.26)));
    set(p);
    if (p >= 1) {
      drag.current = null;
      fire();
    }
  };
  const onUp = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean, p: number, set: (p: number) => void, fire: () => void) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    set(0);
    if (cancelled) return;
    if (!d.moved || p > 0.45) fire();
  };

  /* ── 3. film ── */
  const toBreak = () => {
    setPhase('break');
    sfx.pop();
    later(() => setGame('on'), reduce.current ? 120 : 950);
  };
  const beginFilm = () => {
    if (began.current) return;
    began.current = true;
    sfx.tap();
    haptic(10);
    setIdx(0);
    setPhase('scene');
    if (scenes.length === 1) later(() => sfx.chime(), 500);
  };
  // kartu judul lanjut sendiri setelah sempat terbaca
  useEffect(() => {
    if (phase !== 'title') return;
    const id = setTimeout(beginFilm, reduce.current ? 3200 : 6000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const nextScene = () => {
    if (cut || phase !== 'scene') return;
    haptic(10);
    sfx.tap();
    if (idx + 1 >= scenes.length) return toBreak();
    // adegan penutup disambut denting kecil
    if (idx + 2 === scenes.length) {
      later(() => sfx.chime(), reduce.current ? 120 : 520);
      haptic(18);
    }
    if (reduce.current) {
      setIdx(idx + 1);
      return;
    }
    // potongan film: layar meredup sekejap, lalu adegan berikutnya
    setCut(true);
    later(() => {
      setIdx((v) => v + 1);
      setCut(false);
    }, 170);
  };

  /* ── 4. tamat, kredit, pesan setelah kredit ── */
  const credits = t.credits.filter(([, who]) => from || !who.includes('{from}')).map(([role, who]) => [role, fmt(who, { to, from })] as const);
  const rollMs = 8200 + credits.length * 700;
  const toPost = () => {
    if (posted.current) return;
    posted.current = true;
    setPhase('post');
    sfx.chime();
    haptic(14);
  };
  const gameDone = () => {
    setGame('done');
    setPhase('end');
    sfx.success();
    haptic(24);
    setBurst((v) => v + 1);
    later(() => setRolling(true), reduce.current ? 900 : 2400);
  };
  useEffect(() => {
    if (!rolling) return;
    const id = setTimeout(toPost, reduce.current ? 5200 : rollMs + 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolling]);

  const read = () => {
    if (finale) return;
    sfx.chime();
    haptic(15);
    setFinale(true);
  };

  /* ── tampilan ── */
  const lit = phase !== 'ticket' && phase !== 'front';
  const playing = game === 'on';
  const sc = phase === 'scene' ? scenes[idx] : null;
  /** adegan penutup (juga kalau filmnya cuma satu adegan): bingkai emas, kelopak, penonton bersandar */
  const lastScene = phase === 'scene' && idx === scenes.length - 1;
  /** dua penonton saling bersandar sejak adegan penutup sampai lampu menyala */
  const cozy = lastScene || phase === 'break' || phase === 'end' || phase === 'post';
  const hitFor = phase === 'title' ? beginFilm : phase === 'scene' ? nextScene : phase === 'end' && rolling ? toPost : null;
  const hitLabel = phase === 'title' ? t.startLabel : phase === 'scene' ? t.nextLabel : t.skipCredits;

  let screen;
  if (phase === 'leader') {
    screen = (
      <div key="leader" className={s.leader}>
        <span className={s.cross} aria-hidden />
        <span className={s.ring} aria-hidden>
          <span key={count} className={s.sweep} />
        </span>
        <b key={`n${count}`} className={s.count}>
          {count}
        </b>
      </div>
    );
  } else if (phase === 'title') {
    screen = (
      <div key="title" className={s.card}>
        <span className={s.cardFrame} aria-hidden />
        <Ornament />
        <span className={s.cardSmall}>{from ? fmt(t.presentsFrom, { from }) : t.presents}</span>
        <b className={cx(s.cardTitle, title.length > 18 && s.long, title.length > 30 && s.xl)}>{title}</b>
        <span className={s.cardRule} aria-hidden />
        <span className={s.cardSmall}>{from ? t.aFilmAbout : t.aFilmFor}</span>
        <em className={cx(s.cardNames, names.length > 22 && s.long)}>{names}</em>
        <span className={s.cardBegin}>{t.begin}</span>
      </div>
    );
  } else if (sc) {
    screen = (
      <div key={`s${idx}`} className={cx(s.film, cut && s.cutting, lastScene && s.finalScene)}>
        <span className={s.holes} aria-hidden />
        <span className={cx(s.holes, s.holesR)} aria-hidden />
        {sc.photo ? (
          <div className={s.shot}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sc.photo} alt={fmt(t.sceneAlt, { i: idx + 1 })} draggable={false} className={s.photo} />
            {sc.note ? <p className={cx(s.sub, sc.note.length > 42 && s.subLong)}>{sc.note}</p> : null}
            {lastScene ? <span className={s.leak} aria-hidden /> : null}
          </div>
        ) : (
          // adegan tanpa foto: kartu teks ala film bisu
          <div className={cx(s.shot, s.inter)}>
            <span className={s.interFrame} aria-hidden />
            <Ornament className={s.interOrn} />
            <p className={cx(s.interText, sc.note.length > 34 && s.long)}>{sc.note}</p>
            <Sprite name={idx % 2 ? 'bunga-kamboja' : 'bunga-kamboja-pink'} className={s.interArt} />
          </div>
        )}
        <span className={cx(s.slate, lastScene && s.slateLast)}>{lastScene && scenes.length > 1 ? t.lastScene : fmt(t.sceneOf, { i: idx + 1, n: scenes.length })}</span>
      </div>
    );
  } else if (phase === 'break') {
    screen = (
      <div key="break" className={cx(s.card, playing && s.cardDim)}>
        <span className={s.cardFrame} aria-hidden />
        <b className={s.cardTitle}>{t.breakTitle}</b>
        <span className={s.cardRule} aria-hidden />
        <em className={s.cardNames}>{t.breakSub}</em>
      </div>
    );
  } else if (phase === 'end') {
    screen = rolling ? (
      <div key="roll" className={cx(s.card, s.rollCard)}>
        <div className={s.roll} style={{ '--dur': `${rollMs}ms` } as CSSProperties}>
          <div className={s.rollIn}>
            <b className={s.rollTitle}>{title}</b>
            {credits.map(([role, who], i) => (
              <p key={i} className={s.credit}>
                <span>{role}</span>
                <b>{who}</b>
              </p>
            ))}
            <p className={s.creditNote}>{t.creditsNote}</p>
            <p className={s.creditNote}>{t.creditsSequel}</p>
          </div>
        </div>
      </div>
    ) : (
      <div key="end" className={s.card}>
        <span className={s.cardFrame} aria-hidden />
        <Ornament />
        <b className={cx(s.cardTitle, s.endTitle)}>{t.theEnd}</b>
        <span className={s.cardRule} aria-hidden />
        <em className={s.cardNames}>{t.endSub}</em>
      </div>
    );
  } else if (phase === 'post') {
    screen = (
      <div key="post" className={s.card}>
        <span className={s.cardFrame} aria-hidden />
        <span className={s.cardSmall}>{t.postEyebrow}</span>
        <span className={s.cardRule} aria-hidden />
        <p className={s.postLine}>{t.postLine}</p>
      </div>
    );
  }

  return (
    <div className={cx(s.wrap, ready && s.ready, phase === 'ticket' && !torn && s.pre, open && s.isOpen, lit && s.isLit, cozy && s.cozy, finale && s.over)}>
      <div className={s.theatre}>
        <div className={cx(s.screen, lit && s.lit)} aria-live="polite">
          {screen}
          {lit ? (
            <>
              <span className={s.grain} aria-hidden />
              <span className={s.flicker} aria-hidden />
            </>
          ) : null}
        </div>
        {/* cahaya layar yang tumpah ke tirai dan kursi */}
        <span className={s.spill} aria-hidden />
        {hitFor && !playing && !finale ? <button ref={hitRef} type="button" className={s.screenHit} onClick={hitFor} aria-label={hitLabel} /> : null}

        <div className={cx(s.curtain, s.curtainL)} aria-hidden>
          <Sprite name="bioskop-tirai" className={s.curtainArt} />
        </div>
        <div className={cx(s.curtain, s.curtainR)} aria-hidden>
          <Sprite name="bioskop-tirai" className={s.curtainArt} />
        </div>
        {phase === 'ticket' || phase === 'front' ? <span className={s.spot} aria-hidden /> : null}
        {/* tirainya sendiri juga boleh diketuk (tombol yang terbaca pembaca layar tetap talinya) */}
        {phase === 'front' && !open ? <div className={s.curtainHit} onClick={openCurtain} aria-hidden /> : null}
        <Sprite name="bioskop-lambrekin" className={s.valance} />

        <div className={s.marquee}>
          <Sprite name="bioskop-marquee" className={s.marqueeArt} />
          {BULBS.map(([x, y], i) => (
            <i key={i} className={s.bulb} style={{ left: `${(x / 680) * 100}%`, top: `${(y / 280) * 100}%`, '--i': i } as CSSProperties} aria-hidden />
          ))}
          <div className={s.marqueeText}>
            <span className={s.mqSmall}>{t.nowShowing}</span>
            <b className={cx(s.mqTitle, title.length > 17 && s.long, title.length > 26 && s.xl)}>{title}</b>
            {/* dua nama panjang: cukup namanya saja supaya tidak terpotong */}
            <span className={cx(s.mqSmall, s.mqNames, names.length > 24 && s.long)}>{names.length > 30 ? names : fmt(t.starring, { names })}</span>
          </div>
          {/* rangkaian kamboja di sudut papan nama */}
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
        </div>

        <button
          ref={ropeRef}
          type="button"
          className={cx(s.rope, open && s.ropeDone)}
          style={{ '--rp': rope } as CSSProperties}
          disabled={open || phase !== 'front'}
          tabIndex={phase === 'front' && !open ? 0 : -1}
          aria-label={t.ropeLabel}
          aria-hidden={phase !== 'front'}
          onPointerDown={(e) => onDown(e, 'y')}
          onPointerMove={(e) => onMove(e, 'y', setRope, openCurtain)}
          onPointerUp={(e) => onUp(e, false, rope, setRope, openCurtain)}
          onPointerCancel={(e) => onUp(e, true, rope, setRope, openCurtain)}
          onClick={(e) => {
            // ketukan dari papan ketik (klik dari pointer sudah ditangani di atas)
            if (e.detail === 0) openCurtain();
          }}
        >
          <Sprite name="bioskop-tali" className={s.ropeArt} />
        </button>

        {/* dua penonton di deret depan; di adegan penutup mereka saling bersandar */}
        <div className={s.viewers} aria-hidden>
          <Sprite name="bioskop-penonton-a" className={cx(s.viewer, s.viewerA)} />
          <Sprite name="bioskop-penonton-b" className={cx(s.viewer, s.viewerB)} />
          {cozy && phase !== 'break' ? (
            <svg className={s.heart} viewBox="0 0 24 22">
              <path d="M12,21C-3,10 3,-2 12,5.5C21,-2 27,10 12,21Z" />
            </svg>
          ) : null}
        </div>
        <Sprite name="bioskop-kursi" className={s.seats} />
        {lastScene || (phase === 'break' && !playing) ? (
          <div className={s.petalsBox} aria-hidden>
            <Petals kinds={['putih', 'pink']} count={8} />
          </div>
        ) : null}
      </div>

      {/* tiket: tampil paling depan sampai disobek */}
      {phase === 'ticket' ? (
        <div className={cx(s.ticketLayer, torn && s.torn)}>
          <span className={cx(s.sprig, s.sprigA)} aria-hidden>
            <Sprite name="daun-2" className={s.csLeaf1} />
            <Sprite name="daun-4" className={s.csLeaf2} />
            <Sprite name="bunga-kamboja-pink" className={s.csFlower} />
          </span>
          <span className={cx(s.sprig, s.sprigB)} aria-hidden>
            <Sprite name="daun-4" className={s.csLeaf1} />
            <Sprite name="daun-2" className={s.csLeaf2} />
            <Sprite name="bunga-kamboja" className={s.csFlower} />
          </span>
          <p className={s.tkEyebrow}>{t.ticketEyebrow}</p>
          <div className={s.ticket}>
            <div className={s.tkMain}>
              <Sprite name="bioskop-tiket" className={s.tkArt} />
              <div className={s.tkBand}>
                <b>{t.ticketKind}</b>
                <span>{t.ticketNo}</span>
              </div>
              <div className={s.tkBody}>
                <span className={s.tkLabel}>{t.nowShowing}</span>
                <b className={cx(s.tkTitle, title.length > 16 && s.long, title.length > 28 && s.xl)}>{title}</b>
                <span className={s.tkRule} aria-hidden />
                <span className={s.tkLabel}>{t.cast}</span>
                <em className={cx(s.tkNames, names.length > 16 && s.long, names.length > 26 && s.xl)}>{names}</em>
                <div className={s.tkRow}>
                  <div>
                    <span>{t.seat}</span>
                    <b>{t.seatV}</b>
                  </div>
                  <div>
                    <span>{t.time}</span>
                    <b>{t.timeV}</b>
                  </div>
                  <div>
                    <span>{t.price}</span>
                    <b>{t.priceV}</b>
                  </div>
                </div>
              </div>
            </div>
            <button
              ref={stubRef}
              type="button"
              className={s.tkStub}
              style={{ '--pull': pull } as CSSProperties}
              disabled={torn}
              aria-label={t.tearLabel}
              onPointerDown={(e) => onDown(e, 'y')}
              onPointerMove={(e) => onMove(e, 'y', setPull, tear)}
              onPointerUp={(e) => onUp(e, false, pull, setPull, tear)}
              onPointerCancel={(e) => onUp(e, true, pull, setPull, tear)}
              onClick={(e) => {
                if (e.detail === 0) tear();
              }}
            >
              <Sprite name="bioskop-tiket-sobek" className={s.tkArt} />
              <span className={s.stubTear}>{t.tearHere}</span>
              <span className={s.stubMedal}>
                <b>2</b>
                <i>{t.admitUnit}</i>
              </span>
              <span className={s.stubSide}>
                <span>{t.admit}</span>
                <em className={cx(names.length > 16 && s.long, names.length > 26 && s.xl)}>{names}</em>
              </span>
            </button>
          </div>
          <p className={s.tkSub}>{t.ticketSub}</p>
        </div>
      ) : null}

      {!finale && !playing ? (
        <div className={s.foot}>
          {phase === 'post' ? (
            <button ref={ctaRef} type="button" className={s.cta} onClick={read}>
              {t.read} <span aria-hidden>→</span>
            </button>
          ) : null}
          {phase === 'end' && rolling ? (
            <button type="button" className={s.skip} onClick={toPost}>
              {t.skipCredits}
            </button>
          ) : null}
        </div>
      ) : null}

      {phase === 'ticket' && ready && !torn ? <Hint key="hTear">{t.hintTear}</Hint> : null}
      {phase === 'front' && !open ? <Hint key="hRope">{t.hintRope}</Hint> : null}
      {phase === 'scene' && idx === 0 ? <Hint key="hNext">{scenes.length > 1 ? t.hintNext : t.hintGo}</Hint> : null}

      {finale || playing ? null : phase === 'ticket' ? (
        ready && !torn ? <TapCue key="cueTear" target={stubRef} kind="drag" dir={{ x: 0.4, y: 3 }} at={{ x: 0.62, y: 0.45 }} delay={2200} /> : null
      ) : phase === 'front' ? (
        !open ? <TapCue key="cueRope" target={ropeRef} kind="drag" dir={{ x: 0, y: 3 }} at={{ x: 0.46, y: 0.8 }} delay={2200} /> : null
      ) : phase === 'title' ? (
        <TapCue key="cueTitle" target={hitRef} at={{ x: 0.5, y: 0.82 }} delay={2600} />
      ) : phase === 'scene' ? (
        <TapCue key={`cueScene${idx}`} target={hitRef} at={{ x: 0.78, y: 0.5 }} delay={idx === 0 ? 2800 : 4200} />
      ) : phase === 'post' ? (
        <TapCue key="cueRead" target={ctaRef} delay={3200} />
      ) : null}

      <Confetti burst={burst} count={90} origin={{ x: 0.5, y: 0.42 }} colors={['#f2b84b', '#fff3da', '#c5304a', '#ffd98a', '#f29aa5']} />

      {playing ? <PopcornGame t={t.game} onDone={gameDone} /> : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja-pink"
          theme={{ backdrop: BACKDROP, ink: '#fbeed6', paper: '#fffaf0', paperInk: '#3b2a22' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
