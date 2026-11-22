/* Seni template Terbangkan Lampion: lampion kertas, bulan sabit, bukit + danau. */

export function Lantern({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 130" className={className} aria-hidden>
      <defs>
        <radialGradient id="lp-body" cx="50%" cy="90%" r="98%">
          <stop offset="0" stopColor="#fff8d6" />
          <stop offset=".32" stopColor="#ffd77f" />
          <stop offset=".72" stopColor="#ff9f47" />
          <stop offset="1" stopColor="#e36a27" />
        </radialGradient>
        <radialGradient id="lp-fire" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fffdf0" />
          <stop offset=".5" stopColor="#fff3b8" stopOpacity=".75" />
          <stop offset="1" stopColor="#fff3b8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M12,36C12,13 31,4 50,4C69,4 88,13 88,36C88,64 77,92 71,110L29,110C23,92 12,64 12,36Z" fill="url(#lp-body)" />
      <g fill="none" stroke="#c6541a" strokeOpacity=".3" strokeWidth="1.1">
        <path d="M50,4C44,32 42,80 44,110" />
        <path d="M50,4C56,32 58,80 56,110" />
        <path d="M31,9C21,40 26,84 35,110" />
        <path d="M69,9C79,40 74,84 65,110" />
      </g>
      <path d="M20,30C23,16 36,9 50,8C39,13 30,20 26,33Z" fill="#fff" opacity=".4" />
      <ellipse cx="50" cy="98" rx="27" ry="19" fill="url(#lp-fire)" />
      <rect x="27" y="107.5" width="46" height="6.5" rx="3.2" fill="#9c4614" />
      <rect x="27" y="107.5" width="46" height="2.4" rx="1.2" fill="#fff" opacity=".22" />
      <path d="M50,113c5.5,-6.5 4,-11.5 0,-16.5c-4,5 -5.5,10 0,16.5Z" fill="#fff6c2" />
      <path d="M40,114L44,124M60,114L56,124M44,124L56,124" stroke="#9c4614" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function Moon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden>
      <defs>
        <mask id="lp-moon">
          <rect width="60" height="60" fill="#000" />
          <circle cx="30" cy="30" r="22" fill="#fff" />
          <circle cx="40" cy="23" r="19" fill="#000" />
        </mask>
      </defs>
      <circle cx="30" cy="30" r="29" fill="#fdf1d8" opacity=".07" />
      <circle cx="30" cy="30" r="22" fill="#fdf1d8" mask="url(#lp-moon)" />
    </svg>
  );
}

/** Bukit dan danau di kaki layar. Direntang selebar stage. */
export function Hills({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 244 130" preserveAspectRatio="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="lp-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2b66" />
          <stop offset="1" stopColor="#0c1130" />
        </linearGradient>
        <linearGradient id="lp-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9f6b" stopOpacity="0" />
          <stop offset="1" stopColor="#ff9f6b" stopOpacity=".28" />
        </linearGradient>
      </defs>
      <rect y="0" width="244" height="62" fill="url(#lp-haze)" />
      <path d="M0,58C22,38 40,30 62,40C80,22 104,18 124,36C146,22 170,26 190,42C210,30 228,34 244,46L244,70L0,70Z" fill="#232a63" />
      <path d="M0,66C18,50 36,46 56,56C74,44 96,46 112,58C134,48 160,50 178,60C200,50 224,52 244,62L244,74L0,74Z" fill="#161c48" />
      <g fill="#161c48">
        <path d="M22,58l3.5,-13l3.5,13Z" />
        <path d="M30,60l3,-10l3,10Z" />
        <path d="M196,58l3.5,-13l3.5,13Z" />
        <path d="M205,60l3,-11l3,11Z" />
        <path d="M214,61l2.5,-8l2.5,8Z" />
      </g>
      <rect y="70" width="244" height="60" fill="url(#lp-water)" />
      <g fill="#fdf1d8" opacity=".1">
        <rect x="14" y="82" width="40" height="1.2" rx=".6" />
        <rect x="170" y="90" width="52" height="1.2" rx=".6" />
        <rect x="30" y="104" width="30" height="1.2" rx=".6" />
        <rect x="186" y="112" width="34" height="1.2" rx=".6" />
      </g>
    </svg>
  );
}

/** PRNG kecil supaya posisi bintang/lampion sama di tiap render. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
