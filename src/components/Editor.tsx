'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EMPTY_DATA } from '@/lib/gift';
import { type Draft, api, compressImage, loadDraft, saveDraft, uploadPhotos } from '@/lib/client';
import { fmt, useLocale, useT } from '@/i18n/client';
import { errorText } from '@/lib/client';
import { cheapestLabel } from '@/lib/site';
import { TemplatePlayer } from '@/templates/Player';
import { getTemplate } from '@/templates/registry';
import type { FieldSpec, GiftData, NotesField, PhotosField, TextField } from '@/templates/types';
import { CheckoutSheet } from './CheckoutSheet';

type EditCtx = { id: string; key: string; slug: string };

export function Editor({ templateId }: { templateId: string }) {
  const locale = useLocale();
  const t = useT();
  const meta = getTemplate(templateId, locale)!;
  // isian awal = contoh, tapi tanpa foto contoh (supaya foto orang lain tidak ikut terbit)
  const sample = useMemo<GiftData>(() => ({ ...meta.sample, notes: [...meta.sample.notes], photos: [] }), [meta]);

  const [data, setData] = useState<GiftData>(sample);
  const [touched, setTouched] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [edit, setEdit] = useState<EditCtx | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<{ key: string; msg: string } | null>(null);
  const [preview, setPreview] = useState(false);
  const [run, setRun] = useState(0);
  const [checkout, setCheckout] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  // jumlah foto/kalimat mengubah susunan adegan, jadi pratinjau diputar ulang dari awal
  const previewKey = `${run}:${data.photos.length}:${data.notes.filter((n) => n.trim()).length}`;

  // muat: mode ubah (?edit=&key=) atau draf tersimpan
  useEffect(() => {
    let alive = true;
    (async () => {
      const q = new URLSearchParams(window.location.search);
      const id = q.get('edit');
      const key = q.get('key');
      if (id && key) {
        try {
          const g = await api<{ id: string; slug: string; template: string; data: GiftData }>(
            `/api/gifts/${encodeURIComponent(id)}?key=${encodeURIComponent(key)}`,
          );
          if (!alive) return;
          if (g.template !== templateId) throw new Error('template mismatch');
          setData({ ...EMPTY_DATA, ...g.data });
          setTouched(meta.fields.map((f) => f.key));
          setEdit({ id, key, slug: g.slug });
        } catch {
          if (alive) setLoadError(t.editor.cantOpen);
        }
      } else {
        const d = await loadDraft(templateId);
        if (alive && d) {
          setData({ ...EMPTY_DATA, ...d.data });
          setTouched(d.touched ?? []);
        }
      }
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, [templateId, meta]);

  // simpan draf otomatis
  useEffect(() => {
    if (!ready || edit) return;
    const t = setTimeout(async () => {
      const draft: Draft = { v: 1, data, touched };
      setSaved(await saveDraft(templateId, draft));
    }, 500);
    return () => clearTimeout(t);
  }, [data, touched, ready, edit, templateId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  const update = <K extends keyof GiftData>(key: K, value: GiftData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setTouched((t) => (t.includes(key) ? t : [...t, key]));
    if (fieldError?.key === key) setFieldError(null);
  };

  const focusField = (key: string) => {
    const el = formRef.current?.querySelector<HTMLElement>(`[data-field="${key}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.querySelector<HTMLElement>('input,textarea')?.focus({ preventScroll: true });
  };

  /** true kalau isian wajib sudah beres */
  const validate = () => {
    for (const key of ['to', 'from'] as const) {
      if (!meta.fields.some((f) => f.key === key)) continue;
      const v = data[key].trim();
      const stillSample = !edit && !touched.includes(key);
      if (!v || stillSample) {
        setFieldError({
          key,
          msg: !v ? t.editor.required : t.editor.stillSample,
        });
        setPreview(false);
        focusField(key);
        return false;
      }
    }
    return true;
  };

  const publish = () => {
    if (validate()) setCheckout(true);
  };

  const saveEdit = async () => {
    if (!edit || !validate()) return;
    try {
      setSaving(t.editor.saving);
      const photos = await uploadPhotos(data.photos, (d, n) => setSaving(fmt(t.editor.uploading, { done: d, total: n })));
      setData((d) => ({ ...d, photos }));
      await api(`/api/gifts/${edit.id}`, { method: 'PUT', body: JSON.stringify({ key: edit.key, data: { ...data, photos } }) });
      setToast(t.editor.saved);
    } catch (e) {
      setToast(errorText(e, t) || t.editor.saveFailed);
    } finally {
      setSaving(null);
    }
  };

  const primaryLabel = edit ? (saving ?? t.editor.saveChanges) : fmt(t.editor.publish, { price: cheapestLabel(locale) });
  const onPrimary = edit ? saveEdit : publish;

  if (loadError) {
    return (
      <main className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">{t.editor.cantOpenTitle}</h1>
        <p className="mt-3 text-ink-2">{loadError}</p>
        <Link href="/kado-saya" className="btn btn-ink mt-6 h-12 px-6">
          {t.editor.toMyGifts}
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2.5 px-3 sm:px-6">
          <Link href={edit ? '/kado-saya' : '/'} className="btn btn-ghost h-9 w-9 flex-none" aria-label={t.editor.back}>
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-extrabold leading-tight">{meta.name}</div>
            <div className="truncate text-[11.5px] text-muted">
              {edit ? t.editor.editing : saved ? t.editor.draftSaved : t.editor.fillIn}
            </div>
          </div>
          <button type="button" onClick={onPrimary} disabled={!!saving} className="btn btn-primary hidden h-10 px-5 text-sm lg:inline-flex">
            {primaryLabel} {edit ? null : <span aria-hidden>→</span>}
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-32 pt-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:pb-16">
        <div ref={formRef} className="mx-auto w-full max-w-xl">
          {!edit ? (
            <p className="rounded-2xl bg-butter/50 px-4 py-3 text-[14px] font-semibold leading-snug">
              {t.editor.sampleNote}
            </p>
          ) : null}

          <div className={'mt-5 space-y-6 transition-opacity ' + (ready ? 'opacity-100' : 'opacity-40')}>
            {meta.fields.map((f) => (
              <Field
                key={f.key}
                spec={f}
                data={data}
                isSample={!edit && !touched.includes(f.key)}
                error={fieldError?.key === f.key ? fieldError.msg : null}
                update={update}
                onError={setToast}
              />
            ))}
          </div>

          <div className="mt-8 hidden gap-3 lg:flex">
            <button type="button" onClick={onPrimary} disabled={!!saving} className="btn btn-primary h-13 flex-1 py-4 text-base">
              {primaryLabel} {edit ? null : <span aria-hidden>→</span>}
            </button>
          </div>
        </div>

        {/* pratinjau langsung (layar lebar) */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <div className="relative mx-auto aspect-[9/17] w-full overflow-hidden rounded-[2rem] shadow-pop ring-[10px] ring-white">
              <TemplatePlayer key={previewKey} id={meta.id} data={data} mode="preview" />
            </div>
            <div className="mt-4 flex items-center justify-center gap-3 text-[13px] font-bold text-ink-2">
              <span>{t.editor.livePreview}</span>
              <button type="button" className="underline underline-offset-2" onClick={() => setRun((v) => v + 1)}>
                {t.editor.restart}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* bilah bawah (HP) */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line bg-paper/95 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => {
            setRun((v) => v + 1);
            setPreview(true);
          }}
          className="btn btn-ghost h-12 flex-1 text-[15px]"
        >
          {t.editor.seeResult}
        </button>
        <button type="button" onClick={onPrimary} disabled={!!saving} className="btn btn-primary h-12 flex-[1.5] text-[15px]">
          {primaryLabel} {edit ? null : <span aria-hidden>→</span>}
        </button>
      </div>

      {/* pratinjau layar penuh (HP) */}
      {preview ? (
        <div className="fixed inset-0 z-40 flex animate-fade flex-col bg-ink lg:hidden" role="dialog" aria-label={t.editor.previewLabel}>
          <div className="relative flex-1">
            <TemplatePlayer key={previewKey} id={meta.id} data={data} mode="preview" />
          </div>
          <div className="flex gap-2 bg-paper px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
            <button type="button" onClick={() => setPreview(false)} className="btn btn-ghost h-12 flex-1 text-[15px]">
              {t.editor.editMore}
            </button>
            <button
              type="button"
              onClick={() => {
                setPreview(false);
                onPrimary();
              }}
              disabled={!!saving}
              className="btn btn-primary h-12 flex-[1.5] text-[15px]"
            >
              {primaryLabel} {edit ? null : <span aria-hidden>→</span>}
            </button>
          </div>
        </div>
      ) : null}

      {checkout ? (
        <CheckoutSheet
          meta={meta}
          data={data}
          sampleFields={meta.fields.filter((f) => f.key !== 'photos' && !touched.includes(f.key)).map((f) => f.label)}
          onClose={(finished) => {
            setCheckout(false);
            // kadonya sudah terbit: jangan biarkan diterbitkan dua kali dari draf yang sama
            if (finished) router.push('/kado-saya');
          }}
          onPhotos={(photos) => setData((d) => ({ ...d, photos }))}
        />
      ) : null}

      {toast ? (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-8" role="status">
          <div className="animate-rise rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-paper shadow-pop">{toast}</div>
        </div>
      ) : null}
    </div>
  );
}

/* ───────────────────────── kolom isian ───────────────────────── */

type Update = <K extends keyof GiftData>(key: K, value: GiftData[K]) => void;

function Field({
  spec,
  data,
  isSample,
  error,
  update,
  onError,
}: {
  spec: FieldSpec;
  data: GiftData;
  isSample: boolean;
  error: string | null;
  update: Update;
  onError: (msg: string) => void;
}) {
  const t = useT();
  return (
    <div data-field={spec.key}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={`f-${spec.key}`} className="text-[15px] font-extrabold">
          {spec.label}
        </label>
        {isSample && spec.key !== 'photos' ? (
          <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-muted">{t.editor.sampleBadge}</span>
        ) : null}
      </div>
      {spec.hint ? <p className="mt-0.5 text-[13px] leading-snug text-muted">{spec.hint}</p> : null}
      <div className="mt-2">
        {spec.key === 'notes' ? (
          <Notes spec={spec} value={data.notes} onChange={(v) => update('notes', v)} />
        ) : spec.key === 'photos' ? (
          <Photos spec={spec} value={data.photos} onChange={(v) => update('photos', v)} onError={onError} />
        ) : (
          <Text spec={spec} value={data[spec.key]} onChange={(v) => update(spec.key, v)} invalid={!!error} />
        )}
      </div>
      {error ? <p className="mt-1.5 text-[13px] font-bold text-tomato-dark">{error}</p> : null}
    </div>
  );
}

const inputCls =
  'w-full rounded-2xl bg-white px-4 py-3 text-[16px] leading-snug shadow-[inset_0_0_0_1.5px_var(--color-line)] outline-none transition-shadow placeholder:text-muted/60 focus:shadow-[inset_0_0_0_2px_var(--color-ink)]';

function Text({ spec, value, onChange, invalid }: { spec: TextField; value: string; onChange: (v: string) => void; invalid: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  const cls = inputCls + (invalid ? ' !shadow-[inset_0_0_0_2px_var(--color-tomato)]' : '');
  return (
    <div className="relative">
      {spec.multiline ? (
        <textarea
          ref={ref}
          id={`f-${spec.key}`}
          value={value}
          maxLength={spec.max}
          rows={5}
          placeholder={spec.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cls + ' resize-none pb-7'}
        />
      ) : (
        <input
          id={`f-${spec.key}`}
          value={value}
          maxLength={spec.max}
          placeholder={spec.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cls + ' pr-14'}
          autoComplete="off"
        />
      )}
      <span
        className={
          'pointer-events-none absolute right-3.5 text-[11px] font-bold tabular-nums text-muted/70 ' +
          (spec.multiline ? 'bottom-2.5' : 'top-1/2 -translate-y-1/2')
        }
      >
        {value.length}/{spec.max}
      </span>
    </div>
  );
}

/** Kolom satu kalimat yang melebar ke bawah, supaya kalimat panjang tetap terbaca utuh. */
function AutoGrow({
  id,
  value,
  maxLength,
  placeholder,
  onChange,
  label,
}: {
  id?: string;
  value: string;
  maxLength: number;
  placeholder?: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      id={id}
      rows={1}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value.replace(/\n/g, ' '))}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.preventDefault();
      }}
      className={inputCls + ' resize-none'}
      autoComplete="off"
      aria-label={label}
    />
  );
}

function Notes({ spec, value, onChange }: { spec: NotesField; value: string[]; onChange: (v: string[]) => void }) {
  const t = useT();
  const rows = Math.max(spec.min, value.length, spec.min === 0 ? 0 : 1);
  const list = Array.from({ length: rows }, (_, i) => value[i] ?? '');
  const set = (i: number, v: string) => {
    const next = list.slice();
    next[i] = v;
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {list.map((v, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2.5 grid h-7 w-7 flex-none place-items-center rounded-full bg-paper-2 text-[12px] font-extrabold text-ink-2">{i + 1}</span>
          <AutoGrow
            id={i === 0 ? `f-${spec.key}` : undefined}
            value={v}
            maxLength={spec.max}
            placeholder={spec.placeholder}
            onChange={(val) => set(i, val)}
            label={`${spec.label} ${i + 1}`}
          />
          {rows > spec.min ? (
            <button
              type="button"
              onClick={() => onChange(list.filter((_, k) => k !== i))}
              className="mt-1.5 grid h-9 w-9 flex-none place-items-center rounded-full text-lg text-muted hover:bg-paper-2 hover:text-ink"
              aria-label={fmt(t.editor.removeRow, { n: i + 1 })}
            >
              ×
            </button>
          ) : null}
        </div>
      ))}
      {rows < spec.count ? (
        <button type="button" onClick={() => onChange([...list, ''])} className="btn btn-ghost h-10 px-4 text-[13px]">
          {t.editor.addRow}
        </button>
      ) : null}
    </div>
  );
}

function Photos({
  spec,
  value,
  onChange,
  onError,
}: {
  spec: PhotosField;
  value: string[];
  onChange: (v: string[]) => void;
  onError: (msg: string) => void;
}) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = spec.count - value.length;
    const picked = Array.from(files).slice(0, room);
    if (files.length > room) onError(fmt(t.editor.maxPhotos, { n: spec.count }));
    setBusy(true);
    const next = value.slice();
    for (const f of picked) {
      try {
        next.push(await compressImage(f));
      } catch (e) {
        onError(t.editor.photoUnusable);
      }
    }
    onChange(next);
    setBusy(false);
    if (input.current) input.current.value = '';
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
      {value.map((src, i) => (
        <div key={src.slice(-32) + i} className="group relative aspect-square overflow-hidden rounded-2xl bg-paper-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={fmt(t.editor.photoN, { n: i + 1 })} className="h-full w-full object-cover" />
          <span className="absolute left-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-[10px] font-extrabold text-white">{i + 1}</span>
          <button
            type="button"
            onClick={() => onChange(value.filter((_, k) => k !== i))}
            className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-base leading-none text-white"
            aria-label={fmt(t.editor.removePhoto, { n: i + 1 })}
          >
            ×
          </button>
          {value.length > 1 ? (
            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="grid h-7 w-7 place-items-center rounded-full bg-black/60 text-sm text-white disabled:opacity-0" aria-label={t.editor.moveLeft}>
                ‹
              </button>
              <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="grid h-7 w-7 place-items-center rounded-full bg-black/60 text-sm text-white disabled:opacity-0" aria-label={t.editor.moveRight}>
                ›
              </button>
            </div>
          ) : null}
        </div>
      ))}
      {value.length < spec.count ? (
        <label className="grid aspect-square cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-line bg-white text-center text-[12.5px] font-bold text-ink-2 transition-colors hover:border-ink">
          <input
            ref={input}
            id={`f-${spec.key}`}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => add(e.target.files)}
          />
          <span>
            <span className="block text-2xl leading-none">{busy ? '…' : '+'}</span>
            {busy ? t.editor.processing : t.editor.addPhoto}
          </span>
        </label>
      ) : null}
    </div>
  );
}
