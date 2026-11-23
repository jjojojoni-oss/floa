'use client';

import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Finale, Hint, Sprite, Stage, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

const BACKDROP = '/art/bg-scrapbook.webp';
const ART = [
  'bg-scrapbook',
  'scrapbook-sampul',
  'scrapbook-ring',
  'scrapbook-perangko',
  'scrapbook-cap',
  'scrapbook-tiket',
  'scrapbook-klip',
  'scrapbook-sudut',
  'scrapbook-sobekan',
  'scrapbook-pres-1',
  'scrapbook-pres-2',
  'scrapbook-kantong',
];

export default function Scrapbook(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BACKDROP}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

type Page = { src: string | null; cap: string };
type Text = (typeof TEXT)['id'];

/* tiap halaman punya warna kertas sendiri; halaman tanpa foto memakai potongan kertas berwarna */
const PAPER = ['#f7efdc', '#f4e8da', '#eef0e0', '#f8ecd8', '#f3e6dd', '#eff0e3'];
const TINT = ['#f9d8c8', '#f8e6b4', '#d3e5d6', '#f6d5dc', '#dbe3f3', '#f7dcba'];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const photos = data.photos.filter(Boolean).slice(0, 6);
  const notes = data.notes.map((n) => n.trim());
  const pages: Page[] = photos.length
    ? photos.map((src, i) => ({ src, cap: notes[i] ?? '' }))
    : notes
        .filter(Boolean)
        .slice(0, 6)
        .map((cap) => ({ src: null, cap }));
  /** lembar yang bisa dibalik: sampul + halaman isi. Di bawahnya ada halaman kantong yang tidak dibalik. */
  const leaves = pages.length + 1;

  /** jumlah lembar yang sudah dibalik: 0 = sampul tertutup, `leaves` = halaman kantong */
  const [pos, setPos] = useState(0);
  /** halaman terjauh yang pernah dibuka: petunjuk balik halaman hanya muncul sekali */
  const [far, setFar] = useState(0);
  const [finale, setFinale] = useState(false);
  const posRef = useRef(0);
  const later = useTimers();
  const ready = useArtReady(ART);
  const t = TEXT[useLocale()];

  const bookRef = useRef<HTMLDivElement>(null);
  const leafEls = useRef<(HTMLDivElement | null)[]>([]);
  const frontShades = useRef<(HTMLSpanElement | null)[]>([]);
  const backShades = useRef<(HTMLSpanElement | null)[]>([]);
  /** bayangan yang jatuh ke lembar ke-j (j = leaves → halaman kantong) dari lembar di atasnya */
  const casts = useRef<(HTMLSpanElement | null)[]>([]);
  const angles = useRef<number[]>([]);
  const rafs = useRef<number[]>([]);
  const start = useRef<{ id: number; x0: number; y0: number } | null>(null);
  const drag = useRef<{ leaf: number; w: number; lastX: number; lastT: number; v: number } | null>(null);
  const moved = useRef(false);

  const to = data.to.trim() || t.you;
  const from = data.from.trim();
  const atPocket = pos >= leaves;

  /** Memasang sudut lembar ke-i (0 = rata di kanan, 180 = sudah dibalik ke kiri) berikut semua bayangannya. */
  const apply = useCallback((i: number, a: number, moving: boolean) => {
    const leaf = leafEls.current[i];
    if (!leaf) return;
    angles.current[i] = a;
    const rad = (a * Math.PI) / 180;
    leaf.style.transform = `rotateY(${-a}deg)`;
    leaf.style.zIndex = String(moving ? (a < 90 ? 300 - i : 300 + i) : a >= 90 ? 10 + i : 100 - i);
    const fs = frontShades.current[i];
    if (fs) fs.style.opacity = (Math.sin(Math.min(rad, Math.PI / 2)) * 0.55).toFixed(3);
    const bs = backShades.current[i];
    if (bs) bs.style.opacity = (a > 90 ? ((180 - a) / 90) * 0.5 : 0.5).toFixed(3);
    const c = casts.current[i + 1];
    if (c) {
      c.style.opacity = clamp(a / 10, 0, 1).toFixed(3);
      c.style.setProperty('--e', `${(Math.max(0, Math.cos(rad)) * 100).toFixed(1)}%`);
      c.style.setProperty('--s', `${(Math.sin(rad) * 40).toFixed(1)}%`);
    }
  }, []);

  useLayoutEffect(() => {
    for (let i = 0; i < leaves; i++) apply(i, angles.current[i] ?? 0, false);
  }, [leaves, apply]);
  useEffect(() => {
    const ids = rafs.current;
    return () => ids.forEach((id) => cancelAnimationFrame(id));
  }, []);

  /** Menggerakkan lembar ke-i sampai sudut tujuan (0 atau 180), mulus dari posisi mana pun. */
  const animate = useCallback(
    (i: number, target: number) => {
      cancelAnimationFrame(rafs.current[i] ?? 0);
      const a0 = angles.current[i] ?? 0;
      const dist = Math.abs(target - a0);
      const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (dist < 0.5 || reduce) {
        apply(i, target, false);
        return;
      }
      const fromRest = a0 < 1 || a0 > 179;
      const dur = fromRest ? 780 : 220 + dist * 2.6;
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        // dari diam: terangkat pelan lalu jatuh; dari seretan: langsung meluncur ke tujuan
        const e = fromRest ? (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2) : 1 - Math.pow(1 - p, 3);
        apply(i, a0 + (target - a0) * e, p < 1);
        if (p < 1) rafs.current[i] = requestAnimationFrame(step);
      };
      rafs.current[i] = requestAnimationFrame(step);
    },
    [apply],
  );

  const commit = (next: number) => {
    if (next === posRef.current) return;
    const forward = next > posRef.current;
    posRef.current = next;
    setPos(next);
    setFar((f) => Math.max(f, next));
    sfx.whoosh();
    haptic(10);
    later(() => sfx.tap(), 520);
    if (forward && next >= leaves) later(() => sfx.chime(), 700);
  };

  const goNext = () => {
    const p = posRef.current;
    if (p >= leaves) return;
    animate(p, 180);
    commit(p + 1);
  };
  const goPrev = () => {
    const p = posRef.current;
    if (p <= 0) return;
    animate(p - 1, 0);
    commit(p - 1);
  };

  const open = () => {
    if (finale) return;
    sfx.chime();
    haptic(15);
    setFinale(true);
  };

  /* ── seret: halaman mengikuti jari ── */
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button > 0) return;
    moved.current = false;
    start.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY };
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const st = start.current;
    const book = bookRef.current;
    if (!st || st.id !== e.pointerId || !book) return;
    const dx = e.clientX - st.x0;
    const dy = e.clientY - st.y0;
    if (!drag.current) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      const p = posRef.current;
      const leaf = dx < 0 ? p : p - 1;
      if (leaf < 0 || leaf >= leaves) {
        start.current = null;
        return;
      }
      cancelAnimationFrame(rafs.current[leaf] ?? 0);
      try {
        book.setPointerCapture(e.pointerId);
      } catch {
        /* pointer sudah tidak aktif */
      }
      // titik mulai digeser supaya sudut tidak melompat saat seretan baru terdeteksi
      st.x0 = e.clientX;
      drag.current = { leaf, w: book.offsetWidth || 1, lastX: e.clientX, lastT: performance.now(), v: 0 };
      moved.current = true;
      return;
    }
    const d = drag.current;
    const base = d.leaf < posRef.current ? 180 : 0;
    const a = clamp(base - ((e.clientX - st.x0) / (d.w * 0.92)) * 180, 0, 180);
    apply(d.leaf, a, true);
    const now = performance.now();
    if (now > d.lastT) d.v = d.v * 0.4 + ((e.clientX - d.lastX) / (now - d.lastT)) * 0.6;
    d.lastX = e.clientX;
    d.lastT = now;
  };
  const onEnd = (e: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const st = start.current;
    if (!st || st.id !== e.pointerId) return;
    start.current = null;
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    later(() => (moved.current = false), 80);
    const a = angles.current[d.leaf] ?? 0;
    const wasTurned = d.leaf < posRef.current;
    let target = a > 90 ? 180 : 0;
    // kibasan hanya dihitung kalau jari masih bergerak saat dilepas
    const v = performance.now() - d.lastT > 90 ? 0 : d.v;
    if (v < -0.45) target = 180;
    if (v > 0.45) target = 0;
    if (cancelled) target = wasTurned ? 180 : 0;
    animate(d.leaf, target);
    commit(target === 180 ? d.leaf + 1 : d.leaf);
  };

  /* ketuk: sisi kanan = lanjut, sisi kiri = kembali; klik yang menyusul seretan diabaikan */
  const onTap = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (moved.current) {
      moved.current = false;
      return;
    }
    const book = bookRef.current;
    if (!book) return;
    const r = book.getBoundingClientRect();
    const x = (e.clientX - r.left) / (r.width || 1);
    if (posRef.current === 0 || x >= 0.36) goNext();
    else goPrev();
  };

  const total = pages.length + 1;

  return (
    <div className={cx(s.wrap, ready && s.ready)}>
      <div className={s.head}>
        {atPocket ? (
          <div key="l">
            <div className={s.eyebrow}>{t.oneMore}</div>
            <div className={cx(s.name, s.small)}>{t.letterInPocket}</div>
          </div>
        ) : (
          <div key="n">
            <div className={s.eyebrow}>{t.bookFor}</div>
            <div className={cx(s.name, to.length > 12 && s.small)}>{to}</div>
            {from ? <div className={s.from}>{fmt(t.from, { from })}</div> : null}
          </div>
        )}
      </div>

      <div className={s.mid}>
        <div className={cx(s.scale, pos > 0 && s.opened)}>
          <div
            ref={bookRef}
            className={s.book}
            role="group"
            aria-label={t.book}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={(e) => onEnd(e, false)}
            onPointerCancel={(e) => onEnd(e, true)}
            onClick={onTap}
          >
            {/* sampul belakang + tebal tumpukan halaman */}
            <div className={s.block} />
            <div className={s.edges} />

            {/* halaman kantong: paling bawah, tidak dibalik */}
            <div className={cx(s.pageBase, s.pocketPage)} style={{ '--paper': PAPER[pages.length % PAPER.length] } as CSSProperties} aria-hidden={!atPocket}>
              <span className={s.holes} />
              <span className={s.gutter} />
              <span className={s.ps}>P.S.</span>
              <span className={s.pocketNote}>{t.pocketNote}</span>
              <ArrowDoodle className={s.pocketArrow} />
              <button
                type="button"
                className={cx(s.pocket, atPocket && s.pocketLive)}
                tabIndex={atPocket ? 0 : -1}
                aria-label={t.openLabel}
                onClick={(e) => {
                  e.stopPropagation();
                  if (moved.current) return;
                  if (atPocket) open();
                }}
              >
                <span className={s.sheet}>
                  <span className={cx(s.sheetTo, to.length > 12 && s.long)}>{fmt(t.noteTo, { to })}</span>
                  <span className={s.sheetLine} />
                  <span className={s.sheetLine} />
                  <span className={s.sheetLine} />
                </span>
                <Sprite name="scrapbook-kantong" className={s.pocketArt} />
                <Sprite name="polaroid-selotip-3" className={s.pocketTape1} />
                <Sprite name="polaroid-selotip-1" className={s.pocketTape2} />
                <span className={s.pocketOpen}>{t.noteOpen}</span>
              </button>
              <Sprite name="scrapbook-pres-1" className={s.pocketFlower} />
              <HeartDoodle className={s.pocketHeart} />
              <span className={s.pageNo}>{total}</span>
              <span
                className={s.cast}
                ref={(el) => {
                  casts.current[leaves] = el;
                }}
              />
            </div>

            {Array.from({ length: leaves }, (_, i) => (
              <div
                key={i}
                className={cx(s.leaf, i === 0 && s.coverLeaf)}
                ref={(el) => {
                  leafEls.current[i] = el;
                }}
                aria-hidden={i !== pos}
              >
                <div className={cx(s.face, s.front)}>
                  {i === 0 ? <CoverFront t={t} to={to} from={from} /> : <PageFront page={pages[i - 1]} n={i} from={from} t={t} />}
                  <span
                    className={s.cast}
                    ref={(el) => {
                      casts.current[i] = el;
                    }}
                  />
                  <span
                    className={s.frontShade}
                    ref={(el) => {
                      frontShades.current[i] = el;
                    }}
                  />
                </div>
                <div className={cx(s.face, s.back, i === 0 ? s.liner : s.paperBack)} style={{ '--paper': PAPER[(i + 5) % PAPER.length] } as CSSProperties}>
                  {i === 0 ? <span className={s.linerEdge} /> : <span className={s.holesBack} />}
                  <span
                    className={s.backShade}
                    ref={(el) => {
                      backShades.current[i] = el;
                    }}
                  />
                </div>
              </div>
            ))}

            <Sprite name="scrapbook-ring" className={cx(s.ring, s.ring1)} />
            <Sprite name="scrapbook-ring" className={cx(s.ring, s.ring2)} />
          </div>
        </div>
      </div>

      <div className={s.foot}>
        <div className={s.nav}>
          <button type="button" className={s.navBtn} onClick={goPrev} disabled={pos === 0} aria-label={t.prev}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M14.5 5.5L8 12l6.5 6.5" />
            </svg>
          </button>
          <span className={s.count} aria-live="polite">
            {pos === 0 ? (
              t.cover
            ) : (
              <>
                <b>{pos}</b> / {total}
                <span className={s.sr}>{fmt(t.pageOf, { i: pos, total })}</span>
              </>
            )}
          </span>
          {atPocket ? (
            <button type="button" className={cx(s.navBtn, s.navLetter)} onClick={open} aria-label={t.openLabel}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M4 7.5h16v10H4zM4.5 8l7.5 6 7.5-6" />
              </svg>
            </button>
          ) : (
            <button type="button" className={cx(s.navBtn, pos === 0 && s.navPulse)} onClick={goNext} aria-label={pos === 0 ? t.open : t.next}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M9.5 5.5L16 12l-6.5 6.5" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {pos === 0 ? <Hint key="c">{t.hintCover}</Hint> : null}
      {pos === 1 && far <= 1 && !atPocket ? <Hint key="t">{t.hintTurn}</Hint> : null}
      {atPocket && !finale ? <Hint key="l">{t.hintLetter}</Hint> : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={t.finale}
          flower="bunga-kenikir"
          theme={{ bg: `url(${BACKDROP}) center bottom / cover no-repeat`, ink: meta.palette.ink, paper: '#fffaf0', paperInk: '#3b2a22' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}

/* ───────────────────────── sampul ───────────────────────── */

function CoverFront({ t, to, from }: { t: Text; to: string; from: string }) {
  const names = from ? `${to} & ${from}` : to;
  return (
    <div className={s.cover}>
      <Sprite name="scrapbook-sampul" className={s.coverArt} />
      <div className={s.label}>
        <span className={s.labelTitle}>our scrapbook</span>
        <span className={s.labelRule} aria-hidden>
          <HeartDoodle className={s.labelHeart} />
        </span>
        <span className={cx(s.labelNames, names.length > 22 && s.long)}>{names}</span>
        <span className={s.labelSub}>{t.coverSub}</span>
      </div>
    </div>
  );
}

/* ───────────────────────── halaman isi ───────────────────────── */

function PageFront({ page, n, from, t }: { page: Page; n: number; from: string; t: Text }) {
  const v = (n - 1) % 3;
  const alt = n > 3;
  const blank = !page.src;
  const vars = { '--paper': PAPER[(n - 1) % PAPER.length], '--tint': TINT[(n - 1) % TINT.length] } as CSSProperties;
  const picture = page.src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={page.src} alt="" draggable={false} />
  ) : (
    <span className={cx(s.quote, page.cap.length > 30 && s.quoteLong)}>{page.cap}</span>
  );
  const caption = blank ? (from ? `— ${from}` : '') : page.cap;

  return (
    <div className={cx(s.pageBase, s.page, s[`v${v}`], alt && s.alt, blank && s.blankPage)} style={vars}>
      <span className={s.holes} />
      <span className={s.gutter} />

      {v === 0 ? (
        <>
          <span className={s.print}>
            <span className={cx(s.photo, blank && s.blank)}>{picture}</span>
          </span>
          <Sprite name={`polaroid-selotip-${alt ? 4 : 1}`} className={s.tapeA} />
          <Sprite name={`polaroid-selotip-${alt ? 2 : 3}`} className={s.tapeB} />
          <SparkDoodle className={s.spark} />
          {caption ? <span className={cx(s.caption, blank && s.sign)}>{caption}</span> : null}
          <Sprite name={alt ? 'scrapbook-pres-2' : 'scrapbook-pres-1'} className={s.pressed} />
        </>
      ) : null}

      {v === 1 ? (
        <>
          <span className={s.mat} />
          <span className={s.cornered}>
            <span className={cx(s.photo, blank && s.blank)}>{picture}</span>
            <Sprite name="scrapbook-sudut" className={cx(s.corner, s.c1)} />
            <Sprite name="scrapbook-sudut" className={cx(s.corner, s.c2)} />
            <Sprite name="scrapbook-sudut" className={cx(s.corner, s.c3)} />
            <Sprite name="scrapbook-sudut" className={cx(s.corner, s.c4)} />
          </span>
          <Sprite name="scrapbook-perangko" className={s.stamp} />
          <Sprite name="scrapbook-cap" className={s.postmark} />
          {caption ? (
            <span className={s.strip}>
              <Sprite name="scrapbook-sobekan" className={s.stripArt} />
              <Sprite name={`polaroid-selotip-${alt ? 1 : 2}`} className={s.stripTape} />
              <span className={cx(s.stripText, blank && s.sign)}>{caption}</span>
            </span>
          ) : null}
          <Sprite name={alt ? 'scrapbook-pres-1' : 'scrapbook-pres-2'} className={s.pressedLying} />
          <HeartDoodle className={s.heartB} />
        </>
      ) : null}

      {v === 2 ? (
        <>
          <span className={s.backing} />
          <span className={cx(s.print, s.square)}>
            <span className={cx(s.photo, blank && s.blank)}>{picture}</span>
          </span>
          <Sprite name="scrapbook-klip" className={s.clip} />
          {caption ? <span className={cx(s.caption, blank && s.sign)}>{caption}</span> : null}
          <span className={s.ticket}>
            <Sprite name="scrapbook-tiket" className={s.ticketArt} />
            <span className={s.ticketText}>
              <b>{fmt(t.ticketNo, { n: String(n).padStart(2, '0') })}</b>
              <i>{t.ticket}</i>
            </span>
          </span>
          <Sprite name="bunga-melati" className={s.melati} />
          <HeartDoodle className={s.heartC1} />
          <HeartDoodle className={s.heartC2} />
        </>
      ) : null}

      <span className={s.pageNo}>{n}</span>
    </div>
  );
}

/* ───────────────────────── coretan pena ───────────────────────── */

function HeartDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 36" className={cx(s.doodle, className)} aria-hidden>
      <path d="M20 31C9 23 3 16 6 9.5 8.6 4 16 4.4 20 11c3.4-6.8 11.6-7 14 -1.2C36.6 16 31 23 20.6 31.4" />
    </svg>
  );
}
function SparkDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" className={cx(s.doodle, className)} aria-hidden>
      <path d="M22 4v12M22 28v12M4 22h12M28 22h12M10 10l6 6M28 28l6 6M34 10l-6 6M16 28l-6 6" />
    </svg>
  );
}
function ArrowDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 70" className={cx(s.doodle, className)} aria-hidden>
      <path d="M12 6c26 4 36 24 26 54M26 48l11 13 9-15" />
    </svg>
  );
}
