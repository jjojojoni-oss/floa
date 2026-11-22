'use client';

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type { GiftData, TemplateMode } from '../types';
import s from './kit.module.css';
import { haptic, isMuted, setMuted, sfx, subscribeMuted } from './sfx';

export { sfx, haptic } from './sfx';

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

/* ───────────────────────── Stage ───────────────────────── */

export type BackdropName = 'pagi' | 'senja' | 'malam';

type StageProps = {
  children: ReactNode;
  /** latar lukisan: 'pagi' | 'senja' | 'malam', atau URL gambar sendiri */
  backdrop?: BackdropName | (string & {});
  /** warna dunia template; juga tersedia sebagai var(--bg) / var(--ink) / var(--accent) */
  bg: string;
  ink: string;
  accent: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Pembungkus wajib semua template. Mengisi penuh induknya, dan membuat `1em`
 * di dalamnya selalu proporsional dengan ukuran kotak (≈16px di HP 390px).
 */
export function Stage({ children, bg, ink, accent, backdrop, className, style }: StageProps) {
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false);
  return (
    <div
      className={cx(s.stage, className)}
      style={{ '--bg': bg, '--ink': ink, '--accent': accent, ...style } as CSSProperties}
    >
      {backdrop ? <div className={s.backdrop} style={{ backgroundImage: `url(${backdropUrl(backdrop)})` }} /> : null}
      <div className={s.inner}>{children}</div>
      <div className={s.vignette} aria-hidden />
      <div className={s.grain} aria-hidden />
      <button
        type="button"
        className={s.mute}
        aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'}
        onClick={() => setMuted(!muted)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9.5v5h3.5L12 18V6L7.5 9.5H4z" fill="currentColor" stroke="none" />
          {muted ? <path d="M16 9.5l5 5m0-5l-5 5" /> : <path d="M15.5 9a4.2 4.2 0 010 6M18 6.5a7.6 7.6 0 010 11" />}
        </svg>
      </button>
    </div>
  );
}

/* ───────────────────────── seni lukis ───────────────────────── */

export function backdropUrl(name: string) {
  return name.startsWith('/') || name.startsWith('http') ? name : `/art/bg-${name}.webp`;
}

/** Satu potong lukisan dari public/art (bunga, daun, benda). Ukuran & posisi lewat className/style. */
export function Sprite({ name, className, style }: { name: string; className?: string; style?: CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/art/${name}.webp`} alt="" draggable={false} decoding="async" className={cx(s.sprite, className)} style={style} />;
}

/**
 * true setelah semua lukisan yang disebut selesai dimuat (atau setelah batas waktu),
 * supaya adegan muncul utuh, bukan lapis demi lapis.
 */
export function useArtReady(names: string[], timeoutMs = 2500) {
  const [ready, setReady] = useState(false);
  const key = names.join('|');
  useEffect(() => {
    let alive = true;
    let left = names.length;
    const done = () => {
      left -= 1;
      if (left <= 0 && alive) setReady(true);
    };
    if (!left) setReady(true);
    const imgs = names.map((n) => {
      const im = new Image();
      im.onload = done;
      im.onerror = done;
      im.src = n.startsWith('/') ? n : `/art/${n}.webp`;
      return im;
    });
    const t = setTimeout(() => alive && setReady(true), timeoutMs);
    return () => {
      alive = false;
      clearTimeout(t);
      imgs.forEach((im) => {
        im.onload = null;
        im.onerror = null;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, timeoutMs]);
  return ready;
}

/** Gambar kartu katalog: satu lukisan utuh `public/art/cover-<id>.webp`. */
export function CoverImage({ id }: { id: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/art/cover-${id}.webp`} alt="" draggable={false} loading="lazy" decoding="async" className={s.cover} />;
}

/** Kelopak yang melayang turun pelan di latar. kinds = nama sprite tanpa awalan "kelopak-". */
export function Petals({ kinds = ['putih', 'pink'], count = 9 }: { kinds?: string[]; count?: number }) {
  return (
    <div className={s.petals} aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const r = (n: number) => ((Math.sin((i + 1) * 12.9898 * n) * 43758.5453) % 1 + 1) % 1;
        const vars = {
          '--x': `${Math.round(r(1) * 96)}%`,
          '--s': `${(1 + r(2) * 1.1).toFixed(2)}em`,
          '--d': `${(9 + r(3) * 9).toFixed(1)}s`,
          '--delay': `${(-r(4) * 16).toFixed(1)}s`,
          '--r0': `${Math.round(r(5) * 360)}deg`,
          '--sway': `${(r(6) * 8 - 4).toFixed(1)}em`,
          '--o': (0.55 + r(7) * 0.4).toFixed(2),
        } as CSSProperties;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={`/art/kelopak-${kinds[i % kinds.length]}.webp`} alt="" style={vars} />
        );
      })}
    </div>
  );
}

/* ───────────────────────── Hint ───────────────────────── */

