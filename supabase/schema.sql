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

-- RLS aktif tanpa policy: tabel hanya bisa diakses server floa lewat service role key.
alter table public.gifts enable row level security;

-- Bucket foto: publik untuk dibaca (lewat URL acak), unggah hanya lewat server.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kado', 'kado', true, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
