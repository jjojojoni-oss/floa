'use client';

import { type CSSProperties, type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import { fmt } from '@/i18n/fmt';
import type { GiftData } from '../types';
import { Hint, Stage, cx, haptic, sfx, useArtReady, useKitText, useTimers } from './index';
import s from './kit.module.css';

type Phase = 'tied' | 'untie' | 'open' | 'card' | 'leave';

const ART = ['bungkus-kertas', 'bungkus-tali-v', 'bungkus-tali-h', 'bungkus-pita', 'bungkus-label', 'bunga-melati', 'daun-2'];

/** kelopak yang terhambur waktu bingkisan terbuka: arah, ukuran, putaran, jeda (tetap, bukan acak) */
const PUFF = [
  { k: 'kelopak-putih', dx: -6.2, dy: -7.5, r: -140, s: 1.9, d: 0 },
  { k: 'kelopak-pink', dx: 5.4, dy: -8.6, r: 160, s: 1.7, d: 0.05 },
  { k: 'bunga-melati', dx: -2.2, dy: -10.4, r: -90, s: 2.4, d: 0.1 },
  { k: 'kelopak-putih', dx: 7.6, dy: -4.2, r: 120, s: 1.5, d: 0.08 },
  { k: 'kelopak-pink', dx: -8, dy: -3.4, r: -180, s: 1.6, d: 0.12 },
  { k: 'kelopak-putih', dx: 2.6, dy: -11.2, r: 200, s: 1.4, d: 0.16 },
  { k: 'bunga-melati', dx: 8.4, dy: -9.2, r: 70, s: 1.9, d: 0.2 },
  { k: 'kelopak-pink', dx: -5, dy: -11.6, r: -220, s: 1.3, d: 0.22 },
];

/** "5 catatan kecil · 3 foto · 1 lagu · 1 surat" dari isi kado, dengan bentuk jamak yang benar. */
function useContents(data: GiftData) {
  const k = useKitText();
  const notes = data.notes.filter((n) => n.trim()).length;
  const photos = data.photos.filter(Boolean).length;
  const parts: string[] = [];
  if (notes) parts.push(fmt(notes === 1 ? k.cNotes1 : k.cNotes, { n: notes }));
  if (photos) parts.push(fmt(photos === 1 ? k.cPhotos1 : k.cPhotos, { n: photos }));
  if (data.music) parts.push(k.cSong);
  if (data.message.trim()) parts.push(k.cLetter);
  return parts;
}

/**
 * Sampul kado bersama: bingkisan kertas cokelat berstempel kawung, diikat tali goni dan simpul pita
 * berwarna aksen template, dengan label gantung "untuk {to}". Tarik pitanya (atau ketuk) — simpulnya
 * sedikit membandel di tarikan pertama — lalu kertasnya terbuka dan kartu judul muncul di atas kertas
 * tisu. Ketuk kartunya untuk mulai. Ketukan pertama di sini sekaligus izin memutar musik kado.
 */
export function GiftWrap({
  data,
  palette,
  onDone,
}: {
  data: GiftData;
  palette: { bg: string; ink: string; accent: string };
  onDone: () => void;
}) {
  const k = useKitText();
  const ready = useArtReady(ART);
  const later = useTimers();
  const [phase, setPhase] = useState<Phase>('tied');
  const [tries, setTries] = useState(0);
  const [stubborn, setStubborn] = useState(0);
  const [pull, setPull] = useState(0);
  const drag = useRef<{ id: number; y0: number; h: number; moved: boolean } | null>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const parcelRef = useRef<HTMLButtonElement>(null);
  const done = useRef(onDone);
  done.current = onDone;
  const contents = useContents(data);
  const to = data.to.trim();
  const from = data.from.trim();
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (phase === 'card') cardRef.current?.focus({ preventScroll: true });
  }, [phase]);

  const leave = () => {
    if (phase === 'leave') return;
    setPhase('leave');
    later(() => done.current(), reduce.current ? 50 : 520);
  };

  /** satu tarikan: yang pertama membandel (simpulnya cuma mengencang), yang kedua lepas */
  const attempt = () => {
    if (phase !== 'tied') return;
    const n = tries + 1;
    setTries(n);
    if (n === 1 && !reduce.current) {
      setStubborn((v) => v + 1);
      sfx.tug();
      haptic(18);
      return;
    }
    setPhase('untie');
    sfx.untie();
    haptic(24);
    later(() => {
      setPhase('open');
      sfx.rustle();
      haptic(12);
    }, reduce.current ? 30 : 560);
    later(() => {
      setPhase('card');
      sfx.chime();
    }, reduce.current ? 60 : 1350);
  };

  const onDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (phase !== 'tied' || e.button > 0) return;
    const h = e.currentTarget.getBoundingClientRect().height || 1;
    drag.current = { id: e.pointerId, y0: e.clientY, h, moved: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
  };
  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dy = Math.max(0, e.clientY - d.y0);
    if (dy > 6) d.moved = true;
    // makin ditarik makin berat, seperti tali yang ditahan simpul
    setPull(Math.min(1, dy / (d.h * 0.32)));
  };
  const onUp = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const p = pull;
    setPull(0);
    if (cancelled) return;
    if (!d.moved || p > 0.55) attempt();
  };

  const style = { '--pull': pull } as CSSProperties;
  const hint = phase !== 'tied' ? null : tries === 1 ? k.wrapStubborn : k.wrapPull;

  return (
    <Stage {...palette}>
      <div className={cx(s.wrap, ready && s.ready, s[`ph_${phase}`])} style={style}>
        <p className={s.wrapEyebrow}>{from ? fmt(k.wrapFrom, { from }) : k.wrapAnon}</p>

        <div className={s.parcelBox}>
          <span className={s.glow} aria-hidden />
          {/* kertas tisu di dalam + kartu judul */}
          <div className={s.tissue} aria-hidden={phase !== 'card'}>
            <button
              ref={cardRef}
              type="button"
              className={s.card}
              tabIndex={phase === 'card' ? 0 : -1}
              onClick={() => {
                sfx.tap();
                leave();
              }}
              aria-label={`${k.cardEyebrow} ${to || k.you}. ${contents.join(', ')}. ${k.cardStart}`}
            >
              <span className={s.cardEyebrow}>{k.cardEyebrow}</span>
              <span className={cx(s.cardName, (to || k.you).length > 12 && s.long)}>{to || k.you}</span>
              {from ? <span className={s.cardFrom}>{fmt(k.cardFrom, { from })}</span> : null}
              <span className={s.cardRule} aria-hidden>
                <img src="/art/bunga-melati.webp" alt="" draggable={false} />
              </span>
              {contents.length ? (
                <span className={s.cardInside}>
                  <span className={s.cardInsideLabel}>{k.cardInside}</span>
                  <span className={s.cardItems}>
                    {contents.map((c, i) => (
                      <span key={c} className={s.cardItem} style={{ '--i': i } as CSSProperties}>
                        {c}
                      </span>
                    ))}
                  </span>
                </span>
              ) : null}
              <span className={s.cardSlow}>{k.cardSlow}</span>
              <span className={s.cardStart}>{k.cardStart}</span>
            </button>
          </div>

          {/* bingkisan: dua belah kertas yang nanti membuka ke samping */}
          <button
            ref={parcelRef}
            type="button"
            className={s.parcel}
            tabIndex={phase === 'tied' ? 0 : -1}
            aria-hidden={phase !== 'tied'}
            aria-label={fmt(k.wrapLabel, { to: to || k.you })}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={(e) => onUp(e, false)}
            onPointerCancel={(e) => onUp(e, true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                attempt();
              }
            }}
          >
            <span className={cx(s.paperHalf, s.paperL)} aria-hidden>
              <img src="/art/bungkus-kertas.webp" alt="" draggable={false} />
            </span>
            <span className={cx(s.paperHalf, s.paperR)} aria-hidden>
              <img src="/art/bungkus-kertas.webp" alt="" draggable={false} />
            </span>
            <img src="/art/bungkus-tali-v.webp" alt="" className={s.twineV} draggable={false} />
            <img src="/art/bungkus-tali-h.webp" alt="" className={s.twineH} draggable={false} />
            <span className={s.sprig} aria-hidden>
              <img src="/art/daun-2.webp" alt="" className={s.sprigLeaf} draggable={false} />
              <img src="/art/bunga-melati.webp" alt="" className={s.sprigFlower} draggable={false} />
            </span>
            <span key={stubborn} className={cx(s.bow, stubborn > 0 && s.tug)} aria-hidden>
              <span className={s.bowTint} />
              <img src="/art/bungkus-pita.webp" alt="" draggable={false} />
            </span>
            <span className={s.tag} aria-hidden>
              <img src="/art/bungkus-label.webp" alt="" draggable={false} />
              <span className={cx(s.tagText, (to || k.you).length > 11 && s.long)}>{fmt(k.wrapTag, { to: to || k.you })}</span>
            </span>
          </button>

          {(phase === 'open' || phase === 'card') && !reduce.current ? (
            <span className={s.puff} aria-hidden>
              {PUFF.map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={`/art/${p.k}.webp`}
                  alt=""
                  draggable={false}
                  style={{ '--dx': `${p.dx}em`, '--dy': `${p.dy}em`, '--r': `${p.r}deg`, '--s': `${p.s}em`, '--delay': `${p.d}s` } as CSSProperties}
                />
              ))}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          className={s.wrapSkip}
          onClick={(e) => {
            e.stopPropagation();
            leave();
          }}
        >
          {k.introSkip}
        </button>
      </div>
      {hint ? (
        <Hint key={hint}>
          {hint}
          {tries === 0 ? <span className={s.wrapOr}> · {k.wrapOrTap}</span> : null}
        </Hint>
      ) : null}
    </Stage>
  );
}
