import type { Gift } from '../gift';

export interface Store {
  readonly kind: 'file' | 'supabase';
  getGift(id: string): Promise<Gift | null>;
  getGiftBySlug(slug: string): Promise<Gift | null>;
  /** false kalau slug sudah dipakai */
  insertGift(gift: Gift): Promise<boolean>;
  updateGift(id: string, patch: Partial<Gift>): Promise<Gift | null>;
  deleteGift(id: string): Promise<void>;
  /** menyimpan foto, mengembalikan URL publiknya */
  putPhoto(bytes: Uint8Array, contentType: string, ext: string): Promise<string>;
  /** apakah URL ini foto dari penyimpanan kita */
  ownsPhoto(url: string): boolean;
}
