import 'server-only';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { clean } from './gift';

export const PASS_MAX = 40;
export const HINT_MAX = 80;

/**
 * Kata sandi kado biasanya tanggal atau nama panggilan, jadi dibuat ramah:
 * huruf besar/kecil tidak dibedakan dan spasi berlebih diabaikan.
 */
export function normalizePassword(p: string) {
  return p.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(normalizePassword(password), salt, 32);
  return `s1$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

export function verifyPassword(password: string, stored: string) {
  const [v, salt, hash] = stored.split('$');
  if (v !== 's1' || !salt || !hash) return false;
  const want = Buffer.from(hash, 'base64url');
  const got = scryptSync(normalizePassword(password), Buffer.from(salt, 'base64url'), want.length);
  return timingSafeEqual(want, got);
}

export type LockInput = { password: string; hint: string };

/**
 * Membaca permintaan kunci dari pembuat kado.
 *  - undefined → tidak diubah
 *  - null      → kunci dilepas
 *  - { password: '', hint } → kata sandi lama dipertahankan, hanya petunjuk yang diganti
 */
export function readLock(v: unknown): LockInput | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const password = typeof o.password === 'string' ? o.password.slice(0, PASS_MAX * 2) : '';
  if (normalizePassword(password).length > PASS_MAX) return null;
  return { password, hint: clean(o.hint, HINT_MAX) };
}

/** Kolom kunci untuk disimpan, dari permintaan pembuat dan keadaan sebelumnya. */
export function lockFields(req: LockInput | null | undefined, prev: { passHash: string | null }) {
  if (req === undefined) return {};
  if (req === null) return { passHash: null, passHint: null };
  if (normalizePassword(req.password)) return { passHash: hashPassword(req.password), passHint: req.hint || null };
  // tanpa kata sandi baru: pertahankan yang lama (kalau ada), cukup perbarui petunjuknya
  return prev.passHash ? { passHint: req.hint || null } : { passHash: null, passHint: null };
}
