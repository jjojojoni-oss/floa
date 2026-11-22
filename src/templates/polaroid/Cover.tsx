import s from './style.module.css';

function Snap({ href, tape, caption }: { href: string; tape: string; caption?: boolean }) {
  return (
    <>
      <rect x="-44" y="-52" width="88" height="104" rx="1.6" fill="#22302a" opacity=".16" transform="translate(0 3)" />
      <rect x="-44" y="-52" width="88" height="104" rx="1.6" fill="#fffefb" />
      <image href={href} x="-39" y="-47" width="78" height="78" preserveAspectRatio="xMidYMid slice" />
      <rect x="-39" y="-47" width="78" height="78" fill="none" stroke="#000" strokeOpacity=".06" />
      {caption ? (
        <g fill="none" stroke="#2b2a26" strokeOpacity=".5" strokeWidth="1.5" strokeLinecap="round">
          <path d="M-24,40q5,-5 10,0t10,0t10,0t10,0t8,-1" />
        </g>
      ) : null}
      <rect x="-13" y="-57" width="26" height="9" fill={tape} opacity=".86" transform="rotate(-3)" />
    </>
  );
}

/** Gambar kartu katalog: tiga polaroid bertumpuk di atas meja. */
export default function Cover() {
  return (
    <div className={s.cover}>
      <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <circle cx="12" cy="212" r="34" fill="none" stroke="#6e4e2e" strokeOpacity=".1" strokeWidth="5" />
        <rect x="150" y="30" width="34" height="10" fill="#f2c94c" opacity=".55" transform="rotate(24 167 35)" />
        <g transform="translate(70 116) rotate(-13)">
          <Snap href="/sample/kota.svg" tape="#7fb2a0" />
        </g>
        <g transform="translate(134 122) rotate(11)">
          <Snap href="/sample/taman.svg" tape="#f2c94c" />
        </g>
        <g transform="translate(100 136)">
          <g className={s.coverTop}>
            <Snap href="/sample/senja.svg" tape="#ef6f4c" caption />
          </g>
        </g>
      </svg>
    </div>
  );
}
