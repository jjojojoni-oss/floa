'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { fmt, useT } from '@/i18n/client';
import { drawQrCard } from '@/lib/qr';
import { getTemplate } from '@/templates/registry';

const FLOA_PALETTE = { bg: '#fbf6ee', ink: '#1e1b18', accent: '#f2542d' };

type QrProps = { slug: string; to: string; from?: string; templateId?: string };

/** Alamat kado lengkap, mengikuti domain tempat situs dibuka. */
function useGiftUrl(slug: string) {
  const [origin, setOrigin] = useState('https://floa.site');
  useEffect(() => setOrigin(window.location.origin), []);
  return `${origin}/${slug}`;
}

/** Kartu QR kado (data URL PNG), digambar ulang kalau isinya berubah. */
export function useQrCard({ slug, to, from, templateId }: QrProps) {
  const t = useT();
  const url = useGiftUrl(slug);
  const [card, setCard] = useState<string | null>(null);
  const palette = (templateId && getTemplate(templateId)?.palette) || FLOA_PALETTE;

  useEffect(() => {
    let alive = true;
    setCard(null);
    drawQrCard({
      url,
      palette,
      eyebrow: t.qr.eyebrow,
      name: to || t.qr.you,
      from: from ? fmt(t.qr.from, { from }) : null,
      scan: t.qr.scan,
    })
      .then((u) => alive && setCard(u))
      .catch((e) => console.error('[floa] qr card', e));
    return () => {
      alive = false;
    };
    // palette berasal dari templateId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, to, from, templateId, t]);

  return { card, url, fileName: `floa-qr-${slug}.png` };
}

/** Apakah browser bisa membagikan berkas gambar (lembar bagikan di HP). */
function useCanShareFiles() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    try {
      setOk(!!navigator.canShare?.({ files: [new File([''], 'qr.png', { type: 'image/png' })] }));
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

async function shareCard(card: string, fileName: string, title: string) {
  try {
    const blob = await (await fetch(card)).blob();
    await navigator.share({ files: [new File([blob], fileName, { type: 'image/png' })], title });
  } catch {
    /* dibatalkan pengguna, atau tidak didukung */
  }
}

function QrActions({ card, fileName, compact = false }: { card: string | null; fileName: string; compact?: boolean }) {
  const t = useT();
  const canShare = useCanShareFiles();
  const h = compact ? 'h-10 text-[13px]' : 'h-12 text-[14px]';
  return (
    <div className={'flex gap-2 ' + (compact ? '' : 'w-full')}>
      {card ? (
        <a href={card} download={fileName} className={`btn btn-ink flex-1 px-4 ${h}`}>
          {t.qr.download}
        </a>
      ) : (
        <span className={`btn btn-ink flex-1 px-4 opacity-50 ${h}`}>{t.qr.download}</span>
      )}
      {canShare && card ? (
        <button type="button" onClick={() => shareCard(card, fileName, t.qr.title)} className={`btn btn-ghost flex-1 px-4 ${h}`}>
          {t.qr.share}
        </button>
      ) : null}
    </div>
  );
}

/** Pratinjau QR besar di atas layar: bisa langsung di-scan dari HP pengirim, atau diunduh. */
export function QrDialog({ onClose, ...props }: QrProps & { onClose: () => void }) {
  const t = useT();
  const { card, fileName } = useQrCard(props);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!mounted) return null;
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.qr.title}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[#1e1b18]/55 p-3 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div className="paper-card w-full max-w-sm rounded-[1.75rem] p-4" onClick={(e) => e.stopPropagation()}>
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[19rem] overflow-hidden rounded-2xl bg-white/60">
          {card ? (
            <img src={card} alt={fmt(t.qr.alt, { to: props.to || t.qr.you })} className="h-full w-full" />
          ) : (
            <span className="floa-loader absolute inset-0 m-auto text-muted" aria-label={t.qr.making} />
          )}
        </div>
        <p className="mt-3 text-center text-[13px] leading-snug text-ink-2">{t.qr.hint}</p>
        <div className="mt-3 flex flex-col gap-2">
          <QrActions card={card} fileName={fileName} />
          <button type="button" onClick={onClose} className="btn btn-ghost h-11 w-full text-[14px]">
            {t.qr.close}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Blok QR di halaman "kado sudah terbit": gambar kartu (ketuk untuk memperbesar) + unduh/bagikan. */
export function QrPanel(props: QrProps) {
  const t = useT();
  const { card, fileName } = useQrCard(props);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-3.5 rounded-2xl bg-white/70 p-3 text-left shadow-[inset_0_0_0_1.5px_var(--color-line)]">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative aspect-[4/5] w-[6.5rem] flex-none overflow-hidden rounded-xl bg-white shadow-[0_6px_18px_-8px_rgba(30,27,24,0.35)]"
        aria-label={t.qr.enlarge}
      >
        {card ? (
          <img src={card} alt={fmt(t.qr.alt, { to: props.to || t.qr.you })} className="h-full w-full" />
        ) : (
          <span className="floa-loader absolute inset-0 m-auto scale-75 text-muted" aria-label={t.qr.making} />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-extrabold">{t.qr.title}</p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-ink-2">{t.qr.hint}</p>
        <div className="mt-2">
          <QrActions card={card} fileName={fileName} compact />
        </div>
      </div>
      {open ? <QrDialog {...props} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
