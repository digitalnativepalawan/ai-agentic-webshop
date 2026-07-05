create table if not exists public.operator_media (
  id uuid primary key,
  operator_id text not null references public.operators(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  public_url text not null,
  storage_path text not null unique,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.operator_media enable row level security;

create policy "Public can view operator media"
on public.operator_media for select
using (true);

create index if not exists operator_media_operator_order_idx
on public.operator_media (operator_id, sort_order);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'operator-media',
  'operator-media',
  true,
  104857600,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