/** Petunjuk kecil di bawah layar: "Ketuk kuncupnya", "Tahan untuk meniup", … */
export function Hint({ children }: { children: ReactNode }) {
  return (
    <div className={s.hint} role="status">
      <span className={s.hintDot} />
      {children}
    </div>
  );
}

/* ───────────────────────── Confetti ───────────────────────── */

type Particle = { x: number; y: number; vx: number; vy: number; r: number; w: number; h: number; vr: number; c: string; life: number; shape: number };

/**
 * Ledakan konfeti. Ganti nilai `burst` (mis. dinaikkan 1) untuk meledakkan lagi.
 * `origin` dalam 0..1 relatif ke stage (default: tengah-bawah, menyembur ke atas).
 */
export function Confetti({
  burst,
  colors = ['#f2542d', '#ffd36e', '#ffc9cf', '#2f6b4f', '#bfddf5', '#ffffff'],
  origin = { x: 0.5, y: 0.62 },
  count = 110,
  shapes = 'mix',
}: {
  burst: number;
  colors?: string[];
  origin?: { x: number; y: number };
  count?: number;
  shapes?: 'mix' | 'hearts';
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!burst) return;
    const canvas = ref.current;
    if (!canvas) return;
    const g = canvas.getContext('2d');
    if (!g) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const unit = W / 390;
    const n = reduce ? Math.round(count / 4) : count;
    const ps: Particle[] = Array.from({ length: n }, () => {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
      const sp = (6 + Math.random() * 11) * unit;
      return {
        x: W * origin.x,
        y: H * origin.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp * 1.25,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        w: (5 + Math.random() * 6) * unit,
        h: (8 + Math.random() * 8) * unit,
        c: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        shape: shapes === 'hearts' ? 2 : Math.random() < 0.25 ? 1 : 0,
      };
    });
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(2.2, (now - last) / 16.7);
      last = now;
      g.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of ps) {
        p.vy += 0.32 * unit * dt;
        p.vx *= 0.99;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.r += p.vr * dt;
        if (p.y > H * 0.55 && p.vy > 0) p.life -= 0.012 * dt;
        if (p.life <= 0 || p.y > H + 30) continue;
        alive = true;
        g.save();
        g.globalAlpha = Math.max(0, Math.min(1, p.life));
        g.translate(p.x, p.y);
        g.rotate(p.r);
        g.fillStyle = p.c;
        if (p.shape === 0) {
          g.scale(1, Math.cos(p.r * 2.2));
          g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else if (p.shape === 1) {
          g.beginPath();
          g.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          g.fill();
        } else {
          const k = p.w / 9;
          g.beginPath();
          g.moveTo(0, 3 * k);
          g.bezierCurveTo(-8 * k, -3 * k, -3.5 * k, -8 * k, 0, -3.5 * k);
          g.bezierCurveTo(3.5 * k, -8 * k, 8 * k, -3 * k, 0, 3 * k);
          g.fill();
        }
        g.restore();
      }
      if (alive) raf = requestAnimationFrame(tick);
      else g.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burst]);

  return <canvas ref={ref} className={s.confetti} aria-hidden />;
}

/* ───────────────────────── HoldButton ───────────────────────── */

/**
 * Tekan & tahan sampai penuh → onComplete. `onProgress` (0..1) untuk animasi yang mengikuti.
 * Anak-anaknya adalah isi tombol; beri ukuran lewat className/style.
 */
export function HoldButton({
  ms = 1400,
  onComplete,
  onProgress,
  children,
  className,
  style,
  label,
}: {
  ms?: number;
  onComplete: () => void;
  onProgress?: (p: number) => void;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  label: string;
}) {
  const [p, setP] = useState(0);
  const raf = useRef(0);
  const start = useRef(0);
  const done = useRef(false);
  const cbs = useRef({ onComplete, onProgress });
  cbs.current = { onComplete, onProgress };

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (done.current) return;
    setP(0);
    cbs.current.onProgress?.(0);
  }, []);

  const begin = useCallback(() => {
    if (done.current) return;
    start.current = performance.now();
    const step = (now: number) => {
      const v = Math.min(1, (now - start.current) / ms);
      setP(v);
      cbs.current.onProgress?.(v);
      if (v >= 1) {
        done.current = true;
        haptic(30);
        cbs.current.onComplete();
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [ms]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const C = 2 * Math.PI * 47;
  return (
    <button
      type="button"
      aria-label={label}
      className={cx(s.hold, className)}
      style={style}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        begin();
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) begin();
      }}
      onKeyUp={stop}
    >
      <svg className={s.holdRing} viewBox="0 0 100 100" aria-hidden>
        <circle className={s.holdTrack} cx="50" cy="50" r="47" />
        <circle className={s.holdFill} cx="50" cy="50" r="47" strokeDasharray={C} strokeDashoffset={C * (1 - p)} />
      </svg>
      {children}
    </button>
  );
}

/* ───────────────────────── Typewriter ───────────────────────── */

