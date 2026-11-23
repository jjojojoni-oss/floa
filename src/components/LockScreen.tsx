'use client';

import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { fmt, useT } from '@/i18n/client';
import { ApiError, api, errorText } from '@/lib/client';
import { haptic, sfx } from '@/templates/kit';
import type { GiftData } from '@/templates/types';
import s from './LockScreen.module.css';

export type Lock = { hint: string | null; to: string; from: string; shape?: string | null };

type Phase = 'idle' | 'checking' | 'wrong' | 'opening';

const art = (name: string) => `/art/${name}.webp`;
const ART = ['kunci-gembok', 'kunci-sengkang'];

/**
 * Layar kunci kado: kertas krem yang tenang dengan satu gembok kuningan kecil berukir kawung.
 * Kata sandi angka (mis. tanggal) diketik di papan angka; selain itu di kolom teks.
 * Isi kado baru diambil dari server setelah kata sandinya cocok.
 */
export function LockScreen({
  slug,
  lock,
  onOpen,
  demo,
}: {
  slug: string;
  lock: Lock;
  onOpen: (d: GiftData) => void;
  /** halaman demo: kata sandinya ditampilkan dan dicek di perangkat, tanpa server */
  demo?: { password: string; data: GiftData };
}) {
  const t = useT();
  const digits = lock.shape && /^d[3-8]$/.test(lock.shape) ? Number(lock.shape.slice(1)) : 0;
  const [value, setValue] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
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
    const fallback = setTimeout(() => setReady(true), 2000);
    return () => {
      clearTimeout(fallback);
      imgs.forEach((im) => (im.onload = im.onerror = null));
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const busy = phase === 'checking' || phase === 'opening';

  const submit = useCallback(
    async (password: string) => {
      if (!password.trim() || busy) return;
      setPhase('checking');
      setError(null);
      try {
        const r = demo
          ? await new Promise<{ data: GiftData }>((ok, no) =>
              setTimeout(() => {
                if (password.trim().toLowerCase() === demo.password.toLowerCase()) ok({ data: demo.data });
                else no(new ApiError('wrong_password', '', 401));
              }, 250),
            )
          : await api<{ data: GiftData }>('/api/unlock', { method: 'POST', body: JSON.stringify({ slug, password }) });
        // terbuka: sengkang terangkat, lalu layar memudar ke kadonya
        setPhase('opening');
        sfx.chime();
        haptic(20);
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        later(() => onOpen(r.data), reduce ? 200 : 1100);
      } catch (e) {
        const wrong = e instanceof ApiError && e.code === 'wrong_password';
        setError(wrong ? t.lock.wrong : errorText(e, t));
        setPhase('wrong');
        haptic(50);
        later(() => {
          setPhase('idle');
          if (digits) setValue('');
          textRef.current?.focus();
        }, 500);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busy, slug, digits, onOpen, t, demo],
  );

  const press = useCallback(
    (d: string) => {
      if (busy) return;
      sfx.tap();
      haptic(6);
      setError(null);
      setValue((v) => {
        if (v.length >= digits) return v;
        const next = v + d;
        if (next.length === digits) later(() => submit(next), 140);
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busy, digits, submit],
  );

  const erase = useCallback(() => {
    if (busy) return;
    setValue((v) => v.slice(0, -1));
  }, [busy]);

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

  const name = lock.to || t.lock.you;
  const cls = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

  return (
    <div className={cls(s.root, ready && s.ready, phase === 'opening' && s.opening)}>
      <div className={s.inner}>
        <div className={cls(s.lock, phase === 'wrong' && s.rattle)} aria-hidden>
          {/* eslint-disable @next/next/no-img-element */}
          <img src={art('kunci-sengkang')} alt="" className={s.shackle} draggable={false} />
          <img src={art('kunci-gembok')} alt="" className={s.body} draggable={false} />
          {/* eslint-enable @next/next/no-img-element */}
        </div>

        <p className={s.eyebrow}>{t.lock.eyebrow}</p>
        <h1 className={cls(s.name, name.length > 12 && s.long)}>{name}</h1>
        <p className={s.tease}>{lock.from ? fmt(t.lock.tease, { from: lock.from }) : t.lock.teaseAnon}</p>

        {lock.hint ? (
          <p className={s.hint}>
            <span className={s.hintLabel}>{t.lock.hintLabel}:</span> {lock.hint}
          </p>
        ) : null}

        {demo ? (
          <p className={s.demo}>
            <span className={s.demoTag}>{t.lock.demoTag}</span>
            <span>{t.lock.demoPass}</span>
            <button
              type="button"
              className={s.demoKey}
              disabled={busy}
              aria-label={`${t.lock.demoFill}: ${demo.password}`}
              onClick={() => {
                if (busy) return;
                sfx.tap();
                setError(null);
                setValue(demo.password);
                later(() => submit(demo.password), digits ? 320 : 220);
              }}
            >
              {demo.password}
            </button>
          </p>
        ) : null}

        {digits ? (
          <>
            <div
              className={cls(s.slots, phase === 'wrong' && s.shake)}
              role="status"
              aria-label={fmt(t.lock.progress, { k: value.length, n: digits })}
            >
              {Array.from({ length: digits }, (_, i) => (
                <span key={i} className={cls(s.slot, i < value.length && s.filled)} />
              ))}
            </div>
            <p className={cls(s.msg, error && s.err)} role={error ? 'alert' : undefined}>
              {error ?? fmt(t.lock.askDigits, { n: digits })}
            </p>
            <div className={s.pad}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <button key={d} type="button" className={s.key} onClick={() => press(d)} aria-label={fmt(t.lock.digit, { d })} disabled={busy}>
                  {d}
                </button>
              ))}
              <span />
              <button type="button" className={s.key} onClick={() => press('0')} aria-label={fmt(t.lock.digit, { d: '0' })} disabled={busy}>
                0
              </button>
              <button type="button" className={cls(s.key, s.del)} onClick={erase} aria-label={t.lock.del} disabled={!value || busy}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7z" />
                  <path d="M12.5 9.5l5 5m0-5l-5 5" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={onText} className={cls(s.form, phase === 'wrong' && s.shake)}>
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
              className={s.input}
            />
            <p className={cls(s.msg, error && s.err)} role={error ? 'alert' : undefined}>
              {error ?? t.lock.askText}
            </p>
            <button type="submit" className={s.open} disabled={busy || !value.trim()}>
              {busy ? t.lock.opening : t.lock.open}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
