'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fmt, useLocale, useT } from '@/i18n/client';
import type { Dict } from '@/i18n/dict';
import { type MyGift, type OrderInfo, api, clearDraft, errorText, upsertMyGift, uploadPhotos } from '@/lib/client';
import { qrDataUrl } from '@/lib/qr';
import { QrPanel } from './GiftQr';
import { MARKET_CURRENCY, type Market, PLANS, type PlanId, money, planAmount } from '@/lib/site';
import { SLUG_MAX, SLUG_MIN, slugProblem, slugify, suggestSlug } from '@/lib/slug';
import { Confetti } from '@/templates/kit';
import type { GiftData, TemplateMeta } from '@/templates/types';

type SlugState = { s: 'idle' | 'checking' | 'ok' | 'bad'; reason?: string; suggestion?: string };

function slugReason(code: string | undefined, t: Dict) {
  const m = t.slug as Record<string, string>;
  return fmt(m[code ?? ''] ?? m.reserved, { n: code === 'too_long' ? SLUG_MAX : SLUG_MIN });
}
type MarketInfo = { available: boolean; test: boolean; provider: string | null };
export type PaymentOptions = { country: string | null; suggested: Market; options: Record<Market, MarketInfo> };


/** Menyimpan pesanan ke daftar "Kado saya" di perangkat ini. */
export function rememberOrder(
  o: OrderInfo,
  status: 'pending' | 'live',
  extra: { template: string; to: string; from: string; createdAt?: string; lockPassword?: string },
) {
  upsertMyGift({
    id: o.id,
    slug: o.slug,
    template: extra.template,
    to: extra.to,
    from: extra.from,
    editKey: o.editKey,
    amount: o.amount,
    currency: o.currency,
    status,
    createdAt: extra.createdAt ?? new Date().toISOString(),
    ...(extra.lockPassword ? { locked: true, lockPassword: extra.lockPassword } : {}),
    pay:
      status === 'pending'
        ? { provider: o.provider, test: o.test, kind: o.kind, qr: o.qr, payUrl: o.payUrl, url: o.url, expiresAt: o.expiresAt }
        : undefined,
  });
}

function orderFromMyGift(g: MyGift): OrderInfo | null {
  if (!g.pay) return null;
  return { id: g.id, slug: g.slug, amount: g.amount, currency: g.currency ?? 'IDR', editKey: g.editKey, ...g.pay };
}

/**
 * Checkout satu layar: alamat kado → paket & cara bayar → bayar → kado terbit.
 * Indonesia: QRIS lewat BorderPay, ditampilkan di sini. Luar negeri: kartu lewat Creem (pindah ke halaman Creem,
 * lalu kembali ke /bayar/selesai). `resume` melanjutkan pembayaran QRIS dari halaman Kado saya.
 */
