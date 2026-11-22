'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type MyGift, api, clearDraft, upsertMyGift, uploadPhotos } from '@/lib/client';
import { PLANS, type PlanId, rupiah } from '@/lib/site';
import { slugProblem, slugify, suggestSlug } from '@/lib/slug';
import { Confetti } from '@/templates/kit';
import type { GiftData, TemplateMeta } from '@/templates/types';

type Order = { id: string; slug: string; amount: number; editKey: string; qr: string; expiresAt: string; demo: boolean };
type SlugState = { s: 'idle' | 'checking' | 'ok' | 'bad'; reason?: string; suggestion?: string };

async function qrDataUrl(text: string, size = 720) {
  const QR = (await import('qrcode')).default;
  return QR.toDataURL(text, { margin: 2, width: size, errorCorrectionLevel: 'M', color: { dark: '#1e1b18', light: '#ffffff' } });
}

/**
 * Checkout satu layar: alamat kado → paket → bayar QRIS → kado terbit.
 * `resume` dipakai untuk melanjutkan pembayaran dari halaman Kado saya.
 */
export function CheckoutSheet({
  meta,
  data,
  sampleFields = [],
  resume,
  onClose,
  onPhotos,
}: {
  meta: TemplateMeta;
  data: GiftData;
  /** label kolom yang isinya masih contoh */
  sampleFields?: string[];
  resume?: MyGift;
  onClose: () => void;
  onPhotos?: (photos: string[]) => void;
}) {
  const [order, setOrder] = useState<Order | null>(
    resume?.qr && resume.expiresAt
      ? { id: resume.id, slug: resume.slug, amount: resume.amount, editKey: resume.editKey, qr: resume.qr, expiresAt: resume.expiresAt, demo: !!resume.demo }
      : null,
  );
  const [step, setStep] = useState<'form' | 'pay' | 'done'>(resume ? (resume.status === 'live' ? 'done' : 'pay') : 'form');
  const [slug, setSlug] = useState(() => resume?.slug ?? suggestSlug(data.to));
  const [slugState, setSlugState] = useState<SlugState>({ s: 'idle' });
  const [plan, setPlan] = useState<PlanId>((PLANS.find((p) => p.popular) ?? PLANS[0]).id);
  const [contact, setContact] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const price = PLANS.find((p) => p.id === plan)!.price;

  // kunci scroll halaman di belakang sheet
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // cek ketersediaan alamat
  useEffect(() => {
    if (step !== 'form') return;
    const problem = slugProblem(slug);
    if (problem) {
      setSlugState(slug ? { s: 'bad', reason: problem } : { s: 'idle' });
      return;
    }
    setSlugState({ s: 'checking' });
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await api<{ ok: boolean; reason?: string; suggestion?: string }>(`/api/slug?s=${encodeURIComponent(slug)}`, { signal: ctrl.signal });
        // pesanan kita sendiri yang belum dibayar memegang alamat ini: tetap boleh dipakai
        if (!r.ok && order && order.slug === slug) setSlugState({ s: 'ok' });
        else setSlugState(r.ok ? { s: 'ok' } : { s: 'bad', reason: r.reason, suggestion: r.suggestion });
      } catch {
        if (!ctrl.signal.aborted) setSlugState({ s: 'idle' });
      }
    }, 350);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [slug, step, order]);

  const remember = useCallback(
    (o: Order, status: 'pending' | 'live') => {
      upsertMyGift({
        id: o.id,
        slug: o.slug,
        template: meta.id,
        to: data.to,
        editKey: o.editKey,
        amount: o.amount,
        status,
        createdAt: resume?.createdAt ?? new Date().toISOString(),
        ...(status === 'pending' ? { qr: o.qr, expiresAt: o.expiresAt, demo: o.demo } : {}),
      });
    },
    [meta.id, data.to, resume?.createdAt],
  );

  const submit = async () => {
    if (busy) return;
    if (slugState.s === 'bad' || slugProblem(slug)) {
      setError('Alamat kadonya belum bisa dipakai. Ganti dulu ya.');
      return;
    }
    setError(null);
    try {
      setBusy('Menyiapkan…');
      const photos = await uploadPhotos(data.photos, (d, t) => setBusy(`Mengunggah foto ${d}/${t}…`));
      onPhotos?.(photos);
      setBusy('Membuat QRIS…');
      const o = await api<Order>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          template: meta.id,
          data: { ...data, photos },
          slug,
          plan,
          contact,
          replaces: order ? { id: order.id, key: order.editKey } : undefined,
        }),
      });
      setOrder(o);
      remember(o, 'pending');
      setStep('pay');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ada yang tidak beres. Coba lagi ya.');
    } finally {
      setBusy(null);
    }
  };

  const onPaid = useCallback(() => {
    if (!order) return;
    remember(order, 'live');
    void clearDraft(meta.id);
    setStep('done');
  }, [order, remember, meta.id]);

  const canClose = step !== 'pay';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Terbitkan kado">
      <div className="absolute inset-0 animate-fade bg-ink/55 backdrop-blur-[2px]" onClick={canClose ? onClose : undefined} />
      <div className="relative max-h-[94dvh] w-full animate-sheet overflow-y-auto overscroll-contain rounded-t-[1.75rem] bg-paper shadow-pop sm:max-w-[26rem] sm:rounded-[1.75rem]">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-paper/95 px-5 pb-2 pt-4 backdrop-blur">
          <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wider text-muted">
            <StepDot on={step === 'form'} done={step !== 'form'} n={1} /> Link
            <span className="h-px w-4 bg-line" />
            <StepDot on={step === 'pay'} done={step === 'done'} n={2} /> Bayar
            <span className="h-px w-4 bg-line" />
            <StepDot on={step === 'done'} done={false} n={3} /> Kirim
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-paper-2 text-lg leading-none" aria-label="Tutup">
            ×
          </button>
        </div>

        <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1">
          {step === 'form' ? (
            <FormStep
              to={data.to}
              slug={slug}
              setSlug={(v) => setSlug(slugify(v.replace(/\s+/g, '-')) + (v.endsWith('-') && !v.endsWith('--') ? '-' : ''))}
              commitSlug={() => setSlug((v) => slugify(v))}
              slugState={slugState}
              plan={plan}
              setPlan={setPlan}
              contact={contact}
              setContact={setContact}
              sampleFields={sampleFields}
              busy={busy}
              error={error}
              price={price}
              onBack={onClose}
              onSubmit={submit}
            />
          ) : null}
          {step === 'pay' && order ? (
            <PayStep
              order={order}
              onPaid={onPaid}
              onChange={
                resume
                  ? undefined
                  : () => {
                      setError(null);
                      setStep('form');
                    }
              }
              onLater={onClose}
            />
          ) : null}
          {step === 'done' && order ? <DoneStep order={order} to={data.to} from={data.from} templateId={meta.id} /> : null}
        </div>
      </div>
    </div>
  );
}

