# Deploy Wire — Webshop -> KAPWA Onboarding

What the code now does (shipped):
- /admin/orders lists orders; "Approve & wire" calls provisionKapwa.
- On approval: orders.status -> approved, a mission_control_tasks row is
  opened (onboard_kapwa), and IF KAPWA env is set, a kapwa_tenants row is
  written in KAPWA's project. Human-in-loop: no auto Supabase project creation.
- /mission-control renders the live Onboarding Queue from mission_control_tasks.

To make it actually fire in production, do these 2 things (no code changes):

## 1. Run the two new migrations
Webshop project (Supabase):
  supabase/migrations/20260715000000_mission_control_tasks.sql
KAPWA project (Supabase):
  supabase/migrations/20260715000000_kapwa_tenants.sql

Apply via Supabase dashboard SQL editor or `supabase db push` on each project.
These create: mission_control_tasks (webshop) and kapwa_tenants (KAPWA).

## 2. Set two Vercel env vars (webshop project)
Vercel -> Settings -> Environment Variables (Production):
  KAPWA_SUPABASE_URL        = <KAPWA project URL, e.g. https://xxxx.supabase.co>
  KAPWA_SERVICE_ROLE_KEY    = <KAPWA service-role key>
These are secrets. Never commit them. Without them the cross-project tenant
write is skipped (Mission Control task still opens locally).

## 3. Redeploy
Redeploy the webshop Vercel project so the new Edge/server functions + route
tree ship.

## Verify
1. Place a KAPWA Full order at /agents -> /checkout. It lands as
   awaiting_human_approval.
2. Open /admin/orders, click "Approve & wire".
3. /mission-control now shows the Onboarding Queue item for that order.
4. If KAPWA env is set, a kapwa_tenants row (status=provisioning) exists in the
   KAPWA project, keyed by the same order_ref.

## Note
Per-property Supabase provisioning (the actual KAPWA deploy) is a human step
run during Mission Control Setup. The wire stops at creating the tenant record
+ task; a human flips tenant -> active. Same human-in-loop rule KAPWA enforces
for payments.
