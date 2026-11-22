'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { type MyGift, api, clearDraft, findMyGift, upsertMyGift } from '@/lib/client';
import { DoneStep } from './CheckoutSheet';

type State = 'checking' | 'slow' | 'live' | 'missing';

const ORDER_ID = /^floa-[a-f0-9]{18}$/;

/**
 * Halaman kembali setelah membayar di halaman penyedia (Creem, atau halaman bayar BorderPay).
 * Alamat ini tidak dipercaya sebagai bukti bayar: status selalu dicek ke server, yang mengeceknya ke penyedia.
 */
export function PaymentReturn() {
  const [id, setId] = useState<string | null>(null);
  const [mine, setMine] = useState<MyGift | undefined>();
  const [state, setState] = useState<State>('checking');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    const o = new URLSearchParams(window.location.search).get('order') ?? '';
    if (!ORDER_ID.test(o)) {
      setState('missing');
      return;
    }
    setId(o);
    setMine(findMyGift(o));
  }, []);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const started = Date.now();
    const poll = async () => {
      try {
        const r = await api<{ status: string; slug: string }>(`/api/orders/${id}`);
        if (!alive) return;
        if (r.status === 'live') {
          setSlug(r.slug);
          const g = findMyGift(id);
          if (g) {
            upsertMyGift({ ...g, slug: r.slug, status: 'live', pay: undefined });
            void clearDraft(g.template);
          }
          setState('live');
          return;
        }
      } catch (e) {
        if (!alive) return;
        if (e instanceof Error && /tidak ditemukan/i.test(e.message)) {
          setState('missing');
          return;
        }
      }
      const waited = Date.now() - started;
      if (waited > 90_000) setState('slow');
      timer = setTimeout(poll, waited > 90_000 ? 8000 : 3000);
    };
    poll();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [id]);

  if (state === 'live' && id) {
    return (
      <DoneStep
        order={{ id, slug, editKey: mine?.editKey }}
        to={mine?.to ?? ''}
        from={mine?.from ?? ''}
        templateId={mine?.template}
      />
    );
  }

  if (state === 'missing') {
    return (
      <div className="text-center">
        <h1 className="font-display text-[1.9rem] font-semibold leading-tight">Pesanannya tidak ketemu</h1>
        <p className="mt-2 text-[15px] text-ink-2">
          Kalau kamu sudah membayar, tenang: cek menu Kado saya di perangkat yang kamu pakai saat memesan, atau hubungi kami.
        </p>
        <Link href="/kado-saya" className="btn btn-primary mt-6 h-12 px-6">
          Ke Kado saya
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center" aria-live="polite">
      <span className="floa-loader mx-auto block text-tomato" />
      <h1 className="font-display mt-5 text-[1.9rem] font-semibold leading-tight">
        {state === 'slow' ? 'Masih menunggu konfirmasi' : 'Mengonfirmasi pembayaran…'}
      </h1>
      <p className="mt-2 text-[15px] text-ink-2">
        {state === 'slow'
          ? 'Pembayaranmu belum terkonfirmasi. Biasanya hanya beberapa menit; halaman ini terus mengecek. Kamu juga bisa menutupnya dan cek lagi di Kado saya.'
          : 'Sebentar ya, kami sedang memastikan pembayaranmu masuk.'}
      </p>
      {state === 'slow' ? (
        <Link href="/kado-saya" className="btn btn-ghost mt-6 h-12 px-6">
          Ke Kado saya
        </Link>
      ) : null}
    </div>
  );
}