function StepDot({ on, done, n }: { on: boolean; done: boolean; n: number }) {
  return (
    <span
      className={
        'grid h-5 w-5 place-items-center rounded-full text-[10px] ' +
        (done ? 'bg-leaf text-white' : on ? 'bg-ink text-paper' : 'bg-paper-2 text-muted')
      }
    >
      {done ? '✓' : n}
    </span>
  );
}

/* ───────────────────────── 1. link + paket ───────────────────────── */

function FormStep(p: {
  to: string;
  slug: string;
  setSlug: (v: string) => void;
  commitSlug: () => void;
  slugState: SlugState;
  plan: PlanId;
  setPlan: (v: PlanId) => void;
  contact: string;
  setContact: (v: string) => void;
  sampleFields: string[];
  busy: string | null;
  error: string | null;
  price: number;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const [host, setHost] = useState('floa.site');
  useEffect(() => setHost(window.location.host), []);
  const st = p.slugState;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        p.onSubmit();
      }}
    >
      <h2 className="font-display text-[1.7rem] font-semibold leading-tight">Terbitkan kado{p.to ? ` untuk ${p.to}` : ''}</h2>

      {p.sampleFields.length ? (
        <button type="button" onClick={p.onBack} className="mt-3 block w-full rounded-2xl bg-butter/55 px-3.5 py-2.5 text-left text-[13px] font-semibold leading-snug">
          Masih isi contoh: {p.sampleFields.join(', ')}. <span className="underline underline-offset-2">Periksa lagi</span>
        </button>
      ) : null}

      <label htmlFor="co-slug" className="mt-5 block text-[14px] font-extrabold">
        Alamat kadomu
      </label>
      <div
        className={
          'mt-1.5 flex items-center rounded-2xl bg-white pl-3.5 pr-2 shadow-[inset_0_0_0_1.5px_var(--color-line)] focus-within:shadow-[inset_0_0_0_2px_var(--color-ink)] ' +
          (st.s === 'bad' ? '!shadow-[inset_0_0_0_2px_var(--color-tomato)]' : '')
        }
      >
        <span className="flex-none text-[15px] text-muted">{host}/</span>
        <input
          id="co-slug"
          value={p.slug}
          onChange={(e) => p.setSlug(e.target.value)}
          onBlur={p.commitSlug}
          className="min-w-0 flex-1 bg-transparent py-3.5 text-[16px] font-bold outline-none"
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          maxLength={32}
          placeholder="untuk-namanya"
          aria-describedby="co-slug-status"
        />
        <span className="grid h-7 w-7 flex-none place-items-center" aria-hidden>
          {st.s === 'checking' ? <span className="floa-loader !h-4 !w-4 !border-2 text-muted" /> : null}
          {st.s === 'ok' ? <span className="grid h-6 w-6 place-items-center rounded-full bg-leaf text-xs font-bold text-white">✓</span> : null}
          {st.s === 'bad' ? <span className="grid h-6 w-6 place-items-center rounded-full bg-tomato text-xs font-bold text-white">!</span> : null}
        </span>
      </div>
      <p id="co-slug-status" className="mt-1.5 min-h-5 text-[13px] font-semibold" aria-live="polite">
        {st.s === 'ok' ? <span className="text-leaf">Tersedia. Ini link yang nanti kamu kirim.</span> : null}
        {st.s === 'bad' ? (
          <span className="text-tomato-dark">
            {st.reason}.{' '}
            {st.suggestion ? (
              <button type="button" className="underline underline-offset-2" onClick={() => p.setSlug(st.suggestion!)}>
                Pakai {st.suggestion}
              </button>
            ) : null}
          </span>
        ) : null}
        {st.s === 'idle' || st.s === 'checking' ? <span className="text-muted">Huruf kecil, angka, dan tanda hubung.</span> : null}
      </p>

      <fieldset className="mt-4">
        <legend className="text-[14px] font-extrabold">Link aktif berapa lama?</legend>
        <div className="mt-1.5 grid grid-cols-2 gap-2.5">
          {PLANS.map((pl) => {
            const on = p.plan === pl.id;
            return (
              <label
                key={pl.id}
                className={
                  'relative cursor-pointer rounded-2xl p-3.5 transition-shadow ' +
                  (on ? 'bg-white shadow-[inset_0_0_0_2.5px_var(--color-ink)]' : 'bg-white shadow-[inset_0_0_0_1.5px_var(--color-line)]')
                }
              >
                <input type="radio" name="plan" value={pl.id} checked={on} onChange={() => p.setPlan(pl.id)} className="sr-only" />
                {pl.popular ? (
                  <span className="absolute -top-2 right-3 rounded-full bg-butter px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">Paling dipilih</span>
                ) : null}
                <span className="block text-[13px] font-bold text-ink-2">{pl.name}</span>
                <span className="font-display mt-0.5 block text-[1.45rem] font-semibold leading-none">{rupiah(pl.price)}</span>
                <span className="mt-1 block text-[12px] leading-tight text-muted">{pl.note}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label htmlFor="co-contact" className="mt-4 block text-[14px] font-extrabold">
        Nomor WhatsApp <span className="font-semibold text-muted">(opsional)</span>
      </label>
      <input
        id="co-contact"
        value={p.contact}
        onChange={(e) => p.setContact(e.target.value)}
        inputMode="tel"
        autoComplete="tel"
        maxLength={20}
        placeholder="08xxxxxxxxxx"
        className="mt-1.5 w-full rounded-2xl bg-white px-4 py-3 text-[16px] shadow-[inset_0_0_0_1.5px_var(--color-line)] outline-none focus:shadow-[inset_0_0_0_2px_var(--color-ink)]"
      />
      <p className="mt-1 text-[12.5px] text-muted">Hanya dipakai kalau kamu butuh bantuan soal kado ini.</p>

      {p.error ? (
        <p className="mt-4 rounded-2xl bg-tomato/10 px-3.5 py-2.5 text-[13.5px] font-bold text-tomato-dark" role="alert">
          {p.error}
        </p>
      ) : null}

      <button type="submit" disabled={!!p.busy || p.slugState.s === 'checking'} className="btn btn-primary mt-5 h-14 w-full text-[16px]">
        {p.busy ?? (
          <>
            Bayar {rupiah(p.price)} pakai QRIS <span aria-hidden>→</span>
          </>
        )}
      </button>
      <p className="mt-3 text-center text-[12px] leading-snug text-muted">
        Sekali bayar, bukan langganan. Dengan membayar kamu setuju dengan{' '}
        <Link href="/syarat" target="_blank" className="underline">
          Syarat
        </Link>{' '}
        dan{' '}
        <Link href="/privasi" target="_blank" className="underline">
          Privasi
        </Link>{' '}
        floa.
      </p>
    </form>
  );
}

/* ───────────────────────── 2. bayar ───────────────────────── */

function PayStep({ order, onPaid, onChange, onLater }: { order: Order; onPaid: () => void; onChange?: () => void; onLater: () => void }) {
  const [img, setImg] = useState<string | null>(null);
  const [left, setLeft] = useState(() => Math.max(0, new Date(order.expiresAt).getTime() - Date.now()));
  const [simulating, setSimulating] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const paid = useRef(onPaid);
  paid.current = onPaid;

  useEffect(() => {
    let alive = true;
    qrDataUrl(order.qr).then((u) => alive && setImg(u));
    return () => {
      alive = false;
    };
  }, [order.qr]);

  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, new Date(order.expiresAt).getTime() - Date.now())), 1000);
    return () => clearInterval(t);
  }, [order.expiresAt]);

  // tanya status berkala; begitu lunas, lanjut otomatis
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const r = await api<{ status: string }>(`/api/orders/${order.id}`);
        if (!alive) return;
        if (r.status === 'live') return paid.current();
      } catch {
        /* jaringan putus sebentar: coba lagi */
      }
      if (alive) timer = setTimeout(poll, 2500);
    };
    timer = setTimeout(poll, 2000);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [order.id]);

  const expired = left <= 0;
  const mm = String(Math.floor(left / 60000)).padStart(2, '0');
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, '0');

  const simulate = async () => {
    setSimulating(true);
    try {
      await api('/api/pay/demo', { method: 'POST', body: JSON.stringify({ id: order.id }) });
      paid.current();
    } catch (e) {
      setNote(e instanceof Error ? e.message : 'Gagal.');
      setSimulating(false);
    }
  };

  return (
    <div className="text-center">
      <h2 className="font-display text-[1.7rem] font-semibold leading-tight">Scan untuk bayar</h2>
      <p className="mt-1 text-[14px] text-ink-2">
        Buka e-wallet atau m-banking, pilih <b>Scan QRIS</b>.
      </p>

      {order.demo ? (
        <p className="mt-3 rounded-2xl bg-butter/60 px-3.5 py-2.5 text-left text-[13px] font-semibold leading-snug">
          Mode simulasi: payment gateway belum disambungkan, jadi QR ini bukan QRIS asli dan tidak ada uang yang berpindah.
        </p>
      ) : null}

      <div className="mx-auto mt-4 w-[15.5rem] rounded-[1.6rem] bg-white p-3.5 shadow-card">
        <div className="flex items-center justify-between px-1 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-muted">
          <span>QRIS</span>
          <span>floa</span>
        </div>
        <div className={'relative aspect-square overflow-hidden rounded-xl bg-paper-2 ' + (expired ? 'opacity-25' : '')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {img ? <img src={img} alt="Kode QRIS untuk pembayaran" className="h-full w-full" /> : <span className="floa-loader absolute inset-0 m-auto text-muted" />}
        </div>
        <div className="font-display mt-2.5 text-[1.7rem] font-semibold leading-none">{rupiah(order.amount)}</div>
      </div>

      {expired ? (
        <p className="mt-4 text-[14px] font-bold text-tomato-dark">QR ini sudah kedaluwarsa.</p>
      ) : (
        <p className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-ink-2" aria-live="off">
          <span className="floa-loader !h-4 !w-4 !border-2" /> Menunggu pembayaran · <span className="tabular-nums">{mm}:{ss}</span>
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {order.demo && !expired ? (
          <button type="button" onClick={simulate} disabled={simulating} className="btn btn-primary h-13 w-full py-4 text-[15px]">
            {simulating ? 'Memproses…' : 'Simulasikan pembayaran berhasil'}
          </button>
        ) : null}
        {img && !expired ? (
          <a href={img} download={`qris-floa-${order.slug}.png`} className="btn btn-ghost h-12 w-full text-[14px]">
            Simpan QR ke galeri
          </a>
        ) : null}
        {onChange ? (
          <button type="button" onClick={onChange} className="btn h-11 w-full text-[13.5px] text-ink-2 underline underline-offset-2">
            {expired ? 'Buat QR baru' : 'Ganti link atau paket'}
          </button>
        ) : null}
      </div>
      {note ? <p className="mt-2 text-[13px] font-bold text-tomato-dark">{note}</p> : null}
      <p className="mt-3 text-[12.5px] leading-snug text-muted">
        Halaman ini otomatis lanjut begitu pembayaran masuk. Kalau tertutup, lanjutkan dari menu{' '}
        <button type="button" onClick={onLater} className="font-bold underline">
          Kado saya
        </button>
        .
      </p>
    </div>
  );
}

/* ───────────────────────── 3. terbit ───────────────────────── */

function DoneStep({ order, to, from, templateId }: { order: Order; to: string; from: string; templateId: string }) {
  const [origin, setOrigin] = useState('https://floa.site');
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [burst, setBurst] = useState(0);
  const url = `${origin}/${order.slug}`;

  useEffect(() => {
    setOrigin(window.location.origin);
    setBurst(1);
  }, []);
  useEffect(() => {
    let alive = true;
    qrDataUrl(url, 900).then((u) => alive && setQr(u));
    return () => {
      alive = false;
    };
  }, [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const waText = `Hai${to ? ` ${to}` : ''}, ada sesuatu buat kamu${from ? ` dari ${from}` : ''}. Buka pelan-pelan ya:\n${url}`;

  return (
    <div className="relative text-center">
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-[26rem]">
        <Confetti burst={burst} origin={{ x: 0.5, y: 0.5 }} />
      </div>
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-leaf text-2xl text-white">✓</div>
      <h2 className="font-display mt-3 text-[1.9rem] font-semibold leading-tight">Kadomu sudah terbit!</h2>
      <p className="mt-1 text-[14px] text-ink-2">Tinggal kirim link ini{to ? ` ke ${to}` : ''}.</p>

      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white p-2 pl-4 shadow-[inset_0_0_0_1.5px_var(--color-line)]">
        <span className="min-w-0 flex-1 truncate text-left text-[15px] font-bold" data-testid="gift-url">
          {url.replace(/^https?:\/\//, '')}
        </span>
        <button type="button" onClick={copy} className="btn btn-ink h-10 flex-none px-4 text-[13px]">
          {copied ? 'Tersalin ✓' : 'Salin'}
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <a href={`https://wa.me/?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener" className="btn btn-primary h-13 w-full py-4 text-[15px]">
          Kirim lewat WhatsApp
        </a>
        <div className="grid grid-cols-2 gap-2">
          <a href={`/${order.slug}`} target="_blank" rel="noopener" className="btn btn-ghost h-12 text-[14px]">
            Lihat kado
          </a>
          {qr ? (
            <a href={qr} download={`qr-kado-${order.slug}.png`} className="btn btn-ghost h-12 text-[14px]">
              Unduh QR
            </a>
          ) : (
            <span className="btn btn-ghost h-12 text-[14px] opacity-50">Unduh QR</span>
          )}
        </div>
      </div>

      <p className="mt-4 text-[12.5px] leading-snug text-muted">
        QR-nya bisa dicetak dan diselipkan di kado fisik. Mau ubah isinya nanti?{' '}
        <Link href={`/buat/${templateId}?edit=${order.id}&key=${encodeURIComponent(order.editKey)}`} className="font-bold underline">
          Ubah isi
        </Link>{' '}
        atau buka{' '}
        <Link href="/kado-saya" className="font-bold underline">
          Kado saya
        </Link>
        .
      </p>
    </div>
  );
}
