/* Seni amplop: segel lilin, prangko, cap pos, dan lipatan kantong. Semua digambar sendiri. */

const f = (n: number) => Math.round(n * 10) / 10;

/** Tepi lilin yang tidak rata: titik-titik melingkar dengan jari-jari naik turun, dihaluskan. */
const SEAL = (() => {
  const R = [45, 42.4, 46, 43, 45.4, 42, 46.4, 43.4, 45, 42.6, 46, 43, 44.6, 42.2];
  const n = R.length;
  const pts = R.map((r, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [50 + Math.cos(a) * r, 50 + Math.sin(a) * r];
  });
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m0 = mid(pts[n - 1], pts[0]);
  let d = `M${f(m0[0])},${f(m0[1])}`;
  for (let i = 0; i < n; i++) {
    const m = mid(pts[i], pts[(i + 1) % n]);
    d += `Q${f(pts[i][0])},${f(pts[i][1])} ${f(m[0])},${f(m[1])}`;
  }
  return d + 'Z';
})();

const CRACK = 'M52,3L45,24L57,41L44,58L55,76L48,97';
const CRACK_LEN = 104;

/** Segel lilin dengan monogram. `progress` 0..1 menggambar retakan dari atas ke bawah. */
export function Seal({ letter, progress = 0, className }: { letter: string; progress?: number; className?: string }) {
  const p = Math.max(0, Math.min(1, progress));
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path d={SEAL} fill="#5e0f0a" opacity=".28" transform="translate(0 3)" />
      <path d={SEAL} fill="#b3261e" />
      <circle cx="50" cy="50" r="31.5" fill="#a21f18" />
      <circle cx="50" cy="49.3" r="31.5" fill="none" stroke="#74110c" strokeWidth="1.6" opacity=".75" />
      <circle cx="50" cy="51" r="31.5" fill="none" stroke="#e57b70" strokeWidth="1" opacity=".5" />
      {letter ? (
        <g fontFamily="var(--font-serif, Georgia, serif)" fontSize="35" fontWeight="600" fontStyle="italic" textAnchor="middle">
          <text x="50.9" y="63" fill="#ea8177" opacity=".55">
            {letter}
          </text>
          <text x="50" y="62" fill="#6f100b">
            {letter}
          </text>
        </g>
      ) : (
        <g>
          <path d="M50.8,65C33,52 37,38 50.8,46C64.6,38 68.6,52 50.8,65Z" fill="#ea8177" opacity=".55" />
          <path d="M50,64C32,51 36,37 50,45C64,37 68,51 50,64Z" fill="#6f100b" />
        </g>
      )}
      <ellipse cx="32" cy="27" rx="13" ry="4.6" fill="#fff" opacity=".22" transform="rotate(-34 32 27)" />
      {p > 0 ? (
        <g fill="none" stroke="#3d0805" strokeLinecap="round" strokeLinejoin="round">
          <path d={CRACK} strokeWidth="2.4" strokeDasharray={CRACK_LEN} strokeDashoffset={CRACK_LEN * (1 - p)} />
          <path d="M45,24L33,29" strokeWidth="1.6" opacity={p > 0.35 ? 1 : 0} />
          <path d="M57,41L70,36" strokeWidth="1.6" opacity={p > 0.55 ? 1 : 0} />
          <path d="M44,58L31,65" strokeWidth="1.6" opacity={p > 0.72 ? 1 : 0} />
          <path d="M55,76L67,82" strokeWidth="1.6" opacity={p > 0.88 ? 1 : 0} />
        </g>
      ) : null}
    </svg>
  );
}

/** Prangko kecil bergambar bunga, tepi bergerigi. `paper` = warna kertas di belakangnya. */
export function Stamp({ className, paper = '#f8eedb' }: { className?: string; paper?: string }) {
  return (
    <svg viewBox="0 0 44 54" className={className} aria-hidden>
      <rect width="44" height="54" fill="#fffaf0" />
      <rect x="0" y="0" width="44" height="54" fill="none" stroke={paper} strokeWidth="4.6" strokeDasharray="0.01 6.12" strokeLinecap="round" />
      <rect x="5.5" y="5.5" width="33" height="43" fill="#f4d5c6" />
      <path d="M22,43C21,34 23,29 22,24" stroke="#3f7d5c" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M22,36C17,35 14,31 14,28C18,28 21,31 22,36Z" fill="#4e9a70" />
      <path d="M22,33C27,32 30,28 30,25C26,25 23,28 22,33Z" fill="#3f7d5c" />
      <g transform="translate(22 19)">
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} transform={`rotate(${a})`} d="M0,0C5,-4 5.4,-10 0,-12.4C-5.4,-10 -5,-4 0,0Z" fill="#b3261e" />
        ))}
        <circle r="3" fill="#ffd36e" />
      </g>
      <text x="22" y="46.6" textAnchor="middle" fontSize="4.6" fontWeight="700" letterSpacing=".6" fill="#8a4a3a" fontFamily="var(--font-ui, sans-serif)">
        FLOA
      </text>
    </svg>
  );
}

/** Cap pos: lingkaran ganda + garis bergelombang. */
export function Postmark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 44" className={className} aria-hidden fill="none" stroke="currentColor" strokeLinecap="round">
      <circle cx="74" cy="22" r="18" strokeWidth="1.5" />
      <circle cx="74" cy="22" r="13" strokeWidth="1" />
      <g transform="translate(74 22)" stroke="none" fill="currentColor">
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} transform={`rotate(${a})`} d="M0,0C2.6,-2 2.8,-5.4 0,-6.8C-2.8,-5.4 -2.6,-2 0,0Z" />
        ))}
      </g>
      {[10, 18, 26, 34].map((y) => (
        <path key={y} d={`M2,${y}q6,-4 12,0t12,0t12,0t12,0`} strokeWidth="1.4" />
      ))}
    </svg>
  );
}

/** Tiga lipatan kantong amplop (kiri, kanan, bawah). Bagian V di atas dibiarkan terbuka. */
export function Pocket() {
  return (
    <svg viewBox="0 0 200 130" preserveAspectRatio="none" aria-hidden>
      <polygon points="0,0 106,71 0,130" fill="#f1e3ca" />
      <polygon points="200,0 94,71 200,130" fill="#ecdcc0" />
      <path d="M0,130L92,61Q100,55 108,61L200,130Z" fill="#f8eedb" />
      <g fill="none" stroke="#d2bd97" strokeWidth="1" vectorEffect="non-scaling-stroke">
        <path d="M0,130L92,61Q100,55 108,61L200,130" />
        <path d="M0,0L86,57" opacity=".8" />
        <path d="M200,0L114,57" opacity=".8" />
      </g>
    </svg>
  );
}

/** Garis tepi tutup amplop (bentuknya sendiri dipotong lewat clip-path di CSS). */
export function FlapEdge() {
  return (
    <svg viewBox="0 0 200 78" preserveAspectRatio="none" aria-hidden>
      <path d="M0,0L92,72.5Q100,78 108,72.5L200,0" fill="none" stroke="#d2bd97" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
