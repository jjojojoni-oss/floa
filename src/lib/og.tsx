import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

const PETALS = [0, 72, 144, 216, 288];

function Mark({ size, petal, core }: { size: number; petal: string; core: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      {PETALS.map((a) => (
        <path key={a} transform={`rotate(${a} 20 20)`} d="M20,20C27,14 27.5,5 20,1.5C12.5,5 13,14 20,20Z" fill={petal} />
      ))}
      <circle cx="20" cy="20" r="4.6" fill={core} />
    </svg>
  );
}

/** Gambar pratinjau link (muncul saat link dibagikan di WhatsApp, Instagram, dll). */
export function ogCard({
  eyebrow,
  title,
  sub,
  bg,
  ink,
  accent,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  bg: string;
  ink: string;
  accent: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: bg,
          color: ink,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 40, fontWeight: 700 }}>
          <Mark size={56} petal={accent} core="#ffd36e" />
          floa
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 30, letterSpacing: 6, textTransform: 'uppercase', opacity: 0.65 }}>{eyebrow}</div>
          <div style={{ marginTop: 14, fontSize: title.length > 26 ? 84 : 108, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2 }}>{title}</div>
          <div style={{ marginTop: 22, fontSize: 38, opacity: 0.8 }}>{sub}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', padding: '18px 34px', borderRadius: 999, background: accent, color: '#fff', fontSize: 32, fontWeight: 700 }}>
            Ketuk untuk membuka
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
