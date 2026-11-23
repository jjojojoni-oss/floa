'use client';

import { type FormEvent, useState } from 'react';
import { fmt, useT } from '@/i18n/client';
import { ApiError, api, errorText } from '@/lib/client';
import { TemplatePlayer } from '@/templates/Player';
import { getTemplate } from '@/templates/registry';
import type { GiftData } from '@/templates/types';
import { GiftFrame } from './GiftFrame';
import { MusicPlayer } from './MusicPlayer';

type Lock = { hint: string | null; to: string; from: string };

/**
 * Halaman kado untuk penerima. Kado yang dikunci tampil sebagai layar kata sandi dulu:
 * isinya baru diambil dari server setelah kata sandinya benar.
 */
export function GiftView({ slug, templateId, data: initial, lock }: { slug: string; templateId: string; data: GiftData | null; lock: Lock | null }) {
  const meta = getTemplate(templateId)!;
  const [data, setData] = useState<GiftData | null>(initial);
  const [unlocked, setUnlocked] = useState(false);

  if (!data && lock) {
    return (
      <GiftFrame bg={meta.palette.bg}>
        <LockScreen
          slug={slug}
          templateId={templateId}
          lock={lock}
          onOpen={(d) => {
            setData(d);
            setUnlocked(true);
          }}
        />
      </GiftFrame>
    );
  }
  if (!data) return null;

  return (
    <GiftFrame bg={meta.palette.bg}>
      <TemplatePlayer id={meta.id} data={data} mode="live" />
      {data.music ? <MusicPlayer music={data.music} start={unlocked ? 'now' : 'tap'} /> : null}
    </GiftFrame>
  );
}

function LockScreen({ slug, templateId, lock, onOpen }: { slug: string; templateId: string; lock: Lock; onOpen: (d: GiftData) => void }) {
  const t = useT();
  const { palette } = getTemplate(templateId)!;
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ data: GiftData }>('/api/unlock', { method: 'POST', body: JSON.stringify({ slug, password }) });
      onOpen(r.data);
    } catch (err) {
      setError(err instanceof ApiError && err.code === 'wrong_password' ? t.lock.wrong : errorText(err, t));
      setShake((n) => n + 1);
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: palette.bg, color: palette.ink }}>
      {/* sampul template, dikaburkan: sekilas tahu kadonya seperti apa tanpa membocorkan isinya */}
      <div className="absolute inset-[-10%] bg-cover bg-center opacity-80 blur-[18px]" style={{ backgroundImage: `url(/art/cover-${templateId}.webp)` }} aria-hidden />
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${palette.bg} 35%, transparent), color-mix(in srgb, ${palette.bg} 80%, transparent))` }} aria-hidden />
      <div className="absolute inset-0 bg-[url('/art/tex-butir.webp')] bg-[length:128px_128px] opacity-30" aria-hidden />

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <div
          className="grid h-16 w-16 place-items-center rounded-full shadow-[0_14px_30px_-12px_rgba(0,0,0,0.45)]"
          style={{ background: palette.accent, color: '#fff' }}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" fill="currentColor" stroke="none" />
            <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
          </svg>
        </div>
        <p className="mt-5 text-[13px] font-extrabold uppercase tracking-[0.2em]" style={{ color: palette.accent }}>
          {t.lock.eyebrow}
        </p>
        <h1 className="font-display mt-1 text-[2.6rem] font-semibold leading-[1.05]">{lock.to || t.lock.you}</h1>
        <p className="mt-3 max-w-[18rem] text-[15px] leading-snug opacity-85">
          {lock.from ? fmt(t.lock.sub, { from: lock.from }) : t.lock.subAnon}
        </p>

        {lock.hint ? (
          <p className="mt-4 max-w-[19rem] rounded-2xl px-4 py-2.5 text-[14px] leading-snug" style={{ background: `color-mix(in srgb, ${palette.ink} 10%, transparent)` }}>
            <span className="font-extrabold">{t.lock.hintLabel}:</span> {lock.hint}
          </p>
        ) : null}

        <form onSubmit={submit} className="mt-5 w-full max-w-[19rem]">
          <div key={shake} className={shake ? 'animate-[floa-shake_0.4s_ease]' : undefined}>
            <label htmlFor="gift-pass" className="sr-only">
              {t.lock.input}
            </label>
            <input
              id="gift-pass"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              maxLength={60}
              placeholder={t.lock.input}
              className="h-13 w-full rounded-2xl bg-white px-4 text-center text-[18px] font-bold tracking-wide text-[#1e1b18] shadow-[inset_0_0_0_1.5px_rgba(30,27,24,0.12),0_10px_24px_-14px_rgba(0,0,0,0.4)] outline-none placeholder:font-semibold placeholder:tracking-normal placeholder:text-[#1e1b18]/35 focus:shadow-[inset_0_0_0_2px_#1e1b18]"
            />
          </div>
          {error ? (
            <p className="mt-2 text-[13.5px] font-bold" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy || !password.trim()}
            className="mt-3 h-13 w-full rounded-2xl text-[16px] font-extrabold shadow-[0_12px_26px_-12px_rgba(0,0,0,0.5)] transition-opacity disabled:opacity-60"
            style={{ background: palette.ink, color: palette.bg }}
          >
            {busy ? t.lock.opening : t.lock.open}
          </button>
        </form>
      </div>
    </div>
  );
}
