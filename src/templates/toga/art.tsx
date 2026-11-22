import s from './style.module.css';

/** Topi toga, koordinat lokal 200×150. `swing` = rumbai berayun. */
export function CapShape({ swing = true }: { swing?: boolean }) {
  return (
    <g>
      <defs>
        <linearGradient id="toga-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5878cc" />
          <stop offset="1" stopColor="#263d7c" />
        </linearGradient>
        <linearGradient id="toga-skull" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2c4587" />
          <stop offset="1" stopColor="#1a2b5c" />
        </linearGradient>
      </defs>
      {/* badan topi */}
      <path d="M54,70L54,104Q100,130 146,104L146,70L100,90Z" fill="url(#toga-skull)" />
      <path d="M54,95Q100,121 146,95L146,104Q100,130 54,104Z" fill="#f2c14e" />
      <path d="M54,95Q100,121 146,95L146,98Q100,124 54,98Z" fill="#fff" opacity=".28" />
      {/* papan */}
      <path d="M12,52L100,86L188,52L188,60L100,94L12,60Z" fill="#15244d" />
      <path d="M100,18L188,52L100,86L12,52Z" fill="url(#toga-top)" />
      <path d="M100,18L188,52L100,86L12,52Z" fill="none" stroke="#f2c14e" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M100,24L172,52L100,80L28,52Z" fill="none" stroke="#fff" strokeOpacity=".12" strokeWidth="1.2" strokeLinejoin="round" />
      {/* kancing + tali */}
      <path d="M100,52Q138,49 164,60" stroke="#f2c14e" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <ellipse cx="100" cy="52.5" rx="8.5" ry="4.8" fill="#d99f2b" />
      <ellipse cx="100" cy="51.5" rx="8.5" ry="4.8" fill="#f2c14e" />
      <ellipse cx="99" cy="50.6" rx="4.6" ry="2.2" fill="#ffe59a" />
      {/* rumbai */}
      <g transform="translate(164 60)">
        <g className={swing ? s.tassel : undefined}>
          <path d="M0,0L0,36" stroke="#f2c14e" strokeWidth="2.8" strokeLinecap="round" />
          <circle cy="39" r="5" fill="#ffd978" />
          <path d="M-6,42L6,42L9,72L-9,72Z" fill="#f2c14e" />
          <path d="M-3.6,46L-5,72M0,46L0,72M3.6,46L5,72" stroke="#c9952a" strokeWidth="1.3" />
        </g>
      </g>
    </g>
  );
}

export function CapArt({ className, swing }: { className?: string; swing?: boolean }) {
  return (
    <svg viewBox="0 0 200 150" className={className} aria-hidden>
      <CapShape swing={swing} />
    </svg>
  );
}

/** Gulungan ijazah berpita, koordinat lokal 260×96. */
export function RollShape() {
  return (
    <g>
      <defs>
        <linearGradient id="toga-roll" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset=".5" stopColor="#f6e7c4" />
          <stop offset="1" stopColor="#d3bb89" />
        </linearGradient>
      </defs>
      <ellipse cx="130" cy="88" rx="104" ry="5.5" fill="#050b1c" opacity=".35" />
      <ellipse cx="238" cy="44" rx="9" ry="27" fill="#e4d1a3" />
      <rect x="22" y="17" width="216" height="54" fill="url(#toga-roll)" />
      <ellipse cx="22" cy="44" rx="9" ry="27" fill="#f1dfb4" />
      <ellipse cx="22" cy="44" rx="5.6" ry="18.5" fill="none" stroke="#bfa672" strokeWidth="1.6" />
      <ellipse cx="22" cy="44" rx="2.4" ry="9" fill="#bfa672" />
      <path d="M40,30H104M40,40H96M40,50H104M156,30H222M164,40H222M156,50H214" stroke="#c9b383" strokeWidth="2" strokeLinecap="round" opacity=".6" />
      {/* pita */}
      <rect x="116" y="15.5" width="28" height="57" fill="#cf3b30" />
      <rect x="136" y="15.5" width="8" height="57" fill="#000" opacity=".14" />
      <path d="M124,70L118,94L128,88L133,96L136,70Z" fill="#b22f26" />
      <path d="M136,70L142,94L132,88L127,96L124,70Z" fill="#cf3b30" />
      <path d="M130,16C112,-6 88,2 94,16C88,30 112,34 130,16Z" fill="#cf3b30" />
      <path d="M130,16C148,-6 172,2 166,16C172,30 148,34 130,16Z" fill="#cf3b30" />
      <path d="M130,16C116,6 102,8 100,16C102,24 116,24 130,16Z" fill="#000" opacity=".16" />
      <path d="M130,16C144,6 158,8 160,16C158,24 144,24 130,16Z" fill="#000" opacity=".16" />
      <rect x="123" y="8" width="14" height="17" rx="5" fill="#e2493d" />
    </g>
  );
}

export function RollArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 98" className={className} aria-hidden>
      <RollShape />
    </svg>
  );
}

/** Segel emas di pojok gulungan yang sudah terbuka. */
export function Seal({ className }: { className?: string }) {
  const pts = Array.from({ length: 24 }, (_, k) => {
    const a = (Math.PI * 2 * k) / 24;
    const r = k % 2 ? 26 : 30;
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
  }).join(' ');
  const star = Array.from({ length: 10 }, (_, k) => {
    const a = -Math.PI / 2 + (Math.PI * 2 * k) / 10;
    const r = k % 2 ? 5.2 : 12.5;
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox="-34 -34 68 92" className={className} aria-hidden>
      <path d="M-12,18L-18,54L-7,47L0,56L4,18Z" fill="#b22f26" />
      <path d="M12,18L18,54L7,47L0,56L-4,18Z" fill="#cf3b30" />
      <polygon points={pts} fill="#e0ab36" />
      <circle r="22" fill="#f2c14e" />
      <circle r="18.5" fill="none" stroke="#c9952a" strokeWidth="1.4" />
      <polygon points={star} fill="#fff3c4" />
    </svg>
  );
}
