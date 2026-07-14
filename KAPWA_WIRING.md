# KAPWA Module Map + Webshop → KAPWA Onboarding Wire

Grounded in the two repos as they exist today. Documentation only - no code.

## 1. The 8 webshop modules vs KAPWA's real operator domains

The webshop lists KAPWA Full with 8 module names. KAPWA's actual Resort Operator
covers 9 operating domains. Map the marketing modules to the engineered domains so
the listing = the product (no over-promise).

| Webshop module (marketing) | KAPWA real domain (resort-operator) | Status in code |
|---|---|---|
| Guest Concierge | guest_request (goal 1/3/5) | live (Edge Fn concierge-ai, guest-chat) |
| Booking Assistant | reservation_exception + arrival | live (reservations-ai, frontdesk-today) |
| Lead Generation | not a KAPWA domain yet | GAP - external (Queen OS lead engine) |
| Social Media | not a KAPWA domain | GAP - external (Queen OS / Composio) |
| Review Manager | not a KAPWA domain | GAP - external |
| Menu & Ordering | fnb (stuck orders + stale tabs) | live (ServiceBoard, kitchen/bar) |
| Revenue Follow-up | unpaid_balance + tour (repeat) | live (planner: balance_cleared) |
| Mission Control | integration (failed webhooks/PMS) + ops_cases dashboard | live (ops-coordinator, /admin/operator) |

**Honest read:** 5 of 8 map directly to shipped KAPWA domains. 3 (Lead Gen, Social,
Reviews) are NOT in KAPWA today - they belong to the Queen OS external layer. Either
( a) drop them from KAPWA Full's claim, or ( b) position them as "Queen OS add-on"
wired later. Recommend (b) with a clear "powered by Queen OS" tag so the listing is
true.

## 2. Webshop checkout → KAPWA onboarding (the missing link)

Today: webshop `orders` table (offer_id, offer_kind, status) is a dead end. When a
kapwa-full order is approved, nothing provisions a property. KAPWA has NO tenant
table - each property = its own Supabase project (pilot plan scope).

### Required wire (design)
1. Webshop order approved (status -> approved).
2. Server fn `onOrderApproved` fires:
   - creates a `kapwa_tenants` row (new KAPWA table): property_name, contact_email,
     order_ref, status=provisioning, created_supabase_project=false.
   - sends owner email (Hello / Composio Gmail) with setup link + next steps.
   - creates a Mission Control task "Onboard <property>" visible in /admin/operator.
3. Human (MerQato) runs Mission Control Setup: scaffolds the property's Supabase
   project (apply migrations), sets VITE_SUPABASE_URL + keys, enables agent runtime.
4. Tenant row -> active; owner gets login.

### What must be BUILT (not yet in repo)
- KAPWA: `kapwa_tenants` table + migration (id, property_name, contact_email,
  order_ref FK, status enum, supabase_project_ref, created_at).
- Webshop: `onOrderApproved` hook (server fn) + email via Composio/Resend.
- Shared: order_ref bridge so webshop order <-> KAPWA tenant line up.

### Guardrail (matches both repos' doctrine)
- No auto-provision of a Supabase project without human approval. The agent creates
  the tenant record + task; a human flips it to active. Same human-in-loop rule
  KAPWA already enforces for payments.

## 3. Voice agent (TALA) place in the map
TALA (voice-agent/) is the guest-facing voice surface for Guest Concierge. It is the
"Guest Concierge AI" module's voice channel. List it under that module, not separate.

## 4. Next build steps (for approval)
1. Add `kapwa_tenants` migration to KAPWA.
2. Trim/expand webshop module claims to match the 5 live + 3 Queen-OS-addon split.
3. Build `onOrderApproved` + email + Mission Control task.
4. Document the order_ref bridge.

Nothing here changes either repo until you approve the build steps.
