'use client';

import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Finale, Hint, Sprite, Stage, TapCue, cx, haptic, sfx, useArtReady, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { fmt, useLocale } from '@/i18n/client';
import { TEXT } from './i18n';
import { meta } from './meta';
import s from './style.module.css';

export default function Polaroid(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette} backdrop={BACKDROP}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

type Card = { src: string | null; label: string; title: string; rest: string };
type Drag = { id: number; x0: number; y0: number; dx: number; dy: number; t0: number; el: HTMLElement };
type Face = 'front' | 'back';

/**
 * "Tempat, waktu – cerita" → label + cerita. Kalimat pertama cerita jadi judulnya.
 * Catatan tanpa tanda pisah (kado lama) seluruhnya jadi cerita.
 */
function parseNote(raw: string): Omit<Card, 'src'> {
  const note = raw.trim();
  const m = /^(.{2,48}?)\s+[–—-]\s+(.+)$/.exec(note);
  const label = m ? m[1].trim() : '';
  const story = (m ? m[2] : note).trim();
  const t = /^(.{3,80}?[.!?…])(\s+|$)(.*)$/.exec(story);
  return t ? { label, title: t[1], rest: t[3].trim() } : { label, title: story, rest: '' };
}

/* tiap kartu punya kemiringan & geseran sendiri supaya tumpukannya terlihat berantakan */
const TILT = [-3.6, 4.4, -6.2, 2.8, 5.6, -2.4];
const SHIFT: [number, number][] = [
  [0.3, 0],
  [-0.9, 0.25],
  [1, -0.15],
  [-0.6, 0.4],
  [0.75, 0.15],
  [-0.35, -0.25],
];
/* tempat foto yang sudah dibaca di meja: berserakan di sekeliling tumpukan, jadi kolase di akhir */
const SLOTS: [number, number, number][] = [
  [-7.7, -7.9, -9],
  [7.6, 8.0, 7],
  [7.9, -7.7, 10],
  [-7.5, 8.1, -6],
  [0.3, -8.6, 4],
  [-0.2, 8.7, -3],
];
/* kartu tanpa foto: kertas berwarna lembut */
const TINT = ['#f9d8c8', '#f8e6b4', '#d3e5d6', '#f6d5dc', '#dbe3f3', '#f7dcba'];
const TAPE_ROT = [-3, 4, -6, 2, 5, -2];

const BACKDROP = '/art/bg-polaroid.webp';
const ART = ['bg-polaroid', 'polaroid-karet', 'polaroid-selotip-1', 'polaroid-selotip-2', 'polaroid-selotip-3', 'polaroid-selotip-4'];

/** Coretan pensil kecil di punggung foto: tiap foto beda. */
function Doodle({ i }: { i: number }) {
  const v = i % 4;
  return (
    <svg className={s.doodle} viewBox="0 0 60 44" aria-hidden>
      {v === 0 ? <path d="M30 38C14 27 9 19 13 12c3.6-6 11-5 17 3 6-8 13.4-9 17-3 4 7-1 15-17 26z" /> : null}
      {v === 1 ? <path d="M30 5l5.6 11.6 12.8 1.8-9.3 9 2.3 12.6L30 34l-11.4 6 2.3-12.6-9.3-9 12.8-1.8z" /> : null}
      {v === 2 ? (
        <>
          <circle cx="30" cy="22" r="16" />
          <path d="M23 18v.5M37 18v.5M22 27c4 5 12 5 16 0" />
        </>
      ) : null}
      {v === 3 ? <path d="M8 30c6-14 16-20 26-16 8 3 6 13-1 12-6-1-4-11 5-14 6-2 12 1 15 6m0 0l-6 1m6-1l1-6" /> : null}
    </svg>
  );
}

