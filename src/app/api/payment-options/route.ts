import { json } from '@/lib/http';
import { paymentOptions } from '@/lib/payment';
import type { Market } from '@/lib/site';

/**
 * Cara bayar yang aktif + saran untuk pembeli ini.
 * Vercel mengisi negara pengunjung di header x-vercel-ip-country; tanpa header (mis. di lokal) dianggap Indonesia.
 */
export async function GET(req: Request) {
  const country = (req.headers.get('x-vercel-ip-country') ?? '').toUpperCase() || null;
  const options = paymentOptions();
  let suggested: Market = !country || country === 'ID' ? 'id' : 'intl';
  if (!options[suggested].available) suggested = suggested === 'id' ? 'intl' : 'id';
  return json({ country, suggested, options });
}
