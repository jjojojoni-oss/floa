'use client';

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type { GiftData, TemplateMode } from '../types';
import s from './kit.module.css';
import { haptic, isMuted, setMuted, sfx, subscribeMuted } from './sfx';
import { useLocale } from '@/i18n/client';
import { fmt } from '@/i18n/fmt';
import { drawKeepsake } from '@/lib/keepsake';
import type { Locale } from '@/i18n/config';

/** Teks bersama kit dalam tiga bahasa. {from}/{to} diisi lewat fmt(). */
const KIT_ID = {
  soundOn: 'Nyalakan suara',
  soundOff: 'Matikan suara',
  letterFor: 'Surat untukmu',
  to: 'Untuk',
  from: 'dari,',
  replay: 'Putar ulang',
  madeWith: 'Dibuat dengan',
  makeYours: 'bikin punyamu',
  zoom: 'Perbesar foto',
  zoomed: 'Foto diperbesar',
  you: 'kamu',
  showAll: 'Tampilkan semua',
  memories: 'Kenangan',
  special: 'Satu lagi, yang paling spesial',
  keepsake: 'Simpan kenang-kenangan',
  keepsakeMaking: 'Menyiapkan…',
  keepsakeEyebrow: 'Sepucuk kado untuk',
  fromName: 'dari {from}',
  reply: 'Balas lewat WhatsApp',
  replyText: 'Kadonya udah aku buka. Makasih ya, {from}.',
  replyTextAnon: 'Kadonya udah aku buka. Makasih ya.',
  introFor: 'untuk {to}',
  introNext: 'ketuk untuk lanjut',
  introSkip: 'Lewati',
};
type KitText = typeof KIT_ID;

const KIT: Record<Locale, KitText> = {
  id: KIT_ID,
  ms: {
    soundOn: 'Hidupkan bunyi',
    soundOff: 'Matikan bunyi',
    letterFor: 'Surat untukmu',
    to: 'Untuk',
    from: 'daripada,',
    replay: 'Main semula',
    madeWith: 'Dibuat dengan',
    makeYours: 'buat milikmu',
    zoom: 'Besarkan foto',
    zoomed: 'Foto dibesarkan',
    you: 'awak',
    showAll: 'Tunjuk semua',
    memories: 'Kenangan',
    special: 'Satu lagi, yang paling istimewa',
    keepsake: 'Simpan kenangan',
    keepsakeMaking: 'Menyediakan…',
    keepsakeEyebrow: 'Sepucuk hadiah untuk',
    fromName: 'daripada {from}',
    reply: 'Balas melalui WhatsApp',
    replyText: 'Hadiahnya dah aku buka. Terima kasih ya, {from}.',
    replyTextAnon: 'Hadiahnya dah aku buka. Terima kasih ya.',
    introFor: 'untuk {to}',
    introNext: 'ketik untuk teruskan',
    introSkip: 'Langkau',
  },
  en: {
    soundOn: 'Turn sound on',
    soundOff: 'Turn sound off',
    letterFor: 'A letter for you',
    to: 'Dear',
    from: 'love,',
    replay: 'Play again',
    madeWith: 'Made with',
    makeYours: 'make your own',
    zoom: 'Enlarge photo',
    zoomed: 'Enlarged photo',
    you: 'you',
    showAll: 'Show all',
    memories: 'Memories',
    special: 'One more, the most special one',
    keepsake: 'Save a keepsake',
    keepsakeMaking: 'Preparing…',
    keepsakeEyebrow: 'A little gift for',
    fromName: 'from {from}',
    reply: 'Reply on WhatsApp',
    replyText: 'I just opened your gift. Thank you, {from}.',
    replyTextAnon: 'I just opened your gift. Thank you.',
    introFor: 'for {to}',
    introNext: 'tap to continue',
    introSkip: 'Skip',
  },
};

const DATE_TAG: Record<Locale, string> = { id: 'id-ID', ms: 'ms-MY', en: 'en-US' };

