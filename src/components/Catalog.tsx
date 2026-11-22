'use client';

import Link from 'next/link';
import { useState } from 'react';
import { COVERS } from '@/templates/covers';
import { OCCASIONS, TEMPLATES } from '@/templates/registry';
import type { OccasionId } from '@/templates/types';

/** Katalog: semua template langsung terlihat, bisa disaring per momen. */
export function Catalog() {
  const [occ, setOcc] = useState<OccasionId | 'all'>('all');
  const list = occ === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.occasions.includes(occ));

  return (
    <section id="template" aria-label="Template kado">
      <div className="no-scrollbar sticky top-0 z-20 -mx-4 flex gap-2 overflow-x-auto bg-paper/90 px-4 py-2.5 backdrop-blur-md sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
        <Chip active={occ === 'all'} onClick={() => setOcc('all')}>
          Semua <span className="opacity-60">{TEMPLATES.length}</span>
        </Chip>
        {OCCASIONS.filter((o) => TEMPLATES.some((t) => t.occasions.includes(o.id))).map((o) => (
          <Chip key={o.id} active={occ === o.id} onClick={() => setOcc(o.id)}>
            {o.label}
          </Chip>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {list.map((t, i) => {
          const Cover = COVERS[t.id];
          return (
            <article
              key={t.id}
              className="group flex animate-rise flex-col overflow-hidden rounded-[1.35rem] bg-card shadow-card"
              style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
            >
              <Link
                href={`/demo/${t.id}`}
                className="relative block aspect-[4/5] overflow-hidden"
                aria-label={`Coba demo ${t.name}`}
              >
                <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]">
                  <Cover />
                </div>
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink shadow-sm">
                  <svg width="8" height="9" viewBox="0 0 8 9" aria-hidden>
                    <path d="M0 0l8 4.5L0 9z" fill="currentColor" />
                  </svg>
                  Coba demo
                </span>
              </Link>
              <div className="flex flex-1 flex-col p-3 sm:p-4">
                <h3 className="font-display text-[1.06rem] font-semibold leading-tight sm:text-xl">{t.name}</h3>
                <p className="mt-1 text-[12px] leading-snug text-muted sm:hidden">{t.steps.join(' · ')}</p>
                <p className="mt-1.5 hidden text-sm leading-snug text-muted sm:block">{t.tagline}</p>
                <div className="mt-auto flex gap-1.5 pt-3">
                  <Link href={`/demo/${t.id}`} className="btn btn-ghost h-10 flex-1 text-[13px]">
                    Demo
                  </Link>
                  <Link href={`/buat/${t.id}`} className="btn btn-ink h-10 flex-[1.4] text-[13px]">
                    Pakai <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'inline-flex h-9 flex-none items-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold transition-colors ' +
        (active ? 'bg-ink text-paper' : 'bg-white text-ink-2 shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:text-ink')
      }
    >
      {children}
    </button>
  );
}
