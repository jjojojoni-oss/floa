'use client';

import { type CSSProperties, type RefObject, useEffect, useRef, useState } from 'react';
import s from './TapCue.module.css';

type Kind = 'tap' | 'hold' | 'drag';

/**
 * Penunjuk "sentuh di sini": cincin berdenyut + tangan kecil tepat di atas objek yang harus disentuh.
 * Muncul hanya kalau penerima diam `delay` ms (tidak menyentuh layar) selama `show` benar, dan hilang
 * begitu layar disentuh. Tidak menangkap ketukan (pointer-events: none).
 *
 * Pasang di dalam Stage, di mana saja: posisinya dihitung dari kotak `target` setiap 250 ms,
 * jadi tetap menempel walau objeknya bergerak.
 *
 * - kind 'tap'  : tangan mengetuk
 * - kind 'hold' : tangan menekan lama, cincin mengisi
 * - kind 'drag' : tangan menggeser ke arah `dir` (dalam em, mis. { x: 0, y: -4 } = ke atas)
 */
export function TapCue({
  target,
  show = true,
  kind = 'tap',
  delay = 2800,
  dir = { x: 0, y: -4 },
  at = { x: 0.5, y: 0.5 },
}: {
  target: RefObject<HTMLElement | null>;
  show?: boolean;
  kind?: Kind;
  delay?: number;
  dir?: { x: number; y: number };
  /** titik di dalam target (0..1), default tengah */
  at?: { x: number; y: number };
}) {
  const self = useRef<HTMLDivElement>(null);
  const [idle, setIdle] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number; r: number } | null>(null);

  // diam berapa lama?
  useEffect(() => {
    if (!show) {
      setIdle(false);
      return;
    }
    let t: ReturnType<typeof setTimeout>;
    const arm = () => {
      setIdle(false);
      clearTimeout(t);
      t = setTimeout(() => setIdle(true), delay);
    };
    arm();
    window.addEventListener('pointerdown', arm, true);
    window.addEventListener('keydown', arm, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener('pointerdown', arm, true);
      window.removeEventListener('keydown', arm, true);
    };
  }, [show, delay]);

  // ikuti posisi target
  useEffect(() => {
    if (!show || !idle) return;
    const measure = () => {
      const el = target.current;
      const me = self.current;
      const host = me?.offsetParent as HTMLElement | null;
      if (!el || !host) return setPos(null);
      const a = el.getBoundingClientRect();
      const b = host.getBoundingClientRect();
      if (!a.width || !a.height) return setPos(null);
      setPos({ x: a.left - b.left + a.width * at.x, y: a.top - b.top + a.height * at.y, r: Math.min(a.width, a.height) });
    };
    measure();
    const i = setInterval(measure, 250);
    return () => clearInterval(i);
  }, [show, idle, target, at.x, at.y]);

  const on = show && idle && pos;
  return (
    <div
      ref={self}
      aria-hidden
      className={[s.cue, on ? s.on : '', s[kind]].join(' ')}
      style={
        pos
          ? ({
              left: pos.x,
              top: pos.y,
              '--ring': `${Math.max(48, Math.min(pos.r * 0.9, 120))}px`,
              '--dx': `${dir.x}em`,
              '--dy': `${dir.y}em`,
            } as CSSProperties)
          : undefined
      }
    >
      <span className={s.ring} />
      <span className={s.ring2} />
      <svg className={s.hand} viewBox="0 0 32 40">
        {/* ujung telunjuk di (8, 2). Digambar dua kali: garis tepi tebal di bawah, isi terang di atas */}
        <g fill="#3a231b" stroke="#3a231b" strokeWidth="3" strokeLinejoin="round">
          <rect x="5" y="2" width="6.4" height="21" rx="3.2" />
          <rect x="10.6" y="11.5" width="5.6" height="10" rx="2.8" />
          <rect x="15.6" y="12.5" width="5.6" height="10" rx="2.8" />
          <rect x="20.4" y="14.5" width="5" height="9" rx="2.5" />
          <path d="M5 19 Q3.5 25 7 31 L10 37 H23 Q26 33 25.6 27 L25.4 19 Z" />
          <rect x="1.2" y="19.5" width="6" height="11" rx="3" transform="rotate(-28 4.2 25)" />
        </g>
        <g fill="#fffaf2">
          <rect x="5" y="2" width="6.4" height="21" rx="3.2" />
          <rect x="10.6" y="11.5" width="5.6" height="10" rx="2.8" />
          <rect x="15.6" y="12.5" width="5.6" height="10" rx="2.8" />
          <rect x="20.4" y="14.5" width="5" height="9" rx="2.5" />
          <path d="M5 19 Q3.5 25 7 31 L10 37 H23 Q26 33 25.6 27 L25.4 19 Z" />
          <rect x="1.2" y="19.5" width="6" height="11" rx="3" transform="rotate(-28 4.2 25)" />
        </g>
      </svg>
    </div>
  );
}
