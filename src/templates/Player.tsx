'use client';

import dynamic from 'next/dynamic';
import { type ComponentType, useEffect, useState } from 'react';
import { useT } from '@/i18n/client';
import { Opening } from './kit/Opening';
import { GiftWrap } from './kit/Wrap';
import { getTemplate } from './registry';
import type { GiftData, TemplateMode, TemplateProps } from './types';

function Loading() {
  const t = useT();
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
      <span className="floa-loader" aria-label={t.gift.loading} />
    </div>
  );
}

/** Tiap template dimuat terpisah, jadi halaman kado hanya mengunduh kode template miliknya. */
const PLAYERS: Record<string, ComponentType<TemplateProps>> = {
  scrapbook: dynamic(() => import('./scrapbook'), { ssr: false, loading: Loading }),
  memories: dynamic(() => import('./memories'), { ssr: false, loading: Loading }),
  anniversary: dynamic(() => import('./anniversary'), { ssr: false, loading: Loading }),
  bento: dynamic(() => import('./bento'), { ssr: false, loading: Loading }),
  buket: dynamic(() => import('./buket'), { ssr: false, loading: Loading }),
  lilin: dynamic(() => import('./lilin'), { ssr: false, loading: Loading }),
  amplop: dynamic(() => import('./amplop'), { ssr: false, loading: Loading }),
  polaroid: dynamic(() => import('./polaroid'), { ssr: false, loading: Loading }),
  lampion: dynamic(() => import('./lampion'), { ssr: false, loading: Loading }),
  mau: dynamic(() => import('./mau'), { ssr: false, loading: Loading }),
  plester: dynamic(() => import('./plester'), { ssr: false, loading: Loading }),
  toga: dynamic(() => import('./toga'), { ssr: false, loading: Loading }),
};

/** Pemuat kode tiap template, untuk dipanaskan selagi kalimat pembuka tampil. */
const LOADERS: Record<string, () => Promise<unknown>> = {
  scrapbook: () => import('./scrapbook'),
  memories: () => import('./memories'),
  anniversary: () => import('./anniversary'),
  bento: () => import('./bento'),
  buket: () => import('./buket'),
  lilin: () => import('./lilin'),
  amplop: () => import('./amplop'),
  polaroid: () => import('./polaroid'),
  lampion: () => import('./lampion'),
  mau: () => import('./mau'),
  plester: () => import('./plester'),
  toga: () => import('./toga'),
};

/**
 * Memainkan satu template. Induknya harus `position: relative` dan punya ukuran.
 * Urutannya: bingkisan yang dibuka (sampul bersama, untuk semua template) → kalimat pembuka dari
 * pengirim (kalau ada) → templatenya.
 */
export function TemplatePlayer({ id, data, mode }: { id: string; data: GiftData; mode: TemplateMode }) {
  const meta = getTemplate(id);
  const P = PLAYERS[id];
  const intro = (data.intro ?? '').trim();
  const [step, setStep] = useState<'wrap' | 'intro' | 'play'>('wrap');

  // kode template dipanaskan selagi bingkisan & kalimat pembuka tampil
  useEffect(() => {
    if (step !== 'play') void LOADERS[id]?.().catch(() => {});
  }, [id, step]);

  if (!meta || !P) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, background: meta.palette.bg, color: meta.palette.ink }}>
      {step === 'wrap' ? (
        <GiftWrap data={data} palette={meta.palette} onDone={() => setStep(intro ? 'intro' : 'play')} />
      ) : step === 'intro' && intro ? (
        <Opening text={intro} to={data.to} palette={meta.palette} onDone={() => setStep('play')} />
      ) : (
        <P data={data} mode={mode} />
      )}
    </div>
  );
}
