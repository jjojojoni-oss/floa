import type { ReactNode } from 'react';

/**
 * Bingkai layar kado. Di HP memenuhi layar; di layar lebar jadi kolom seukuran HP
 * di tengah, dengan latar warna template.
 */
export function GiftFrame({ bg, children, footer }: { bg: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: bg }}>
      <div className="absolute inset-0 bg-black/10 max-sm:hidden" aria-hidden />
      <div className="gift-frame relative w-full flex-1 overflow-hidden sm:flex-none">{children}</div>
      {footer}
    </div>
  );
}
