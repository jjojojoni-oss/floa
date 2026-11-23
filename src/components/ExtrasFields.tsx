'use client';

import { useState } from 'react';
import { useT } from '@/i18n/client';
import { ApiError, api } from '@/lib/client';
import { parseSpotify } from '@/lib/music';
import type { GiftAsk, GiftMusic, MusicKind } from '@/templates/types';

const inputCls =
  'w-full rounded-2xl bg-white px-4 py-3 text-[16px] leading-snug shadow-[inset_0_0_0_1.5px_var(--color-line)] outline-none transition-shadow placeholder:text-muted/60 focus:shadow-[inset_0_0_0_2px_var(--color-ink)]';

/** Sakelar nyala/mati dengan judul dan keterangan. */
function Switch({ title, sub, checked, onChange, className = '' }: { title: string; sub: string; checked: boolean; onChange: (on: boolean) => void; className?: string }) {
  return (
    <label className={'flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[inset_0_0_0_1.5px_var(--color-line)] ' + className}>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold">{title}</span>
        <span className="block text-[12.5px] leading-snug text-muted">{sub}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="relative h-7 w-12 flex-none rounded-full bg-line transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-leaf peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-ink"
      />
    </label>
  );
}

/* ───────────────────────── kalimat pembuka ───────────────────────── */

export function IntroField({ value, max, onChange }: { value: string; max: number; onChange: (v: string) => void }) {
  const t = useT();
  return (
    <div data-field="intro">
      <label htmlFor="f-intro" className="text-[15px] font-extrabold">
        {t.intro.label} <span className="font-semibold text-muted">{t.music.optional}</span>
      </label>
      <p className="mt-0.5 text-[13px] leading-snug text-muted">{t.intro.hint}</p>
      <div className="relative mt-2">
        <textarea
          id="f-intro"
          value={value}
          maxLength={max}
          rows={3}
          placeholder={t.intro.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls + ' resize-none pb-7'}
        />
        <span className="pointer-events-none absolute bottom-2.5 right-3.5 text-[11px] font-bold tabular-nums text-muted/70">
          {value.length}/{max}
        </span>
      </div>
    </div>
  );
}

/* ───────────────────────── pertanyaan penutup ───────────────────────── */

export function AskField({
  value,
  maxQ,
  maxA,
  onChange,
}: {
  value: GiftAsk | null | undefined;
  maxQ: number;
  maxA: number;
  onChange: (v: GiftAsk | null) => void;
}) {
  const t = useT();
  const q = value?.q ?? '';
  const a = value?.a ?? '';
  const b = value?.b ?? '';
  const on = q.trim().length > 0;
  const setQ = (next: string) => {
    if (!next.trim() && !a && !b) return onChange(null);
    // begitu pertanyaan mulai ditulis, dua jawaban terisi bawaan (dalam bahasa pengirim), tetap bisa diganti
    const fill = !q.trim() && !a && !b;
    onChange({ q: next, a: fill ? t.ask.defaultA : a, b: fill ? t.ask.defaultB : b });
  };
  const answer = (key: 'a' | 'b', label: string, ph: string) => (
    <label className="block min-w-0 flex-1">
      <span className="sr-only">{label}</span>
      <input
        value={key === 'a' ? a : b}
        maxLength={maxA}
        placeholder={ph}
        disabled={!on}
        onChange={(e) => onChange({ q, a, b, [key]: e.target.value })}
        className={inputCls + ' text-center font-hand !text-[20px] font-semibold disabled:opacity-50'}
        autoComplete="off"
        aria-label={label}
      />
    </label>
  );
  return (
    <div data-field="ask">
      <label htmlFor="f-ask" className="text-[15px] font-extrabold">
        {t.ask.label} <span className="font-semibold text-muted">{t.music.optional}</span>
      </label>
      <p className="mt-0.5 text-[13px] leading-snug text-muted">{t.ask.hint}</p>
      <div className="relative mt-2">
        <input
          id="f-ask"
          value={q}
          maxLength={maxQ}
          placeholder={t.ask.questionPh}
          onChange={(e) => setQ(e.target.value.replace(/\n/g, ' '))}
          className={inputCls + ' pr-14'}
          autoComplete="off"
          aria-label={t.ask.question}
        />
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold tabular-nums text-muted/70">
          {q.length}/{maxQ}
        </span>
      </div>
      <div className={'mt-2 transition-opacity ' + (on ? 'opacity-100' : 'opacity-60')}>
        <span className="block text-[12.5px] font-bold text-muted">{t.ask.answers}</span>
        <div className="mt-1.5 flex gap-2">
          {answer('a', t.ask.answerA, t.ask.defaultA)}
          {answer('b', t.ask.answerB, t.ask.defaultB)}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── musik ───────────────────────── */

export function MusicField({ music, onChange }: { music: GiftMusic | null | undefined; onChange: (m: GiftMusic | null) => void }) {
  const t = useT();
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const use = async (raw = link) => {
    const v = raw.trim();
    if (!v || busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ type: MusicKind; id: string; title?: string }>(`/api/music?url=${encodeURIComponent(v)}`);
      onChange({ provider: 'spotify', type: r.type, id: r.id, ...(r.title ? { title: r.title } : {}), autoplay: music?.autoplay ?? true });
      setLink('');
    } catch (e) {
      // server tak terjangkau tapi link-nya jelas: tetap dipakai (judulnya saja yang tidak ada)
      const local = parseSpotify(v);
      if (local && !(e instanceof ApiError && e.code === 'music_invalid')) {
        onChange({ provider: 'spotify', ...local, autoplay: true });
        setLink('');
      } else setError(t.music.invalid);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-field="music">
      <label htmlFor="f-music" className="text-[15px] font-extrabold">
        {t.music.label} <span className="font-semibold text-muted">{t.music.optional}</span>
      </label>
      <p className="mt-0.5 text-[13px] leading-snug text-muted">{t.music.hint}</p>

      {music ? (
        <div className="mt-2">
          <iframe
            title={music.title ?? 'Spotify'}
            src={`https://open.spotify.com/embed/${music.type}/${music.id}?utm_source=generator`}
            width="100%"
            height="80"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="block rounded-[14px] border-0 bg-[#282828]"
          />
          <Switch
            className="mt-2.5"
            title={t.music.autoplay}
            sub={t.music.autoplaySub}
            checked={music.autoplay !== false}
            onChange={(on) => onChange({ ...music, autoplay: on })}
          />
          <div className="mt-2 flex items-start justify-between gap-3">
            <p className="text-[12.5px] leading-snug text-muted">{t.music.previewNote}</p>
            <button type="button" onClick={() => onChange(null)} className="btn btn-ghost h-9 flex-none px-3.5 text-[13px]">
              {t.music.remove}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-2 flex gap-2">
            <input
              id="f-music"
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                if (error) setError(null);
              }}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData('text');
                if (pasted) {
                  e.preventDefault();
                  setLink(pasted);
                  void use(pasted);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void use();
                }
              }}
              inputMode="url"
              autoComplete="off"
              placeholder={t.music.placeholder}
              className={inputCls + (error ? ' !shadow-[inset_0_0_0_2px_var(--color-tomato)]' : '')}
            />
            <button type="button" onClick={() => use()} disabled={busy || !link.trim()} className="btn btn-ink h-[50px] flex-none px-5 text-[14px]">
              {busy ? t.music.reading : t.music.add}
            </button>
          </div>
          {error ? (
            <p className="mt-1.5 text-[13px] font-bold text-tomato-dark">{error}</p>
          ) : (
            <p className="mt-1.5 text-[12.5px] text-muted">{t.music.howTo}</p>
          )}
        </>
      )}
    </div>
  );
}

