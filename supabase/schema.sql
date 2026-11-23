-- floa: skema Supabase. Jalankan sekali di SQL Editor proyek Supabase.

create table if not exists public.gifts (
  id          text primary key,
  slug        text not null unique,
  template    text not null,
  data        jsonb not null,
  status      text not null default 'pending' check (status in ('pending', 'live')),
  plan        text not null,
  amount      integer not null,
  edit_key    text not null,
  contact     text,
  provider    text not null,
  created_at  timestamptz not null default now(),
  paid_at     timestamptz,
  expires_at  timestamptz
);

create index if not exists gifts_status_created_idx on public.gifts (status, created_at);

-- Pembayaran dua pasar: rupiah (BorderPay, QRIS) dan dolar AS (Creem, kartu).
-- amount disimpan dalam satuan terkecil mata uangnya (rupiah / sen).
alter table public.gifts add column if not exists currency text not null default 'IDR' check (currency in ('IDR', 'USD'));
alter table public.gifts add column if not exists provider_ref text;
alter table public.gifts add column if not exists pay_expires_at timestamptz;

-- Bahasa pengirim (id / ms / en): halaman kado dan pratinjau link-nya memakai bahasa ini.
-- Kunci kata sandi (opsional): hanya hash scrypt yang disimpan, petunjuknya terlihat publik.
alter table public.gifts add column if not exists pass_hash text;
alter table public.gifts add column if not exists pass_hint text;
-- bentuk kata sandi untuk layar kunci ('d6' = 6 angka), tanpa membocorkan isinya
alter table public.gifts add column if not exists pass_shape text;

alter table public.gifts add column if not exists lang text not null default 'id' check (lang in ('id', 'ms', 'en'));

-- RLS aktif tanpa policy: tabel hanya bisa diakses server floa lewat service role key.
alter table public.gifts enable row level security;

-- Bucket foto: publik untuk dibaca (lewat URL acak), unggah hanya lewat server.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kado', 'kado', true, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
