/** Hal-hal yang paling sering ingin diubah pemilik situs ada di sini. */
export const SITE = {
  name: 'floa',
  domain: 'floa.site',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://floa.site',
  description:
    'Kado digital interaktif yang dibuka dari HP. Pilih template, ganti nama dan pesannya, bayar pakai QRIS, link kadomu langsung jadi.',
  contact: { email: 'halo@floa.site' },
} as const;

export type PlanId = 'bulan' | 'selamanya';

export type Plan = {
  id: PlanId;
  name: string;
  /** harga dalam rupiah */
  price: number;
  /** masa aktif dalam hari; null = tanpa batas */
  days: number | null;
  note: string;
  popular?: boolean;
};

export const PLANS: Plan[] = [
  { id: 'bulan', name: '30 hari', price: 19000, days: 30, note: 'Link aktif sebulan' },
  { id: 'selamanya', name: 'Selamanya', price: 39000, days: null, note: 'Link tidak pernah mati', popular: true },
];

export const CHEAPEST = Math.min(...PLANS.map((p) => p.price));

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function rupiah(n: number) {
  return 'Rp' + n.toLocaleString('id-ID');
}

/** "19rb" */
export function rupiahShort(n: number) {
  return n % 1000 === 0 ? `${n / 1000}rb` : rupiah(n);
}
