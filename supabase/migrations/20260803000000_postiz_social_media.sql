-- Merqato-owned Social Media Operator state.
-- Postiz remains authoritative for OAuth integrations, scheduling, publishing,
-- platform delivery, and release status. No Postiz credentials are stored here.

create table if not exists public.social_post_approvals (
  id uuid primary key default gen_random_uuid(),
  postiz_post_id text,
  content_snapshot jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_by text,
  reviewed_by uuid references auth.users(id) on delete set null,
  review_note text check (review_note is null or char_length(review_note) <= 2000),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists social_post_approvals_postiz_post_id_idx
  on public.social_post_approvals (postiz_post_id);
create index if not exists social_post_approvals_status_idx
  on public.social_post_approvals (status, requested_at desc);

create table if not exists public.postiz_account_mappings (
  id uuid primary key default gen_random_uuid(),
  postiz_integration_id text not null unique,
  operator_id text not null default 'social-media-operator',
  platform text not null check (platform in ('facebook', 'instagram', 'instagram-standalone')),
  display_name text not null,
  profile_handle text,
  enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists postiz_account_mappings_operator_idx
  on public.postiz_account_mappings (operator_id, enabled);

create table if not exists public.postiz_audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  postiz_post_ids text[] not null default '{}',
  postiz_integration_ids text[] not null default '{}',
  actor_user_id uuid references auth.users(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists postiz_audit_log_created_at_idx
  on public.postiz_audit_log (created_at desc);

create table if not exists public.postiz_webhook_events (
  id text primary key,
  event_type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text
);

create index if not exists postiz_webhook_events_unprocessed_idx
  on public.postiz_webhook_events (received_at)
  where processed_at is null;

alter table public.social_post_approvals enable row level security;
alter table public.postiz_account_mappings enable row level security;
alter table public.postiz_audit_log enable row level security;
alter table public.postiz_webhook_events enable row level security;

revoke all on public.social_post_approvals from anon, authenticated;
revoke all on public.postiz_account_mappings from anon, authenticated;
revoke all on public.postiz_audit_log from anon, authenticated;
revoke all on public.postiz_webhook_events from anon, authenticated;

grant all on public.social_post_approvals to service_role;
grant all on public.postiz_account_mappings to service_role;
grant all on public.postiz_audit_log to service_role;
grant all on public.postiz_webhook_events to service_role;

drop trigger if exists social_post_approvals_set_updated_at on public.social_post_approvals;
create trigger social_post_approvals_set_updated_at
  before update on public.social_post_approvals
  for each row execute function public.set_updated_at();

drop trigger if exists postiz_account_mappings_set_updated_at on public.postiz_account_mappings;
create trigger postiz_account_mappings_set_updated_at
  before update on public.postiz_account_mappings
  for each row execute function public.set_updated_at();
