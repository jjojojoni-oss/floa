export function FloaMark({ size = 28 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/art/bunga-kamboja-pink.webp" alt="" width={size} height={size} draggable={false} style={{ width: size, height: size }} />
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex select-none items-center gap-1.5" aria-label="floa">
      <FloaMark size={size * 1.15} />
      <span className="font-display font-semibold leading-none" style={{ fontSize: size * 1.02 }}>
        floa
      </span>
    </span>
  );
}
