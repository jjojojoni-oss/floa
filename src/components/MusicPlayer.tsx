'use client';

import { type MutableRefObject, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useT } from '@/i18n/client';
import { spotifyUri } from '@/lib/music';
import { isMuted, subscribeMuted } from '@/templates/kit/sfx';
import type { GiftMusic } from '@/templates/types';

/* ── Spotify iFrame API (https://developer.spotify.com/documentation/embeds/references/iframe-api) ── */

type PlaybackUpdate = { data: { isPaused: boolean; isBuffering: boolean; position: number; duration: number } };
type Controller = {
  play(): void;
  pause(): void;
  resume(): void;
  destroy(): void;
  addListener(event: 'ready', cb: () => void): void;
  addListener(event: 'playback_update', cb: (e: PlaybackUpdate) => void): void;
};
type IFrameAPI = {
  createController(el: HTMLElement, options: { uri: string; width?: string | number; height?: string | number }, cb: (c: Controller) => void): void;
};
type SpotifyWindow = Window & { onSpotifyIframeApiReady?: (api: IFrameAPI) => void; __floaSpotify?: IFrameAPI };

let apiPromise: Promise<IFrameAPI> | null = null;

function loadSpotify(): Promise<IFrameAPI> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<IFrameAPI>((resolve, reject) => {
    const w = window as SpotifyWindow;
    if (w.__floaSpotify) return resolve(w.__floaSpotify);
    // Spotify diblokir jaringan/ekstensi tanpa memicu error: menyerah setelah 12 detik, tombol musiknya disembunyikan
    const giveUp = window.setTimeout(() => {
      apiPromise = null;
      reject(new Error('spotify api timeout'));
    }, 12_000);
    const prev = w.onSpotifyIframeApiReady;
    w.onSpotifyIframeApiReady = (api) => {
      window.clearTimeout(giveUp);
      w.__floaSpotify = api;
      prev?.(api);
      resolve(api);
    };
    const s = document.createElement('script');
    s.src = 'https://open.spotify.com/embed/iframe-api/v1';
    s.async = true;
    s.onerror = () => {
      apiPromise = null;
      reject(new Error('spotify api'));
    };
    document.body.appendChild(s);
  });
  return apiPromise;
}

/**
 * Lagu latar kado dari Spotify, selalu diputar otomatis. Pemutarnya disimpan sebagai tombol bulat kecil di kiri
 * atas; lagu mulai pada ketukan pertama penerima (browser melarang suara sebelum ada ketukan), atau langsung
 * kalau `start="now"` (mis. setelah kado terkunci dibuka, karena ketukan "Buka" sudah dihitung). Kalau Spotify
 * belum siap atau browser menolak, ketukan-ketukan berikutnya di kado mencoba lagi sampai lagunya pernah berbunyi;
 * kalau tetap tidak bisa, pemutarnya dibuka (sekali) supaya penerima bisa menekan ▶ sendiri.
 * `armed={false}`: pemutarnya sudah dimuat (tersembunyi, mis. selama layar kunci demo) tapi belum boleh berbunyi,
 * supaya begitu kuncinya terbuka lagunya bisa langsung mulai tanpa menunggu Spotify dimuat.
 * `primeRef`: diisi fungsi untuk memulai lagu dari dalam sebuah ketukan, juga selagi belum `armed` (demo: ketukan
 * yang membuka kunci), karena HP hanya mengizinkan suara yang dimulai di dalam ketukan itu sendiri.
 */
