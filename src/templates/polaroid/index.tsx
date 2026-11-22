'use client';

import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from 'react';
import { Finale, Hint, Stage, cx, haptic, sfx, useTimers } from '../kit';
import type { TemplateProps } from '../types';
import { meta } from './meta';
import s from './style.module.css';

export default function Polaroid(props: TemplateProps) {
  const [run, setRun] = useState(0);
  return (
    <Stage {...meta.palette}>
      <Scene key={run} {...props} onReplay={() => setRun((v) => v + 1)} />
    </Stage>
  );
}

type Card = { src: string | null; cap: string };
type Drag = { id: number; x0: number; y0: number; dx: number; dy: number; t0: number; el: HTMLElement };

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
const TAPE = ['#ef6f4c', '#f2c94c', '#7fb2a0', '#e9a0b0', '#8fa8d6', '#f0a35e'];
const TINT = ['#f7c9b6', '#f6dc9c', '#bcd9cb', '#f1c3cf', '#c5d2ee', '#f5cfa4'];

function Scene({ data, mode, onReplay }: TemplateProps & { onReplay: () => void }) {
  const photos = data.photos.filter(Boolean).slice(0, 6);
  const notes = data.notes.map((n) => n.trim());
  const cards: Card[] = photos.length
    ? photos.map((src, i) => ({ src, cap: notes[i] ?? '' }))
    : notes
        .filter(Boolean)
        .slice(0, 6)
        .map((cap) => ({ src: null, cap }));
  const total = cards.length;

  /** jumlah kartu yang sudah dilempar; kartu ke-`idx` adalah yang teratas */
  const [idx, setIdx] = useState(0);
  const [dirs, setDirs] = useState<number[]>([]);
  const [finale, setFinale] = useState(false);
  const drag = useRef<Drag | null>(null);
  const moved = useRef(false);
  const later = useTimers();

  const atLetter = idx >= total;
  const to = data.to.trim() || 'kamu';
  const from = data.from.trim();

  const toss = (dir: number) => {
    if (atLetter) return;
    const i = idx;
    setDirs((d) => {
      const n = d.slice();
      n[i] = dir;
      return n;
    });
    setIdx(i + 1);
    sfx.whoosh();
    haptic(12);
    if (i + 1 >= total) later(() => sfx.chime(), 420);
  };

  const onDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0) return;
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
    if (moved.current) d.el.style.transform = `translate(${d.dx}px, ${d.dy * 0.35}px) rotate(${d.dx / 16}deg)`;
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
    if (far || flick) toss(d.dx > 0 ? 1 : -1);
  };

  /* ketuk (atau Enter/Spasi) = lempar bergantian kanan-kiri; klik setelah menyeret diabaikan */
  const onTap = (e: ReactMouseEvent<HTMLButtonElement>) => {
    /* detail 0 = dari keyboard, selalu dihitung */
    if (e.detail !== 0 && moved.current) {
      moved.current = false;
      return;
    }
    toss(idx % 2 === 0 ? 1 : -1);
  };

  const open = () => {
    if (!atLetter || finale) return;
    sfx.chime();
    haptic(15);
    setFinale(true);
  };

  return (
    <div className={s.wrap}>
      <span className={s.ring} />
      <span className={cx(s.scrap, s.scrap1)} />
      <span className={cx(s.scrap, s.scrap2)} />
      <span className={cx(s.scrap, s.scrap3)} />

      <div className={s.head}>
        {atLetter && total > 0 ? (
          <div key="l">
            <div className={s.eyebrow}>tinggal satu lagi</div>
            <div className={cx(s.name, s.small)}>Ada surat di paling bawah.</div>
          </div>
        ) : (
          <div key="n">
            <div className={s.eyebrow}>{total > 0 ? 'setumpuk kenangan untuk' : 'ada surat untuk'}</div>
            <div className={cx(s.name, to.length > 12 && s.small)}>{to}</div>
            {from ? <div className={s.from}>dari {from}</div> : null}
          </div>
        )}
      </div>

      <div className={s.pile}>
        <button
          type="button"
          className={cx(s.note, atLetter && s.noteTop)}
          onClick={open}
          tabIndex={atLetter ? 0 : -1}
          aria-hidden={!atLetter}
          aria-label="Buka surat di paling bawah"
        >
          <span className={s.noteFlap} />
          <span className={s.noteEyebrow}>{total > 0 ? 'surat di paling bawah' : 'sepucuk surat'}</span>
          <svg className={s.sticker} viewBox="0 0 40 40" aria-hidden>
            <circle cx="20" cy="20" r="19" fill="var(--accent)" />
            <circle cx="20" cy="20" r="15.5" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1" strokeDasharray="2 2.6" />
            <path d="M20,29C9,21 12,12 20,17C28,12 31,21 20,29Z" fill="#fff" />
          </svg>
          <span className={cx(s.noteTo, to.length > 13 && s.long)}>Buat {to}</span>
          <span className={s.noteOpen}>ketuk untuk membuka</span>
        </button>

        {cards.map((c, i) => {
          const k = i - idx;
          const gone = k < 0;
          const top = k === 0;
          const style = {
            '--r': `${top ? TILT[i % 6] * 0.3 : TILT[i % 6]}deg`,
            '--x': `${top ? 0 : SHIFT[i % 6][0]}em`,
            '--y': `${top ? 0 : SHIFT[i % 6][1] + k * 0.32}em`,
            '--s': top ? 1 : Math.max(0.9, 1 - k * 0.022),
            '--dir': dirs[i] ?? 1,
            '--tape': TAPE[i % 6],
            zIndex: gone ? 30 + i : total - i,
          } as CSSProperties;
          return (
            <button
              key={i}
              type="button"
              className={cx(s.card, gone && s.gone, k > 3 && s.deep, top && s.top)}
              style={style}
              tabIndex={top ? 0 : -1}
              aria-hidden={!top}
              aria-label={`Foto ${i + 1} dari ${total}${c.cap ? `: ${c.cap}` : ''}. Ketuk atau geser untuk lanjut.`}
              onPointerDown={top ? onDown : undefined}
              onPointerMove={top ? onMove : undefined}
              onPointerUp={top ? (e) => onEnd(e, false) : undefined}
              onPointerCancel={top ? (e) => onEnd(e, true) : undefined}
              onClick={top ? onTap : undefined}
            >
              <span className={s.tape} />
              {c.src ? (
                <span className={s.photo}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.src} alt="" draggable={false} />
                </span>
              ) : (
                <span className={cx(s.photo, s.blank)} style={{ background: TINT[i % 6] }}>
                  <span className={s.quote}>{c.cap}</span>
                </span>
              )}
              <span className={s.cap}>{c.src ? c.cap : from ? `— ${from}` : ''}</span>
            </button>
          );
        })}
      </div>

      <div className={s.foot}>
        {!atLetter ? (
          <div className={s.count} aria-live="polite">
            <b>{idx + 1}</b> / {total}
          </div>
        ) : null}
      </div>

      {idx === 0 && total > 0 ? <Hint>Geser atau ketuk fotonya</Hint> : null}
      {atLetter && !finale ? <Hint key="s">Ketuk suratnya</Hint> : null}

      {finale ? (
        <Finale
          data={data}
          mode={mode}
          eyebrow={total > 0 ? 'Surat di paling bawah' : 'Surat untukmu'}
          theme={{ bg: 'linear-gradient(#e3ede6, #cddcd2)', ink: '#22302a', paper: '#fffefa', paperInk: '#22302a' }}
          onReplay={onReplay}
        />
      ) : null}
    </div>
  );
}