/* ───────────────────────── kata sandi ───────────────────────── */

export type LockState = {
  on: boolean;
  password: string;
  hint: string;
  /** kado yang sedang diubah sudah punya kata sandi (tidak bisa ditampilkan, hanya diganti) */
  existing: boolean;
};

export const NO_LOCK: LockState = { on: false, password: '', hint: '', existing: false };

export function LockField({ lock, onChange, error }: { lock: LockState; onChange: (l: LockState) => void; error: string | null }) {
  const t = useT();
  const set = (patch: Partial<LockState>) => onChange({ ...lock, ...patch });

  return (
    <div data-field="lock">
      <p className="text-[15px] font-extrabold">
        {t.lock.label} <span className="font-semibold text-muted">{t.music.optional}</span>
      </p>
      <Switch className="mt-2" title={t.lock.toggle} sub={t.lock.toggleSub} checked={lock.on} onChange={(on) => set({ on })} />

      {lock.on ? (
        <div className="mt-3 space-y-3 rounded-2xl bg-paper-2/60 p-3.5">
          <div>
            <label htmlFor="f-lock-pass" className="text-[14px] font-extrabold">
              {t.lock.password}
            </label>
            <input
              id="f-lock-pass"
              value={lock.password}
              onChange={(e) => set({ password: e.target.value })}
              maxLength={40}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder={lock.existing ? '••••••' : t.lock.passwordPh}
              className={'mt-1.5 ' + inputCls + (error ? ' !shadow-[inset_0_0_0_2px_var(--color-tomato)]' : '')}
            />
            <p className="mt-1 text-[12.5px] leading-snug text-muted">{lock.existing && !lock.password ? t.lock.keep : t.lock.passwordHelp}</p>
            {error ? <p className="mt-1 text-[13px] font-bold text-tomato-dark">{error}</p> : null}
          </div>
          <div>
            <label htmlFor="f-lock-hint" className="text-[14px] font-extrabold">
              {t.lock.passHint} <span className="font-semibold text-muted">{t.music.optional}</span>
            </label>
            <input
              id="f-lock-hint"
              value={lock.hint}
              onChange={(e) => set({ hint: e.target.value })}
              maxLength={80}
              autoComplete="off"
              placeholder={t.lock.passHintPh}
              className={'mt-1.5 ' + inputCls}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
