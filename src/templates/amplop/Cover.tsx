import { Seal, Stamp } from './art';
import s from './style.module.css';

/** Gambar kartu katalog: amplop bersegel, dengan amplop sisi alamat mengintip di belakang. */
export default function Cover() {
  return (
    <div className={s.cover}>
      <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <ellipse cx="100" cy="196" rx="74" ry="9" fill="#5a3c1e" opacity=".16" />

        {/* amplop belakang: sisi alamat */}
        <g transform="translate(112 96) rotate(11)">
          <rect x="-72" y="-47" width="144" height="94" rx="4" fill="#f6ead4" stroke="#d8c5a2" strokeWidth="1" />
          <g fill="none" stroke="#2e2a26" strokeOpacity=".22" strokeWidth="1.2" strokeLinecap="round">
            <path d="M-58,14H10" />
            <path d="M-58,26H-10" />
          </g>
          <svg x="40" y="-41" width="24" height="29.5" viewBox="0 0 44 54">
            <Stamp paper="#f6ead4" />
          </svg>
          <g fill="none" stroke="#3d3a52" strokeOpacity=".4" strokeWidth="1.1" strokeLinecap="round">
            <path d="M0,-34q4,-3 8,0t8,0t8,0t8,0" />
            <path d="M0,-28q4,-3 8,0t8,0t8,0t8,0" />
            <path d="M0,-22q4,-3 8,0t8,0t8,0t8,0" />
          </g>
        </g>

        {/* amplop depan: sisi segel */}
        <g transform="translate(96 142) rotate(-6)">
          <rect x="-78" y="-51" width="156" height="102" rx="4.5" fill="#e3d1b0" />
          <polygon points="-78,-51 4,5 -78,51" fill="#f1e3ca" />
          <polygon points="78,-51 -4,5 78,51" fill="#ecdcc0" />
          <path d="M-78,51L-6,-3Q0,-8 6,-3L78,51Z" fill="#f8eedb" />
          <path d="M-78,51L-6,-3Q0,-8 6,-3L78,51" fill="none" stroke="#d2bd97" strokeWidth="1" />
          <path d="M-78,-48L78,-48L7,7Q0,13 -7,7Z" fill="#5a3c1e" opacity=".14" />
          <path d="M-78,-51L78,-51L7,4Q0,10 -7,4Z" fill="#fcf5e7" stroke="#d2bd97" strokeWidth="1" strokeLinejoin="round" />
          <rect x="-78" y="-51" width="156" height="102" rx="4.5" fill="none" stroke="#cdb78f" strokeWidth="1" />
          <svg x="-21" y="-14" width="42" height="42" viewBox="0 0 100 100" overflow="visible">
            <g className={s.coverSeal}>
              <Seal letter="f" />
            </g>
          </svg>
        </g>
      </svg>
    </div>
  );
}
