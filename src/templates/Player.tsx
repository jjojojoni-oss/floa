'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { useT } from '@/i18n/client';
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
  buket: dynamic(() => import('./buket'), { ssr: false, loading: Loading }),
  lilin: dynamic(() => import('./lilin'), { ssr: false, loading: Loading }),
  amplop: dynamic(() => import('./amplop'), { ssr: false, loading: Loading }),
  polaroid: dynamic(() => import('./polaroid'), { ssr: false, loading: Loading }),
  lampion: dynamic(() => import('./lampion'), { ssr: false, loading: Loading }),
  mau: dynamic(() => import('./mau'), { ssr: false, loading: Loading }),
  plester: dynamic(() => import('./plester'), { ssr: false, loading: Loading }),
  toga: dynamic(() => import('./toga'), { ssr: false, loading: Loading }),
};

/** Memainkan satu template. Induknya harus `position: relative` dan punya ukuran. */
export function TemplatePlayer({ id, data, mode }: { id: string; data: GiftData; mode: TemplateMode }) {
  const meta = getTemplate(id);
  const P = PLAYERS[id];
  if (!meta || !P) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, background: meta.palette.bg, color: meta.palette.ink }}>
      <P data={data} mode={mode} />
    </div>
  );
}
