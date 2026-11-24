'use client';

import { type CSSProperties, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Confetti, Finale, Hint, Sprite, Stage, TapCue, Typewriter, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { DustGame } from './Game';
import { TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BACKDROP = '/art/bg-vinyl.webp';
const ART = ['bg-vinyl', 'vinyl-sampul', 'vinyl-stiker', 'vinyl-meja', 'vinyl-lengan', 'vinyl-label-a'];

/**
 * sleeve  → sampul album; piringannya ditarik keluar (geser ke kanan, atau ketuk)
 * pulling → piringan meluncur keluar dari sampul
 * landing → sampul mengecil ke pojok, pemutar naik, piringan mendarat di atasnya
 * deck    → jarum menunggu digeser ke piringan (atau diketuk)
 * drop    → lengan berayun ke alur pertama, piringan mulai berputar
 * play    → sisi A: tiap catatan = satu lagu; lengan bergeser ke dalam tiap ganti lagu
 * dust    → mini-game: gumpalan debu nangkring di piringan
 * flip    → piringan dibalik
 * sideB   → sisi B berputar; catatan sampul (surat) dibuka → Finale
 */
type Phase = 'sleeve' | 'pulling' | 'landing' | 'deck' | 'drop' | 'play' | 'dust' | 'flip' | 'sideB';

/* Geometri pemutar dalam satuan lukisan vinyl-meja (lihat art/sprites/55-vinyl.js):
   poros lengan, pusat piringan, panjang lengan sampai ujung jarum, dan sudut tekuk kepala jarum. */
const PIV = { x: 560, y: 136 };
const CEN = { x: 270, y: 266 };
const ARM_L = 333;
const STYLUS_OFF = 3.65;
const PIV_DIST = Math.hypot(PIV.x - CEN.x, PIV.y - CEN.y);
/** arah poros → pusat piringan, diukur dari "lurus ke bawah" searah jarum jam */
const PIV_DIR = (Math.atan2(PIV.x - CEN.x, CEN.y - PIV.y) * 180) / Math.PI;
/** sudut putar lengan supaya jarumnya berada di jari-jari r dari pusat piringan */
const armAngle = (r: number) => PIV_DIR - STYLUS_OFF - (Math.acos((ARM_L * ARM_L + PIV_DIST * PIV_DIST - r * r) / (2 * ARM_L * PIV_DIST)) * 180) / Math.PI;
/** alur terluar & terdalam yang berisi lagu (jari-jari piringan 206) */
const R_OUT = 198;
const R_IN = 82;

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Vinyl(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BACKDROP}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

/** Not balok kecil yang melayang dari piringan selama lagu diputar (bentuk SVG, tidak bergantung huruf). */
function Note({ double }: { double?: boolean }) {
  return (
    <svg viewBox="0 0 24 28" aria-hidden>
      {double ? (
        <path d="M8 5.2 21 2.6v15.6a3.9 3.1 0 1 1-2.2-2.8V7.9L10.2 9.6v11.6A3.9 3.1 0 1 1 8 18.4Z" />
      ) : (
        <path d="M11 2.6c1.4 3.6 6.6 4 6.6 9.4 0 1.5-.5 2.8-1.2 3.8.2-3.2-2-4.9-3.2-5.4v10.8A3.9 3.1 0 1 1 11 18.4Z" />
      )}
    </svg>
  );
}

/** Piringan hitam: alur-alur halus, jeda antar lagu sebanyak jumlah lagunya, dan label lukisan di tengah. */
function Disc({ n, side, label }: { n: number; side: 'a' | 'b'; label: string }) {
  const grooves: number[] = [];
  for (let r = 78; r <= 201; r += 3.1) grooves.push(r);
  const gaps = Array.from({ length: Math.max(0, n - 1) }, (_, j) => R_OUT - ((j + 1) * (R_OUT - R_IN)) / n);
  return (
    <svg className={s.discSvg} viewBox="-206 -206 412 412" aria-hidden>
      <circle r="206" fill="#0f0d0c" />
      <circle r="204.4" fill="none" stroke="#4a4440" strokeWidth="1.1" />
      {grooves.map((r, i) => (
        <circle key={r} r={r} fill="none" stroke="#fff" strokeOpacity={i % 3 ? 0.05 : 0.085} strokeWidth="0.8" />
      ))}
      {gaps.map((r) => (
        <g key={r}>
          <circle r={r} fill="none" stroke="#050404" strokeWidth="3" />
          <circle r={r + 1.4} fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="0.8" />
        </g>
      ))}
      <circle r="74" fill="#0a0908" />
      <image href={`/art/vinyl-label-${side}.webp`} x="-68" y="-68" width="136" height="136" />
      <text className={s.lblTop} y="-33" textAnchor="middle">
        {label}
      </text>
      <text className={s.lblBottom} y="45" textAnchor="middle">
        33⅓
      </text>
    </svg>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const locale = useLocale();
  const t = TEXT[locale];
  const later = useTimers();
  const ready = useArtReady(ART);

  const to = data.to.trim() || t.you;
  const from = data.from.trim();
  const title = data.title.trim() || t.titleFallback;
  const artist = from ? `${to} & ${from}` : to;

  /** lagu-lagu sisi A: tiap catatan berpasangan dengan fotonya sendiri sebelum yang kosong dibuang */
  const tracks = useMemo(() => {
    const list = data.notes
      .map((note, i) => ({ note: note.trim(), photo: data.photos[i] || null }))
      .filter((x) => x.note)
      .slice(0, 6);
    return list.length ? list : t.fallback.map((note) => ({ note, photo: null as string | null }));
  }, [data.notes, data.photos, t.fallback]);
  const n = tracks.length;
  const cover = data.photos.find(Boolean) ?? null;

  const [phase, setPhase] = useState<Phase>('sleeve');
  /** seberapa jauh piringan sedang ditarik (0..1) */
  const [pull, setPull] = useState(0);
  const [k, setK] = useState(0);
  /** sudut lengan selama diseret jari; null = mengikuti fase */
  const [armDrag, setArmDrag] = useState<number | null>(null);
  const [typed, setTyped] = useState(false);
  const [finale, setFinale] = useState(false);
  /** semburan hati kecil saat lagu penutup mulai */
  const [burst, setBurst] = useState(0);

  const drag = useRef<{ id: number; x0: number; w: number; moved: boolean } | null>(null);
  const aDrag = useRef<{ id: number; x0: number; y0: number; moved: boolean } | null>(null);
  const pullRef = useRef<HTMLButtonElement>(null);
  const armHitRef = useRef<HTMLButtonElement>(null);
  const armBox = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const deckView = phase !== 'sleeve' && phase !== 'pulling';
  const playing = phase === 'play';
  const cur = tracks[Math.min(k, n - 1)];
  const isLast = k === n - 1;

  // lukisan & foto untuk langkah berikutnya disiapkan lebih dulu
  useEffect(() => {
    if (phase !== 'landing') return;
    ['/art/vinyl-label-b.webp', '/art/game-vinyl-debu.webp', ...tracks.map((x) => x.photo)].forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
  }, [phase, tracks]);

  // fokus mengikuti tombol lanjut (pengguna papan ketik / pembaca layar)
  useEffect(() => {
    if (mode === 'preview') return;
    if (phase === 'play' || phase === 'sideB') {
      const id = setTimeout(() => ctaRef.current?.focus({ preventScroll: true }), 700);
      return () => clearTimeout(id);
    }
    if (phase === 'deck') armHitRef.current?.focus({ preventScroll: true });
  }, [phase, mode]);

  /* ── 1. tarik piringan dari sampul ── */
  const pullOut = () => {
    if (phase !== 'sleeve') return;
    const quick = reduced();
    sfx.whoosh();
    haptic(14);
    setPhase('pulling');
    later(() => {
      setPull(0);
      setPhase('landing');
      sfx.rustle();
    }, quick ? 80 : 620);
    later(() => {
      setPhase('deck');
      sfx.pop();
      haptic(10);
    }, quick ? 220 : 1750);
  };
  const onPullDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (phase !== 'sleeve' || e.button > 0) return;
    drag.current = { id: e.pointerId, x0: e.clientX, w: e.currentTarget.getBoundingClientRect().width || 1, moved: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const onPullMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    if (Math.abs(dx) > 6) d.moved = true;
    setPull(Math.max(0, Math.min(1, dx / (d.w * 0.42))));
  };
  const onPullUp = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (cancelled) return setPull(0);
    // ketukan biasa, atau tarikan yang cukup jauh
    if (!d.moved || pull > 0.4) pullOut();
    else setPull(0);
  };

  /* ── 2. turunkan jarum ── */
  const drop = () => {
    if (phase !== 'deck') return;
    setArmDrag(null);
    setPhase('drop');
    sfx.tap();
    haptic(12);
    later(() => {
      setK(0);
      setTyped(false);
      setPhase('play');
      sfx.crack();
      sfx.note(0);
      haptic(18);
    }, reduced() ? 120 : 1050);
  };
  /** sudut lengan (0 = di sandaran) dari posisi jari relatif terhadap porosnya */
  const pointerAngle = (e: ReactPointerEvent) => {
    const r = armBox.current?.getBoundingClientRect();
    if (!r || !r.width) return 0;
    const u = r.width / 180;
    const deg = (Math.atan2(-(e.clientX - (r.left + 90 * u)), e.clientY - (r.top + 100 * u)) * 180) / Math.PI - STYLUS_OFF;
    return Math.max(0, Math.min(armAngle(R_OUT), deg));
  };
  const onArmDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (phase !== 'deck' || e.button > 0) return;
    aDrag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const onArmMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = aDrag.current;
    if (!d || d.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 6) d.moved = true;
    if (d.moved) setArmDrag(pointerAngle(e));
  };
  const onArmUp = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const d = aDrag.current;
    if (!d || d.id !== e.pointerId) return;
    aDrag.current = null;
    if (cancelled) return setArmDrag(null);
    // ketukan biasa, atau lengan sudah diseret cukup dekat ke piringan
    if (!d.moved || (armDrag ?? 0) > armAngle(R_OUT) * 0.45) drop();
    else setArmDrag(null);
  };

  /* ── 3. lagu demi lagu, lalu sisi B ── */
  const next = () => {
    if (phase !== 'play') return;
    if (k + 1 < n) {
      setK(k + 1);
      setTyped(false);
      sfx.tap();
      sfx.note(k + 1);
      haptic(10);
      if (k + 2 === n) {
        // lagu penutup: denting + hati-hati kecil dari piringan
        later(() => {
          sfx.chime();
          setBurst((b) => b + 1);
        }, 320);
      }
      return;
    }
    // sisi A habis: ternyata ada debu di piringannya
    sfx.pop();
    haptic(14);
    setPhase('dust');
  };
  const afterGame = () => {
    sfx.whoosh();
    haptic(16);
    setPhase('flip');
    later(() => {
      setPhase('sideB');
      sfx.crack();
      later(() => sfx.chime(), 300);
    }, reduced() ? 150 : 1500);
  };
  const openLetter = () => {
    if (finale || phase !== 'sideB') return;
    sfx.chime();
    haptic(15);
    setFinale(true);
  };

  /* ── tampilan ── */
  const trackAngle = (i: number) => armAngle(R_OUT - ((i + 0.5) * (R_OUT - R_IN)) / n);
  const armDeg = armDrag ?? (phase === 'play' ? trackAngle(k) : phase === 'drop' ? armAngle(R_OUT + 3) : phase === 'sideB' ? armAngle(R_OUT - 8) : 0);
  const needleUp = !(phase === 'play' || phase === 'sideB');
  // setelah surat terbuka, piringan di baliknya berhenti (tidak perlu terus dianimasikan)
  const spinning = !finale && (phase === 'drop' || phase === 'play' || phase === 'sideB');
  const flipped = phase === 'flip' || phase === 'sideB';
  // lagu yang fotonya sudah jadi sampul album cukup memakai sampulnya
  const single = playing && cur.photo && cur.photo !== cover ? cur.photo : null;
  const lastOne = isLast && n > 1;
  const lyricSize = cur.note.length > 52 ? s.xlong : cur.note.length > 40 ? s.long : cur.note.length > 24 ? s.mid : null;
  const cta = phase === 'play' ? (isLast ? t.toSideB : k + 2 === n ? t.nextLast : t.next) : phase === 'sideB' ? t.readNotes : null;

  let head;
  if (!deckView) {
    head = (
      <div key="names">
        <div className={s.eyebrow}>{t.albumFor}</div>
        <div className={cx(s.name, to.length > 12 && s.small)}>{to}</div>
        {from ? <div className={s.from}>{fmt(t.from, { from })}</div> : null}
      </div>
    );
  } else if (flipped) {
    head = (
      <div key="b">
        <div className={s.eyebrow}>{t.sideBEyebrow}</div>
        <div className={s.big}>{t.sideBTitle}</div>
      </div>
    );
  } else {
    head = (
      <div key="a">
        <div className={s.eyebrow}>{phase === 'play' || phase === 'dust' ? t.nowPlaying : fmt(t.deckEyebrow, { n })}</div>
        <div className={cx(s.big, title.length > 26 && s.small)}>{title}</div>
      </div>
    );
  }

  return (
    <div className={cx(s.wrap, ready && s.ready, s[`ph_${phase}`], deckView && s.deckView, phase === 'pulling' && s.out, single && s.hasSingle)}>
      <div className={s.head}>{head}</div>

      {/* pemutar piringan + lengan jarumnya */}
      <div className={s.deck} aria-hidden>
        <Sprite name="vinyl-meja" className={s.art} />
        {/* lampu kecil di samping tombol putar: menyala selama piringan berputar */}
        <span className={cx(s.led, spinning && s.ledOn)} />
      </div>

      {/* piringan hitam: mula-mula di dalam sampul, lalu di atas pemutar */}
      <div ref={discRef} className={cx(s.disc, phase === 'flip' && s.lift, phase === 'sleeve' && ready && pull === 0 && s.nudge)} style={{ '--pull': pull } as CSSProperties} aria-hidden>
        <div className={cx(s.flipper, flipped && s.flipped)}>
          <div className={s.dFace}>
            <div className={cx(s.spin, spinning && s.spinning)}>
              <Disc n={n} side="a" label={t.sideA} />
            </div>
          </div>
          <div className={cx(s.dFace, s.dBack)}>
            <div className={cx(s.spin, spinning && s.spinning)}>
              <Disc n={2} side="b" label={t.sideB} />
            </div>
          </div>
        </div>
        <span className={s.sheen} />
      </div>
      {playing ? <button type="button" className={s.discHit} onClick={next} tabIndex={-1} aria-hidden /> : null}

      {/* not balok melayang dari piringan selama lagunya diputar */}
      {!finale && (playing || phase === 'sideB') ? (
        <div className={cx(s.notes, lastOne && playing && s.notesGold)} aria-hidden>
          <i>
            <Note />
          </i>
          <i>
            <Note double />
          </i>
          <i>
            <Note />
          </i>
        </div>
      ) : null}

      <div ref={armBox} className={cx(s.arm, needleUp && s.up)} aria-hidden>
        <div className={cx(s.armRot, armDrag !== null && s.dragging)} style={{ transform: `rotate(${armDeg}deg)` }}>
          <Sprite name="vinyl-lengan" className={s.art} />
        </div>
      </div>
      {phase === 'deck' ? (
        <button
          ref={armHitRef}
          type="button"
          className={s.armHit}
          aria-label={t.needleLabel}
          onPointerDown={onArmDown}
          onPointerMove={onArmMove}
          onPointerUp={(e) => onArmUp(e, false)}
          onPointerCancel={(e) => onArmUp(e, true)}
          onClick={(e) => {
            // dari papan ketik; ketukan jari sudah ditangani di onPointerUp
            if (e.detail === 0) drop();
          }}
        />
      ) : null}

      {/* sampul album: besar di awal, lalu jadi gambar kecil di samping judul lagu */}
      <div className={s.sleeve}>
        <Sprite name="vinyl-sampul" className={s.art} />
        {cover ? (
          <span className={s.coverPhoto}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="" draggable={false} />
          </span>
        ) : null}
        <span className={s.wear} aria-hidden />
        <span className={s.gloss} aria-hidden />
        <span className={cx(s.obi, to.length > 11 && s.obiLong)} aria-hidden>
          <b>{fmt(t.obiFor, { to })}</b>
          <i>{t.obiEdition}</i>
        </span>
        <div className={s.sText} aria-hidden={deckView}>
          <div className={cx(s.sTitle, title.length > 20 && s.long)}>{title}</div>
          <div className={cx(s.sArtist, artist.length > 24 && s.long)}>{artist}</div>
          <div className={s.sImprint}>{t.imprint}</div>
        </div>
        <span className={cx(s.sticker, t.sticker[1].length > 9 && s.stickerLong)} aria-hidden>
          <Sprite name="vinyl-stiker" className={s.art} />
          <span>
            <b>{t.sticker[0]}</b>
            <i>{t.sticker[1]}</i>
          </span>
        </span>
      </div>
      {phase === 'sleeve' ? (
        <button
          ref={pullRef}
          type="button"
          className={s.pullHit}
          aria-label={t.pullLabel}
          onPointerDown={onPullDown}
          onPointerMove={onPullMove}
          onPointerUp={(e) => onPullUp(e, false)}
          onPointerCancel={(e) => onPullUp(e, true)}
          onClick={(e) => {
            if (e.detail === 0) pullOut();
          }}
        />
      ) : null}

      {/* foto untuk lagu yang sedang diputar (lagu yang fotonya jadi sampul album memakai sampulnya) */}
      {single ? (
        <span key={`s${k}`} className={s.single}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={single} alt={fmt(t.singleAlt, { i: k + 1 })} draggable={false} />
          <b aria-hidden>{String(k + 1).padStart(2, '0')}</b>
        </span>
      ) : null}

      <div className={s.info} aria-live="polite">
        {phase === 'play' || phase === 'dust' ? (
          <div key={`t${k}`} className={s.track}>
            <div className={cx(s.trackNo, lastOne && s.last)}>
              <span className={cx(s.eq, playing && s.eqOn)} aria-hidden>
                <i />
                <i />
                <i />
              </span>
              {lastOne ? t.lastTrack : fmt(t.trackOf, { i: k + 1, n })}
            </div>
            <p className={cx(s.lyric, lyricSize)}>
              <Typewriter text={cur.note} speed={34} onDone={() => setTyped(true)} />
            </p>
            {lastOne ? (
              <svg className={s.swoosh} viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden>
                <path d="M3 7.5C24 2.5 43 10.5 66 5.5S104 3.5 117 7" pathLength={1} />
              </svg>
            ) : null}
            <div className={s.dots} aria-hidden>
              {tracks.map((_, i) => (
                <i key={i} className={cx(i <= k && s.on, i === n - 1 && n > 1 && s.end)} />
              ))}
            </div>
          </div>
        ) : (
          <p key={flipped ? 'pb' : 'pa'} className={s.prompt}>
            {flipped ? t.sideBLine : t.deckLine}
          </p>
        )}
      </div>

      {!finale && phase !== 'dust' && cta ? (
        <div className={s.foot}>
          <button key={`${phase}${k}`} ref={ctaRef} type="button" className={s.cta} onClick={phase === 'sideB' ? openLetter : next}>
            {cta} <span aria-hidden>→</span>
          </button>
        </div>
      ) : null}

      {phase === 'sleeve' && ready ? (
        <Hint key="hintPull">
          {t.hintPull}
          <span className={s.or}> · {t.orTap}</span>
        </Hint>
      ) : null}
      {phase === 'deck' ? (
        <Hint key="hintNeedle">
          {t.hintNeedle}
          <span className={s.or}> · {t.orTap}</span>
        </Hint>
      ) : null}

      {finale || phase === 'dust' ? null : phase === 'sleeve' ? (
        ready ? <TapCue key="cuePull" target={pullRef} kind="drag" dir={{ x: 4, y: 0 }} at={{ x: 0.86, y: 0.5 }} delay={2200} /> : null
      ) : phase === 'deck' ? (
        <TapCue key="cueNeedle" target={armHitRef} kind="drag" dir={{ x: -3.4, y: 0 }} at={{ x: 0.5, y: 0.8 }} delay={2400} />
      ) : cta && (typed || phase === 'sideB') ? (
        <TapCue key={`cue${phase}${k}`} target={ctaRef} delay={3600} />
      ) : null}

      {phase === 'dust' ? <DustGame disc={discRef} t={t.game} onDone={afterGame} /> : null}

      <Confetti burst={burst} shapes="hearts" count={44} origin={{ x: 0.4, y: 0.6 }} colors={['#c8372d', '#fff3d0', '#f1d58a', '#f29a8e', '#2f6f6a']} />

      {finale ? (
        <Finale
          data={{ ...data, title }}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kamboja-pink"
          theme={{ backdrop: BACKDROP, ink: meta.palette.ink, paper: '#fffaf0', paperInk: '#3b2a22' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
