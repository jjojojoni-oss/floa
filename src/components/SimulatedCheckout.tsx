'use client';

import { useEffect, useState } from 'react';
import { fmt, useT } from '@/i18n/client';
import { type MyGift, api, errorText, findMyGift } from '@/lib/client';
import { money } from '@/lib/site';

/**
 * Pengganti halaman checkout kartu saat pembayaran luar negeri masih mode simulasi (Creem belum disambungkan).
 * Tidak ada kartu yang dimasukkan dan tidak ada uang yang berpindah.
 */
export function SimulatedCheckout() {
  const t = useT();
  const [id, setId] = useState('');
  const [mine, setMine] = useState<MyGift | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const o = new URLSearchParams(window.location.search).get('order') ?? '';
    setId(o);
    setMine(findMyGift(o));
  }, []);

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      await api('/api/pay/simulate', { method: 'POST', body: JSON.stringify({ id }) });
      window.location.assign(`/bayar/selesai?order=${encodeURIComponent(id)}`);
    } catch (e) {
      setError(errorText(e, t));
      setBusy(false);
    }
  };

  return (
    <div className="text-center">
      <p className="rounded-2xl bg-butter/60 px-3.5 py-2.5 text-left text-[13px] font-semibold leading-snug">
        {t.payReturn.simNote}
      </p>
      <h1 className="font-display mt-5 text-[1.9rem] font-semibold leading-tight">{t.payReturn.simHeading}</h1>
      {mine ? (
        <p className="font-display mt-2 text-[2.2rem] font-semibold leading-none">{money(mine.amount, mine.currency ?? 'USD')}</p>
      ) : null}
      <p className="mt-2 text-[14px] text-ink-2">{fmt(t.payReturn.simFor, { to: mine?.to || '…' })}</p>
      {error ? <p className="mt-3 text-[13px] font-bold text-tomato-dark">{error}</p> : null}
      <div className="mt-6 flex flex-col gap-2">
        <button type="button" onClick={pay} disabled={busy || !id} className="btn btn-primary h-13 w-full py-4 text-[15px]">
          {busy ? t.checkout.simulating : t.checkout.simulate}
        </button>
        <button type="button" onClick={() => window.history.back()} className="btn btn-ghost h-12 w-full text-[14px]">
          {t.payReturn.back}
        </button>
      </div>
    </div>
  );
}