/** Teks yang "ditulis" kata demi kata saat punggung foto terbuka. */
function Ink({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className={s.word} style={{ '--d': `${delay + i * 0.07}s` } as CSSProperties}>
          {w}{' '}
        </span>
      ))}
    </span>
  );
}

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const t = TEXT[useLocale()];
  const photos = data.photos.filter(Boolean).slice(0, 6);
  const notes = data.notes.map((n) => n.trim());
  const cards: Card[] = photos.length
    ? photos.map((src, i) => ({ src, ...parseNote(notes[i] ?? '') }))
    : notes
        .filter(Boolean)
        .slice(0, 6)
        .map((n) => ({ src: null, ...parseNote(n) }));
  const total = cards.length;
  const withPhotos = photos.length > 0;
  /* foto terakhir disimpan untuk akhir: datang tertelungkup */
  const special = total >= 2 ? total - 1 : -1;
  /* satu foto yang "nempel" dengan foto di bawahnya: harus ditarik dua kali */
  const sticky = total >= 4 ? 1 : -1;

  const [tied, setTied] = useState(total > 0);
  /** jumlah foto yang sudah ditaruh di meja; foto ke-`idx` adalah yang teratas */
  const [idx, setIdx] = useState(0);
  const [face, setFace] = useState<Face>('front');
  const [revealed, setRevealed] = useState(false);
  const [tugs, setTugs] = useState(0);
  const [tugging, setTugging] = useState(false);
  const [finale, setFinale] = useState(false);
  const drag = useRef<Drag | null>(null);
  const moved = useRef(false);
  const kbd = useRef(false);
  const noteRef = useRef<HTMLButtonElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const bandRef = useRef<HTMLButtonElement>(null);
  /** foto teratas saat ini, untuk penunjuk sentuh */
  const topRef = useMemo(() => ({ get current() { return cardRefs.current[idx] ?? null; } }), [idx]);
  const later = useTimers();
  const ready = useArtReady(ART);

  const atLetter = idx >= total;
  const to = data.to.trim() || t.you;
  const from = data.from.trim();
  const top = atLetter ? null : cards[idx];
  const isSpecial = idx === special;
  const hasStory = !!top && !!(top.title || top.label);
  const showingBack = isSpecial ? !revealed : face === 'back';

  /* setiap foto baru: depan dulu, kecuali yang terakhir (tertelungkup) */
  useEffect(() => {
    setFace(idx === special ? 'back' : 'front');
    setRevealed(false);
    if (kbd.current) (cardRefs.current[idx] ?? noteRef.current)?.focus({ preventScroll: true });
  }, [idx, special]);

  const snap = () => {
    if (!tied) return;
    setTied(false);
    sfx.crack();
    haptic(18);
    later(() => sfx.tap(), 140);
    // pakai papan ketik: fokus pindah ke foto teratas begitu karetnya lepas
    if (kbd.current) later(() => (cardRefs.current[idx] ?? noteRef.current)?.focus({ preventScroll: true }), 60);
  };

  const place = () => {
    if (atLetter || !top) return;
    if (idx === sticky && tugs === 0) {
      // nempel: terangkat sedikit lalu kembali
      setTugs(1);
      setTugging(true);
      sfx.crack();
      haptic(35);
      later(() => setTugging(false), 520);
      return;
    }
    const i = idx;
    setIdx(i + 1);
    sfx.whoosh();
    haptic(12);
    if (i + 1 >= total) later(() => sfx.chime(), 520);
  };

  const flipOrPlace = () => {
    if (tied) return snap();
    if (!top) return;
    if (isSpecial && !revealed) {
      setRevealed(true);
      sfx.chime();
      haptic(20);
      return;
    }
    if (!isSpecial && face === 'front' && top.src && hasStory) {
      setFace('back');
      sfx.tap();
      haptic(8);
      return;
    }
    place();
  };

  const onDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0) return;
    kbd.current = false;
    moved.current = false;
    const el = e.currentTarget;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* pointer sudah tidak aktif */
    }
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, t0: performance.now(), el };
    el.style.transition = 'none';
  };

  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    d.dx = e.clientX - d.x0;
    d.dy = e.clientY - d.y0;
    if (Math.abs(d.dx) > 6 || Math.abs(d.dy) > 6) moved.current = true;
    if (moved.current && !tied) d.el.style.transform = `translate(${d.dx}px, ${d.dy * 0.35}px) rotate(${d.dx / 16}deg)`;
  };

  const onEnd = (e: ReactPointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    d.el.style.transition = '';
    d.el.style.transform = '';
    /* klik yang menyusul seretan diabaikan di onTap; setelah itu benderanya dibersihkan */
    if (moved.current) later(() => (moved.current = false), 80);
    if (cancelled || !moved.current) return;
    const w = d.el.offsetWidth || 1;
    const speed = Math.abs(d.dx) / Math.max(1, performance.now() - d.t0);
    const far = Math.abs(d.dx) > w * 0.28;
    const flick = speed > 0.55 && Math.abs(d.dx) > w * 0.1;
    if (!(far || flick)) return;
    if (tied) return snap();
    // foto terakhir yang masih tertelungkup: diseret = dibalik dulu
    if (isSpecial && !revealed) return flipOrPlace();
    place();
  };

  /* ketuk (atau Enter/Spasi) = balik foto, lalu taruh di meja; klik setelah menyeret diabaikan */
  const onTap = (e: ReactMouseEvent<HTMLButtonElement>) => {
    /* detail 0 = dari keyboard, selalu dihitung */
    if (e.detail !== 0 && moved.current) {
      moved.current = false;
      return;
    }
    kbd.current = e.detail === 0;
    flipOrPlace();
  };

  const open = () => {
    if (!atLetter || finale) return;
    sfx.chime();
    haptic(15);
    setFinale(true);
  };

  /* ── kepala & petunjuk sesuai keadaan ── */
  let head: ReactNode;
  if (atLetter && total > 0) {
    head = (
      <div key="l">
        <div className={s.eyebrow}>{t.lastEyebrow}</div>
        <div className={cx(s.name, s.small)}>{t.letterBelow}</div>
      </div>
    );
  } else if (isSpecial && !tied) {
    head = revealed ? (
      <div key="f">
        <div className={s.eyebrow}>{t.favEyebrow}</div>
        <div className={cx(s.name, s.small)}>{t.fav}</div>
      </div>
    ) : (
      <div key="s">
        <div className={s.eyebrow}>{t.oneMore}</div>
        <div className={cx(s.name, s.small)}>{t.special}</div>
      </div>
    );
  } else {
    head = (
      <div key="n">
        <div className={s.eyebrow}>{total > 0 ? t.pileFor : t.letterFor}</div>
        <div className={cx(s.name, to.length > 12 && s.small)}>{to}</div>
        {from ? <div className={s.from}>{fmt(t.from, { from })}</div> : null}
      </div>
    );
  }

  let hint: string | null = null;
  if (tied) hint = t.hintBand;
  else if (atLetter) hint = finale ? null : t.hintLetter;
  else if (tugging || (idx === sticky && tugs === 1)) hint = t.stuck;
  else if (isSpecial) hint = revealed ? t.hintKeep : t.hintSpecial;
  else if (top?.src && hasStory && face === 'front') hint = t.hintFlip;
  else hint = withPhotos && idx < total - 1 ? t.hintNext : t.hintNextNote;
  const hintKey = `${tied}-${idx}-${face}-${revealed}-${tugs}-${tugging}`;
  const countTpl = (withPhotos ? t.countPhoto : t.countNote).split('{i}');

  return (
    <div className={cx(s.wrap, ready && s.ready)}>
      <div className={s.head}>{head}</div>

      <div className={s.pile}>
        <button
          ref={noteRef}
          type="button"
          className={cx(s.note, atLetter && s.noteTop)}
          onClick={open}
          tabIndex={atLetter ? 0 : -1}
          aria-hidden={!atLetter}
          aria-label={t.openLabel}
        >
          <span className={s.noteFlap} />
          <span className={s.noteEyebrow}>{total > 0 ? t.noteBottom : t.noteSingle}</span>
          <span className={s.sticker} aria-hidden>
            <Sprite name="daun-2" className={s.stickerLeaf} />
            <Sprite name="daun-4" className={s.stickerLeaf2} />
            <Sprite name="bunga-kamboja-pink" className={s.stickerFlower} />
          </span>
          <span className={cx(s.noteTo, to.length > 13 && s.long)}>{fmt(t.noteTo, { to })}</span>
          <span className={s.noteOpen}>{t.noteOpen}</span>
        </button>

        {cards.map((c, i) => {
          const k = i - idx;
          const placed = k < 0;
          const isTop = k === 0;
          const spec = i === special;
          const fav = spec && isTop && revealed;
          const slot = SLOTS[i % SLOTS.length];
          const back = isTop ? showingBack : spec && !placed;
          const style = {
            '--r': `${placed ? slot[2] : fav ? 0 : isTop ? TILT[i % 6] * 0.3 : TILT[i % 6]}deg`,
            '--x': `${placed ? slot[0] : isTop ? 0 : SHIFT[i % 6][0]}em`,
            '--y': `${placed ? slot[1] : fav ? -0.3 : isTop ? 0 : SHIFT[i % 6][1] + k * 0.32}em`,
            '--s': placed ? 0.37 : fav ? 1.08 : isTop ? 1 : Math.max(0.9, 1 - k * 0.022),
            '--tr': `${TAPE_ROT[i % 6]}deg`,
            zIndex: placed ? 2 + i : 20 + total - i,
          } as CSSProperties;
          const label = c.label || fmt(t.backNumber, { i: i + 1 });
          const story = [c.title, c.rest].filter(Boolean).join(' ');
          /* untuk pembaca layar: label + cerita tanpa titik ganda di ujung */
          const said = [c.label, story].filter(Boolean).join('. ').replace(/[.!?…]+$/, '');
          const capFront = c.label ? `: ${c.label}` : '';
          const aria = !c.src
            ? fmt(t.cardPlain, { i: i + 1, total, cap: said })
            : spec
              ? revealed
                ? t.cardFav
                : t.cardSpecial
              : back
                ? fmt(t.cardBack, { i: i + 1, cap: said })
                : fmt(story ? t.cardFront : t.cardPhoto, { i: i + 1, total, cap: capFront });
          return (
            <button
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              type="button"
              className={cx(
                s.card,
                placed && s.placed,
                k > 3 && s.deep,
                isTop && !tied && s.top,
                back && s.flipped,
                fav && s.fav,
                isTop && tugging && s.tug,
              )}
              style={style}
              tabIndex={isTop && !tied ? 0 : -1}
              aria-hidden={!isTop || tied}
              aria-label={aria}
              onPointerDown={isTop ? onDown : undefined}
              onPointerMove={isTop ? onMove : undefined}
              onPointerUp={isTop ? (e) => onEnd(e, false) : undefined}
              onPointerCancel={isTop ? (e) => onEnd(e, true) : undefined}
              onClick={isTop ? onTap : undefined}
            >
              <span className={s.flip}>
                {/* ── depan ── */}
                <span className={cx(s.face, s.front)}>
                  <Sprite name={`polaroid-selotip-${(i % 4) + 1}`} className={s.tape} />
                  {c.src ? (
                    <span className={s.photo}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.src} alt="" draggable={false} />
                    </span>
                  ) : (
                    <span className={cx(s.photo, s.blank)} style={{ '--paper': TINT[i % 6] } as CSSProperties}>
                      {c.label ? <span className={s.blankLabel}>{c.label}</span> : null}
                      <span className={cx(s.quote, story.length > 70 && s.quoteLong)}>{story}</span>
                      <Sprite name="bunga-melati" className={s.blankFlower} />
                    </span>
                  )}
                  <span className={s.cap}>{c.src ? c.label : from ? `— ${from}` : ''}</span>
                </span>

                {/* ── punggung foto: kertas cetak dengan tulisan tangan ── */}
                <span className={cx(s.face, s.back)} aria-hidden>
                  <span className={s.print} aria-hidden>
                    {Array.from({ length: 7 }, (_, n) => (
                      <span key={n}>{`${t.backPrint} · ${t.backPrint} · ${t.backPrint}`}</span>
                    ))}
                  </span>
                  {isTop && back ? (
                    <span className={s.backBody}>
                      <span className={s.backLabel}>{label}</span>
                      {c.src && c.title ? (
                        <Ink
                          text={c.title}
                          delay={0.35}
                          className={cx(s.backTitle, c.title.length > 46 && s.backTitleLong, !c.rest && c.title.length <= 34 && s.backTitleShort)}
                        />
                      ) : null}
                      {c.src && c.rest ? <Ink text={c.rest} delay={0.35 + c.title.split(/\s+/).length * 0.07 + 0.25} className={s.backRest} /> : null}
                      {spec ? <span className={s.backSpecial}>{t.specialBack}</span> : null}
                    </span>
                  ) : null}
                  {i === sticky ? (
                    <>
                      <span className={s.stain} aria-hidden />
                      {isTop && back ? <span className={s.stainNote}>{t.stain}</span> : null}
                    </>
                  ) : (
                    <Doodle i={i} />
                  )}
                  <span className={s.lab}>{`N° ${String(i + 1).padStart(2, '0')} · 4R`}</span>
                </span>
              </span>
            </button>
          );
        })}

        {/* karet gelang + secarik kertas yang terselip di bawahnya */}
        {total > 0 ? (
          <>
            <span className={cx(s.slip, !tied && s.slipGone)} aria-hidden>
              <span className={s.slipTo}>{fmt(t.slipTo, { to })}</span>
              <span className={s.slipLine}>{fmt(withPhotos ? t.slipPhotos : t.slipNotes, { n: total })}</span>
              {total > 1 ? <span className={s.slipPs}>{t.slipPs}</span> : null}
            </span>
            <button
              ref={bandRef}
              type="button"
              className={cx(s.band, !tied && s.bandGone)}
              onClick={(e) => {
                kbd.current = e.detail === 0;
                snap();
              }}
              tabIndex={tied ? 0 : -1}
              aria-hidden={!tied}
              aria-label={t.bandLabel}
            >
              <Sprite name="polaroid-karet" className={s.bandImg} />
            </button>
          </>
        ) : null}
      </div>

      <div className={s.foot}>
        {!atLetter && !tied && total > 0 ? (
          <div className={s.count} aria-live="polite">
            {fmt(countTpl[0], { total })}
            <b>{idx + 1}</b>
            {fmt(countTpl[1] ?? '', { total })}
          </div>
        ) : null}
      </div>

      {hint ? <Hint key={hintKey}>{hint}</Hint> : null}

      {/* penunjuk sentuh kalau penerima diam: karet → foto teratas → surat */}
      <TapCue target={bandRef} show={tied} />
      <TapCue target={topRef} show={!tied && !atLetter && !tugging} delay={3600} at={{ x: 0.5, y: 0.45 }} />
      <TapCue target={noteRef} show={atLetter && !finale && total > 0} />

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={total > 0 ? t.finaleBottom : t.finaleSingle}
          flower="bunga-kamboja-pink"
          theme={{ bg: `url(${BACKDROP}) center bottom / cover no-repeat`, ink: meta.palette.ink, paper: '#fffaf0', paperInk: '#3b2a22' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
