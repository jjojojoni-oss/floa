import { randomBytes } from 'node:crypto';
import { type SupabaseClient, createClient } from '@supabase/supabase-js';
import type { Gift } from '../gift';
import type { Store } from './types';

/**
 * Penyimpanan produksi: tabel `gifts` + bucket foto di Supabase.
 * Skemanya ada di supabase/schema.sql. Hanya dipakai di server, dengan service role key.
 */

type Row = {
  id: string;
  slug: string;
  template: string;
  data: Gift['data'];
  status: Gift['status'];
  plan: Gift['plan'];
  amount: number;
  edit_key: string;
  contact: string | null;
  provider: string;
  created_at: string;
  paid_at: string | null;
  expires_at: string | null;
};

const toGift = (r: Row): Gift => ({
  id: r.id,
  slug: r.slug,
  template: r.template,
  data: r.data,
  status: r.status,
  plan: r.plan,
  amount: r.amount,
  editKey: r.edit_key,
  contact: r.contact,
  provider: r.provider,
  createdAt: r.created_at,
  paidAt: r.paid_at,
  expiresAt: r.expires_at,
});

function toRow(g: Partial<Gift>): Partial<Row> {
  const r: Partial<Row> = {};
  if (g.id !== undefined) r.id = g.id;
  if (g.slug !== undefined) r.slug = g.slug;
  if (g.template !== undefined) r.template = g.template;
  if (g.data !== undefined) r.data = g.data;
  if (g.status !== undefined) r.status = g.status;
  if (g.plan !== undefined) r.plan = g.plan;
  if (g.amount !== undefined) r.amount = g.amount;
  if (g.editKey !== undefined) r.edit_key = g.editKey;
  if (g.contact !== undefined) r.contact = g.contact;
  if (g.provider !== undefined) r.provider = g.provider;
  if (g.createdAt !== undefined) r.created_at = g.createdAt;
  if (g.paidAt !== undefined) r.paid_at = g.paidAt;
  if (g.expiresAt !== undefined) r.expires_at = g.expiresAt;
  return r;
}

export function supabaseStore(url: string, serviceKey: string, bucket: string): Store {
  const base = url.replace(/\/+$/, '');
  const db: SupabaseClient = createClient(base, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const publicPrefix = `${base}/storage/v1/object/public/${bucket}/`;

  return {
    kind: 'supabase',

    async getGift(id) {
      const { data, error } = await db.from('gifts').select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(`supabase getGift: ${error.message}`);
      return data ? toGift(data as Row) : null;
    },

    async getGiftBySlug(slug) {
      const { data, error } = await db.from('gifts').select('*').eq('slug', slug).maybeSingle();
      if (error) throw new Error(`supabase getGiftBySlug: ${error.message}`);
      return data ? toGift(data as Row) : null;
    },

    async insertGift(gift) {
      const { error } = await db.from('gifts').insert(toRow(gift));
      if (!error) return true;
      // 23505 = unique_violation (slug sudah dipakai)
      if (error.code === '23505') return false;
      throw new Error(`supabase insertGift: ${error.message}`);
    },

    async updateGift(id, patch) {
      const { id: _id, slug: _slug, ...rest } = patch;
      const { data, error } = await db.from('gifts').update(toRow(rest)).eq('id', id).select('*').maybeSingle();
      if (error) throw new Error(`supabase updateGift: ${error.message}`);
      return data ? toGift(data as Row) : null;
    },

    async deleteGift(id) {
      const { error } = await db.from('gifts').delete().eq('id', id);
      if (error) throw new Error(`supabase deleteGift: ${error.message}`);
    },

    async putPhoto(bytes, contentType, ext) {
      const now = new Date();
      const name = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${randomBytes(12).toString('hex')}.${ext}`;
      const { error } = await db.storage.from(bucket).upload(name, bytes, {
        contentType,
        cacheControl: '31536000',
        upsert: false,
      });
      if (error) throw new Error(`supabase putPhoto: ${error.message}`);
      return publicPrefix + name;
    },

    ownsPhoto(u) {
      return u.startsWith(publicPrefix) && /^[a-z0-9/]+\.(jpg|png|webp)$/.test(u.slice(publicPrefix.length));
    },
  };
}
