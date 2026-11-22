import type { ReactNode } from 'react';
import { SiteFooter, SiteHeader } from './SiteChrome';

export function Legal({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6">
      <SiteHeader />
      <main className="pt-4">
        <h1 className="font-display text-4xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted">Terakhir diperbarui {updated}</p>
        <div className="mt-6 space-y-6 text-[15.5px] leading-relaxed text-ink-2 [&_h2]:mb-1.5 [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
