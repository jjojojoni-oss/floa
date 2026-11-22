export function FloaMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <g transform="translate(20 20)">
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} transform={`rotate(${a})`} d="M0,0C7,-6 7.5,-15 0,-18.5C-7.5,-15 -7,-6 0,0Z" fill="#f2542d" />
        ))}
        <circle r="4.6" fill="#ffd36e" />
      </g>
    </svg>
  );
}

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 select-none" aria-label="floa">
      <FloaMark size={size} />
      <span className="font-display font-semibold leading-none" style={{ fontSize: size * 1.02 }}>
        floa
      </span>
    </span>
  );
}
