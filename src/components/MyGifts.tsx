'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { type MyGift, api, readMyGifts, removeMyGift, upsertMyGift } from '@/lib/client';
import { fmt, useLocale, useT } from '@/i18n/client';
import { EMPTY_DATA } from '@/lib/gift';
import { COVERS } from '@/templates/covers';
import { getTemplate } from '@/templates/registry';
import { CheckoutSheet } from './CheckoutSheet';

export function MyGifts() {
  const t = useT();
  const locale = useLocale();
  const [list, setList] = useState<MyGift[] | null>(null);
  const [resume, setResume] = useState<MyGift | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const refresh = () => setList(readMyGifts());

  useEffect(() => {
    const gifts = readMyGifts();
    setList(gifts);
    // pesanan yang belum lunas: cek, siapa tahu pembayarannya sudah masuk
    gifts
      .filter((g) => g.status === 'pending')
      .forEach(async (g) => {
        try {
          const r = await api<{ status: 'pending' | 'live'; slug: string }>(`/api/orders/${g.id}`);
          if (r.status === 'live') {
            // slug bisa berbeda kalau pembayarannya telat dan alamatnya sempat dilepas
            upsertMyGift({ ...g, slug: r.slug, status: 'live', pay: undefined });
            setList(readMyGifts());
          }
        } catch {
          /* pesanan sudah tidak ada di server: biarkan, pengguna bisa menghapusnya */
        }
      });
  }, []);

  const copy = async (g: MyGift) => {
    const url = `${window.location.origin}/${g.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(g.id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt(t.myGifts.copyPrompt, url);
    }
  };

  if (list === null) return <div className="mt-10 h-40" />;

  if (!list.length) {
    return (
      <div className="paper-card mt-8 rounded-3xl p-8 text-center">
        <p className="font-display text-2xl font-semibold">{t.myGifts.emptyTitle}</p>
        <p className="mt-2 text-[15px] text-ink-2">{t.myGifts.emptySub}</p>
        <Link href="/" className="btn btn-primary mt-5 h-12 px-6">
          {t.myGifts.pick}
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="mt-6 space-y-3">
        {list.map((g) => {
          const meta = getTemplate(g.template, locale);
          const Cover = COVERS[g.template];
          const pending = g.status === 'pending';
          const payable = pending && !!g.pay && new Date(g.pay.expiresAt).getTime() > Date.now();
          return (
            <li key={g.id} className="paper-card flex gap-3.5 rounded-3xl p-3">
              <div className="relative h-24 w-20 flex-none overflow-hidden rounded-2xl">{Cover ? <Cover /> : null}</div>
              <div className="min-w-0 flex-1 py-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-[16px] font-extrabold">{fmt(t.myGifts.for, { to: g.to || '…' })}</h2>
                  <span
                    className={
                      'flex-none rounded-full px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider ' +
                      (pending ? 'bg-butter/70 text-ink' : 'bg-leaf/15 text-leaf')
                    }
                  >
                    {pending ? t.myGifts.unpaid : t.myGifts.live}
                  </span>
                </div>
                <p className="truncate text-[13px] text-muted">
                  {meta?.name ?? g.template} · /{g.slug}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {pending ? (
                    <>
                      {payable && g.pay?.kind === 'redirect' && g.pay.url ? (
                        <a href={g.pay.url} className="btn btn-primary h-9 px-3.5 text-[13px]">
                          {t.myGifts.continuePay}
                        </a>
                      ) : payable ? (
                        <button type="button" onClick={() => setResume(g)} className="btn btn-primary h-9 px-3.5 text-[13px]">
                          {t.myGifts.continuePay}
                        </button>
                      ) : (
                        <Link href={`/buat/${g.template}`} className="btn btn-ink h-9 px-3.5 text-[13px]">
                          {t.myGifts.republish}
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          removeMyGift(g.id);
                          refresh();
                        }}
                        className="btn btn-ghost h-9 px-3.5 text-[13px]"
                      >
                        {t.myGifts.remove}
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => copy(g)} className="btn btn-ink h-9 px-3.5 text-[13px]">
                        {copied === g.id ? t.myGifts.copied : t.myGifts.copyLink}
                      </button>
                      <a href={`/${g.slug}`} target="_blank" rel="noopener" className="btn btn-ghost h-9 px-3.5 text-[13px]">
                        {t.myGifts.view}
                      </a>
                      <Link href={`/buat/${g.template}?edit=${g.id}&key=${encodeURIComponent(g.editKey)}`} className="btn btn-ghost h-9 px-3.5 text-[13px]">
                        {t.myGifts.edit}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {resume && getTemplate(resume.template) ? (
        <CheckoutSheet
          meta={getTemplate(resume.template, locale)!}
          data={{ ...EMPTY_DATA, to: resume.to, from: resume.from ?? '' }}
          resume={resume}
          onClose={() => {
            setResume(null);
            refresh();
          }}
        />
      ) : null}
    </>
  );
}