export function useKitText() {
  return KIT[useLocale()];
}

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
  const k = useKitText();
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
        aria-label={muted ? k.soundOn : k.soundOff}
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

/** Paragraf surat dipisah oleh baris kosong. */
function paragraphs(msg: string) {
  return msg
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => setR(window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);
  return r;
}

/**
 * Layar penutup yang dipakai semua template. Surat terbuka pelan dan paragrafnya muncul
 * satu per satu (ketuk untuk mempercepat), lalu tanda tangan, kenangan foto, kartu
 * kenang-kenangan yang bisa disimpan, dan (di kado sungguhan) tombol balas.
 */
export function Finale({
  data,
  mode,
  theme,
  eyebrow,
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
  /** tambahan opsional di antara surat dan foto (muncul setelah surat selesai dibaca) */
  children?: ReactNode;
}) {
  const [zoom, setZoom] = useState<string | null>(null);
  const k = useKitText();
  eyebrow = eyebrow ?? k.letterFor;
  const photos = data.photos.filter(Boolean);
  const paras = useMemo(() => paragraphs(data.message), [data.message]);
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);
  const done = reduce || shown >= paras.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const lastRef = useRef<HTMLParagraphElement>(null);

  // paragraf muncul satu per satu; jedanya mengikuti panjang paragraf sebelumnya (kecepatan baca santai)
  useEffect(() => {
    if (done) return;
    const wait = shown === 0 ? 1600 : Math.min(5200, Math.max(1400, paras[shown - 1].length * 40));
    const t = setTimeout(() => setShown((n) => n + 1), wait);
    return () => clearTimeout(t);
  }, [shown, done, paras]);

  // paragraf baru ikut digulir ke pandangan
  useEffect(() => {
    if (shown > 1) lastRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [shown]);

  const visible = done ? paras.length : shown;
  const strip = photos.length > 1 ? photos.slice(0, -1) : [];
  const special = photos.length ? photos[photos.length - 1] : null;
  const from = data.from.trim();
  const replyText = from ? fmt(k.replyText, { from }) : k.replyTextAnon;

  const vars = {
    '--f-bg': theme?.bg,
    '--f-ink': theme?.ink,
    '--f-paper': theme?.paper,
    '--f-paper-ink': theme?.paperInk,
    ...(theme?.backdrop ? { backgroundImage: `url(${backdropUrl(theme.backdrop)})` } : null),
  } as CSSProperties;

  const photoBtn = (src: string, i: number, className: string) => (
    <button
      type="button"
      key={src + i}
      className={className}
      onClick={() => {
        sfx.tap();
        setZoom(src);
      }}
      aria-label={`${k.zoom} ${i + 1}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading="lazy" draggable={false} />
    </button>
  );

  return (
    <>
      <div className={s.finale} style={vars} data-finale ref={rootRef}>
        <div className={s.finaleBody}>
          <div className={s.eyebrow}>{eyebrow}</div>
          {data.title ? <h1 className={s.fTitle}>{data.title}</h1> : null}
          <div className={cx(s.letter, !done && s.reading)} onClick={() => !done && setShown((n) => Math.min(paras.length, n + 1))}>
            {flower ? (
              <div className={s.deco} aria-hidden>
                <Sprite name="daun-2" className={s.decoLeaf} />
                <Sprite name="daun-4" className={s.decoLeaf2} />
                <Sprite name={flower} className={s.decoFlower} />
              </div>
            ) : null}
            {data.to ? <div className={s.salam}>{k.to} {data.to},</div> : null}
            {paras.length ? (
              <div className={s.pesan} aria-live="polite">
                {paras.slice(0, visible).map((p, i) => (
                  <p key={i} ref={i === visible - 1 ? lastRef : undefined} className={s.para}>
                    {p}
                  </p>
                ))}
              </div>
            ) : null}
            {!done ? (
              <button
                type="button"
                className={s.showAll}
                onClick={(e) => {
                  e.stopPropagation();
                  setShown(paras.length);
                }}
              >
                {k.showAll}
              </button>
            ) : null}
            {from && done ? (
              <div className={s.ttd}>
                {k.from}
                <br />
                <b>{from}</b>
              </div>
            ) : null}
          </div>

          {done ? (
            <div className={s.after}>
              {children}
              {photos.length ? (
                <section className={s.memories}>
                  {strip.length ? (
                    <>
                      <div className={s.memLabel}>{k.memories}</div>
                      <div className={cx(s.strip, strip.length === 1 && s.stripOne)}>{strip.map((src, i) => photoBtn(src, i, s.snap))}</div>
                    </>
                  ) : null}
                  {special ? (
                    <>
                      <div className={s.memLabel}>{photos.length > 1 ? k.special : k.memories}</div>
                      {photoBtn(special, photos.length - 1, s.special)}
                    </>
                  ) : null}
                </section>
              ) : null}
              <div className={s.fActions}>
                <KeepsakeButton data={data} rootRef={rootRef} theme={theme} photo={special} />
                {mode === 'live' ? (
                  <a className={s.ghostBtn} href={`https://wa.me/?text=${encodeURIComponent(replyText)}`} target="_blank" rel="noopener">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5z" />
                    </svg>
                    {k.reply}
                  </a>
                ) : null}
                {onReplay ? (
                  <button
                    type="button"
                    className={s.replay}
                    onClick={() => {
                      sfx.tap();
                      onReplay();
                    }}
                  >
                    ↺ {k.replay}
                  </button>
                ) : null}
                {mode === 'live' ? (
                  <a className={s.made} href="/?ref=kado" target="_blank" rel="noopener">
                    {k.madeWith} <b>floa</b> · {k.makeYours} →
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {zoom ? (
        <div className={s.lightbox} onClick={() => setZoom(null)} role="dialog" aria-label={k.zoomed}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom} alt="" />
        </div>
      ) : null}
    </>
  );
}

