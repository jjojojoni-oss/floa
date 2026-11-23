'use client';

import { useState } from 'react';
import { TemplatePlayer } from '@/templates/Player';
import { getTemplate } from '@/templates/registry';
import type { GiftData } from '@/templates/types';
import { GiftFrame } from './GiftFrame';
import { type Lock, LockScreen } from './LockScreen';
import { MusicPlayer } from './MusicPlayer';

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