export function MusicPlayer({
  music,
  start = 'tap',
  armed = true,
  primeRef,
}: {
  music: GiftMusic;
  start?: 'tap' | 'now';
  armed?: boolean;
  primeRef?: MutableRefObject<(() => void) | null>;
}) {
  const t = useT();
  const hostRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<Controller | null>(null);
  const wantPlay = useRef(false);
  const started = useRef(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [failed, setFailed] = useState(false);
  /** lagunya sudah pernah benar-benar berbunyi: setelah itu ketukan tidak lagi memutar ulang (penerima bebas menjeda) */
  const everPlayed = useRef(false);
  const lastTry = useRef(0);
  const nudged = useRef(false);
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const playingRef = useRef(false);
  playingRef.current = playing;
  const tapped = useRef(false);

  const tryPlay = () => {
    tapped.current = true;
    const c = ctrlRef.current;
    if (!c) {
      wantPlay.current = true;
      return;
    }
    if (mutedRef.current) return;
    started.current = true;
    lastTry.current = Date.now();
    c.play();
    // ketukan berikutnya akan mencoba lagi; kalau setelah 8 detik tetap belum bunyi, buka pemutarnya supaya penerima
    // bisa menekan ▶ sendiri (cukup sekali, dan ditutup lagi begitu lagunya jalan)
    window.setTimeout(() => {
      if (!playingRef.current && !everPlayed.current && !nudged.current) {
        nudged.current = true;
        setNeedsTap(true);
        setOpen(true);
      }
    }, 8000);
  };

  // pasang pemutar Spotify
  useEffect(() => {
    let alive = true;
    const host = hostRef.current;
    if (!host) return;
    const el = document.createElement('div');
    host.appendChild(el);
    loadSpotify()
      .then((api) => {
        if (!alive) return;
        api.createController(el, { uri: spotifyUri(music), width: '100%', height: 80 }, (c) => {
          if (!alive) {
            c.destroy();
            return;
          }
          ctrlRef.current = c;
          c.addListener('ready', () => {
            if (!alive) return;
            setReady(true);
            if (wantPlay.current) {
              wantPlay.current = false;
              tryPlay();
            }
          });
          c.addListener('playback_update', (e) => {
            if (!alive) return;
            const isPlaying = !e.data.isPaused;
            setPlaying(isPlaying);
            if (isPlaying) {
              // pemutar yang tadi dibuka karena lagunya tak kunjung bunyi: tutup lagi
              if (!everPlayed.current && nudged.current) setOpen(false);
              everPlayed.current = true;
              setNeedsTap(false);
            }
          });
        });
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
      ctrlRef.current?.destroy();
      ctrlRef.current = null;
      host.replaceChildren();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [music.type, music.id]);

  // mulai: langsung (kado terkunci baru dibuka) atau pada ketukan pertama di mana pun di kado. Selama lagunya belum
  // pernah berbunyi (Spotify masih dimuat, atau browser menolak), tiap ketukan berikutnya mencoba lagi; jedanya
  // dijaga supaya lagu yang sedang memuat tidak diulang dari awal.
  // Didengarkan saat jari DIANGKAT (pointerup), bukan saat menyentuh: di layar sentuh hanya pointerup/touchend/click
  // yang dihitung browser sebagai izin memutar suara (pointerdown hanya berlaku untuk mouse). Inilah sebabnya dulu
  // lagunya otomatis di desktop tapi di HP penerima harus menekan ▶ sendiri.
  // dipanggil dari dalam ketukan pembuka kunci (lihat primeRef)
  useEffect(() => {
    if (!primeRef) return;
    primeRef.current = () => {
      if (!everPlayed.current && !playingRef.current) tryPlay();
    };
    return () => {
      primeRef.current = null;
    };
  });

  useEffect(() => {
    if (!armed) return;
    // (kalau ketukan pembuka kunci baru saja memulainya, jangan diulang dari awal)
    if (start === 'now' && !everPlayed.current && !playingRef.current && !(started.current && Date.now() - lastTry.current < 400)) tryPlay();
    const onTap = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== 'Enter' && e.key !== ' ') return;
      if (everPlayed.current || playingRef.current) return;
      // Jeda sangat pendek: hanya untuk ketukan yang sama (atau dua ketukan beruntun) selagi Spotify belum sempat
      // melapor. Lagu yang benar-benar diterima Spotify langsung terlihat lewat playingRef (status putar), jadi jeda
      // yang lebih panjang tidak perlu dan justru melewatkan ketukan pita yang datang cepat sesudah percobaan yang
      // ditolak (itu yang membuat beberapa template di HP baru berbunyi jauh sesudahnya).
      if (started.current && Date.now() - lastTry.current < 400) return;
      tryPlay();
    };
    const opts = { capture: true } as const;
    document.addEventListener('pointerup', onTap, opts);
    document.addEventListener('keydown', onTap, opts);
    return () => {
      document.removeEventListener('pointerup', onTap, opts);
      document.removeEventListener('keydown', onTap, opts);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, armed]);

  // tombol suara di pojok kanan atas juga mengatur musiknya
  useEffect(() => {
    const c = ctrlRef.current;
    if (!c) return;
    if (muted) {
      if (started.current) c.pause();
    } else if (started.current) c.resume();
    // sempat dibisukan saat ketukan pertama: mulai sekarang (ketukan tombol suara dihitung sebagai izin)
    else if (tapped.current) tryPlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted]);

  if (failed) return null;

  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-[70] flex flex-col items-start gap-2" aria-hidden={!armed || undefined}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label={open ? t.music.hide : t.music.show}
        aria-expanded={open}
        className={
          'pointer-events-auto relative flex h-11 w-11 items-center justify-center gap-2 rounded-full before:absolute before:-inset-1.5 bg-[#1e1b18]/45 text-white shadow-[0_6px_16px_-6px_rgba(0,0,0,0.5)] backdrop-blur-md transition-transform active:scale-95' +
          (armed ? '' : ' invisible')
        }
      >
        {playing ? (
          <span className="flex h-4 items-end gap-[3px]" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-[3px] origin-bottom animate-[floa-eq_0.9s_ease-in-out_infinite] rounded-full bg-white" style={{ height: '100%', animationDelay: `${i * 0.18}s` }} />
            ))}
          </span>
        ) : (
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
            <path d="M19 3v12.2A3.5 3.5 0 1 1 17 12V7.3l-8 1.6v8.3A3.5 3.5 0 1 1 7 14V5.6z" />
          </svg>
        )}
      </button>

      {/* pemutar tetap terpasang (supaya lagunya tidak berhenti), hanya disembunyikan saat dikecilkan */}
      <div
        className={
          'w-full max-w-[22rem] origin-top-left transition-[opacity,transform] duration-200 ' +
          (open ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0')
        }
        aria-hidden={!open}
      >
        <div ref={hostRef} className="h-20 overflow-hidden rounded-[14px] bg-[#282828] shadow-[0_14px_30px_-12px_rgba(0,0,0,0.55)] [&_iframe]:block [&_iframe]:border-0" />
        {needsTap && ready ? (
          <p className="mt-1.5 inline-block rounded-full bg-[#1e1b18]/60 px-3 py-1 text-[12px] font-bold text-white backdrop-blur">{t.music.tapToPlay}</p>
        ) : null}
      </div>
    </div>
  );
}