export function CheckoutSheet({
  meta,
  data,
  sampleFields = [],
  resume,
  lock = null,
  onClose,
  onPhotos,
}: {
  meta: TemplateMeta;
  data: GiftData;
  /** kunci kata sandi dari editor (null = tidak dikunci) */
  lock?: { password: string; hint: string } | null;
  /** label kolom yang isinya masih contoh */
  sampleFields?: string[];
  resume?: MyGift;
  /** `finished` = true kalau ditutup setelah kadonya terbit */
  onClose: (finished: boolean) => void;
  onPhotos?: (photos: string[]) => void;
}) {
  const t = useT();
  const locale = useLocale();
  const [order, setOrder] = useState<OrderInfo | null>(resume ? orderFromMyGift(resume) : null);
  const [step, setStep] = useState<'form' | 'pay' | 'done'>(resume ? (resume.status === 'live' ? 'done' : 'pay') : 'form');
  const [slug, setSlug] = useState(() => resume?.slug ?? suggestSlug(data.to));
  const [slugState, setSlugState] = useState<SlugState>({ s: 'idle' });
  const [plan, setPlan] = useState<PlanId>((PLANS.find((p) => p.popular) ?? PLANS[0]).id);
  const [market, setMarket] = useState<Market>('id');
  const [options, setOptions] = useState<PaymentOptions | null>(null);
  const [contact, setContact] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currency = MARKET_CURRENCY[market];
  const price = planAmount(PLANS.find((p) => p.id === plan)!, currency);
  const extra = { template: meta.id, to: data.to, from: data.from, createdAt: resume?.createdAt, lockPassword: lock?.password.trim() || resume?.lockPassword };

  // kunci scroll halaman di belakang sheet
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // cara bayar yang aktif + saran berdasarkan negara pembeli
  useEffect(() => {
    if (resume) return;
    let alive = true;
    api<PaymentOptions>('/api/payment-options')
      .then((o) => {
        if (!alive) return;
        setOptions(o);
        setMarket(o.suggested);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [resume]);

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

  const submit = async () => {
    if (busy) return;
    if (slugState.s === 'bad' || slugProblem(slug)) {
      setError(t.checkout.fixAddress);
      return;
    }
    if (options && !options.options[market].available) {
      setError(t.checkout.methodOff);
      return;
    }
    setError(null);
    try {
      setBusy(t.checkout.preparing);
      const photos = await uploadPhotos(data.photos, (d, n) => setBusy(fmt(t.checkout.uploading, { done: d, total: n })));
      onPhotos?.(photos);
      setBusy(market === 'id' ? t.checkout.makingQris : t.checkout.makingCard);
      const o = await api<OrderInfo>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          template: meta.id,
          data: { ...data, photos },
          slug,
          plan,
          market,
          lang: locale,
          lock,
          contact,
          replaces: order ? { id: order.id, key: order.editKey } : undefined,
        }),
      });
      setOrder(o);
      rememberOrder(o, 'pending', extra);
      if (o.kind === 'redirect' && o.url) {
        setBusy(t.checkout.redirecting);
        window.location.assign(o.url);
        return; // tetap "sibuk" sampai halaman berpindah
      }
      setStep('pay');
      setBusy(null);
    } catch (e) {
      setError(errorText(e, t));
      setBusy(null);
    }
  };

  const onPaid = useCallback(
    (finalSlug: string) => {
      setOrder((cur) => {
        if (!cur) return cur;
        const next = { ...cur, slug: finalSlug || cur.slug };
        rememberOrder(next, 'live', extra);
        return next;
      });
      void clearDraft(meta.id);
      setStep('done');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [meta.id, data.to, data.from],
  );

  const canClose = step !== 'pay';
  const close = () => onClose(step === 'done');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={t.checkout.dialog}>
      <div className="absolute inset-0 animate-fade bg-ink/55 backdrop-blur-[2px]" onClick={canClose ? close : undefined} />
      <div className="relative max-h-[94dvh] w-full animate-sheet overflow-y-auto overscroll-contain rounded-t-[1.75rem] bg-paper shadow-pop sm:max-w-[26rem] sm:rounded-[1.75rem]">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-paper/95 px-5 pb-2 pt-4 backdrop-blur">
          <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wider text-muted">
            <StepDot on={step === 'form'} done={step !== 'form'} n={1} /> {t.checkout.stepLink}
            <span className="h-px w-4 bg-line" />
            <StepDot on={step === 'pay'} done={step === 'done'} n={2} /> {t.checkout.stepPay}
            <span className="h-px w-4 bg-line" />
            <StepDot on={step === 'done'} done={false} n={3} /> {t.checkout.stepSend}
          </div>
          <button type="button" onClick={close} className="grid h-9 w-9 place-items-center rounded-full bg-paper-2 text-lg leading-none" aria-label={t.checkout.close}>
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
              market={market}
              setMarket={(m) => {
                setMarket(m);
                setError(null);
              }}
              options={options}
              contact={contact}
              setContact={setContact}
              sampleFields={sampleFields}
              busy={busy}
              error={error}
              price={price}
              onBack={close}
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
              onLater={close}
            />
          ) : null}
          {step === 'done' && order ? (
            <DoneStep order={order} to={data.to} from={data.from} templateId={meta.id} locked={!!lock || !!resume?.locked} lockPassword={extra.lockPassword} />
          ) : null}
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