/** Teks yang muncul huruf demi huruf, tanpa menggeser layout. */
export function Typewriter({
  text,
  speed = 28,
  start = true,
  onDone,
  className,
}: {
  text: string;
  speed?: number;
  start?: boolean;
  onDone?: () => void;
  className?: string;
}) {
  const [n, setN] = useState(0);
  const cb = useRef(onDone);
  cb.current = onDone;

  useEffect(() => {
    setN(0);
  }, [text]);

  useEffect(() => {
    if (!start) return;
    if (n >= text.length) {
      cb.current?.();
      return;
    }
    const ch = text[n];
    const delay = ch === '\n' ? speed * 6 : /[.,!?…]/.test(ch) ? speed * 4 : speed;
    const t = setTimeout(() => setN((v) => v + 1), delay);
    return () => clearTimeout(t);
  }, [n, start, text, speed]);

  return (
    <span className={cx(s.tw, className)}>
      {text.slice(0, n)}
      {n < text.length && start ? <span className={s.twCaret} /> : null}
      <span className={s.twGhost} aria-hidden>
        {text.slice(n)}
      </span>
    </span>
  );
}

/* ───────────────────────── Finale ───────────────────────── */

export type FinaleTheme = {
  /** latar layar penutup (warna/gradien CSS) */
  bg?: string;
  /** latar lukisan untuk layar penutup */
  backdrop?: BackdropName | (string & {});
  /** warna teks di atas latar */
  ink?: string;
  /** warna kertas surat */
  paper?: string;
  /** warna tulisan di kertas */
  paperInk?: string;
};

/**
 * Layar penutup yang dipakai semua template: judul, surat, foto, tanda tangan,
 * tombol putar ulang. Cukup panggil saat interaksi template selesai.
 */
export function Finale({
  data,
  mode,
  theme,
  eyebrow = 'Surat untukmu',
  flower = 'bunga-kamboja',
  onReplay,
  children,
}: {
  data: GiftData;
  mode: TemplateMode;
  theme?: FinaleTheme;
  eyebrow?: string;
  /** bunga lukisan yang terselip di sudut surat (nama sprite), atau null untuk tanpa hiasan */
  flower?: string | null;
  onReplay?: () => void;
  /** tambahan opsional di antara surat dan foto */
  children?: ReactNode;
}) {
  const [zoom, setZoom] = useState<string | null>(null);
  const photos = data.photos.filter(Boolean);
  const vars = {
    '--f-bg': theme?.bg,
    '--f-ink': theme?.ink,
    '--f-paper': theme?.paper,
    '--f-paper-ink': theme?.paperInk,
    ...(theme?.backdrop ? { backgroundImage: `url(${backdropUrl(theme.backdrop)})` } : null),
  } as CSSProperties;

  return (
    <>
      <div className={s.finale} style={vars} data-finale>
        <div className={s.finaleBody}>
          <div className={s.eyebrow}>{eyebrow}</div>
          {data.title ? <h1 className={s.fTitle}>{data.title}</h1> : null}
          <div className={s.letter}>
            {flower ? (
              <div className={s.deco} aria-hidden>
                <Sprite name="daun-2" className={s.decoLeaf} />
                <Sprite name="daun-4" className={s.decoLeaf2} />
                <Sprite name={flower} className={s.decoFlower} />
              </div>
            ) : null}
            {data.to ? <div className={s.salam}>Untuk {data.to},</div> : null}
            <div className={s.pesan}>{data.message}</div>
            {data.from ? (
              <div className={s.ttd}>
                dari,
                <br />
                <b>{data.from}</b>
              </div>
            ) : null}
          </div>
          {children}
          {photos.length ? (
            <div className={s.photos}>
              {photos.map((src, i) => (
                <button
                  type="button"
                  key={src + i}
                  className={s.photo}
                  onClick={() => {
                    sfx.tap();
                    setZoom(src);
                  }}
                  aria-label={`Perbesar foto ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" loading="lazy" draggable={false} />
                </button>
              ))}
            </div>
          ) : null}
          <div className={s.fActions}>
            {onReplay ? (
              <button
                type="button"
                className={s.replay}
                onClick={() => {
                  sfx.tap();
                  onReplay();
                }}
              >
                ↺ Putar ulang
              </button>
            ) : null}
            {mode === 'live' ? (
              <a className={s.made} href="/?ref=kado" target="_blank" rel="noopener">
                Dibuat dengan <b>floa</b> · bikin punyamu →
              </a>
            ) : null}
          </div>
        </div>
      </div>
      {zoom ? (
        <div className={s.lightbox} onClick={() => setZoom(null)} role="dialog" aria-label="Foto diperbesar">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom} alt="" />
        </div>
      ) : null}
    </>
  );
}

/* ───────────────────────── util kecil ───────────────────────── */

/** setTimeout yang otomatis dibersihkan saat komponen dilepas. */
export function useTimers() {
  const ids = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(
    () => () => {
      ids.current.forEach(clearTimeout);
      ids.current = [];
    },
    [],
  );
  return useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    ids.current.push(id);
    return id;
  }, []);
}
