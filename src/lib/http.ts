import 'server-only';
import { OrderError } from './orders';
import { ConfigError } from './store';

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function fail(message: string, status = 400, code = 'bad_request') {
  return json({ error: message, code }, status);
}

/** Mengubah error yang dikenal jadi respons rapi; sisanya 500 tanpa membocorkan detail. */
export function handle(e: unknown) {
  if (e instanceof OrderError) return fail(e.message, e.status, e.code);
  if (e instanceof ConfigError) {
    console.error('[floa] config', e.message);
    return fail('Layanan belum siap. Coba lagi nanti ya.', 503, 'not_configured');
  }
  console.error('[floa] error', e);
  return fail('Ada yang tidak beres di sisi kami. Coba lagi ya.', 500, 'server_error');
}