/* ───────────────────────── 1. link + paket + cara bayar ───────────────────────── */

const MARKETS: Market[] = ['id', 'intl'];

function FormStep(p: {
  to: string;
  slug: string;
  setSlug: (v: string) => void;
  commitSlug: () => void;
  slugState: SlugState;
  plan: PlanId;
  setPlan: (v: PlanId) => void;
  market: Market;
  setMarket: (m: Market) => void;
  options: PaymentOptions | null;
  contact: string;
  setContact: (v: string) => void;
  sampleFields: string[];
  busy: string | null;
  error: string | null;
  price: number;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const t = useT();
  const [host, setHost] = useState('floa.site');
  useEffect(() => setHost(window.location.host), []);
  const st = p.slugState;
  const currency = MARKET_CURRENCY[p.market];
  const info = p.options?.options[p.market];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        p.onSubmit();
      }}
    >
      <h2 className="font-display text-[1.7rem] font-semibold leading-tight">{p.to ? fmt(t.checkout.titleFor, { to: p.to }) : t.checkout.title}</h2>

      {p.sampleFields.length ? (
        <button type="button" onClick={p.onBack} className="mt-3 block w-full rounded-2xl bg-butter/55 px-3.5 py-2.5 text-left text-[13px] font-semibold leading-snug">
          {fmt(t.checkout.stillSample, { fields: p.sampleFields.join(', ') })} <span className="underline underline-offset-2">{t.checkout.checkAgain}</span>
        </button>
      ) : null}

      <label htmlFor="co-slug" className="mt-5 block text-[14px] font-extrabold">
        {t.checkout.address}
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
          placeholder={t.checkout.addressPlaceholder}
          aria-describedby="co-slug-status"
        />
        <span className="grid h-7 w-7 flex-none place-items-center" aria-hidden>
          {st.s === 'checking' ? <span className="floa-loader !h-4 !w-4 !border-2 text-muted" /> : null}
          {st.s === 'ok' ? <span className="grid h-6 w-6 place-items-center rounded-full bg-leaf text-xs font-bold text-white">✓</span> : null}
          {st.s === 'bad' ? <span className="grid h-6 w-6 place-items-center rounded-full bg-tomato text-xs font-bold text-white">!</span> : null}
        </span>
      </div>
      <p id="co-slug-status" className="mt-1.5 min-h-5 text-[13px] font-semibold" aria-live="polite">
        {st.s === 'ok' ? <span className="text-leaf">{t.checkout.available}</span> : null}
        {st.s === 'bad' ? (
          <span className="text-tomato-dark">
            {slugReason(st.reason, t)}.{' '}
            {st.suggestion ? (
              <button type="button" className="underline underline-offset-2" onClick={() => p.setSlug(st.suggestion!)}>
                {fmt(t.checkout.use, { slug: st.suggestion! })}
              </button>
            ) : null}
          </span>
        ) : null}
        {st.s === 'idle' || st.s === 'checking' ? <span className="text-muted">{t.checkout.slugHelp}</span> : null}
      </p>

      <fieldset className="mt-3">
        <legend className="text-[14px] font-extrabold">{t.checkout.payFrom}</legend>
        <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-2xl bg-paper-2 p-1" role="radiogroup">
          {MARKETS.map((id) => {
            const m = id === 'id' ? { id, title: t.checkout.marketId, sub: t.checkout.marketIdSub } : { id, title: t.checkout.marketIntl, sub: t.checkout.marketIntlSub };
            const on = p.market === m.id;
            const off = p.options ? !p.options.options[m.id].available : false;
            return (
              <label
                key={m.id}
                className={
                  'cursor-pointer rounded-[0.85rem] px-3 py-2.5 text-center transition-all ' +
                  (on ? 'bg-white shadow-card' : 'text-ink-2') +
                  (off ? ' cursor-not-allowed opacity-50' : '')
                }
              >
                <input
                  type="radio"
                  name="market"
                  value={m.id}
                  checked={on}
                  disabled={off}
                  onChange={() => p.setMarket(m.id)}
                  className="sr-only"
                />
                <span className="block text-[14px] font-extrabold leading-tight">{m.title}</span>
                <span className="mt-0.5 block text-[11.5px] font-semibold text-muted">{off ? t.checkout.notActive : m.sub}</span>
              </label>
            );
          })}
        </div>
        <p className="mt-1.5 text-[12.5px] leading-snug text-muted">
          {p.market === 'id' ? t.checkout.noteId : t.checkout.noteIntl}
        </p>
      </fieldset>

      <fieldset className="mt-4">
        <legend className="text-[14px] font-extrabold">{t.checkout.howLong}</legend>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {PLANS.map((pl) => {
            const on = p.plan === pl.id;
            return (
              <label
                key={pl.id}
                className={
                  'relative cursor-pointer rounded-2xl px-2 py-3 transition-shadow min-[360px]:px-2.5 sm:p-3.5 ' +
                  (on ? 'bg-white shadow-[inset_0_0_0_2.5px_var(--color-ink)]' : 'bg-white shadow-[inset_0_0_0_1.5px_var(--color-line)]')
                }
              >
                <input type="radio" name="plan" value={pl.id} checked={on} onChange={() => p.setPlan(pl.id)} className="sr-only" />
                {pl.popular ? (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-butter px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider">{t.plans.recommended}</span>
                ) : null}
                <span className="block text-[13px] font-bold text-ink-2">{t.plans[pl.id].name}</span>
                <span className="font-display mt-0.5 block whitespace-nowrap text-[1.02rem] font-semibold leading-none min-[360px]:text-[1.15rem] min-[400px]:text-[1.3rem]">
                  {currency === 'IDR' ? (
                    <>
                      <span className="mr-0.5 align-[0.28em] text-[0.62em]">Rp</span>
                      {planAmount(pl, currency).toLocaleString('id-ID')}
                    </>
                  ) : (
                    money(planAmount(pl, currency), currency)
                  )}
                </span>
                <span className="mt-1 block text-[11.5px] leading-tight text-muted">{t.plans[pl.id].note}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label htmlFor="co-contact" className="mt-4 block text-[14px] font-extrabold">
        {t.checkout.whatsapp} <span className="font-semibold text-muted">{t.checkout.optional}</span>
      </label>
      <input
        id="co-contact"
        value={p.contact}
        onChange={(e) => p.setContact(e.target.value)}
        inputMode="tel"
        autoComplete="tel"
        maxLength={20}
        placeholder={p.market === 'id' ? '08xxxxxxxxxx' : '+1 555 000 0000'}
        className="mt-1.5 w-full rounded-2xl bg-white px-4 py-3 text-[16px] shadow-[inset_0_0_0_1.5px_var(--color-line)] outline-none focus:shadow-[inset_0_0_0_2px_var(--color-ink)]"
      />
      <p className="mt-1 text-[12.5px] text-muted">{t.checkout.whatsappHelp}</p>

      {info?.test ? (
        <p className="mt-4 rounded-2xl bg-butter/60 px-3.5 py-2.5 text-[12.5px] font-semibold leading-snug">
          {t.checkout.testMode}
        </p>
      ) : null}

      {p.error ? (
        <p className="mt-4 rounded-2xl bg-tomato/10 px-3.5 py-2.5 text-[13.5px] font-bold text-tomato-dark" role="alert">
          {p.error}
        </p>
      ) : null}

      <button type="submit" disabled={!!p.busy || p.slugState.s === 'checking'} className="btn btn-primary mt-5 h-14 w-full text-[16px]">
        {p.busy ?? (
          <>
            {fmt(p.market === 'id' ? t.checkout.payQris : t.checkout.payCard, { price: money(p.price, currency) })} <span aria-hidden>→</span>
          </>
        )}
      </button>
      <p className="mt-3 text-center text-[12px] leading-snug text-muted">
        {t.checkout.legalA}{' '}
        <Link href="/syarat" target="_blank" className="underline">
          {t.nav.terms}
        </Link>{' '}
        {t.checkout.legalAnd}{' '}
        <Link href="/privasi" target="_blank" className="underline">
          {t.nav.privacy}
        </Link>
        {t.checkout.legalB === '.' ? '.' : ` ${t.checkout.legalB}`}
      </p>
    </form>
  );
}

/* ───────────────────────── 2. bayar (QRIS) ───────────────────────── */

function PayStep({
  order,
  onPaid,
  onChange,
  onLater,
}: {
  order: OrderInfo;
  onPaid: (slug: string) => void;
  onChange?: () => void;
  onLater: () => void;
}) {
  const t = useT();
  const [img, setImg] = useState<string | null>(null);
  const [left, setLeft] = useState(() => Math.max(0, new Date(order.expiresAt).getTime() - Date.now()));
  const [simulating, setSimulating] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const paid = useRef(onPaid);
  paid.current = onPaid;

  useEffect(() => {
    let alive = true;
    if (order.qr) qrDataUrl(order.qr).then((u) => alive && setImg(u));
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
        const r = await api<{ status: string; slug: string }>(`/api/orders/${order.id}`);
        if (!alive) return;
        if (r.status === 'live') return paid.current(r.slug);
      } catch {
        /* jaringan putus sebentar: coba lagi */
      }
      if (alive) timer = setTimeout(poll, 3000);
    };
    timer = setTimeout(poll, 2500);
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
    setNote(null);
    try {
      const r = await api<{ status: string; slug: string }>('/api/pay/simulate', { method: 'POST', body: JSON.stringify({ id: order.id }) });
      if (r.status === 'live') paid.current(r.slug);
      else {
        setNote(t.checkout.simulateSent);
        setSimulating(false);
      }
    } catch (e) {
      setNote(errorText(e, t));
      setSimulating(false);
    }
  };

  return (
    <div className="text-center">
      <h2 className="font-display text-[1.7rem] font-semibold leading-tight">{t.checkout.scanTitle}</h2>
      <p className="mt-1 text-[14px] text-ink-2">
        {t.checkout.scanSub} <b>{t.checkout.scanQris}</b>.
      </p>

      {order.provider === 'demo' ? (
        <p className="mt-3 rounded-2xl bg-butter/60 px-3.5 py-2.5 text-left text-[13px] font-semibold leading-snug">
          {t.checkout.demoNote}
        </p>
      ) : order.test ? (
        <p className="mt-3 rounded-2xl bg-butter/60 px-3.5 py-2.5 text-left text-[13px] font-semibold leading-snug">
          {t.checkout.bpTestNote}
        </p>
      ) : null}

      <div className="mx-auto mt-4 w-[15.5rem] rounded-[1.6rem] bg-white p-3.5 shadow-card">
        <div className="flex items-center justify-between px-1 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-muted">
          <span>QRIS</span>
          <span>floa</span>
        </div>
        <div className={'relative aspect-square overflow-hidden rounded-xl bg-paper-2 ' + (expired ? 'opacity-25' : '')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {img ? <img src={img} alt={t.checkout.qrAlt} className="h-full w-full" /> : <span className="floa-loader absolute inset-0 m-auto text-muted" />}
        </div>
        <div className="font-display mt-2.5 text-[1.7rem] font-semibold leading-none">{money(order.amount, order.currency)}</div>
      </div>

      {expired ? (
        <p className="mt-4 text-[14px] font-bold text-tomato-dark">{t.checkout.expired}</p>
      ) : (
        <p className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-ink-2" aria-live="off">
          <span className="floa-loader !h-4 !w-4 !border-2" /> {t.checkout.waiting} · <span className="tabular-nums">{mm}:{ss}</span>
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {order.test && !expired ? (
          <button type="button" onClick={simulate} disabled={simulating} className="btn btn-primary h-13 w-full py-4 text-[15px]">
            {simulating ? t.checkout.simulating : t.checkout.simulate}
          </button>
        ) : null}
        {order.payUrl && !expired ? (
          <a href={order.payUrl} className="btn btn-ghost h-12 w-full text-[14px]">
            {t.checkout.payOnBorderpay}
          </a>
        ) : null}
        {img && !expired ? (
          <a href={img} download={`qris-floa-${order.slug}.png`} className="btn btn-ghost h-12 w-full text-[14px]">
            {t.checkout.saveQr}
          </a>
        ) : null}
        {onChange ? (
          <button type="button" onClick={onChange} className="btn h-11 w-full text-[13.5px] text-ink-2 underline underline-offset-2">
            {expired ? t.checkout.newQr : t.checkout.change}
          </button>
        ) : null}
      </div>
      {note ? <p className="mt-2 text-[13px] font-bold text-ink-2">{note}</p> : null}
      <p className="mt-3 text-[12.5px] leading-snug text-muted">
        {t.checkout.autoContinue}{' '}
        <button type="button" onClick={onLater} className="font-bold underline">
          {t.nav.myGifts}
        </button>
        .
      </p>
    </div>
  );
}

/* ───────────────────────── 3. terbit ───────────────────────── */

export function DoneStep({
  order,
  to,
  from,
  templateId,
  locked = false,
  lockPassword,
}: {
  order: { id: string; slug: string; editKey?: string };
  to: string;
  from: string;
  templateId?: string;
  locked?: boolean;
  lockPassword?: string;
}) {
  const t = useT();
  const [origin, setOrigin] = useState('https://floa.site');
  const [copied, setCopied] = useState(false);
  const [burst, setBurst] = useState(0);
  const url = `${origin}/${order.slug}`;

  useEffect(() => {
    setOrigin(window.location.origin);
    setBurst(1);
  }, []);
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

  const waText = `${fmt(t.checkout.waMessage, { to: to ? ` ${to}` : '', from: from ? fmt(t.checkout.waFrom, { from }) : '' })}\n${url}`;

  return (
    <div className="relative text-center">
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-[26rem]">
        <Confetti burst={burst} origin={{ x: 0.5, y: 0.5 }} />
      </div>
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-leaf text-2xl text-white">✓</div>
      <h2 className="font-display mt-3 text-[1.9rem] font-semibold leading-tight">{t.checkout.doneTitle}</h2>
      <p className="mt-1 text-[14px] text-ink-2">{to ? fmt(t.checkout.doneSubTo, { to }) : t.checkout.doneSub}</p>

      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white p-2 pl-4 shadow-[inset_0_0_0_1.5px_var(--color-line)]">
        <span className="min-w-0 flex-1 truncate text-left text-[15px] font-bold" data-testid="gift-url">
          {url.replace(/^https?:\/\//, '')}
        </span>
        <button type="button" onClick={copy} className="btn btn-ink h-10 flex-none px-4 text-[13px]">
          {copied ? t.checkout.copied : t.checkout.copy}
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <a href={`https://wa.me/?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener" className="btn btn-primary h-13 w-full py-4 text-[15px]">
          {t.checkout.sendWa}
        </a>
        {locked ? (
          <p className="flex items-start gap-2 rounded-2xl bg-butter/60 px-3.5 py-2.5 text-left text-[13px] font-semibold leading-snug">
            <span aria-hidden>🔒</span>
            <span>{lockPassword ? fmt(t.lock.reminder, { password: lockPassword }) : t.lock.reminderNoPass}</span>
          </p>
        ) : null}
        <QrPanel slug={order.slug} to={to} from={from} templateId={templateId} />
        <a href={`/${order.slug}`} target="_blank" rel="noopener" className="btn btn-ghost h-12 w-full text-[14px]">
          {t.checkout.viewGift}
        </a>
      </div>

      <p className="mt-4 text-[12.5px] leading-snug text-muted">
        {order.editKey && templateId ? (
          <>
            {t.checkout.editLater}{' '}
            <Link href={`/buat/${templateId}?edit=${order.id}&key=${encodeURIComponent(order.editKey)}`} className="font-bold underline">
              {t.checkout.editContent}
            </Link>{' '}
            {t.checkout.orOpen}{' '}
          </>
        ) : (
          `${t.checkout.listAt} `
        )}
        <Link href="/kado-saya" className="font-bold underline">
          {t.nav.myGifts}
        </Link>
        .
      </p>
    </div>
  );
}
