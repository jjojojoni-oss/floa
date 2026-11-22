import 'server-only';
import { type Market, MARKET_CURRENCY } from '../site';
import { borderpayProvider } from './borderpay';
import { creemProvider } from './creem';
import { demoProvider } from './demo';
import type { PaymentProvider, ProviderId } from './types';

export type { Charge, ChargeStatus, OrderRef, PaymentProvider, ProviderId } from './types';

/**
 * PAYMENT_PROVIDER=demo memaksa simulasi untuk semua pembeli (hanya untuk mencoba alur).
 * Tanpa itu: penyedia asli dipakai kalau kuncinya terisi; kalau belum, simulasi hanya di lokal,
 * dan di produksi pilihan itu dimatikan supaya tidak ada kado yang terbit gratis.
 */
function demoAllowed() {
  return process.env.PAYMENT_PROVIDER === 'demo' || process.env.NODE_ENV !== 'production';
}

/** Penyedia untuk pembeli baru: BorderPay (QRIS, rupiah) di Indonesia, Creem (kartu, dolar) di luar negeri. */
export function providerFor(market: Market): PaymentProvider | null {
  const currency = MARKET_CURRENCY[market];
  if (process.env.PAYMENT_PROVIDER === 'demo') return demoProvider(currency);
  const real = market === 'id' ? borderpayProvider() : creemProvider();
  if (real) return real;
  return demoAllowed() ? demoProvider(currency) : null;
}

/** Penyedia yang dulu dipakai sebuah pesanan (untuk cek status, webhook, simulasi). */
export function providerById(id: ProviderId | string, market: Market): PaymentProvider | null {
  if (id === 'borderpay') return borderpayProvider();
  if (id === 'creem') return creemProvider();
  if (id === 'demo') return demoAllowed() ? demoProvider(MARKET_CURRENCY[market]) : null;
  return null;
}

export type MarketInfo = { available: boolean; test: boolean; provider: ProviderId | null };

/** Pilihan pembayaran yang aktif saat ini, untuk ditampilkan di checkout. */
export function paymentOptions(): Record<Market, MarketInfo> {
  const info = (m: Market): MarketInfo => {
    const p = providerFor(m);
    return { available: !!p, test: p?.test ?? false, provider: p?.id ?? null };
  };
  return { id: info('id'), intl: info('intl') };
}