/**
 * Tombol kartu kenang-kenangan. Gambarnya disiapkan lebih dulu (begitu tombol muncul),
 * supaya saat diketuk lembar bagikan HP bisa langsung terbuka.
 */
function KeepsakeButton({
  data,
  rootRef,
  theme,
  photo,
}: {
  data: GiftData;
  rootRef: React.RefObject<HTMLDivElement | null>;
  theme?: FinaleTheme;
  photo: string | null;
}) {
  const k = useKitText();
  const locale = useLocale();
  const [card, setCard] = useState<string | null>(null);
  const to = data.to.trim();
  const from = data.from.trim();
  const title = data.title.trim();

  useEffect(() => {
    let alive = true;
    const cs = rootRef.current ? getComputedStyle(rootRef.current) : null;
    const accent = cs?.getPropertyValue('--accent').trim() || '#c8553d';
    drawKeepsake({
      eyebrow: k.keepsakeEyebrow,
      name: to || k.you,
      title,
      from: from ? fmt(k.fromName, { from }) : null,
      date: new Intl.DateTimeFormat(DATE_TAG[locale], { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
      photo,
      palette: { paper: theme?.paper || '#fffaf0', ink: theme?.paperInk || '#3b2a22', accent },
    })
      .then((u) => alive && setCard(u))
      .catch((e) => console.error('[floa] keepsake', e));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, from, title, photo, locale]);

  const fileName = `floa-${(to || 'kado').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'kado'}.jpg`;

  const save = async () => {
    if (!card) return;
    sfx.tap();
    try {
      const blob = await (await fetch(card)).blob();
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return;
    }
    const a = document.createElement('a');
    a.href = card;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <button type="button" className={s.solidBtn} onClick={save} disabled={!card} aria-busy={!card}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" />
      </svg>
      {card ? k.keepsake : k.keepsakeMaking}
    </button>
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
