/** Alamat kado: floa.site/<slug>. Dipakai di browser dan server. */

const RESERVED = new Set([
  'api', 'buat', 'demo', 'dev', 'kado-saya', 'syarat', 'privasi', 'sample', 'admin', 'login', 'masuk', 'daftar',
  'floa', 'www', 'app', 'kado', 'bayar', 'checkout', 'harga', 'faq', 'tentang', 'bantuan', 'help', 'static',
  'assets', 'template', 'templates', 'edit', 'new', 'null', 'undefined', 'robots', 'sitemap', 'favicon', 'icon',
]);

export const SLUG_MIN = 3;
export const SLUG_MAX = 32;

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, '');
}

/** null kalau valid; kalau tidak, alasan singkat untuk ditampilkan. */
export function slugProblem(slug: string): string | null {
  if (slug.length < SLUG_MIN) return `Minimal ${SLUG_MIN} karakter`;
  if (slug.length > SLUG_MAX) return `Maksimal ${SLUG_MAX} karakter`;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return 'Hanya huruf kecil, angka, dan tanda hubung';
  if (RESERVED.has(slug)) return 'Alamat ini tidak bisa dipakai';
  // alamat cadangan untuk pesanan yang slug-nya dilepas (lihat releaseHold di lib/orders.ts)
  if (slug.startsWith('floa-')) return 'Alamat ini tidak bisa dipakai';
  return null;
}

/** Alamat yang boleh dibuka sebagai halaman kado: pilihan pembeli, atau alamat cadangan floa-<id pesanan>. */
export function isGiftPath(slug: string) {
  return !slugProblem(slug) || /^floa-[a-f0-9]{18}$/.test(slug);
}

/** Saran awal dari nama penerima: "untuk-laras". */
export function suggestSlug(to: string) {
  const base = slugify(to);
  return base ? slugify(`untuk-${base}`) : '';
}
