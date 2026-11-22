import 'server-only';
import { fileStore } from './file';
import { supabaseStore } from './supabase';
import type { Store } from './types';

export type { Store } from './types';

export class ConfigError extends Error {}

let cached: Store | null = null;

/**
 * Supabase kalau variabelnya ada; kalau tidak, berkas lokal (khusus pengembangan).
 * Di Vercel tanpa Supabase kita berhenti dengan pesan jelas, daripada diam-diam kehilangan data.
 */
export function getStore(): Store {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    cached = supabaseStore(url, key, process.env.SUPABASE_BUCKET ?? 'kado');
  } else if (process.env.VERCEL) {
    throw new ConfigError('Penyimpanan belum diatur: isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.');
  } else {
    cached = fileStore;
  }
  return cached;
}
