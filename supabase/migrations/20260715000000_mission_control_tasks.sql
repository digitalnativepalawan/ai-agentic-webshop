-- ============================================================================
-- Mission Control live queue. Approved webshop orders (KAPWA) create a task
-- here so the operator (MerQato) sees real work to action, not a static demo.
-- ============================================================================
create type public.mc_task_status as enum (
  'open', 'in_progress', 'done', 'blocked'
);

create table public.mission_control_tasks (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null,                 -- 'onboard_kapwa' | 'review_order' | 'generic'
  title       text not null,
  detail      text,
  ref         text,                          -- webshop order_ref bridge
  status      public.mc_task_status not null default 'open',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.mission_control_tasks enable row level security;

-- Admins (has_role) see + manage; everyone else reads nothing.
create policy "mc_tasks: admin read"
  on public.mission_control_tasks for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
create policy "mc_tasks: admin write"
  on public.mission_control_tasks for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
