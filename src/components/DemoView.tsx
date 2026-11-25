'use client';

import { useState } from 'react';
import type { DemoLock } from '@/lib/demo';
import { TemplatePlayer } from '@/templates/Player';
import type { GiftData, GiftMusic } from '@/templates/types';
import { LockScreen } from './LockScreen';
import { MusicPlayer } from './MusicPlayer';

/**
 * Halaman demo: dimulai dari layar kunci (kata sandinya diberi tahu), lalu kado contoh
 * dengan lagu yang mulai diputar begitu kuncinya terbuka. Pemutar lagunya sudah dimuat (tersembunyi) sejak layar
 * kunci, di posisi yang sama di pohon React, supaya Spotify sudah siap saat kuncinya terbuka.
 */
export function DemoView({ id, data, lock, music }: { id: string; data: GiftData; lock: DemoLock | null; music: GiftMusic | null }) {
  const [open, setOpen] = useState(!lock);
  const [unlocked, setUnlocked] = useState(false);

  return (
    <>
      {!open && lock ? (
        <LockScreen
          slug=""
          lock={{ hint: lock.hint, to: data.to, from: data.from, shape: lock.shape }}
          demo={{ password: lock.password, data }}
          onOpen={() => {
            setOpen(true);
            setUnlocked(true);
          }}
        />
      ) : (
        <TemplatePlayer id={id} data={data} mode="demo" />
      )}
      {music ? <MusicPlayer music={music} start={unlocked ? 'now' : 'tap'} armed={open} /> : null}
    </>
  );
}
