'use client';

import { type CSSProperties, type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { fmt, useT } from '@/i18n/client';
import { ApiError, api, errorText } from '@/lib/client';
import { Confetti, haptic, sfx } from '@/templates/kit';
import type { GiftData } from '@/templates/types';
import s from './LockScreen.module.css';

export type Lock = { hint: string | null; to: string; from: string; shape?: string | null };

type Phase = 'idle' | 'checking' | 'wrong' | 'opening';

const art = (name: string) => `/art/${name}.webp`;
const ART = ['bg-kunci', 'kunci-pita', 'kunci-gembok', 'kunci-sengkang', 'kunci-anak', 'bunga-melati'];

/**
 * Layar kunci kado: gembok kuningan berukir kawung yang tergantung di pita beludru, di atas kain sutra.
 * Kata sandi angka (mis. tanggal) diketik di papan angka; selain itu di kolom teks.
 * Isi kado baru diambil dari server setelah kata sandinya cocok.
 */
export function LockScreen({ slug, lock, onOpen }: { slug: string; lock: Lock; onOpen: (d: GiftData) => void }) {
  const t = useT();
  const digits = lock.shape && /^d[3-8]$/.test(lock.shape) ? Number(lock.shape.slice(1)) : 0;
  const [value, setValue] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [misses, setMisses] = useState(0);
  const [burst, setBurst] = useState(0);
  const [ready, setReady] = useState(false);
  const textRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  useEffect(() => {
    let left = ART.length;
    const done = () => --left <= 0 && setReady(true);
    const imgs = ART.map((n) => {
      const im = new Image();
      im.onload = done;
      im.onerror = done;
      im.src = art(n);
      return im;
    });
    const fallback = setTimeout(() => setReady(true), 2500);
    return () => {
      clearTimeout(fallback);
      imgs.forEach((im) => (im.onload = im.onerror = null));
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const submit = useCallback(
    async (password: string) => {
      if (!password.trim() || phase === 'checking' || phase === 'opening') return;
      setPhase('checking');
      setError(null);
      try {
        const r = await api<{ data: GiftData }>('/api/unlock', { method: 'POST', body: JSON.stringify({ slug, password }) });
        // terbuka: anak kunci masuk & berputar, sengkang terangkat, lalu kadonya muncul
        setPhase('opening');
        sfx.chime();
        haptic(20);
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        later(() => {
          sfx.success();
          setBurst((b) => b + 1);
        }, reduce ? 100 : 900);
        later(() => onOpen(r.data), reduce ? 400 : 1900);
      } catch (e) {
        const wrong = e instanceof ApiError && e.code === 'wrong_password';
        setError(wrong ? t.lock.wrong : errorText(e, t));
        setMisses((m) => m + 1);
        setPhase('wrong');
        sfx.crack();
        haptic(60);
        later(() => {
          setPhase('idle');
          if (digits) setValue('');
          textRef.current?.focus();
        }, 650);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, slug, digits, onOpen, t],
  );

  const press = useCallback(
    (d: string) => {
      if (phase === 'checking' || phase === 'opening') return;
      sfx.tap();
      haptic(8);
      setError(null);
      setValue((v) => {
        if (v.length >= digits) return v;
        const next = v + d;
        if (next.length === digits) later(() => submit(next), 160);
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, digits, submit],
  );

  const erase = useCallback(() => {
    if (phase === 'checking' || phase === 'opening') return;
    sfx.tap();
    setValue((v) => v.slice(0, -1));
  }, [phase]);

  // papan ketik fisik juga bisa dipakai di mode angka
  useEffect(() => {
    if (!digits) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') erase();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [digits, press, erase]);

  const onText = (e: FormEvent) => {
    e.preventDefault();
    void submit(value);
  };

  const busy = phase === 'checking';
  const name = lock.to || t.lock.you;

  return (
    <div className={[s.root, ready && s.ready, phase === 'opening' && s.opening].filter(Boolean).join(' ')}>
      <div className={s.bg} style={{ backgroundImage: `url(${art('bg-kunci')})` }} aria-hidden />
      <div className={s.grain} aria-hidden />

      <div className={s.inner}>
        {/* gembok tergantung di pita */}
        <div className={s.hang} aria-hidden>
          <div className={[s.swing, phase === 'wrong' && s.rattle].filter(Boolean).join(' ')}>
            {/* eslint-disable @next/next/no-img-element */}
            <img src={art('kunci-sengkang')} alt="" className={s.shackle} draggable={false} />
            <img src={art('kunci-pita')} alt="" className={s.ribbon} draggable={false} />
            <img src={art('kunci-gembok')} alt="" className={s.body} draggable={false} />
          </div>
          <img src={art('kunci-anak')} alt="" className={s.key} draggable={false} />
          {/* eslint-enable @next/next/no-img-element */}
        </div>

        <div className={s.copy}>
          <p className={s.eyebrow}>{t.lock.eyebrow}</p>
          <h1 className={[s.name, name.length > 12 && s.long].filter(Boolean).join(' ')}>{name}</h1>
          <p className={s.tease}>{lock.from ? fmt(t.lock.tease, { from: lock.from }) : t.lock.teaseAnon}</p>
        </div>

        {lock.hint ? (
          <p className={[s.hint, misses >= 2 && s.nudge].filter(Boolean).join(' ')}>
            <span className={s.hintLabel}>{t.lock.hintLabel}</span>
            <span className={s.hintText}>{lock.hint}</span>
          </p>
        ) : null}

        <p className={[s.ask, error && s.err].filter(Boolean).join(' ')} role={error ? 'alert' : undefined}>
          {error ?? (digits ? fmt(t.lock.askDigits, { n: digits }) : t.lock.askText)}
        </p>

        {digits ? (
          <>
            <div
              className={[s.slots, phase === 'wrong' && s.shake, busy && s.pulse].filter(Boolean).join(' ')}
              role="status"
              aria-label={fmt(t.lock.progress, { k: value.length, n: digits })}
            >
              {Array.from({ length: digits }, (_, i) => (
                <span key={i} className={[s.slot, i < value.length && s.filled].filter(Boolean).join(' ')}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {i < value.length ? <img src={art('bunga-melati')} alt="" draggable={false} style={{ '--r': `${(i * 47) % 60 - 30}deg` } as CSSProperties} /> : null}
                </span>
              ))}
            </div>
            <div className={s.pad}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <button key={d} type="button" className={s.keyBtn} onClick={() => press(d)} aria-label={fmt(t.lock.digit, { d })} disabled={busy || phase === 'opening'}>
                  {d}
                </button>
              ))}
              <span />
              <button type="button" className={s.keyBtn} onClick={() => press('0')} aria-label={fmt(t.lock.digit, { d: '0' })} disabled={busy || phase === 'opening'}>
                0
              </button>
              <button type="button" className={[s.keyBtn, s.del].join(' ')} onClick={erase} aria-label={t.lock.del} disabled={!value || busy || phase === 'opening'}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7z" />
                  <path d="M12.5 9.5l5 5m0-5l-5 5" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={onText} className={[s.textForm, phase === 'wrong' && s.shake].filter(Boolean).join(' ')}>
            <label htmlFor="gift-pass" className="sr-only">
              {t.lock.input}
            </label>
            <input
              ref={textRef}
              id="gift-pass"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              type="text"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              maxLength={60}
              placeholder={t.lock.input}
              className={s.textInput}
            />
            <button type="submit" className={s.openBtn} disabled={busy || phase === 'opening' || !value.trim()}>
              {busy || phase === 'opening' ? t.lock.opening : t.lock.open}
            </button>
          </form>
        )}
      </div>

      <div className={s.flash} aria-hidden />
      <Confetti burst={burst} origin={{ x: 0.5, y: 0.22 }} colors={['#f1d58a', '#fff4cc', '#c99a3e', '#ffffff', '#f6c9d0', '#7a1f31']} count={90} />
    </div>
  );
}
