/**
 * Alamat situs untuk metadata. Urutan: yang diisi sendiri → domain produksi dari Vercel → floa.site.
 * (Sebelum domain dipasang, Vercel mengisi yang kedua dengan alamat *.vercel.app.)
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://floa.site');

/** Hal-hal yang paling sering ingin diubah pemilik situs ada di sini. */
export const SITE = {
  name: 'floa',
  domain: 'floa.site',
  url: SITE_URL,
  description:
    'Kado digital interaktif yang dibuka dari HP. Pilih template, ganti nama dan pesannya, bayar pakai QRIS atau kartu, link kadomu langsung jadi.',
  contact: { email: 'halo@floa.site' },
} as const;

export type PlanId = 'bulan' | 'selamanya';

/** Pembeli di Indonesia bayar rupiah lewat BorderPay (QRIS); pembeli luar negeri bayar dolar lewat Creem (kartu). */
export type Market = 'id' | 'intl';
export type Currency = 'IDR' | 'USD';
export const MARKET_CURRENCY: Record<Market, Currency> = { id: 'IDR', intl: 'USD' };

export type Plan = {
  id: PlanId;
  name: string;
  /** harga untuk pembeli Indonesia, dalam rupiah */
  price: number;
  /** harga untuk pembeli luar negeri, dalam sen dolar AS (299 = $2.99; Creem meminta minimal 100) */
  usd: number;
  /** masa aktif dalam hari; null = tanpa batas */
  days: number | null;
  note: string;
  popular?: boolean;
};

export const PLANS: Plan[] = [
  { id: 'bulan', name: '30 hari', price: 19000, usd: 299, days: 30, note: 'Link aktif sebulan' },
  { id: 'selamanya', name: 'Selamanya', price: 39000, usd: 499, days: null, note: 'Link tidak pernah mati', popular: true },
];

export const CHEAPEST = Math.min(...PLANS.map((p) => p.price));

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

/** Harga paket dalam satuan terkecil mata uangnya (rupiah, atau sen untuk USD). */
export function planAmount(plan: Plan, currency: Currency) {
  return currency === 'IDR' ? plan.price : plan.usd;
}

export function rupiah(n: number) {
  return 'Rp' + n.toLocaleString('id-ID');
}

/** "19rb" */
export function rupiahShort(n: number) {
  return n % 1000 === 0 ? `${n / 1000}rb` : rupiah(n);
}

/** Rp19.000 atau $2.99. `amount` dalam satuan terkecil (rupiah / sen). */
export function money(amount: number, currency: Currency) {
  return currency === 'IDR' ? rupiah(amount) : `$${(amount / 100).toFixed(2)}`;
}

/** Mata uang yang ditampilkan lebih dulu untuk sebuah bahasa: rupiah untuk Bahasa Indonesia, dolar AS selain itu. */
export function displayCurrency(locale: string): Currency {
  return locale === 'id' ? 'IDR' : 'USD';
}

/** Harga termurah yang ringkas untuk label ("19rb" atau "$2.99"). */
export function cheapestLabel(locale: string) {
  return displayCurrency(locale) === 'IDR' ? rupiahShort(CHEAPEST) : money(Math.min(...PLANS.map((p) => p.usd)), 'USD');
}
