-- ============================================================================
-- Merqato agentic commerce — transactional core
--
-- Design notes (see the security audit):
--   * The product CATALOG stays in code (src/lib/site-data.ts) and remains the
--     server-authoritative source of pricing. This migration only persists the
--     TRANSACTIONAL layer: approval requests / orders and their human-approval
--     lifecycle.
--   * Row Level Security is DEFAULT-DENY. Authenticated humans may read only
--     their own orders. Admins (via has_role) may read all and change status.
--     There is NO insert/update policy for anon/authenticated, so ALL writes
--     flow through the service-role server functions, where totals are computed
--     from the catalog and can never be tampered with by the client or an agent.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Roles: kept in a dedicated table with a SECURITY DEFINER lookup so RLS
-- policies can call has_role() without recursively triggering RLS on the
-- roles table. (Supabase-recommended pattern; never store roles on a
-- user-editable profile row.)
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('admin', 'staff');

create table public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- A user may see their own roles; admins may see everyone's.
create policy "user_roles: read own or admin"
  on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- Only admins manage role assignments. The first admin is bootstrapped out of
-- band (SQL / service role), which is why there is no self-insert path.
create policy "user_roles: admin write"
  on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- Orders / approval requests
-- ---------------------------------------------------------------------------
create type public.order_status as enum (
  'awaiting_human_approval',
  'approved',
  'rejected',
  'payment_pending',
  'confirmed',
  'cancelled'
);

create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_ref      text not null unique,
  channel        text not null default 'web' check (channel in ('web', 'agent')),

  -- Snapshot of the offer as priced by the server at request time.
  offer_id       text not null,
  offer_kind     text not null check (offer_kind in ('operator', 'setup', 'stay', 'partnership')),
  offer_name     text not null,
  plan           text,
  line_items     jsonb not null default '[]'::jsonb,
  total_amount   integer not null check (total_amount >= 0),
  currency       text not null default 'PHP' check (currency = 'PHP'),

  -- Requester (nullable user_id: agents / guests have no auth session).
  user_id        uuid references auth.users (id) on delete set null,
  requester_name  text check (requester_name is null or char_length(requester_name) <= 200),
  requester_email text check (requester_email is null or char_length(requester_email) <= 320),
  notes           text check (notes is null or char_length(notes) <= 2000),

  status         public.order_status not null default 'awaiting_human_approval',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index orders_user_id_idx    on public.orders (user_id);
create index orders_status_idx     on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

-- Humans read their own orders; admins/staff read all. No public read: agents
-- poll status through a server route that looks up the unguessable order id.
create policy "orders: read own or staff"
  on public.orders for select to authenticated
  using (
    user_id = auth.uid()
    or public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'staff')
  );

-- Only admins/staff move an order through its lifecycle (approve / reject /
-- confirm). Deliberately no INSERT policy — every write is server-side.
create policy "orders: staff update status"
  on public.orders for update to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'staff'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'staff'));

-- ---------------------------------------------------------------------------
-- keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();
